import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

const petSchema = new Schema({
  color:    String,
  accessory: String, // "bow", "hat", "scarf"
  name:     String,  // pet's name chosen by the user
}, { _id: false });

const avatarSchema = new Schema({
  hair: String,
  skin: String,
  top: String,
  bottom: String,
  shoes: String,
  accessory: String,
  pet:       { type: petSchema, default: () => ({}) }, // ← nested here

}, { _id: false });

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  parentId: { type: Schema.Types.ObjectId, ref: "Parent" },
  avatar: { type: avatarSchema, default: () => ({}) },
  level: { type: Number, default: 1 },
    profile: {
      dateOfBirth: { type: Date },
      ageRange: {
        type: String,
        enum: ["4-6", "6-8", "8-10"],
      },
      language: { type: String, default: "en" },
      readingLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
      },
    },

     friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    communityEnabled: { type: Boolean, default: false }, // requires parent permission
 
    isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// ── Parent ──────────────────────────────────────────────────
const ParentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },  // hashed
 
    children: [{ type: Schema.Types.ObjectId, ref: "User" }],
 
    // permissions granted per child — keyed by child userId string
    permissions: {
      type: Map,
      of: new Schema(
        {
          communityAccess: { type: Boolean, default: false },
          diaryAiSuggestions: { type: Boolean, default: true },
          insightReports: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: {},
    },
 
    notificationEmail: { type: String },  // where reports are sent
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

ParentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

ParentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const Parent = mongoose.model("Parent", ParentSchema);
export const User = mongoose.model("User", userSchema);
