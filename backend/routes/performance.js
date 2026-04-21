// backend/routes/performance.ts
import express from 'express';
import { PerformanceModel } from '../models/Tracking Agent/Performance.js';

const performanceRouter = express.Router();

// Store individual task performance
performanceRouter.post('/track', async (req, res) => {
console.log('📥 Received performance data:', JSON.stringify(req.body, null, 2));

  try {
    // ✅ Fix: Check for undefined/null, not falsy values
    const requiredFields = ['userId', 'levelId', 'taskId', 'timeTaken'];
    const missingFields = requiredFields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null;
    });
    
    // ✅ Special handling for 'correct' (boolean can be false)
    if (req.body.correct === undefined || req.body.correct === null) {
      missingFields.push('correct');
    }
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    const performance = new PerformanceModel({
      userId: req.body.userId,
      levelId: req.body.levelId,
      sessionId: req.body.sessionId,
      taskId: req.body.taskId,
      taskType: req.body.taskType,
      correct: req.body.correct,
      timeTaken: req.body.timeTaken,
      accuracy: req.body.accuracy,
      averageResponseTime: req.body.averageResponseTime,
      timestamp: req.body.timestamp
    });
    console.log('💾 Saving performance record:', performance);

    await performance.save();
    
    // Update user's personalized difficulty profile
    console.log('4️⃣ Saved to database');
    
    // Try to send response
    console.log('5️⃣ Sending response...');
    return res.status(200).json({ success: true });
    
res.status(200).json({ 
      success: true,
      message: 'Performance tracked successfully',
      id: performance._id 
    });  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get performance summary for a user
performanceRouter.get('/user/:userId/summary', async (req, res) => {
  const { userId } = req.params;
  
  const summary = await PerformanceModel.aggregate([
    { $match: { userId } },
    { $group: {
      _id: null,
      totalTasks: { $sum: 1 },
      correctTasks: { $sum: { $cond: ['$correct', 1, 0] } },
      avgTime: { $avg: '$timeTaken' },
      avgHints: { $avg: '$hintsUsed' }
    }}
  ]);
  
  res.json(summary[0]);
});

// Get personalized difficulty recommendation
performanceRouter.get('/user/:userId/recommendation', async (req, res) => {
  const recentPerformance = await PerformanceModel.find({
    userId: req.params.userId,
    timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
  }).sort({ timestamp: -1 }).limit(50);
  
  // Calculate recommendation based on historical data
  const accuracy = recentPerformance.filter(p => p.correct).length / recentPerformance.length;
  const avgTime = recentPerformance.reduce((sum, p) => sum + p.timeTaken, 0) / recentPerformance.length;
  
  let recommendedDifficulty = 'medium';
  if (accuracy > 0.8 && avgTime < 5) recommendedDifficulty = 'hard';
  if (accuracy < 0.5 || avgTime > 15) recommendedDifficulty = 'easy';
  
  res.json({ recommendedDifficulty });
});

export default performanceRouter;