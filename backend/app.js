import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import avatarRoutes from "./routes/avatar.js";
import chapterroutes from "./routes/chapters.js";
import communityroutes from "./routes/community.js";
import diaryroutes from "./routes/diary.js";
import levelroutes from "./routes/levels.js";
import performanceRouter from "./routes/performance.js";
import router from "./routes/progress.js";
const app = express();
const httpServer = createServer(app); 
const io = new Server(httpServer , {
  cors: {origin: '*'}
})
const PORT = process.env.PORT || 5000;

const userSocketMap = new Map();

// in your socket setup (app.js or wherever io is configured)
io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("register", (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log("registered:", userId, "→", socket.id);
    console.log("userSocketMap now:", Object.fromEntries(userSocketMap)); // see all registered users
  });
  socket.on('join_session', id => socket.join(id))

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);
  });
});

// Make io and the map available to routes
export { io, userSocketMap };

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
app.use("/api/diary",diaryroutes);
app.use("/api/community" , communityroutes);
app.use("/api/avatar", avatarRoutes); 

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// httpServer.listen(3000); 

httpServer.listen(PORT, () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});