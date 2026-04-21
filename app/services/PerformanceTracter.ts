// services/PerformanceTracker.ts
// 
// WHAT IS THIS FILE?
// ==================
// This is a "smart observer" that watches how the player performs
// and helps decide if the game should get easier or harder.
// 
// Think of it as a personal tutor who:
// 1. Watches every answer the player gives
// 2. Notes how long they take, how many hints they need
// 3. Analyzes patterns to understand their skill level
// 4. Recommends when to adjust difficulty

// ──────────────────────────────────────────────────────────────
// PERFORMANCE DATA INTERFACE
// ──────────────────────────────────────────────────────────────
// This defines WHAT information we collect about each player action

export interface PerformanceData {
  // WHO and WHERE
  userId: string;        // Which player (e.g., "user123")
  levelId: string;       // Which level (e.g., "level_1")
  timestamp: Date;       // When this happened (e.g., "9:00:00 AM")
  sessionId: string;     // Unique ID for this play session (e.g., "user123_level_1_1690000000000")
  
  // WHAT they did
  taskId: string;        // Which question/task (e.g., "morning_q1")
  taskType?: string;     // Type of task: 'choice', 'tap_object', etc.
  correct: boolean;      // Did they get it right? (true/false)
  timeTaken: number;     // How many seconds to answer (e.g., 5.2 seconds)
  
  // CALCULATED STATISTICS (derived from the above)
  tasksAttempted?: number;     // Total questions attempted so far
  tasksCorrect?: number;       // Total correct answers so far
  accuracy: number;           // Percentage correct (e.g., 75%)
  averageResponseTime: number; // Average time per question (e.g., 6.3 seconds)
  hesitationCount?: number;    // Long pauses (indicates struggling)
  abandonedTasks?: number;     // Tasks they gave up on
  
  // HISTORICAL TRENDS (how they're changing over time)
  previousAccuracy?: number;                    // What their accuracy was before
  trendDirection?: 'improving' | 'declining' | 'stable'; // Are they getting better or worse?
}

const API_URL = 'http://localhost:5000'; // Replace with your actual backend URL


// ──────────────────────────────────────────────────────────────
// PERFORMANCE TRACKER CLASS
// ──────────────────────────────────────────────────────────────
// This is the main brain that collects, stores, and analyzes data

export class PerformanceTracker {
  // 📚 DATA STORAGE
  // This array holds ALL the performance records for this game session
  // Think of it as a diary of everything the player does
  private sessionData: PerformanceData[] = [];
  
  // 👤 PLAYER IDENTIFICATION
  // Who is playing? (so we can track across different levels)
  private userId: string;
  
  // 🎮 LEVEL IDENTIFICATION  
  // Which level are they playing? (each level has different content)
  private levelId: string;
  private sessionId: string; // Unique ID for this play session (optional)

  onDifficultyChange?: (newDifficulty: 'easy' | 'medium' | 'hard') => void;


   // ✅ ADD THIS METHOD - Get number of tasks recorded
  getTaskCount(): number {
    return this.sessionData.length;
  }
  
  // ✅ ADD THIS METHOD - Get recent tasks (if needed)
  getRecentTasks(count: number): PerformanceData[] {
    return this.sessionData.slice(-count);
  }
  
  // ✅ ADD THIS METHOD - Check if any data exists
  hasData(): boolean {
    return this.sessionData.length > 0;
  }
  
  // ──────────────────────────────────────────────────────────
  // CONSTRUCTOR - Called when we start tracking a player
  // ──────────────────────────────────────────────────────────
  // Example: new PerformanceTracker("user123", "level_1")
  constructor(userId: string, levelId: string) {
    this.userId = userId;
    this.levelId = levelId;
    this.sessionId = `${userId}_${levelId}_${Date.now()}`; // Unique session ID
    console.log(`📊 PerformanceTracker started for ${userId} on ${levelId}`);
  }
  
  // ──────────────────────────────────────────────────────────
  // METHOD 1: RECORD TASK ATTEMPT
  // ──────────────────────────────────────────────────────────
  // Called EVERY TIME the player answers a question
  // Records what happened and calculates statistics
  
