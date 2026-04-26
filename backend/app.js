import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import { connectDB } from "./db.js";
import airouter from "./routes/ai.js";
import authRoutes from "./routes/auth.js";
import chapterroutes from "./routes/chapters.js";
import diaryroutes from "./routes/diary.js";
import levelroutes from "./routes/levels.js";
import performanceRouter from "./routes/performance.js";
import router from "./routes/progress.js";
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chapters" , chapterroutes); 
app.use("/api/levels", levelroutes);
app.use("/api/progress", router);
app.use("/api/performance", performanceRouter);
app.use("/api/ai", airouter);
app.use("/api/diary",diaryroutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});