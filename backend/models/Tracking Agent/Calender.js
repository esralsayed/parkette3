import { Schema, model } from "mongoose";

const calendarDaySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

  date: { type: Date, required: true },

  status: {
    type: String,
    enum: ["completed", "missed", "favorite"],
    default: "completed",
  },

  note: String, // for diary feature 📝

  createdAt: { type: Date, default: Date.now },
});

// Prevent duplicate days per user
calendarDaySchema.index({ userId: 1, date: 1 }, { unique: true });

const calendarSummarySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },

  totalDays: Number,
  missedDays: Number,
  favoriteDays: Number,
});

export default model("CalendarSummary", calendarSummarySchema);