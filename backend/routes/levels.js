import express from "express";
import mongoose from "mongoose";
import { authMiddleware } from "../middleware/auth.js";
import Level from "../models/content agent/Level.js";
import Progress from "../models/content agent/Progress.js";
import { generateAndSaveEasyVariant, getEasyVariant, getLevelAttemptCount } from "./ai.js";

const levelroutes = express.Router();

// GET /api/levels?userId=xxx&chapterId=xxx
levelroutes.get("/", async (req, res) => {
  try {
    console.log("Fetching levels with query:", req.query);
    const { userId, chapterId } = req.query;

    if (!userId || !chapterId)
      return res.status(400).json({ message: "userId and chapterId required" });

    // fetch all active levels for this chapter, sorted by order
    const levels = await Level.find({ chapterId, isActive: true }).sort({ order: 1 });

    // fetch user's progress doc
    const progress = await Progress.findOne({ userId });

    // extract only level progress entries for this chapter
    const chapterLevelProgress = progress?.levelProgress.filter(
      (lp) => lp.chapterId.toString() === chapterId
    ) ?? [];

    // build a map of levelId -> passed for quick lookup
    const passedMap = new Map(
      chapterLevelProgress.map((lp) => [lp.levelId.toString(), lp.passed])
    );

    // unlock logic: first level always unlocked, next level unlocks when previous is passed
    const levelsWithUnlockStatus = levels.map((level, index) => {
      const isFirst = index === 0;
      const previousLevel = index > 0 ? levels[index - 1] : null;
      const previousPassed = previousLevel
        ? passedMap.get(previousLevel._id.toString()) === true
        : false;

      const unlocked = isFirst || previousPassed;
      console.log('level', level.title, 'unlocked:', unlocked, 'previousPassed:', previousPassed);

      const myProgress = chapterLevelProgress.find(
        (lp) => lp.levelId.toString() === level._id.toString()
      );

      return {
        id: level._id,
        title: level.title,
        order: level.order,
        reward: level.reward,
        tags: level.tags,
        unlocked,
        passed: myProgress?.passed ?? false,
        starsEarned: myProgress?.starsEarned ?? 0,
        attempts: myProgress?.attempts ?? 0,
      };
    });

    res.json({ levels: levelsWithUnlockStatus });
  } catch (error) {
    console.error("Error fetching levels:", error);
    res.status(500).json({ message: "Server error" });
  }
});

levelroutes.get("/admin", async (req, res) => {
  try {
    console.log("Fetching levels with query:", req.query);
    const { chapterId } = req.query;

    // fetch all active levels for this chapter, sorted by order
    const levels = await Level.find({ chapterId, isActive: true }).sort({ order: 1 });

    res.json({ levels });
  } catch (error) {
    console.error("Error fetching levels:", error);
    res.status(500).json({ message: "Server error" });
  }
});

levelroutes.get("/:id", authMiddleware, async (req, res) => {
  console.log(authMiddleware); 
  try {
    const levelId = req.params.id;
    const userId  = req.user?.userId;
    console.log("getting level", levelId, userId); 

    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).json({ message: "Level not found" });
    }

    const attempts = await getLevelAttemptCount(userId, levelId);
    console.log(attempts); 

    if (attempts > 2) {
      // ── 1. Check cache FIRST, never skip this ──
      const cached = await getEasyVariant(levelId);
      console.log(cached);
      if (cached) {
        return res.json({
          level: { ...level.toObject(), dialog: cached, _variantApplied: "easy" },
        });
      }

      // ── 2. Only reach here if no cache AND attempts > 2 ──
      console.log(`Generating easy variant for level ${levelId}…`);
      const easyDialog = await generateAndSaveEasyVariant(level.toObject());

      return res.json({
        level: { ...level.toObject(), dialog: easyDialog, _variantApplied: "easy" },
      });
    }

    res.json({ level });

  } catch (error) {
    console.error("Error fetching level:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add this BEFORE the /:id route
levelroutes.get("/admin/:id", async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    if (!level) return res.status(404).json({ message: "Level not found" });
    res.json({ level });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


//for the admin
// POST /api/levels — create (used by admin panel)
levelroutes.post("/", async (req, res) => {
  try {
    const body = req.body;
    if (!body.chapterId) return res.status(400).json({ error: "chapterId required" });
    if (!body.title) return res.status(400).json({ error: "title required" });
    const level = await Level.create(body);
    res.status(201).json({ level });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
 
// PUT /api/levels/:id — update (used by admin panel)
levelroutes.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "invalid id" });
    const level = await Level.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).lean();
    if (!level) return res.status(404).json({ error: "not found" });
    res.json({ level });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
 
// DELETE /api/levels/:id — delete (used by admin panel)
levelroutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "invalid id" });
    await Level.findByIdAndDelete(id);
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /admin/levels/:id/generate-variants
levelroutes.post('/admin/levels/:id/generate-variants', async (req, res) => {
  const level = await Level.findById(req.params.id);
  const variants = await generateVariantsForLevel(level);
  await Level.findByIdAndUpdate(level._id, {
    'difficultyVariants.easy.dialog': variants.easy.dialog,
    'difficultyVariants.medium.dialog': variants.medium.dialog,
    'difficultyVariants.hard.dialog': variants.hard.dialog,
  });
  res.json({ success: true });
});

export default levelroutes;