import express from "express";
import jwt from "jsonwebtoken";
import { Parent, User } from "../models/User.js";
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
        process.env.JWT_SECRET || "your-secret-key",
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
      process.env.JWT_SECRET || "your-secret-key",
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