import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('dirname:', __dirname);

await mongoose.connect(process.env.MONGO_URI);

const users = await User.find({ friendCode: { $exists: false } });
console.log(`Found ${users.length} users without a friend code`);

for (const user of users) {
  user.friendCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  await user.save();
  console.log(`Updated ${user.username}: ${user.friendCode}`);
}

console.log('Done!');
await mongoose.disconnect();