  async recordTaskAttempt(attempt: {
    taskId: string;        // Which question
    correct: boolean;      // Did they get it right?
    timeTaken: number;     // How many seconds?
    taskType?: string;     // What kind of task?
  }): Promise<void> {

     // 1. Calculate running totals
  const tasksAttempted = this.sessionData.length + 1;
  const tasksCorrect = this.sessionData.filter(d => d.correct).length + (attempt.correct ? 1 : 0);
  
  // 2. Calculate accuracy percentage
  //    Example: 3 correct out of 5 = 60%
  const accuracy = (tasksCorrect / tasksAttempted) * 100;
  
  // 3. Calculate average response time
  //    Example: times [2, 3, 5] = average 3.33 seconds
  const allTimes = [...this.sessionData.map(d => d.timeTaken), attempt.timeTaken];
  const averageResponseTime = allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length;
    
    // 4. Create the complete record
  const fullRecord: PerformanceData = {
    // Identity
    userId: this.userId,
    levelId: this.levelId,
    timestamp: new Date(),
    sessionId: this.sessionId,
    
    // Task data
    taskId: attempt.taskId,
    taskType: attempt.taskType || 'unknown',
    correct: attempt.correct,
    timeTaken: attempt.timeTaken,
    
    // Calculated metrics
    tasksAttempted: tasksAttempted,
    tasksCorrect: tasksCorrect,
    accuracy: accuracy,
    averageResponseTime: averageResponseTime,
  };
    
    // 💾 SAVE THE RECORD
    this.sessionData.push(fullRecord);

    this.sendToBackend(fullRecord).catch(err => 
      console.error('Failed to send to backend:', err)
    );

    await this.checkAndAdjustDifficulty();

    
    // 📢 LOG FOR DEBUGGING (helps developers see what's happening)
    console.log(`📊 Recorded: Task ${attempt.taskId} - ${attempt.correct ? '✅' : '❌'} (${attempt.timeTaken}s, accuracy: ${fullRecord.accuracy}%)`);
  }

