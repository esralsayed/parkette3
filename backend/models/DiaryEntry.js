import mongoose from "mongoose";

const { Schema } = mongoose;

// ── Diary Entry ─────────────────────────────────────────────
const DiaryEntrySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: { type: String, required: true },  // child's free text
    drawingUrl: { type: String },               // optional drawing/doodle upload

    // AI suggestions — only shown if parent has enabled diaryAiSuggestions
    aiSuggestions: {
      emotionLabels: { type: [String], default: [] },
      // e.g. ["happy", "excited", "a little nervous"]

      copingActivity: { type: String },
      // e.g. "Try taking 3 deep breaths and drawing how you feel"

      generatedAt: { type: Date },
    },

    // child's own emotion tag (they pick from a simple visual set)
    selfReportedEmotion: {
      type: String,
      enum: ["happy", "sad", "angry", "scared", "excited", "confused", "calm"],
    },

    isPrivate: { type: Boolean, default: true },  // always private by default
  },
  { timestamps: true }
);

// index for fetching a user's diary entries newest first
DiaryEntrySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("DiaryEntry", DiaryEntrySchema);