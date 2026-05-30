import express from 'express';
import Level from '../models/content agent/Level.js';
import Progress from '../models/content agent/Progress.js';
import { User } from "../models/User.js";
import { evaluateAndUnlockChapters } from '../utils/chapterUnlock.js';
import { updateSkillScores } from '../utils/recommendationService.js';
import { awardChapterToken } from '../utils/tokenService.js';

const router = express.Router();


//simply checks for user level and unlocks
// export const evaluateChapterUnlocks = (user, chapters) => {
//   const unlocked = [];

//   for (const chapter of chapters) {
//     const chapterId = chapter._id.toString();

//     const alreadyUnlocked = user.unlockedChapters?.some(
//       id => id.toString() === chapterId
//     );

//     if (alreadyUnlocked) continue;

//     if (user.level >= chapter.unlockedOn) {
//       unlocked.push(chapter._id);
//     }
//   }

//   return unlocked;
// };

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

    const wasAlreadyPassed = existingLevelIndex !== -1 &&
    progress.levelProgress[existingLevelIndex]?.passed === true;

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

    progress.currentLevelId  = levelId;
    progress.currentChapterId = chapterId;

    await progress.save();

    await updateSkillScores(userId, levelId, { passed, attempts, preQuestionAnswers, postQuestionAnswers }).catch(err =>
      console.error("⚠️ [SkillScores] Failed to update:", err.message)
    );
    const updatedProgress = await Progress.findOne({ userId }).select("skillScores").lean();
const skillScores = updatedProgress?.skillScores ?? {};

    // Level up logic
    let levelUp = false;
    let newUnlocks = [];

  if (passed && !wasAlreadyPassed) {
    const user = await User.findByIdAndUpdate(
      userId, 
      { $inc: { level: 1 } }, 
      { returnDocument: 'after' }
    );

    levelUp = true;
    const unlockResult = await evaluateAndUnlockChapters(userId);
    newUnlocks = unlockResult.newlyUnlocked;
    console.log(newUnlocks)

  }

  console.log("progress", progress)

    res.json({ 
      success: true, 
      progress, 
      levelUp, 
      newUnlocks,
      skillScores
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
    let rewardUnlocked = null;

    if (allPassed && !wasAlreadyPassed) {
      const result = await awardChapterToken(userId, chapterId);
      if (result) {
        tokensAwarded = result.tokens;
        rewardUnlocked = result;
      }
    }
 
    res.json({ success: true, progress, allPassed, tokensAwarded, rewardUnlocked });
 
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
      .populate('chapterProgress.chapterId')
      .populate('currentLevelId', 'title order chapterId');

    if (!progress) {
      return res.json({
        levelProgress: [],
        chapterProgress: [],
        totalStars: 0,
        currentLevel: null,
        chapterProgressMap: {},
      });
    }
    let currentLevel;

    if (!progress.currentLevelId) {
      // new user — find first level of first chapter
      const firstLevel = await Level.findOne({}).sort({ order: 1 });
      currentLevel = firstLevel
        ? { _id: firstLevel._id, title: firstLevel.title, order: firstLevel.order, chapterId: firstLevel.chapterId }
        : { order: 1 };
    } else {
      const completedOrder = progress.currentLevelId.order;
      const nextLevel = await Level.findOne({ 
        chapterId: progress.currentLevelId.chapterId, 
        order: completedOrder + 1
      });
      currentLevel = nextLevel
        ? { _id: nextLevel._id, title: nextLevel.title, order: nextLevel.order, chapterId: nextLevel.chapterId }
        : { order: completedOrder };
    }

    const currentChapter = progress.currentChapterId
      ? progress.currentChapterId
      : { order: 1 };

    // ── Per-chapter progress map ──────────────────────────
    const allChapters = await Level.aggregate([
      { $group: { _id: '$chapterId', totalLevels: { $sum: 1 } } }
    ]);

    const chapterProgressMap = {};
    for (const ch of allChapters) {
      const chId = ch._id.toString();
      const passed = progress.levelProgress
        .filter(lp => lp.chapterId?.toString() === chId && lp.passed)
        .length;
      chapterProgressMap[chId] = {
        completed: passed,
        total: ch.totalLevels,
      };
    }

    res.json({
      ...progress.toObject(),
      currentLevel,
      currentChapter,
      chapterProgressMap,
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;