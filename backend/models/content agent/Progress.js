import mongoose from "mongoose";

const { Schema } = mongoose;

// ── Per-level progress ──────────────────────────────────────
const LevelProgressSchema = new Schema(
  {
    levelId: { type: Schema.Types.ObjectId, ref: "Level", required: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    attempts: { type: Number, default: 0 },       // key field for struggle detection
    passed: { type: Boolean, default: false },
    starsEarned: { type: Number, default: 0 },
    lastAttemptAt: { type: Date },
    completedAt: { type: Date },
    preQuestionnaireId:  { type: Schema.Types.ObjectId, ref: "QuestionnaireResponse" },
    postQuestionnaireId: { type: Schema.Types.ObjectId, ref: "QuestionnaireResponse" },
    preQuestionAnswers:  { type: Schema.Types.Mixed, default: null },
    postQuestionAnswers: { type: Schema.Types.Mixed, default: null },

    // which difficulty variant was served (ai-selected based on child profile)
    servedDifficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "base"],
      default: "base",
    },

    // which language variant was served
    servedLanguage: {
      type: String,
      enum: ["simple", "base", "complex"],
      default: "base",
    },

    choiceMade: { type: Schema.Types.Mixed },  // what the child answered — for reflection + insights
  },
  { _id: false }
);

// ── Per-chapter progress ────────────────────────────────────
const ChapterProgressSchema = new Schema(
  {
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    status: {
      type: String,
      enum: ["locked", "active", "passed", "struggled"],
      default: "locked",
    },
    starsEarned: { type: Number, default: 0 },
    totalStarsPossible: { type: Number, default: 0 },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { _id: false }
);

// ── Progress ────────────────────────────────────────────────
const ProgressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,  // one progress doc per user
    },

    chapterProgress: { type: [ChapterProgressSchema], default: [] },
    levelProgress: { type: [LevelProgressSchema], default: [] },

    currentChapterId: { type: Schema.Types.ObjectId, ref: "Chapter", default: null },
    currentLevelId: { type: Schema.Types.ObjectId, ref: "Level", default: null },

    totalStars: { type: Number, default: 0 },

    // skill performance map — updated after each level
    // used by AI to pick the next best level
    // e.g. { social: 0.8, language: 0.4, focus: 0.6 }
    skillScores: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// ── Helper: check if a chapter is unlocked ──────────────────
// Call this after completing a chapter to decide next routing
ProgressSchema.methods.evaluateChapter = function (chapter, levelDocs) {
  const relevant = this.levelProgress.filter(
    (lp) => lp.chapterId.toString() === chapter._id.toString()
  );

  const tooManyRetries = relevant.some(
    (lp) => lp.attempts > chapter.failThreshold.maxRetriesPerLevel
  );

  const passRate =
    relevant.filter((lp) => lp.passed).length / levelDocs.length;

  const struggled =
    tooManyRetries || passRate < chapter.failThreshold.minPassRate;

  return {
    struggled,
    passRate,
    nextChapterId: struggled
      ? chapter.remedialChapterId
      : chapter.nextChapterId,
  };
};

export default mongoose.model("Progress", ProgressSchema);