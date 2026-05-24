import express from 'express';
import Chapter from '../models/content agent/Chapter.js';
import Level from '../models/content agent/Level.js';
import Progress from '../models/content agent/Progress.js';
import { User } from "../models/User.js";

const router = express.Router();


//simply checks for user level and unlocks
export const evaluateChapterUnlocks = (user, chapters) => {
  const unlocked = [];

  for (const chapter of chapters) {
    const chapterId = chapter._id.toString();

    const alreadyUnlocked = user.unlockedChapters?.some(
      id => id.toString() === chapterId
    );

    if (alreadyUnlocked) continue;

    if (user.level >= chapter.unlockedOn) {
      unlocked.push(chapter._id);
    }
  }

  return unlocked;
};

// ── Award tokens for chapter completion ────────────────────────────────────
// Call this once when a chapter is fully completed, not on every level save
const awardTokens = async (userId, chapterId, starsEarned) => {
  // Base award + star bonus — tune these values to your economy
  const BASE_TOKENS   = 20;
  const BONUS_PER_STAR = 5;
  const amount = BASE_TOKENS + starsEarned * BONUS_PER_STAR;

  await User.findByIdAndUpdate(userId, {
    $inc: { tokens: amount },
    $push: {
      tokenLedger: {
        amount,
        reason:    'chapter_complete',
        chapterId,
        earnedAt:  new Date(),
      },
    },
  });

  return { tokensAwarded: amount };
};

// ── POST /progress/level ───────────────────────────────────────────────────
router.post('/level', async (req, res) => {
  try {
    console.log("🔄 [Progress] Request body:", req.body);

    const {
      userId,
      levelId,
      chapterId,
      starsEarned = 0,
      passed = false,
      attempts = 1,
      lastAttemptAt,
      completedAt,
      preQuestionAnswers,
      postQuestionAnswers,
    } = req.body;

    // ── Strong Validation ─────────────────────────────────────
    if (!userId || !levelId) {
      return res.status(400).json({ message: "userId and levelId are required" });
    }

    if (!chapterId) {
      console.error(`❌ [Progress] chapterId is missing for level ${levelId}`);
      return res.status(400).json({ 
        message: "chapterId is required",
        levelId 
      });
    }

    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ 
        userId, 
        levelProgress: [], 
        chapterProgress: [], 
        unlockedChapters: [] 
      });
    }

    const existingLevelIndex = progress.levelProgress.findIndex(
      lp => lp.levelId?.toString() === levelId.toString()
    );

    const levelProgressEntry = {
      levelId,
      chapterId,                    // Now guaranteed to exist
      attempts,
      passed,
      starsEarned: existingLevelIndex !== -1
        ? Math.max(starsEarned, progress.levelProgress[existingLevelIndex].starsEarned || 0)
        : starsEarned,
      lastAttemptAt: lastAttemptAt || new Date(),
      completedAt: completedAt || new Date(),
      preQuestionAnswers:  preQuestionAnswers  ?? null,  // ← ADD
      postQuestionAnswers: postQuestionAnswers ?? null,  // ← ADD
      servedDifficulty: 'base',
      servedLanguage: 'base',
    };

    if (existingLevelIndex !== -1) {
      progress.levelProgress[existingLevelIndex] = {
        ...progress.levelProgress[existingLevelIndex].toObject(),
        ...levelProgressEntry,
      };
    } else {
      progress.levelProgress.push(levelProgressEntry);
    }

    progress.totalStars = progress.levelProgress.reduce(
      (sum, lp) => sum + (lp.passed ? (lp.starsEarned || 0) : 0),
      0
    );

    await progress.save();

    console.log("✅ [Progress] Saved successfully for level", levelId);

    // Level up logic
    let levelUp = false;
    let newUnlocks = [];

    if (passed) {
      const isFirstCompletion = existingLevelIndex === -1 || 
                               !progress.levelProgress[existingLevelIndex]?.passed;

      if (isFirstCompletion) {
        const user = await User.findByIdAndUpdate(
          userId, 
          { $inc: { level: 1 } }, 
          { returnDocument: 'after' }
        );

        levelUp = true;
        const chapters = await Chapter.find();
        newUnlocks = evaluateChapterUnlocks(user, chapters);
      }
    }

    res.json({ 
      success: true, 
      progress, 
      levelUp, 
      newUnlocks 
    });

  } catch (error) {
    console.error('❌ Error saving progress:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      validationErrors: error.errors 
    });
  }
});

