// services/tokenService.js
// constants/rewards.js
import { User } from "../models/User.js";
export const CHAPTER_REWARDS = {
  '69d2f1ce4c52af68e2ff6468': { tokens: 1, type: 'sticker',    itemId: 'sticker10',  label: 'Music Sticker' },
  '69fddebbf6b5e57336dca3b2': { tokens: 1, type: 'game',       itemId: 'feed_game',  label: 'Feed Game'     },
  '69fde9a3f6b5e57336dca3b6': { tokens: 1, type: 'hair',       itemId: 'hair9',      label: 'New Hairstyle' },
};

export const awardChapterToken = async (userId, chapterId) => {
  console.log("inside awards");

  // Handle both populated objects and raw ObjectId/string
  const chapterIdStr = chapterId?._id
    ? chapterId._id.toString()
    : chapterId.toString();

  console.log("chapterIdStr:", chapterIdStr); // ← add this to verify

  const reward = CHAPTER_REWARDS[chapterIdStr];
  if (!reward) {
    console.log("No reward found for chapterId:", chapterIdStr);
    return null;
  }

  const user = await User.findById(userId);
  const alreadyAwarded = user.tokenLedger?.some(
    (t) => t.chapterId?.toString() === chapterIdStr
  );
  if (alreadyAwarded) return null;

  await User.findByIdAndUpdate(userId, {
    $inc: { tokens: reward.tokens },
    $push: {
      tokenLedger: {
        amount:    reward.tokens,
        reason:    `chapter_${chapterIdStr}_complete`,
        chapterId: chapterIdStr,
        earnedAt:  new Date(),
      },
    },
    $addToSet: { unlockedItems: { type: reward.type, itemId: reward.itemId } },
  });

  return reward;
};