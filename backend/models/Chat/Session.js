import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['active', 'ended'],
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now },
  endedAt: Date
});

export const Session = mongoose.model('Session', SessionSchema);