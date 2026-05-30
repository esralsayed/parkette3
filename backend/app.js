import dotenv from "dotenv";
dotenv.config();

// import { spawn } from "child_process";
import cors from "cors";
import express from "express";
import { createServer } from 'http';
// import path from "path";
import { Server } from 'socket.io';
// import { fileURLToPath } from "url";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import avatarRoutes from "./routes/avatar.js";
import chapterroutes from "./routes/chapters.js";
import communityroutes from "./routes/community.js";
import diaryroutes from "./routes/diary.js";
import levelroutes from "./routes/levels.js";
import performanceRouter from "./routes/performance.js";
import router from "./routes/progress.js";
import recRouter from "./routes/recommend.js";
// import { checkSidecarHealth } from "./utils/emotionAnalyser.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const app = express();
const httpServer = createServer(app); 
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:8081', 'https://parkette.vercel.app'],
    credentials: true
  }
});
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
app.use(cors({
  origin: ['http://localhost:8081', 'https://parkette.vercel.app' , 'http://127.0.0.1:5500'],
  credentials: true
}));
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
app.use("/api/recommend", recRouter)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

//Emotion analysis 
// function startMLSidecar() {
//   return new Promise((resolve, reject) => {
//     const sidecar = spawn("python", [
//       path.join(__dirname, "ml", "emotion.py")
//     ]);

//     sidecar.stdout.on("data", (data) => {
//       const msg = data.toString();
//       console.log(`[ML] ${msg.trim()}`);

//       // Resolve once the model confirms it's ready
//       if (msg.includes("Model ready")) resolve(sidecar);
//     });

//     sidecar.stderr.on("data", (data) => {
//       // transformers logs to stderr by default — not always an error
//       console.log(`[ML stderr] ${data.toString().trim()}`);
//     });

//     sidecar.on("error", (err) => {
//       console.error("Failed to start ML sidecar:", err);
//       reject(err);
//     });

//     sidecar.on("close", (code) => {
//       if (code !== 0) {
//         console.error(`ML sidecar exited with code ${code}`);
//       }
//     });

//     // Fallback: if model takes too long to log "Model ready",
//     // resolve anyway after 30s (transformers logs go to stderr)
//     setTimeout(() => resolve(sidecar), 30000);
//   });
// }

// async function bootstrap() {
//   console.log("Starting ML sidecar...");
//   await startMLSidecar();

//   // Confirm it's actually reachable
//   const healthy = await checkSidecarHealth();
//   if (!healthy) {
//     console.error("ML sidecar health check failed — exiting.");
//     process.exit(1);
//   }

//   console.log("ML sidecar is up and healthy.");
//   app.listen(process.env.PORT || 3000, () => {
//       console.log(`Server running on port ${process.env.PORT || 3000}`);
//     });
// }

// bootstrap();

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// httpServer.listen(3000); 

httpServer.listen(PORT, () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});