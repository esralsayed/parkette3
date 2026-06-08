// services/moderationService.js
import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function moderateChildMessage(content) {
  try {

    // =========================
    // OPENAI MODERATION
    // =========================

    const moderationResponse = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: content,
    });

    const result = moderationResponse.results[0];

    // Clean object for Groq
    const moderationData = {
      flagged: result.flagged,

      categories: result.categories,

      categoryScores: result.category_scores,
    };

    console.log("[OPENAI MODERATION]");
    console.dir(moderationData, { depth: null });

    // Return moderation data only
    return moderationData;

  } catch (error) {
    if (error.status === 429) {
      console.warn("[MODERATION] Rate limited — skipping OpenAI, falling back to Groq only");
      return {
        flagged: false,
        categories: {},
        categoryScores: {},
        skipped: true,
      };
    }

    // all other errors still fail safe
    console.error("[MODERATION ERROR]", error);
    return {
      flagged: true,
      categories: { moderation_error: true },
      categoryScores: {},
    };
  }

    return {
      flagged: true,

      categories: {
        moderation_error: true,
      },

      categoryScores: {},
    };
}

// services/groqModerationService.js

export async function classifyMessage(content, moderationResult) {
  try {

    const prompt = `
You are moderating messages in a children's multiplayer educational game.

Your task is to classify the message into EXACTLY ONE tier:

1. safe
- Friendly
- Harmless
- Positive
- Game-related

2. needs_caution
- Mild bullying
- Mild rude language
- Emotional manipulation
- Asking for personal information
- Suspicious behavior

3. unsafe
- Threats
- Grooming
- Sexual content
- Hate speech
- Explicit bullying
- Violence
- Sharing contact info
- Predatory behavior

MESSAGE:
"${content}"

Return ONLY valid JSON:

{
  "tier": "safe | needs_caution | unsafe",
  "reasons": ["reason1", "reason2"],
  "sanitized": "rewritten version with problematic content removed or softened, preserving friendly intent — REQUIRED for needs_caution, null for safe and unsafe"

}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
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
                "You are a child safety moderation system. Return ONLY valid JSON.",
            },

            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Groq API error: ${response.status} ${response.statusText}`
      );
    }

    const raw = await response.json();

    const cleaned = raw.choices[0].message.content
      .replace(/```json|```/g, "")
      .trim();

    console.log("[GROQ RAW]");
    console.log(cleaned);

    const parsed = JSON.parse(cleaned);

    return parsed;

  } catch (error) {

    console.error("[GROQ MODERATION ERROR]", error);

    return {
      tier: "needs_caution",
      reasons: ["classification_failed"],
      sanitized: null,
    };
  }
}