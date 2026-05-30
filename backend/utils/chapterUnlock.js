import Chapter from "../models/content agent/Chapter.js";
import { User } from "../models/User.js";

// ─────────────────────────────────────────────────────────────────
// evaluateAndUnlockChapters
//
// Single source of truth for chapter unlocking.
// Called from two places:
//   1. POST /progress/level  — after a level is passed (level-based unlock)
//   2. GET  /api/recommend   — after Groq recommends a level in a locked chapter
//
// Unlock triggers:
//   A) user.level >= chapter.unlockedOn  (original logic)
//   B) recommendedChapterId is provided  (recommendation-based unlock)
//
// Both triggers are evaluated together so we never double-write
// or miss one.
//
// Returns:
//   { newlyUnlocked: [chapterId, ...] }
//   newlyUnlocked — chapter IDs that were just unlocked this call
//                   (empty array if nothing changed)
// ─────────────────────────────────────────────────────────────────
export async function evaluateAndUnlockChapters(userId, { recommendedChapterId = null } = {}) {
  const [user, chapters] = await Promise.all([
    User.findById(userId).select("level unlockedChapters"),
    Chapter.find({ isActive: true }).select("_id unlockedOn"),
  ]);

  if (!user) throw new Error(`User ${userId} not found`);

  // Build a Set of already-unlocked chapter IDs for O(1) lookup
  const alreadyUnlocked = new Set(
    (user.unlockedChapters ?? []).map((id) => id.toString())
  );

  const toUnlock = [];

  // ── Trigger A: level-based unlock ─────────────────────────────
  for (const chapter of chapters) {
    const chapterId = chapter._id.toString();
    if (alreadyUnlocked.has(chapterId)) continue;
    if (chapter.unlockedOn != null && user.level >= chapter.unlockedOn) {
      toUnlock.push(chapter._id);
      alreadyUnlocked.add(chapterId); // prevent duplicate in same call
    }
  }

  // ── Trigger B: recommendation-based unlock ────────────────────
  if (recommendedChapterId) {
    const recId = recommendedChapterId.toString();
    if (!alreadyUnlocked.has(recId)) {
      // Verify the chapter actually exists and is active
      const exists = chapters.find((ch) => ch._id.toString() === recId);
      if (exists) {
        toUnlock.push(exists._id);
        alreadyUnlocked.add(recId);
      } else {
        console.warn(`⚠️ [Unlock] recommendedChapterId ${recId} not found or inactive`);
      }
    }
  }

  // ── Persist if anything changed ───────────────────────────────
  if (toUnlock.length > 0) {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { unlockedChapters: { $each: toUnlock } },
    });
    console.log(
      `🔓 [Unlock] Unlocked ${toUnlock.length} chapter(s) for user ${userId}:`,
      toUnlock.map((id) => id.toString())
    );
  }

  return { newlyUnlocked: toUnlock.map((id) => id.toString()) };
}