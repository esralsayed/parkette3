// routes/calendar.js
import express from "express";
import CalendarDay from "../models/Tracking Agent/Calender.js";

const router = express.Router();

// Get all calendar days for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const days = await CalendarDay.find({ userId });
    res.json({ days });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update or create a day
router.post("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { date, status, note } = req.body;

  try {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0,0,0,0);

    const day = await CalendarDay.findOneAndUpdate(
      { userId, date: normalizedDate },
      { status, note },
      { upsert: true, new: true }
    );

    res.json({ day });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;