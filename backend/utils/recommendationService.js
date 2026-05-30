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
export async function updateSkillScores(userId, levelId, { passed, attempts, preQuestionAnswers, postQuestionAnswers }, progress) {
    console.log("1️⃣ updateSkillScores called", { userId, levelId });

  const level = await Level.findById(levelId).select("tags").lean();
    console.log("2️⃣ level found:", level);

  if (!level?.tags?.skills?.length) {
    console.log("❌ returning early — no skills on level tags");
    return;
  }

  console.log("4️⃣ progress received:", !!progress);

  const skills = level.tags.skills;

  console.log("3️⃣ skills:", level.tags.skills);


  const hasPre  = preQuestionAnswers  != null && preQuestionAnswers.total  > 0;
  const hasPost = postQuestionAnswers != null && postQuestionAnswers.total > 0;

  let performanceScore;

  if (hasPre && hasPost) {
    const preRate  = preQuestionAnswers.score / preQuestionAnswers.total;
    const postRate = postQuestionAnswers.score / postQuestionAnswers.total;
    const gain     = postRate - preRate;

    performanceScore = Math.min(1.0, Math.max(0.0, (postRate * 0.6) + (gain * 0.2) + 0.2));

    if (!passed)            performanceScore *= 0.6;
    else if (attempts > 1)  performanceScore *= 0.85;
  } else {
    if      (passed && attempts <= 1) performanceScore = 0.85;
    else if (passed && attempts >  1) performanceScore = 0.65;
    else                              performanceScore = 0.25;
  }

  const scores = progress.skillScores ?? new Map();
  const alpha = 0.3;

  for (const skill of skills) {
    const current = scores.get(skill) ?? 0.5;
    const raw     = (alpha * performanceScore) + ((1 - alpha) * current);
    const updated = Math.min(1.0, Math.max(0.0, parseFloat(raw.toFixed(2))));
    scores.set(skill, updated);
  }

  progress.skillScores = scores;
    console.log("5️⃣ about to save, scores:", Object.fromEntries(scores));

  await progress.save();

  console.log("📊 [SkillScores] Updated for user", userId, Object.fromEntries(scores));
}

