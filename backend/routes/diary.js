import express from "express";
import mongoose from "mongoose";
import Diary, { DiaryEntry } from "../models/Diary.js";
import { Parent, User } from "../models/User.js";
import { assessSeverity, classifyEmotion, extractText } from "../utils/emotionAnalyser.js";
import { sendAlert } from "../utils/sendAlerts.js";
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
    const user = await User.findById(diary.userId);
    const parent = await Parent.findById(user.parentId);
    const parentEmail = parent ? parent.email : null;
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

    if (parent.permissions.get(user._id.toString())?.diaryEmotionalAnalysis) {

    // ── Emotion analysis (non-blocking — won't fail the save) ──
    try {
      const text = extractText(content);

      if (text.length > 10) { // skip if entry is too short to analyze
        const emotions   = await classifyEmotion(text);
        const assessment = assessSeverity(emotions);

        console.log(`Emotion result for entry ${entry._id}:`, assessment);

        if (assessment.shouldAlert) {
          await sendAlert({
            diaryId,
            entryId: entry._id,
            severity:   assessment.severity,
            topEmotion: assessment.topEmotion,
            confidence: assessment.confidence,
            parentEmail: parentEmail ?? null, // adjust to your Diary schema
          });
        }
      }
    } catch (analysisErr) {
      // Never block the save response over analysis failure
      console.error("Emotion analysis failed:", analysisErr.message);
    }
  }

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
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await DiaryEntry.findOne({
      diaryId: new mongoose.Types.ObjectId(diaryId),
      Date: { $gte: startOfDay, $lte: endOfDay },
    });

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

// PATCH /api/diary/:diaryId/entry/:entryId/favourite
diaryroutes.patch("/:diaryId/entry/:entryId/favourite", async (req, res) => {
  try {
    console.log("body: ", req.body);
    const { diaryId, entryId } = req.params;
    const { favorite } = req.body;
    //const favorite = isFavorite === true || isFavorite === "true"; // ← force boolean
 
    if (!diaryId || !entryId)
      return res.status(400).json({ message: "diaryId and entryId required" });
 
    const entry = await DiaryEntry.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(entryId),
        diaryId: new mongoose.Types.ObjectId(diaryId),
      },
      { $set: { favorite: favorite } },
      { new: true }
    );
 
    if (!entry)
      return res.status(404).json({ message: "Entry not found" });
 
    res.json(entry);
  } catch (err) {
    console.error("Error toggling favourite:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/diary/:diaryId/stats
diaryroutes.get("/:diaryId/stats", async (req, res) => {
  try {
    console.log("are you here? backendd" ); 
    const { diaryId } = req.params;

    // Get the diary's creation date as the "start"
    const diary = await Diary.findById(diaryId);
    if (!diary) return res.status(404).json({ message: "Diary not found" });

    const allEntries = await DiaryEntry.find({
      diaryId: new mongoose.Types.ObjectId(diaryId)
    }).select("Date favorite");

    // Total days since diary was created up to today
const start = new Date(diary._id.getTimestamp());
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDays = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;

    const totalEntries = allEntries.length;
    const missedDays = totalDays - totalEntries;
    const favoriteDates = allEntries
      .filter(e => e.favorite === true)
      .map(e => e.Date.toISOString());

      console.log(totalDays, totalEntries, missedDays, favoriteDates)
    res.json({ totalDays, totalEntries, missedDays, favoriteDates });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/diary/:diaryId/favourites
diaryroutes.get("/:diaryId/favourites", async (req, res) => {
  try {
    const { diaryId } = req.params;
    const entries = await DiaryEntry.find({
      diaryId: new mongoose.Types.ObjectId(diaryId),
      favorite: true,
    }).select("Date content").sort({ Date: -1 });

    res.json(entries);
  } catch (err) {
    console.error("Error fetching favourites:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default diaryroutes; 