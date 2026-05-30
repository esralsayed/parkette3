import Level from "../models/content agent/Level.js";
import Progress from "../models/content agent/Progress.js";

// ─────────────────────────────────────────────────────────────────
// SKILL SCORE UPDATER
// Called inside POST /progress/level after saving progress.
// Updates the skillScores map on the Progress doc based on how
// the child performed on this level.
//
// Logic:
//   - passed on first try        → skill += 0.2  (capped at 1.0)
//   - passed but needed retries  → skill += 0.05
//   - failed                     → skill -= 0.15 (floored at 0.0)
//
// Each level's tags.skills array drives which skills get updated.
// ─────────────────────────────────────────────────────────────────
export async function updateSkillScores(userId, levelId, { passed, attempts, preQuestionAnswers, postQuestionAnswers }) {
console.log("here?")
  const level = await Level.findById(levelId).select("tags").lean();
  if (!level?.tags?.skills?.length) return;

  const skills = level.tags.skills;

  let delta;
  const hasPre  = preQuestionAnswers  != null && preQuestionAnswers.total  > 0;
  const hasPost = postQuestionAnswers != null && postQuestionAnswers.total > 0;

  if (hasPre && hasPost) {
    // ── Pre/post comparison path ───────────────────────────────────────────
    const preRate  = preQuestionAnswers.score  / preQuestionAnswers.total;   // 0.0–1.0
    const postRate = postQuestionAnswers.score / postQuestionAnswers.total;  // 0.0–1.0
    const gain     = postRate - preRate;                                     // -1.0–+1.0

    // Learning gain component: scaled to ±0.3 range
    let learningDelta = (postRate * 0.3) + (gain * 0.1);

    // Failure/struggle penalty layered on top
    if (!passed) {
      learningDelta -= 0.15;
    } else if (attempts > 1) {
      learningDelta -= 0.05;  // passed but needed retries — slight penalty
    }

    delta = learningDelta;

  } else {
    // ── Fallback: old passed+attempts logic ───────────────────────────────
    if      (passed && attempts <= 1) delta =  0.20;
    else if (passed && attempts >  1) delta =  0.05;
    else                              delta = -0.15;
  }

  const progress = await Progress.findOne({ userId });
  if (!progress) return;

  const scores = progress.skillScores ?? new Map();

  for (const skill of skills) {
    const current = scores.get(skill) ?? 0.5;
    const updated = Math.min(1.0, Math.max(0.0, current + delta));
    scores.set(skill, parseFloat(updated.toFixed(2)));
  }

  progress.skillScores = scores;
  await progress.save();

  console.log("📊 [SkillScores] Updated for user", userId, Object.fromEntries(scores));
}


// ─────────────────────────────────────────────────────────────────
// GROQ RECOMMENDATION ENGINE
// Takes a userId + the level they just completed.
// Returns { recommendedLevelId, reason, type }
//   type: "retry"     → same skill, different env (e.g. fire home → fire school)
//         "next"      → logical next level in sequence
//         "challenge" → child is doing well, push harder
// ─────────────────────────────────────────────────────────────────

//cooldown window: 3 means must 3 other levels first, 5 , etc.
export async function getNextLevelRecommendation(userId, completedLevelId, skillScores) {
  // ── 1. Load child's current skill scores ──────────────────────
  const progress = await Progress.findOne({ userId }).lean();
  if (!progress) throw new Error("No progress found for user");

  // ── 2. Load completed level metadata ──────────────────────────
  const completedLevel = await Level.findById(completedLevelId)
    .select("title chapterId order tags")
    .lean();

  if (!completedLevel) throw new Error("Completed level not found");

  // ── 3. Load ALL active levels (excluding already-passed ones) ──
    const recentLevelIds = new Set(
    progress.levelProgress
        .sort((a, b) => new Date(b.lastAttemptAt) - new Date(a.lastAttemptAt))
        .slice(0, 3)  // cooldown window — tune this number
        .map((lp) => lp.levelId.toString())
    );

  const allLevels = await Level.find({ isActive: true })
    .select("_id title chapterId order tags")
    .lean();

  // Build a compact catalog for Groq — only include what it needs
  const levelCatalog = allLevels.map((l) => ({
    id: l._id.toString(),
    title: l.title,
    chapterId: l.chapterId.toString(),
    order: l.order,
    skills: l.tags?.skills ?? [],
    difficulty: l.tags?.difficulty ?? "medium",
    environment: l.tags?.environment ?? "",
    alreadyPassed: recentLevelIds.has(l._id.toString()),
  }));

  // ── 4. Build Groq prompt ──────────────────────────────────────
  const prompt = `
You are a children's educational AI advisor for a safety learning app.
Your job is to recommend the single best next level for a child to attempt.

CHILD'S SKILL SCORES (0.0 = struggling, 1.0 = mastered):
${JSON.stringify(skillScores, null, 2)}

LEVEL JUST COMPLETED:
${JSON.stringify({
  id: completedLevelId,
  title: completedLevel.title,
  skills: completedLevel.tags?.skills ?? [],
  difficulty: completedLevel.tags?.difficulty,
  environment: completedLevel.tags?.environment,
}, null, 2)}

ALL AVAILABLE LEVELS:
${JSON.stringify(levelCatalog, null, 2)}

RECOMMENDATION RULES (apply in order):
1. If the child scored below 0.4 on any skill from the completed level:
   - Find a level covering the SAME skill in a DIFFERENT environment (type: "retry")
   - This reinforces the weak skill through a fresh context
2. If all skills from the completed level are above 0.4:
   - Find the next logical level (same chapter, next order, not yet passed) (type: "next")
3. If all skills are above 0.75 and the child has passed most levels:
   - Recommend a harder level they haven't passed yet (type: "challenge")
4. Never recommend a level where onCooldown is true. 
 You MAY recommend a previously passed level if the child's skill score 
 for that level's skills is below 0.5 and it is not on cooldown.
5. Never recommend the level they just completed.

Respond with ONLY this JSON, no markdown, no explanation:
{
  "recommendedLevelId": "<level _id string>",
  "type": "retry" | "next" | "challenge",
  "reason": "<one sentence, child-friendly explanation for the parent>"
}
`.trim();

  // ── 5. Call Groq ──────────────────────────────────────────────
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are an educational routing AI. Return only valid JSON. No markdown. No extra text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,  // low temp = more deterministic routing decisions
      max_tokens: 150,   // recommendation is tiny — no need for more
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq error: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  const cleaned = (raw.choices[0].message.content ?? "")
    .replace(/```json|```/g, "")
    .trim();

  let recommendation;
  try {
    recommendation = JSON.parse(cleaned);
  } catch {
    throw new Error("Groq returned invalid JSON for recommendation");
  }

  // ── 6. Validate the returned levelId actually exists ──────────
  const exists = allLevels.find(
    (l) => l._id.toString() === recommendation.recommendedLevelId
  );

  if (!exists) {
    // Fallback: next level in same chapter by order
    const fallback = allLevels
      .filter(
        (l) =>
          l.chapterId.toString() === completedLevel.chapterId.toString() &&
          l.order > completedLevel.order &&
          !recentLevelIds.has(l._id.toString())
      )
      .sort((a, b) => a.order - b.order)[0];

    if (!fallback) return null;  // chapter complete

    return {
      recommendedLevelId: fallback._id.toString(),
      type: "next",
      reason: "Moving on to the next level in this chapter.",
      level: fallback,
    };
  }

  console.log("🎯 [Recommend] Groq picked:", recommendation);

  return {
    ...recommendation,
    level: exists,
  };
}