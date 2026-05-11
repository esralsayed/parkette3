import Level from "../models/content agent/Level.js";
import Progress from "../models/content agent/Progress.js";
// ─────────────────────────────────────────────
// 1. Check attempt count for a user + level
// ─────────────────────────────────────────────
export async function getLevelAttemptCount(userId, levelId) {
  const progress = await Progress.findOne({ userId });
  
  if (!progress) return 0;

  const levelProgress = progress.levelProgress.find(
    (lp) => lp.levelId.toString() === levelId.toString()
  );
  console.log("how many attempts?", levelProgress.attempts); 
  return levelProgress?.attempts ?? 0;
}

// ─────────────────────────────────────────────
// 2. Check if an easy variant already exists
// ─────────────────────────────────────────────
export async function getEasyVariant(levelId) {
  console.log("is there easy varient?", levelId); 
  const level = await Level.findById(levelId).select("difficultyVariants").lean();
  const dialog = level?.difficultyVariants?.easy?.dialog;
  // Only treat it as "exists" if it was actually generated (non-empty dialog)
  if (dialog && dialog.length > 0) {
    return dialog;
  }
  return null;
}

// ─────────────────────────────────────────────
// 3. Generate + persist a simpler level variant
//    using groq api
// ─────────────────────────────────────────────
export async function generateAndSaveEasyVariant(level) {
  console.log("we are generating easy version"); 
  const baseDialog = level.dialog ?? [];

const prompt = `
You are simplifying a children's educational dialog level.

STRICT RULES:
- Keep EVERY step. The output array must have the same number of items as the input.
- Do NOT remove, merge, or skip any dialog or task step.
- Preserve all fields: type, taskType, gameType, renderMode, sceneKey, content, continuationSteps, correctFeedback, wrongFeedback, speaker.
- Only change "text", "instruction", "correctFeedback", "wrongFeedback" to simpler language.
- continuationSteps must also be simplified but keep the same count.
- Input has ${baseDialog.length} steps. Output MUST have ${baseDialog.length} steps.

Simplification goals:
- Shorter sentences (max 8 words per sentence)
- Friendly, calm tone
- No complex vocabulary

Return ONLY a valid JSON array. No markdown. No explanation.

Original dialog:
${JSON.stringify(baseDialog, null, 2)}
`.trim();

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an educational content adapter for children. Return only valid JSON, no markdown, no explanation.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq error: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  const cleaned = (raw.choices[0].message.content ?? "")
    .replace(/```json|```/g, "")
    .trim();

  let easyDialog;
  try {
    easyDialog = JSON.parse(cleaned);
  } catch {
    throw new Error("Groq returned invalid JSON for easy variant");
  }

  await Level.findByIdAndUpdate(level._id, {
    $set: { "difficultyVariants.easy.dialog": easyDialog },
  });
  console.log("easy version", easyDialog); 

  return easyDialog;
}