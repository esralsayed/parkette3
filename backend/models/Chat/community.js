import mongoose from "mongoose";

const { Schema } = mongoose;

// ── Moderation result (reused across post + message) ────────
const ModerationSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["pending", "approved", "flagged", "blocked"],
      default: "pending",
    },
    flagReasons: {
      type: [String],
      enum: [
        "inappropriate_language",
        "bullying",
        "personal_info_detected",
        "adult_content",
        "other",
      ],
      default: [],
    },
    reviewedAt: { type: Date },
    autoModerated: { type: Boolean, default: true }, // true = AI flagged, false = human reviewed
  },
  { _id: false }
);

// ── Community Post ──────────────────────────────────────────
const CommunityPostSchema = new Schema(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: { type: String, required: true },
    imageUrl: { type: String },

    // sanitized version shown to others if AI detected issues
    sanitizedContent: { type: String },

    moderation: { type: ModerationSchema, default: () => ({}) },

    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isVisible: { type: Boolean, default: false }, // false until moderation passes
  },
  { timestamps: true }
);

CommunityPostSchema.index({ authorId: 1, createdAt: -1 });
CommunityPostSchema.index({ "moderation.status": 1 }); // for moderation queue

// ── Direct Message ──────────────────────────────────────────
const MessageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: { type: String, required: true },
    moderation: { type: ModerationSchema, default: () => ({}) },

    isDelivered: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

export const CommunityPost = mongoose.model("CommunityPost", CommunityPostSchema);
export const Message = mongoose.model("Message", MessageSchema);