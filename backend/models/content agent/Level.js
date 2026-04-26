import mongoose from "mongoose";

const { Schema } = mongoose;

// ── Tags (same shape as Chapter) ────────────────────────────
const TagsSchema = new Schema(
  {
    environment: { type: String },
    skills: { type: [String] },
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    difficultyScore: { type: Number, min: 1, max: 3 },
    ageRange: { type: [String] },
    emotionalTheme: { type: String },
    source: {
      type: String,
      enum: ["ai", "manual", "ai_reviewed"],
      default: "ai",
    },
  },
  { _id: false }
);

// ── Scene ───────────────────────────────────────────────────
// Base scene + AI pre-generated language variants
const SceneSchema = new Schema(
  {
    backgroundImage: { type: String },
    narrative: { type: String, required: true },  // base version you author
    narrativeVariants: {
      simple: { type: String },   // AI-generated for younger/struggling kids
      complex: { type: String },  // AI-generated for advanced kids
    },
    characters: { type: [String], default: [] },
    audioNarration: { type: String },  // URL to audio file
  },
  { _id: false }
);

// ── Task ────────────────────────────────────────────────────
// content shape varies by type — kept flexible (Mixed)
// drag_drop:   { items: [String], targets: [String] }
// tap_object:  { objectsInScene: [String], correctObject: String }
// choice:      { options: [String], correctIndex: Number }
// speak:       { expectedPhrase: String, acceptSimilar: Boolean }


// ── Difficulty Variant ──────────────────────────────────────
// Same safety rule, different social pressure level
// AI pre-generates these from the base scene + task
const DifficultyVariantSchema = new Schema(
  {
    dialog: { type: [Schema.Types.Mixed], default: [] }, // ← ADD THIS

  },
  { _id: false }
);

const DialogStepSchema = new Schema({
  type: {
    type: String,
    enum: ["narrate", "dialog", "task"],
    required: true,
  },
  sceneKey: { type: String },  // e.g. "park", "school", "home" for easier AI prompting

  // for narrate + dialog
  text:     { type: String },
  // for dialog only
  speaker:  { type: String },
  
  // ── Task-specific fields (when type === "task") ──
  taskType: {
    type: String,
    enum: ["choice", "tap_object", "drag_drop", "speak", "image_choice"],
  },
    gameType: {
    type: String,
    // no enum — open-ended so you can add games freely
    // e.g. 'find_friends', 'choose_slide', 'match_pairs', 'sort_items'
  },
    renderMode: {
    type: String,
    enum: ['inline', 'overlay', 'fullscreen'],
    default: 'inline',
  },
  instruction: { type: String },           // task instruction
   content: {
    type: Schema.Types.Mixed,              // shape varies by taskType
  },
  correctFeedback: { type: String },       // shown on correct answer
  wrongFeedback: { type: String },         // shown on wrong answer
  
  // continuation steps after correct task completion
  continuationSteps: [{ type: Schema.Types.Mixed }],
  
}, { _id: false });


// ── Level ───────────────────────────────────────────────────
const LevelSchema = new Schema(
  {
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true },  // order within the chapter

    tags: { type: TagsSchema, default: () => ({}) },

    scene: { type: SceneSchema, required: true },

    // AI pre-generated difficulty variants of this level
    // keyed by difficulty string for easy lookup
    difficultyVariants: {
      easy: { type: DifficultyVariantSchema },
      medium: { type: DifficultyVariantSchema },
      hard: { type: DifficultyVariantSchema },
    },

    reward: {
      stars: { type: Number, default: 3 },  // max stars for clean first pass
    },

    maxRetries: { type: Number, default: 3 },  // overrides chapter failThreshold for this level

    isActive: { type: Boolean, default: true },
    dialog: { type: [DialogStepSchema], default: [] },

  },
  { timestamps: true }
);

// index for fast chapter-level queries
LevelSchema.index({ chapterId: 1, order: 1 });

export default mongoose.model("Level", LevelSchema);