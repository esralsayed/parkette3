import express from "express";
import { CalendarDay } from "../models/Tracking Agent/Calender.js";
import { User } from "../models/User.js";

const calendarRouter = express.Router();

// GET /calender/:userId — returns days + computed stats
calendarRouter.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [days, user] = await Promise.all([
      CalendarDay.find({ userId }).sort({ date: 1 }),
      User.findById(userId).select("createdAt"),
    ]);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Total days since the user joined (inclusive)
    const joinDate = user?.createdAt ? new Date(user.createdAt) : null;
    if (joinDate) joinDate.setHours(0, 0, 0, 0);
    const totalDaysSinceJoin = joinDate
      ? Math.floor((now - joinDate) / 86400000) + 1
      : null;

    // Build a set of dates that have a CalendarDay record
    const visitedDates = new Set(
      days.map((d) => new Date(d.date).toISOString().split("T")[0])
    );

    // Missing days = every day since join that has no record at all
    let missedDays = 0;
    if (joinDate) {
      const cursor = new Date(joinDate);
      while (cursor <= now) {
        const key = cursor.toISOString().split("T")[0];
        if (!visitedDates.has(key)) missedDays++;
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    const favoriteDays = days.filter((d) => d.status === "favorite").length;
    res.json({
      days,
      stats: {
        totalDaysSinceJoin,
        missedDays,
        favoriteDays,
        visitedDays: days.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /calender/:userId — create or update a day
calendarRouter.post("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { date, status, note } = req.body;
  try {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    // Don't downgrade a favorite back to completed
    const existing = await CalendarDay.findOne({ userId, date: normalizedDate });
    if (existing?.status === 'favorite') {
      return res.json({ day: existing });
    }

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

// PATCH /calender/:userId/:date/favorite — toggle favorite on a specific day
calendarRouter.patch("/:userId/:date/favorite", async (req, res) => {
  const { userId, date } = req.params;
  try {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const day = await CalendarDay.findOne({ userId, date: normalizedDate });
    if (!day) return res.status(404).json({ message: "Day not found" });

    day.status = day.status === "favorite" ? "completed" : "favorite";
    await day.save();
    console.log(`Toggled favorite for ${date}: now ${day.status}`);
    res.json({ day });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default calendarRouter;