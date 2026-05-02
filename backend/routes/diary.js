import express from "express";
import mongoose from "mongoose";
import Diary, { DiaryEntry } from "../models/Diary.js";
import { User } from "../models/User.js";
const diaryroutes = express.Router(); 

// GET /api/diary/ => to get the diary
diaryroutes.get("/:userId/", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId)
      return res.status(400).json({ message: "userId required" });

    const diary = await Diary.findOne({ 
      userId: new mongoose.Types.ObjectId(userId)  // ← cast string to ObjectId
    });

    if (!diary)
      return res.status(404).json({ message: "Diary not found" });

    //console.log("got the diary?", diary);
    res.json(diary);
  } catch (err) {
    console.error("Error fetching diary:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export const createDiaryForUser = async (userId, name) => {
  const existing = await Diary.findOne({ userId });
  if (existing) return existing;

  return await Diary.create({
    userId,
    diaryTitle: { text: `${name}'s diary` }
  });
};

// POST /api/diary/ => ill use use this for now to add a diary bc i alr have a user (for adminnn)
diaryroutes.post("/admin", async (req, res) => {
  try {
    console.log("adding diary...", req.query);

    const { userId } = req.query;

    if (!userId)
      return res.status(400).json({ message: "userId required" });

    const user = await User.findById(userId);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const diary = await createDiaryForUser(userId, user.name);

    return res.status(201).json({
      message: "Diary created successfully",
      diary
    });

  } catch (err) {
    console.error("Error creating diary:", err);
    res.status(500).json({ message: "Server error" });
  }
});

diaryroutes.delete("/admin", async (req,res) => {
    try{
        console.log("deleting diary...", req.query); 
        const { userId } = req.query; 
        if (!userId) 
            return res.status(400).json({ message: "userId required" });

        //fetch the diary
        const diary = await Diary.deleteOne({userId: userId}); //creating a diary
        console.log("deleted the diary?",diary); 
        res.json(diary); 
    } catch(err){
    console.error("Error deleting diary:", err);
    res.status(500).json({ message: "Server error" });
    }
})


//for editing but u should edit it to have diaryId instead
diaryroutes.put("/save/:diaryId/cover", async (req, res) => {
  try {
    const { diaryId } = req.params;
    if (!diaryId)
      return res.status(400).json({ message: "userId required" });

    // ← only pick fields that belong to the cover
    const { theme, stickers, diaryTitle } = req.body;

    const allowedUpdate = {};
    if (theme !== undefined)      allowedUpdate.theme = theme;
    if (stickers !== undefined)   allowedUpdate.stickers = stickers;
    if (diaryTitle !== undefined) {
      if (diaryTitle.text !== undefined)         allowedUpdate["diaryTitle.text"] = diaryTitle.text;
      if (diaryTitle.defaultStyle !== undefined) allowedUpdate["diaryTitle.defaultStyle"] = diaryTitle.defaultStyle;
      if (diaryTitle.letters !== undefined)      allowedUpdate["diaryTitle.letters"] = diaryTitle.letters;
    }

    console.log("allowed update:", allowedUpdate);

    const diary = await Diary.findByIdAndUpdate(
      diaryId,
      { $set: allowedUpdate },
      { new: "true" }
    );

    if (!diary)
      return res.status(404).json({ message: "Diary not found" });

    res.json(diary);
  } catch (err) {
    console.error("Error editing diary:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/diary/:diaryId/entry — create or update today's entry
diaryroutes.post("/entry/:diaryId/save", async (req, res) => {
  try {
    console.log("are we in route?"); 
    const { diaryId } = req.params;
    const { date, day, content } = req.body;
    console.log(diaryId); 

    if (!diaryId) return res.status(400).json({ message: "diaryId required" });
    if (!date)    return res.status(400).json({ message: "date required" });

    // Check diary exists
    const diary = await Diary.findById(diaryId);
    console.log(diary);
    if (!diary) return res.status(404).json({ message: "Diary not found" });

        // Match by day range, not exact timestamp
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Upsert: if an entry already exists for this date, update it
    const entry = await DiaryEntry.findOneAndUpdate(
      {
        diaryId: new mongoose.Types.ObjectId(diaryId),
        Date: { $gte: startOfDay, $lte: endOfDay },  // ← match whole day
      },
      {
        $set: {
          Date: new Date(date),
          Day: day,
          content,
        },
      },
      { new: true, upsert: true }
    );

    console.log(entry);
    res.status(201).json({ message: "Entry saved", entry });
  } catch (err) {
    console.error("Error saving entry:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/diary/:diaryId/entry/today — fetch today's entry or scaffold a new one
diaryroutes.get("/:diaryId/entry", async (req, res) => {
  try {
    const { diaryId } = req.params;
    const date = req.query.date ? new Date(req.query.date) : new Date();


    if (!diaryId) return res.status(400).json({ message: "diaryId required" });
    const diary = await Diary.findById(diaryId);
    if (!diary) return res.status(404).json({ message: "Diary not found" });

    // Build a date range for today (midnight → midnight) so time doesn't matter
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await DiaryEntry.findOne({
      diaryId: new mongoose.Types.ObjectId(diaryId),
      Date: { $gte: startOfDay, $lte: endOfDay },
    });

    console.log(existing); 
    if (existing) return res.json({ entry: existing, isNew: false });

    // No entry yet — return a scaffold (don't save it until user actually writes)
    const scaffold = {
      diaryId,
      Date: date,
      Day: date.toLocaleDateString("en-US", { weekday: "long" }),
      content: { leftPage: Array(9).fill(""), rightPage: Array(9).fill("") },
    };

    res.json({ entry: scaffold, isNew: true });
  } catch (err) {
    console.error("Error fetching today's entry:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default diaryroutes; 