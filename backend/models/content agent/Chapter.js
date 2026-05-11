import mongoose from "mongoose";

const { Schema } = mongoose;

// ── Tags (reused in Level too) ──────────────────────────────
const TagsSchema = new Schema(
  {
    environment: {
      type: String,
      enum: ["park", "house", "school", "forest", "market", "street", "online"],
    },
    skills: {
      type: [String],
      enum: ["language", "social", "motor", "focus", "memory", "emotional", "safety"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
    },
    difficultyScore: {
      type: Number,
      min: 1,
      max: 3,  // 1=easy, 2=medium, 3=hard — used for numeric comparison in routing
    },
    ageRange: {
      type: [String],
      enum: ["4-6", "6-8", "8-10"],
    },
    emotionalTheme: {
      type: String,
      enum: ["friendship", "sharing", "courage", "trust", "boundaries", "empathy"],
    },
    source: {
      type: String,
      enum: ["ai", "manual", "ai_reviewed"],
      default: "ai",
    },
  },
  { _id: false }
);

// ── Fail Threshold ──────────────────────────────────────────
const FailThresholdSchema = new Schema(
  {
    maxRetriesPerLevel: { type: Number, default: 3 },
    minPassRate: { type: Number, default: 0.6 }, // 60% of levels passed cleanly
  },
  { _id: false }
);

// ── Chapter ─────────────────────────────────────────────────
const ChapterSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    coverImage: { type: String },

    tags: { type: TagsSchema, default: () => ({}) },
    taggingStatus: {
      type: String,
      enum: ["pending", "approved", "flagged"],
      default: "pending",
    }, // for content moderation workflow

    failThreshold: { type: FailThresholdSchema, default: () => ({}) },
    // unlockRules: {
    //   requiredPassedLevels: { type: Number, default: 1 },
    //   requiredAvgStars: { type: Number, default: 0 }
    // },
    unlockedOn: { type: Number, default: null }, // which chapter needs to be passed to unlock this one (null for first chapter),
    isActive: { type: Boolean, default: true }, // soft delete / draft toggle
  },
  { timestamps: true }
);

export default mongoose.model("Chapter", ChapterSchema);