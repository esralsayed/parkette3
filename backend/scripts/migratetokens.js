// migrate-stickers.js
// Run once with: node migrate-stickers.js
// Adds page: "left" to all existing stickers that don't have a page field yet.
// Since we have no spread width stored, we default everything to "left" —
// which is safe because the old code placed stickers on both pages arbitrarily
// and there's no reliable way to know which page they were on without PAGE_W.

import mongoose from "mongoose";
import { DiaryEntry } from "../models/Diary.js"; // adjust path to your model

const MONGO_URI = "mongodb+srv://esraahmed109_db_user:esraa109db@cluster0.p9kerpy.mongodb.net/parkette?appName=Cluster0";

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Find all entries that have at least one sticker missing the page field
  const entries = await DiaryEntry.find({
    "stickers.0": { $exists: true },          // has at least one sticker
    "stickers.page": { $exists: false },      // at least one missing page
  });

  console.log(`Found ${entries.length} entries to migrate`);

  let updated = 0;

  for (const entry of entries) {
    let dirty = false;

    entry.stickers = entry.stickers.map(s => {
      if (!s.page) {
        dirty = true;
        return { ...s.toObject(), page: "left" };
      }
      return s;
    });

    if (dirty) {
      await entry.save();
      updated++;
    }
  }

  console.log(`Migration complete — updated ${updated} entries`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});