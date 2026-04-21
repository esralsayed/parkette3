// backend/models/PerformanceModel.ts

import mongoose from 'mongoose';

const PerformanceSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  levelId: { type: String, required: true },
  sessionId: { type: String, required: true },
  taskId: { type: String, required: true },
  taskType: { type: String },
  correct: { type: Boolean, required: true },
  timeTaken: { type: Number, required: true },
  accuracy: { type: Number },
  averageResponseTime: { type: Number },
  timestamp: { type: Date, default: Date.now, index: true }
});

// Compound index for fast queries
PerformanceSchema.index({ userId: 1, timestamp: -1 });
PerformanceSchema.index({ levelId: 1, timestamp: -1 });

export const PerformanceModel = mongoose.model('Performance', PerformanceSchema);