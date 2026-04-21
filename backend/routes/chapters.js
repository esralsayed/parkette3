import express from "express";
import Chapter from "../models/content agent/Chapter.js";
import Progress from "../models/content agent/Progress.js";
import { User } from "../models/User.js";

const chapterroutes = express.Router();
// Get all chapters

chapterroutes.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const chapters = await Chapter.find().sort({ unlockedOn: 1 });
    const progress = await Progress.findOne({ userId });

    // map chapterId -> chapterProgress status for quick lookup
    const chapterProgressMap = new Map(
      progress?.chapterProgress.map((cp) => [cp.chapterId.toString(), cp]) ?? []
    );

    const chaptersWithStatus = chapters.map((chapter) => {
      const cp = chapterProgressMap.get(chapter._id.toString());
      return {
        id: chapter._id,
        title: chapter.title,
        description: chapter.description,
        unlockedOn: chapter.unlockedOn,
        levelCount: chapter.levels?.length ?? 0,
        unlocked: chapter.unlockedOn <= user.level,
        // progress info (null if never started)
        status: cp?.status ?? "locked",
        starsEarned: cp?.starsEarned ?? 0,
        totalStarsPossible: cp?.totalStarsPossible ?? 0,
      };
    });

    res.json({ chapters: chaptersWithStatus, userLevel: user.level });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    res.status(500).json({ message: "Server error" });
  }
});

chapterroutes.get("/admin", async (req, res) => {
  try {

    const chapters = await Chapter.find().sort({ unlockedOn: 1 });

    res.json({ chapters });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//for the admin 
// POST /api/chapters — create (used by admin panel)
chapterroutes.post("/", async (req, res) => {
  try {
    const { title, order, isActive } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    const chapter = await Chapter.create({ title, order: order ?? 1, isActive: isActive ?? true });
    res.status(201).json({ chapter });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
 
// DELETE /api/chapters/:id — delete (used by admin panel)
chapterroutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "invalid id" });
    await Chapter.findByIdAndDelete(id);
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


export default chapterroutes;