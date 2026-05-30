import express from "express";
import Progress from "../models/content agent/Progress.js";
import { evaluateAndUnlockChapters } from "../utils/chapterUnlock.js";
import { getNextLevelRecommendation } from "../utils/recommendationService.js";

const recRouter = express.Router();

// ── GET /api/recommend/:userId?completedLevelId=xxx ───────────────────────
// Called from the end screen after a level finishes.
// Returns the next best level for this child to attempt.
//
// Query params:
//   completedLevelId (required) — the level they just finished
//
// Response:
//   {
//     recommendedLevelId: string,
//     type: "retry" | "next" | "challenge",
//     reason: string,       // one sentence for the parent/UI
//     level: { _id, title, chapterId, order, tags }
//     skillScores: {}       // current scores for dashboard display
//   }
recRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { completedLevelId } = req.query;

    if (!completedLevelId) {
      return res.status(400).json({ message: "completedLevelId query param is required" });
    }

    // ── Wait for progress to be saved (up to 3s) ──────────────────────────
    let progress = null;
    const maxAttempts = 6;
    const delayMs = 500;

    for (let i = 0; i < maxAttempts; i++) {
      progress = await Progress.findOne({
        userId,
        "levelProgress.levelId": completedLevelId,  // adjust to your schema field name
      })
        .select("skillScores levelProgress")
        .lean();

      if (progress) break;

      console.log(`[Recommend] Progress not found yet, retrying (${i + 1}/${maxAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    const skillScores = progress?.skillScores
    ? (progress.skillScores instanceof Map
        ? Object.fromEntries(progress.skillScores)
        : progress.skillScores)  // lean() already made it a plain object
    : {};

    console.log("skill scores", skillScores)

    const recommendation = await getNextLevelRecommendation(userId, completedLevelId, skillScores);
    console.log(recommendation); 
    if (!recommendation) {
      // All levels in the chapter are complete
      return res.json({
        recommendedLevelId: null,
        type: "complete",
        reason: "You've completed all levels in this chapter!",
        level: null,
      });
    }

    // ── Trigger B: unlock the recommended chapter if needed ───
    // This is safe to call even if it's already unlocked —
    // evaluateAndUnlockChapters skips already-unlocked chapters.
    const recommendedChapterId = recommendation.level?.chapterId?.toString();
    const { newlyUnlocked } = await evaluateAndUnlockChapters(userId, {
      recommendedChapterId,
    });
 
    if (newlyUnlocked.length > 0) {
      console.log(`🔓 [Recommend] Unlocked chapter ${recommendedChapterId} via recommendation`);
    } 

    res.json({
      ...recommendation,
      skillScores,
      newlyUnlocked
    });

  } catch (error) {
    console.error("❌ [Recommend] Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default recRouter;