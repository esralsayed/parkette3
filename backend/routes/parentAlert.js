// routes/parentAlerts.js
// Mount this under /api/parent — e.g. app.use('/api/parent', parentAlertsRouter)
//
// Endpoints:
//   GET  /api/parent/alerts/:parentId          → paginated list of all alerts
//   POST /api/parent/alerts/:alertId/dismiss   → mark one alert dismissed
//   POST /api/parent/alerts/dismiss-all        → dismiss all for a parent

import express from "express";
import mongoose, { Schema } from "mongoose";

const ParentRouter = express.Router();

// ─────────────────────────────────────────────
// MODELS  (define inline so this file is self-contained;
//          if you already have these models elsewhere just import them)
// ─────────────────────────────────────────────

// ParentAlert model — a unified feed of safety events for a parent
const parentAlertSchema = new Schema(
  {
    parentId:  { type: Schema.Types.ObjectId, ref: "Parent", required: true, index: true },
    childId:   { type: Schema.Types.ObjectId, ref: "User",   required: true },

    // "message_flagged" | "message_blocked" | "emotion_severe"
    alertType: {
      type: String,
      enum: ["message_flagged", "message_blocked", "emotion_severe"],
      required: true,
    },

    // For message alerts
    messageId:        { type: Schema.Types.ObjectId, ref: "Message", default: null },
    messageContent:   { type: String, default: null },   // original message text
    flagReasons:      [{ type: String }],

    // For emotion alerts
    diaryEntryId:  { type: Schema.Types.ObjectId, ref: "DiaryEntry", default: null },
    severity:      { type: String, enum: ["mild", "moderate", "severe", null], default: null },
    topEmotion:    { type: String, default: null },
    confidence:    { type: Number, default: null },

    dismissed:    { type: Boolean, default: false },
    dismissedAt:  { type: Date,    default: null },
  },
  { timestamps: true }
);

export const ParentAlert =
  mongoose.models.ParentAlert || mongoose.model("ParentAlert", parentAlertSchema);

// ─────────────────────────────────────────────
// HELPER  called from your community send-message route
//         and from your diary save route
// ─────────────────────────────────────────────

/**
 * createMessageAlert
 * Call this inside your community message route after Message.create()
 * whenever classification.tier is "needs_caution" or "unsafe".
 *
 * Usage:
 *   import { createMessageAlert } from './parentAlertsRoute.js';
 *   await createMessageAlert({ childId: senderId, messageId: msg._id,
 *                              content, tier: classification.tier,
 *                              flagReasons: mappedReasons });
 */
export async function createMessageAlert({ childId, messageId, content, tier, flagReasons }) {
  try {
    const User   = mongoose.model("User");
    const child  = await User.findById(childId).lean();
    if (!child?.parentId) return; // no parent linked — skip

    const alertType = tier === "unsafe" ? "message_blocked" : "message_flagged";

    await ParentAlert.create({
      parentId:       child.parentId,
      childId,
      alertType,
      messageId,
      messageContent: content,
      flagReasons:    flagReasons ?? [],
    });
  } catch (err) {
    console.error("[CREATE MESSAGE ALERT ERROR]", err);
  }
}

/**
 * createEmotionAlert
 * Call this inside your diary save route instead of (or alongside) sendAlert().
 *
 * Usage:
 *   import { createEmotionAlert } from './parentAlertsRoute.js';
 *   await createEmotionAlert({ childId: user._id, diaryEntryId: entry._id,
 *                              severity, topEmotion, confidence });
 */
export async function createEmotionAlert({ childId, diaryEntryId, severity, topEmotion, confidence }) {
  try {
    const User  = mongoose.model("User");
    const child = await User.findById(childId).lean();
    if (!child?.parentId) return;

    await ParentAlert.create({
      parentId: child.parentId,
      childId,
      alertType:    "emotion_severe",
      diaryEntryId: diaryEntryId ?? null,
      severity:     severity    ?? "severe",
      topEmotion:   topEmotion  ?? null,
      confidence:   confidence  ?? null,
    });
  } catch (err) {
    console.error("[CREATE EMOTION ALERT ERROR]", err);
  }
}

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