    private async sendToBackend(record: PerformanceData): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/performance/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      // Store failed attempts in local queue for retry
    }
  }

  private async checkAndAdjustDifficulty(): Promise<void> {
    // Real-time decisions based on local data
    if (this.shouldDecreaseDifficulty()) {
      await this.adjustDifficulty('easy');
    } else if (this.shouldIncreaseDifficulty()) {
      await this.adjustDifficulty('hard');
    }
  }
  
  private async adjustDifficulty(level: 'easy' | 'medium' | 'hard'): Promise<void> {
    console.log(`🎮 Adjusting difficulty to ${level}`);
    // Emit event or callback to parent component
    if (this.onDifficultyChange) {
      this.onDifficultyChange(level);
    }
  }
  
  // ──────────────────────────────────────────────────────────
  // METHOD 2: GET CURRENT PERFORMANCE SUMMARY
  // ──────────────────────────────────────────────────────────
  // Returns a snapshot of how the player is doing RIGHT NOW
  // Used to decide if we should adjust difficulty
  
  getCurrentPerformance(): PerformanceData {
    // 🚨 SPECIAL CASE: No data yet (first question)
    if (this.sessionData.length === 0) {
      console.log(`📊 No data yet, returning default performance`);
      return this.getDefaultPerformance();
    }
    
    // 📊 ANALYZE RECENT TASKS (last 5 questions)
    // We focus on recent performance because it's more relevant
    const recentTasks = this.sessionData.slice(-5); // Last 5 tasks
    
    // Calculate recent accuracy
    const correctCount = recentTasks.filter(t => t.correct).length;
    const accuracy = (correctCount / recentTasks.length) * 100;
    
    // Calculate recent average time
    const avgTime = recentTasks.reduce((sum, t) => sum + t.timeTaken, 0) / recentTasks.length;
        
    // 📈 TREND ANALYSIS - Are they getting better or worse?
    // Compare recent 5 tasks vs previous 5 tasks (tasks 6-10)
    const olderTasks = this.sessionData.slice(-10, -5); // 5 tasks before recent
    const olderAccuracy = olderTasks.length > 0 
      ? (olderTasks.filter(t => t.correct).length / olderTasks.length) * 100 
      : accuracy; // If no older data, use current accuracy
    
    // Determine trend direction
    let trendDirection: 'improving' | 'declining' | 'stable' = 'stable';
    if (accuracy > olderAccuracy + 10) {
      trendDirection = 'improving';  // Got 10%+ better!
      console.log(`📈 Trend: IMPROVING (${olderAccuracy}% → ${accuracy}%)`);
    } else if (accuracy < olderAccuracy - 10) {
      trendDirection = 'declining';  // Got 10%+ worse!
      console.log(`📉 Trend: DECLINING (${olderAccuracy}% → ${accuracy}%)`);
    } else {
      console.log(`📊 Trend: STABLE (${accuracy}% ± 10%)`);
    }
    
    // 📤 RETURN THE PERFORMANCE SUMMARY
    return {
      userId: this.userId,
      levelId: this.levelId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      taskId: 'summary',  // Special ID for summary records
      correct: accuracy >= 70,  // Consider "success" if accuracy > 70%
      timeTaken: avgTime,
      tasksAttempted: this.sessionData.length,
      tasksCorrect: this.sessionData.filter(t => t.correct).length,
      accuracy: accuracy,
      averageResponseTime: avgTime,
      previousAccuracy: olderAccuracy,
      trendDirection: trendDirection
    };
  }
  
  // ──────────────────────────────────────────────────────────
  // HELPER METHOD: Get Default Performance
  // ──────────────────────────────────────────────────────────
  // Used when we don't have any data yet (start of game)
  
  private getDefaultPerformance(): PerformanceData {
    return {
      userId: this.userId,
      levelId: this.levelId,
      timestamp: new Date(),
      sessionId: this.sessionId,
      taskId: 'initial',
      correct: false,
      timeTaken: 0,
      tasksAttempted: 0,
      tasksCorrect: 0,
      accuracy: 100,           // Start optimistic!
      averageResponseTime: 0,
      previousAccuracy: 100,
      trendDirection: 'stable'
    };
  }
  
  // ──────────────────────────────────────────────────────────
  // EXTRA HELPER METHODS (Add these if needed)
  // ──────────────────────────────────────────────────────────
  
  // Check if player is struggling and needs easier difficulty
  shouldDecreaseDifficulty(): boolean {
    const performance = this.getCurrentPerformance();
    
    // Decrease difficulty if:
    // 1. Accuracy below 50% OR
    // 2. Last 3 questions were all wrong OR  
    // 3. Taking more than 15 seconds per question on average
    const recentTasks = this.sessionData.slice(-3);
    const allWrong = recentTasks.length === 3 && recentTasks.every(t => !t.correct);
    const tooSlow = performance.averageResponseTime > 15;
    
    const shouldDecrease = performance.accuracy < 50 || allWrong || tooSlow;
    
    if (shouldDecrease) {
      console.log(`⚠️ Recommendation: DECREASE difficulty (accuracy: ${performance.accuracy}%, allWrong: ${allWrong}, tooSlow: ${tooSlow})`);
    }
    
    return shouldDecrease;
  }
  
  // Check if player is excelling and needs harder difficulty
  shouldIncreaseDifficulty(): boolean {
    const performance = this.getCurrentPerformance();
    
    // Increase difficulty if:
    // 1. Accuracy above 85% AND
    // 2. Last 3 questions were all correct AND
    // 3. Answering quickly (under 5 seconds average)
    const recentTasks = this.sessionData.slice(-3);
    const allCorrect = recentTasks.length === 3 && recentTasks.every(t => t.correct);
    const fastEnough = performance.averageResponseTime < 5;
    
    const shouldIncrease = performance.accuracy > 85 && allCorrect && fastEnough;
    
    if (shouldIncrease) {
      console.log(`🎯 Recommendation: INCREASE difficulty (accuracy: ${performance.accuracy}%, fast: ${fastEnough})`);
    }
    
    return shouldIncrease;
  }
  
  // Get a human-readable summary (for debugging or UI)
  getSummary(): string {
    const perf = this.getCurrentPerformance();
    return `
      📊 Performance Summary:
      • Questions: ${perf.tasksAttempted}
      • Accuracy: ${perf.accuracy?.toFixed(1)}%
      • Avg Time: ${perf.averageResponseTime?.toFixed(1)}s
      • Trend: ${perf.trendDirection}
    `;
  }
  
  // Clear all data (when starting a new level or resetting)
  clear(): void {
    this.sessionData = [];
    console.log(`🗑️ PerformanceTracker cleared for ${this.userId}`);
  }
}

// ──────────────────────────────────────────────────────────────
// HOW TO USE THIS FILE
// ──────────────────────────────────────────────────────────────
//
// 1. CREATE TRACKER (when level starts):
//    const tracker = new PerformanceTracker("user123", "level_1");
//
// 2. RECORD EACH ATTEMPT (after each answer):
//    tracker.recordTaskAttempt({
//      taskId: "question_1",
//      correct: true,
//      timeTaken: 3.5,
//      hintsUsed: 0,
//      retries: 1
//    });
//
// 3. CHECK PERFORMANCE (when deciding difficulty):
//    const performance = tracker.getCurrentPerformance();
//    console.log(performance.accuracy); // 75%
//
// 4. ADJUST DIFFICULTY (based on recommendations):
//    if (tracker.shouldDecreaseDifficulty()) {
//      await setDifficulty('easy');
//    }
//    if (tracker.shouldIncreaseDifficulty()) {
//      await setDifficulty('hard');
//    }
//
