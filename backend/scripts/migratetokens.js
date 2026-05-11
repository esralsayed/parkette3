// scripts/removeUnlockedChapters.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import Progress from "../models/content agent/Progress.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await Progress.updateMany(
      {},
      {
        $unset: {
          unlockedChapters: "",
        },
      }
    );

    console.log("unlockedChapters removed:", result.modifiedCount);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();