// Add this helper before getNextLevelRecommendation
function computeSimilarityScore(completedLevel, candidateLevel) {
  let score = 0;

  const completedSkills = completedLevel.tags?.skills ?? [];
  const candidateSkills = candidateLevel.tags?.skills ?? [];

  // Skill overlap — dominant signal, worth 70pts
  const sharedSkills = completedSkills.filter(s => candidateSkills.includes(s));
  const overlapRatio = sharedSkills.length / Math.max(completedSkills.length, 1);
  score += overlapRatio * 70;

  // Environment — reduced to 10pts, familiarity matters less than skill continuity
  if (completedLevel.tags?.environment === candidateLevel.tags?.environment) {
    score += 5;
  }

  // Emotional theme — 10pts
  if (completedLevel.tags?.emotionalTheme === candidateLevel.tags?.emotionalTheme) {
    score += 5;
  }

  // Age range overlap — 10pts
  const completedAges = completedLevel.tags?.ageRange ?? [];
  const candidateAges = candidateLevel.tags?.ageRange ?? [];
  if (completedAges.some(a => candidateAges.includes(a))) score += 10;

  console.log(score)
  return Math.round(score);
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
  // ── 1. Load progress ──────────────────────────────────────────
  const progress = await Progress.findOne({ userId }).lean();
  if (!progress) throw new Error("No progress found for user");

  // ── 2. Load completed level ───────────────────────────────────
  const completedLevel = await Level.findById(completedLevelId)
    .select("title chapterId order tags")
    .lean();
  if (!completedLevel) throw new Error("Completed level not found");

  // ── 3. Cooldown window ────────────────────────────────────────
  const recentLevelIds = new Set(
    progress.levelProgress
      .sort((a, b) => new Date(b.lastAttemptAt) - new Date(a.lastAttemptAt))
      .slice(0, 3)
      .map((lp) => lp.levelId.toString())
  );

  // ── 4. Load all active levels ─────────────────────────────────
  const allLevels = await Level.find({ isActive: true })
    .select("_id title chapterId order tags")
    .lean();

  // ── 5. Routing decision in CODE ───────────────────────────────
  const weakSkills = Object.entries(skillScores).filter(([_, v]) => v <= 0.5);
  const allStrong  = Object.values(skillScores).every(v => v >= 0.75);
  const routingType = weakSkills.length > 0 ? 'retry' : allStrong ? 'challenge' : 'next';

  console.log("🔀 Routing type:", routingType, "weak skills:", weakSkills.map(([k]) => k));

  // ── 6. Score all candidates ───────────────────────────────────
  const scoredCatalog = allLevels
    .filter(l => l._id.toString() !== completedLevelId)
    .map(l => ({
      id: l._id.toString(),
      title: l.title,
      chapterId: l.chapterId.toString(),
      order: l.order,
      skills: l.tags?.skills ?? [],
      difficulty: l.tags?.difficulty ?? "medium",
      difficultyScore: l.tags?.difficultyScore ?? 2,
      environment: l.tags?.environment ?? "",
      emotionalTheme: l.tags?.emotionalTheme ?? "",
      ageRange: l.tags?.ageRange ?? [],
      onCooldown: recentLevelIds.has(l._id.toString()),
      similarityToCompleted: computeSimilarityScore(completedLevel, l),
    }))
    .sort((a, b) => b.similarityToCompleted - a.similarityToCompleted);

  // ── 7. Filter candidates by routing type ──────────────────────
  let candidates;
  if (routingType === 'retry') {
    candidates = scoredCatalog
      .filter(l => l.similarityToCompleted >= 30 && !l.onCooldown)
      .slice(0, 5);

    // Fallback: if nothing hits >= 30, take top 3 by similarity
    if (candidates.length === 0) {
      candidates = scoredCatalog
        .filter(l => !l.onCooldown)
        .slice(0, 3);
    }
  } else if (routingType === 'challenge') {
    candidates = scoredCatalog
      .filter(l => l.difficultyScore > (completedLevel.tags?.difficultyScore ?? 2) && !l.onCooldown)
      .slice(0, 5);

    // Fallback: if no harder levels, take highest similarity
    if (candidates.length === 0) {
      candidates = scoredCatalog
        .filter(l => !l.onCooldown)
        .slice(0, 3);
    }
  } else {
    // next — same chapter, next by order
    candidates = scoredCatalog
      .filter(l => l.chapterId === completedLevel.chapterId.toString() && l.order > completedLevel.order)
      .sort((a, b) => a.order - b.order)
      .slice(0, 3);

    // Fallback: if chapter is done, highest similarity outside chapter
    if (candidates.length === 0) {
      candidates = scoredCatalog
        .filter(l => !l.onCooldown)
        .slice(0, 3);
    }
  }

  console.log("📋 Candidates:", candidates.map(c => ({ title: c.title, similarity: c.similarityToCompleted })));

  // ── 8. If only one candidate, skip Groq ───────────────────────
  if (candidates.length === 1) {
    const only = candidates[0];
    const level = allLevels.find(l => l._id.toString() === only.id);
    return {
      recommendedLevelId: only.id,
      type: routingType,
      reason: routingType === 'retry'
        ? "Let's practice these skills again in a new situation."
        : routingType === 'challenge'
        ? "You're ready for a harder challenge!"
        : "Let's move on to the next level.",
      level,
    };
  }

  // ── 9. Groq picks the best from candidates + writes reason ────
  const prompt = `
You are a children's educational AI advisor.
Routing type already decided: ${routingType.toUpperCase()}

CHILD'S WEAK SKILLS: ${weakSkills.map(([k, v]) => `${k} (${v.toFixed(2)})`).join(', ') || 'none'}

LEVEL JUST COMPLETED:
${JSON.stringify({
  title: completedLevel.title,
  skills: completedLevel.tags?.skills ?? [],
  difficulty: completedLevel.tags?.difficulty,
  environment: completedLevel.tags?.environment,
}, null, 2)}

CANDIDATES (pick from this list only, ranked by similarity):
${JSON.stringify(candidates, null, 2)}

Rules:
- Pick the candidate with the highest similarityToCompleted
- For retry: prefer levels that cover the child's weak skills
- For challenge: prefer harder levels
- For next: prefer lower order number
- Never pick a level where onCooldown is true

Respond with ONLY this JSON, no markdown:
{
  "recommendedLevelId": "<id from candidates only>",
  "type": "${routingType}",
  "reason": "<one sentence, child-friendly explanation for the parent>"
}
`.trim();

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an educational routing AI. Return only valid JSON. No markdown. No extra text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 150,
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

  // ── 10. Validate Groq picked from candidates ──────────────────
  const picked = candidates.find(c => c.id === recommendation.recommendedLevelId);
  if (!picked) {
    // Groq hallucinated an id — take the top candidate
    console.warn("⚠️ Groq picked invalid id, falling back to top candidate");
    const top = candidates[0];
    const level = allLevels.find(l => l._id.toString() === top.id);
    return {
      recommendedLevelId: top.id,
      type: routingType,
      reason: recommendation.reason ?? "Let's try this next level!",
      level,
    };
  }

  const level = allLevels.find(l => l._id.toString() === picked.id);
  console.log("🎯 [Recommend] Groq picked:", recommendation);

  return {
    ...recommendation,
    level,
  };
}