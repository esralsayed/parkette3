import mongoose from "mongoose";

const { Schema } = mongoose;

// ── Insight Report ──────────────────────────────────────────
// AI-generated summary of a child's gameplay outcomes
// sent to parent/teacher on demand or on schedule

const InsightReportSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    generatedFor: {
      type: String,
      enum: ["parent", "teacher"],
      required: true,
    },

    period: {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },

    // AI-generated narrative summary
    summary: { type: String },

    // structured highlights pulled from Progress
    highlights: {
      chaptersCompleted: { type: Number, default: 0 },
      levelsCompleted: { type: Number, default: 0 },
      totalStars: { type: Number, default: 0 },
      totalXp: { type: Number, default: 0 },

      strongSkills: { type: [String], default: [] },   // skills with high score
      weakSkills: { type: [String], default: [] },     // skills needing attention

      struggledChapters: [{ type: Schema.Types.ObjectId, ref: "Chapter" }],
      passedChapters: [{ type: Schema.Types.ObjectId, ref: "Chapter" }],
    },

    // suggested activities for parent/teacher to try offline
    recommendations: { type: [String], default: [] },

    sentAt: { type: Date },  // null = not yet sent
    sentTo: { type: String },  // email address it was sent to
  },
  { timestamps: true }
);

InsightReportSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("InsightReport", InsightReportSchema);