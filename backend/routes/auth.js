import crypto from 'crypto';
import express from "express";
import jwt from "jsonwebtoken";
import { authMiddleware, requireRole } from '../middleware/auth.js';
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
        if (!name || !username || !email || !password) {
      return res.status(400).json({ 
        message: "Missing required fields: name, username, email, and password are required" 
      });
    }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Please enter a valid email address",
        field: "email"
      });
    }
    // Check if user already exists by email or username
    const existingUser = await Parent.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const existingParentByEmail = await Parent.findOne({ email });
    if (existingParentByEmail) {
      return res.status(409).json({ 
        message: "Email already registered. Please use a different email or try logging in.",
        field: "email"
      });
    }
      const parent = new Parent({
        name,
        username,
        email,
        password,
      });
      await parent.save();

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

 if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'username') {
        return res.status(409).json({ 
          message: "Username already exists. Please choose a different username.",
          field: "username"
        });
      }
      if (field === 'email') {
        return res.status(409).json({ 
          message: "Email already registered. Please use a different email or try logging in.",
          field: "email"
        });
      }
    }
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/send-otp
// Called right after signup — sends OTP to the parent's email
router.post('/send-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    console.log('1. userId received:', userId);
    
    const user = await Parent.findById(userId);
    console.log('2. user found:', user);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

    console.log('3. deleting old OTPs');
    await OTP.deleteMany({ userId });

    const code = crypto.randomInt(100000, 999999).toString();
    console.log('4. code generated:', code);

    await OTP.create({
      userId,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    console.log('5. OTP saved to DB');

    await sendVerificationEmail(user.email, code);
    console.log('6. email sent');

    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('FAILED AT STEP:', err.message);
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
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
    const user = await Parent.findByIdAndUpdate(userId, { isVerified: true });

     // Generate token so parent can proceed directly
    const token = jwt.sign(
      { userId: user._id, role: 'parent' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Email verified successfully' ,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: 'parent',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;

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
        level: user.level,
        tokenLedger: user.tokenLedger,
        unlockedItems: user.unlockedItems
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
    const { name, password, username, parentId, permissions = {} } = req.body;
        // Validate required fields
    if (!name || !password || !username || !parentId) {
      return res.status(400).json({ 
        message: "Missing required fields: name, password, username, and parentId are required" 
      });
    }

    // Check if child already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists", field: "username"});
    }

    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ 
        message: "Parent not found. Please ensure you're logged in correctly.",
        field: "parentId"
      });
    }

    // Create child user
    const child = new User({
      name,
      password,
      username,
      parentId,
    });

    await child.save();
    await createDiaryForUser(child._id, child.name);

///save children to parent
    parent.children.push(child._id);
    parent.permissions.set(child._id.toString(), {
    communityAccess: permissions.communityAccess || false,
    diaryEmotionalAnalysis: permissions.diaryEmotionalAnalysis || true,
    diaryAiSuggestions: permissions.diaryAiSuggestions || true,
    insightReports: permissions.insightReports || true,
  });
    await parent.save();

    res.status(201).json({
      message: "Child registered successfully",
      child: {
        id: child._id,
        name: child.name,
        username: child.username,
      },
      permissions: parent.permissions.get(child._id.toString()),
    });
  } catch (error) {
    console.error("Register child error:", error);
        if (error.code === 11000) {
      return res.status(409).json({ 
        message: "Username already exists. Please choose a different username.",
        field: "username"
      });
    }
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

router.get("/children/:id", authMiddleware, requireRole("parent"), async (req, res) => {
  try {
    const { id } = req.params;

    // req.user.userId comes from your JWT payload
    if (req.user.userId !== id) {
      return res.status(403).json({ message: "Access denied." });
    }

    const parent = await Parent.findById(id)
      .populate("children", "-password -tokenLedger")
      .lean();

    if (!parent) {
      return res.status(404).json({ message: "Parent not found." });
    }

    return res.status(200).json({ children: parent.children });
  } catch (error) {
    console.error("fetchChildren error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});


export default router;