/**
 * GET /api/parent/alerts/:parentId
 * Query params:
 *   page     (default 1)
 *   limit    (default 20)
 *   type     "message_flagged" | "message_blocked" | "emotion_severe" | "all" (default "all")
 *   dismissed true | false | "all" (default false — hide dismissed)
 */
ParentRouter.get("/alerts/:parentId", async (req, res) => {
  try {
    const { parentId } = req.params;
    const page      = Math.max(1, parseInt(req.query.page  ?? "1"));
    const limit     = Math.min(50, parseInt(req.query.limit ?? "20"));
    const typeFilter      = req.query.type      ?? "all";
    const dismissedFilter = req.query.dismissed ?? "false";

    const filter = { parentId: new mongoose.Types.ObjectId(parentId) };

    if (typeFilter !== "all") filter.alertType = typeFilter;

    if (dismissedFilter === "false")     filter.dismissed = false;
    else if (dismissedFilter === "true") filter.dismissed = true;
    // else "all" → no filter on dismissed

    const [alerts, total] = await Promise.all([
      ParentAlert.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("childId", "name username avatar level")
        .lean(),
      ParentAlert.countDocuments(filter),
    ]);

    // Unread badge count (undismissed)
    const unreadCount = await ParentAlert.countDocuments({
      parentId: new mongoose.Types.ObjectId(parentId),
      dismissed: false,
    });

    res.json({
      alerts,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[GET ALERTS ERROR]", err);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
});

/**
 * POST /api/parent/alerts/:alertId/dismiss
 */
ParentRouter.post("/alerts/:alertId/dismiss", async (req, res) => {
  try {
    const alert = await ParentAlert.findByIdAndUpdate(
      req.params.alertId,
      { dismissed: true, dismissedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json({ message: "Alert dismissed", alert });
  } catch (err) {
    res.status(500).json({ message: "Failed to dismiss alert" });
  }
});

/**
 * POST /api/parent/alerts/dismiss-all
 * Body: { parentId }
 */
ParentRouter.post("/alerts/dismiss-all", async (req, res) => {
  try {
    const { parentId } = req.body;
    if (!parentId) return res.status(400).json({ message: "parentId required" });

    await ParentAlert.updateMany(
      { parentId: new mongoose.Types.ObjectId(parentId), dismissed: false },
      { dismissed: true, dismissedAt: new Date() }
    );
    res.json({ message: "All alerts dismissed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to dismiss alerts" });
  }
});

export default ParentRouter;

// ─────────────────────────────────────────────
// HOW TO WIRE THIS UP
// ─────────────────────────────────────────────
//
// 1. In your Express app entry point:
//
//    import parentAlertsRouter from './routes/parentAlertsRoute.js';
//    app.use('/api/parent', parentAlertsRouter);
//
// 2. In your community message send route, after Message.create():
//
//    import { createMessageAlert } from './routes/parentAlertsRoute.js';
//    ...
//    if (!isBlocked && needsReview || isBlocked) {
//      await createMessageAlert({
//        childId:     senderId,
//        messageId:   msg._id,
//        content,
//        tier:        classification.tier,   // "needs_caution" | "unsafe"
//        flagReasons: mappedReasons,
//      });
//    }
//
// 3. In your diary save route, where assessSeverity returns shouldAlert:
//
//    import { createEmotionAlert } from './routes/parentAlertsRoute.js';
//    ...
//    if (assessment.shouldAlert) {
//      await createEmotionAlert({
//        childId:      user._id,
//        diaryEntryId: entry._id,
//        severity:     assessment.severity,
//        topEmotion:   assessment.topEmotion,
//        confidence:   assessment.confidence,
//      });
//      // keep your existing sendAlert() email call here too if desired
//    }