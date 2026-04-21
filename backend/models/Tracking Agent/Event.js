import { Schema, model } from "mongoose";

const eventSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  type: String, // e.g., "choice_made"
  data: Object, // flexible to store sceneId, choiceId, etc.
  timestamp: { type: Date, default: Date.now }
});

export default model("Event", eventSchema);