// ── POST /progress/chapter ────────────────────────────────────────────────
// Called after every level completion. Upserts the chapter progress entry:
//   - Sets startedAt on first write (no-op afterward)
//   - Checks if all levels in the chapter are now passed → status: 'passed'
//   - Awards tokens once when the chapter is first fully completed
router.post('/chapter', async (req, res) => {
  try {
    const { userId, chapterId, completedLevelId, starsEarned = 0 } = req.body;
 
    if (!userId || !chapterId || !completedLevelId) {
      return res.status(400).json({ message: 'userId, chapterId, and completedLevelId are required' });
    }

    // ── Load chapter definition so we know how many levels it has ──────────
    const chapterLevels = await Level.find({ chapterId });
    const totalLevels = chapterLevels.length;
    const chapterLevelIds = chapterLevels.map(l => l._id.toString());
  
    // ── Load (or create) the progress doc ──────────────────────────────────
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId, levelProgress: [], chapterProgress: [] });
    }
 
    // ── Check how many chapter levels the user has now passed ───────────────
    const passedLevels = progress.levelProgress.filter(
      lp => chapterLevelIds.includes(lp.levelId?.toString()) && lp.passed
    );
    const allPassed = totalLevels > 0 && passedLevels.length >= totalLevels;
 
    // ── Sum stars across all passed levels in this chapter ──────────────────
    const totalStarsEarned = passedLevels.reduce(
      (sum, lp) => sum + (lp.starsEarned || 0), 0
    );
 
    // ── Upsert the chapterProgress entry ───────────────────────────────────
    const existingIndex = progress.chapterProgress.findIndex(
      cp => cp.chapterId?.toString() === chapterId.toString()
    );
 
    const now = new Date();
    const wasAlreadyPassed = existingIndex !== -1 &&
      progress.chapterProgress[existingIndex]?.status === 'passed';
 
    if (existingIndex !== -1) {
      const existing = progress.chapterProgress[existingIndex].toObject();
      progress.chapterProgress[existingIndex] = {
        ...existing,
        status:      allPassed ? 'passed' : 'active',
        starsEarned: totalStarsEarned,
        // completedAt: only written once, on first transition to 'passed'
        ...(allPassed && !existing.completedAt ? { completedAt: now } : {}),
      };
    } else {
      // First time we've seen this chapter — set startedAt now
      progress.chapterProgress.push({
        chapterId,
        status:      allPassed ? 'passed' : 'active',
        starsEarned: totalStarsEarned,
        startedAt:   now,
        ...(allPassed ? { completedAt: now } : {}),
      });
    }
 
    await progress.save();
    console.log(`✅ [Progress] Chapter ${chapterId} — status: ${allPassed ? 'passed' : 'active'}`);
 
    // ── Award tokens once on first chapter completion ───────────────────────
    let tokensAwarded = 0;
    if (allPassed && !wasAlreadyPassed) {
      const award = await awardTokens(userId, chapterId, totalStarsEarned);
      tokensAwarded = award.tokensAwarded;
      console.log(`🪙 Awarded ${tokensAwarded} tokens for completing chapter ${chapterId}`);
    }
 
    res.json({ success: true, progress, allPassed, tokensAwarded });
 
  } catch (error) {
    console.error('❌ Error saving chapter progress:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ── GET /progress/:userId ──────────────────────────────────────────────────
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await Progress.findOne({ userId })
      .populate('levelProgress.levelId')
      .populate('chapterProgress.chapterId');

    if (!progress) {
      return res.json({ levelProgress: [], chapterProgress: [], totalStars: 0, unlockedChapters: [] });
    }

    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;