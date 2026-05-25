import crypto from 'crypto';
import express from "express";
import jwt from "jsonwebtoken";
import OTP from '../models/OTP.js';
import { Parent, User } from "../models/User.js";
import { sendVerificationEmail } from '../utils/mailer.js';
import { createDiaryForUser } from "./diary.js";

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  try {
    console.log("RAW BODY:", req.body);
    const { name, username, email, password } = req.body;
    // Check if user already exists by email or username
    const existingUser = await Parent.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
      const parent = new Parent({
        name,
        username,
        email,
        password,
      });
      await parent.save();
  
      const token = jwt.sign(
        { userId: parent._id, role: "parent" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: parent._id,
        name: parent.name,
        username: parent.username,
        email: parent.email,
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/send-otp
// Called right after signup — sends OTP to the parent's email
router.post('/send-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(userId);
    const user = await Parent.findById(userId);
    console.log(user)
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

    // Invalidate any existing unused OTPs for this user
    await OTP.deleteMany({ userId });

    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();

    // Save to DB with 15 min expiry
    await OTP.create({
      userId,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await sendVerificationEmail(user.email, code);

    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// POST /api/auth/verify-otp
// Called when the parent submits the 6-digit code
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, code } = req.body;

    const otp = await OTP.findOne({ userId, code, used: false });

    if (!otp) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    if (otp.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Code has expired' });
    }

    // Mark OTP as used
    otp.used = true;
    await otp.save();

    // Mark user as verified
    await Parent.findByIdAndUpdate(userId, { isVerified: true });

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password, role = "child" } = req.body;

    let user;
    if (role === "parent") {
      user = await Parent.findOne({ username });
    } else {
      user = await User.findOne({ username });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role,
        email: user.email,
        friendCode: user.friendCode,
        level: user.level
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Register child route (after parent signup)
router.post("/register-child", async (req, res) => {
  try {
    console.log("Register child with data:", req.body);
    const { name, email, password, username, parentId } = req.body;

    // Check if child already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create child user
    const child = new User({
      name,
      email,
      password,
      username,
      parentId,
    });

    await child.save();
    await createDiaryForUser(child._id, child.name);

///save children to parent
    const parent = await Parent.findById(parentId);
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    parent.children.push(child._id);
    await parent.save();

    res.status(201).json({
      message: "Child registered successfully",
      child: {
        id: child._id,
        name: child.name,
        email: child.email,
        username: child.username,
      }
    });
  } catch (error) {
    console.error("Register child error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/delete", async (req, res) => {
  try {
    console.log("deleting...", req.query);

    const { userId } = req.query;

    if (!userId)
      return res.status(400).json({ message: "userId required" });

    const user = await User.findByIdAndDelete(userId);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const diary = await Diary.deleteOne({userId:userId});
    console.log("deleted diary?", diary); 

    return res.status(200).json({
      message: "User deleted successfully",
      user
    });

  } catch (error) {
    console.error("deleting child error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;