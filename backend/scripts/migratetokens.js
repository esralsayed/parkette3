import dotenv from "dotenv";
import mongoose from "mongoose";
import { Parent } from "../models/User.js";

dotenv.config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected");

    const parents = await Parent.find({});

    for (const parent of parents) {

      for (const [key, perms] of parent.permissions.entries()) {

        // convert to plain object
        const updatedPerms = {
          ...perms.toObject(),
          diaryEmotionalAnalysis: true,
        };

        parent.permissions.set(key, updatedPerms);
      }

      // IMPORTANT
      parent.markModified("permissions");

      await parent.save();

      console.log("Updated:", parent._id);
    }

    console.log("Done");
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();