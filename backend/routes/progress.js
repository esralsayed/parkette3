// routes/progress.js
import express from 'express';
import Progress from '../models/content agent/Progress.js';

const router = express.Router();

// Save level progress
router.post('/level', async (req, res) => {
  try {
    console.log("saving progress..");
    const { userId, levelId, chapterId, starsEarned, passed, attempts, lastAttemptAt, completedAt } = req.body;
    
    // Find or create progress document
    let progress = await Progress.findOne({ userId });
    
    if (!progress) {
      progress = new Progress({ userId, levelProgress: [], chapterProgress: [] });
    }
    
    // Check if level progress already exists
    const existingLevelIndex = progress.levelProgress.findIndex(
      lp => lp.levelId.toString() === levelId
    );
    
    const levelProgressEntry = {
      levelId,
      chapterId,
      attempts,
      passed,
      starsEarned,
      lastAttemptAt,
      completedAt,
      servedDifficulty: 'base',
      servedLanguage: 'base',
    };
    
    if (existingLevelIndex !== -1) {
      // Update existing
      progress.levelProgress[existingLevelIndex] = {
        ...progress.levelProgress[existingLevelIndex],
        ...levelProgressEntry,
      };
    } else {
      // Add new
      progress.levelProgress.push(levelProgressEntry);
    }
    
    // Update total stars
    progress.totalStars = progress.levelProgress.reduce(
      (sum, lp) => sum + (lp.passed ? lp.starsEarned : 0),
      0
    );
    
    await progress.save();
    
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user progress
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await Progress.findOne({ userId })
      .populate('levelProgress.levelId')
      .populate('chapterProgress.chapterId');
    
    if (!progress) {
      return res.json({ levelProgress: [], chapterProgress: [], totalStars: 0 });
    }
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;