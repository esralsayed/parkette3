// services/LevelService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameLevel, GameStep, LevelAdapter } from '../../adapters/LevelAdapter';
import { levelRepository } from '../repository/LevelRepository';
import { PerformanceTracker } from './PerformanceTracter';

// Store in AsyncStorage or backend to persist across app restarts
class LevelAttemptTracker {
  private static instance: LevelAttemptTracker;
  private attempts: Map<string, { count: number, wrongChoices: number }> = new Map();
  
  static getInstance(): LevelAttemptTracker {
    if (!LevelAttemptTracker.instance) {
      LevelAttemptTracker.instance = new LevelAttemptTracker();
    }
    return LevelAttemptTracker.instance;
  }
  
  async recordAttempt(levelId: string, hadWrongChoices: boolean): Promise<void> {
    const current = this.attempts.get(levelId) || { count: 0, wrongChoices: 0 };
    current.count++;
    if (hadWrongChoices) current.wrongChoices++;
    this.attempts.set(levelId, current);
    
    console.log(`[Attempts] Saving to AsyncStorage →`, current);   // ← Add this
    
    await AsyncStorage.setItem(`level_attempts_${levelId}`, JSON.stringify(current));
  }
  
  async shouldSimplify(levelId: string): Promise<boolean> {
    console.log(`Checking if level ${levelId} needs simplification...`);
    const data = await AsyncStorage.getItem(`level_attempts_${levelId}`);
    if (!data) return false;
    
    const attempts = JSON.parse(data);
    // Simplify after 2 attempts with wrong choices
    return attempts.count >= 2 && attempts.wrongChoices >= 2;
  }
}

export interface GameSession {
  levelId: string;
  chapterId: string;
  level: GameLevel;
  currentSceneIndex: number;
  currentStepIndex: number;
  starsEarned: number;
  attempts: number;
  startTime: number;
  completed: boolean;
  answers: AnswerRecord[];
}

export interface AnswerRecord {
  stepId: string;
  answer: any;
  isCorrect: boolean;
  timestamp: number;
  attempts: number;
}

export interface StepResult {
  success: boolean;
  feedback?: string;
  nextStep: GameStep | null;
  starsDeducted?: number;
  rewardUnlocked?: { label: string; type: string; itemId: string } | null;  // ← add
}

export class LevelService {
  private attemptTracker = LevelAttemptTracker.getInstance();
  private currentSession: GameSession | null = null;
  private performanceTracker: PerformanceTracker | null = null;
  private currentDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  private levelRetrialCount: number = 0;
  private wrongChoiceCount: number = 0;

  // explanation -> 
  // this function takes the levelId, userId, difficulty 
  // first it sets the currentdifficulty
  // it gets the rawLevel from the levelrepo
  // ti passes the raw level to leveladapter
  // if current difficulty is easy it caches the level ? 
  // resets wrong choice count
  // creates a performance tracker variable
  // creates a current session object
  // returns the gameLevel it got from leveladaptor
  
  async initializeLevel(levelId: string, chapterId: string, userId: string, difficulty?: 'easy' | 'medium' | 'hard', miniAvatar?: string | null): Promise<GameLevel> {
    console.log(`🎮 Initializing level ${levelId} for user ${userId}`);
    
    // Use medium difficulty for now (you can change this later)
    this.currentDifficulty = difficulty || 'medium';

    // ✅ Don't record an attempt here — we only count attempts when the user
    // fails (i.e. makes wrong choices). Replaying a passed level doesn't count.
    const currentAttemptNumber = await this.getAccumulatedAttempts(levelId);

    console.log("im tracking the difficulty",this.currentDifficulty);

    // Check cache first for easy mode
  if (this.currentDifficulty === 'easy') {
    const cached = await this.getCachedSimplifiedLevel(levelId);
    if (cached) {
      // Skip adapter entirely — use cached version
      this.wrongChoiceCount = 0;
      this.performanceTracker = new PerformanceTracker(userId, levelId);
      this.currentSession = {
        levelId,
        chapterId,
        level: cached,
        currentSceneIndex: 0,
        currentStepIndex: 0,
        starsEarned: cached.reward?.stars || 3,
        attempts: currentAttemptNumber,
        startTime: Date.now(),
        completed: false,
        answers: []
      };
      return cached;
    }
  }
    
    // Fetch and adapt level
    const rawLevel = await levelRepository.getLevelById(levelId);
    console.log('Raw level data:', rawLevel);
    const gameLevel = await LevelAdapter.toGameLevel(rawLevel, this.currentDifficulty, miniAvatar);
    console.log('Adapted game level:', gameLevel);

    // ✅ Cache the simplified version using LevelRepository's AsyncStorage
    if (this.currentDifficulty === 'easy') {
      await this.cacheSimplifiedLevel(levelId, gameLevel);
    }
    
    // Reset wrong choice count for this attempt
    this.wrongChoiceCount = 0;
    
    // Create performance tracker (just for tracking, not adapting yet)
    this.performanceTracker = new PerformanceTracker(userId, levelId);
  
    // Create session
    this.currentSession = {
      levelId,
      chapterId,
      level: gameLevel,
      currentSceneIndex: 0,
      currentStepIndex: 0,
      starsEarned: gameLevel.reward?.stars || 3,
      attempts: currentAttemptNumber,
      startTime: Date.now(),
      completed: false,
      answers: []
    };
    
    return gameLevel;
  }

private async getAccumulatedAttempts(levelId: string): Promise<number> {
  try {
    const key = `level_attempts_${levelId}`;
    const data = await AsyncStorage.getItem(key);
    
    console.log(`[Attempts] Read attempt for ${levelId}`);
    console.log(`[Attempts] Key used: ${key}`);
    console.log(`[Attempts] Raw data from AsyncStorage:`, data);

    if (!data) {
      console.log(`[Attempts] No data found → returning 0`);
      return 0;
    }
    
    const parsed = JSON.parse(data);
    console.log(`[Attempts] Parsed count:`, parsed.count);
    
    return parsed.count || 0;
  } catch (e) {
    console.error(`[Attempts] Error reading storage:`, e);
    return 0;
  }
}

private async recordLevelCompletion(levelId: string, hadWrongChoices: boolean): Promise<void> {
  console.log(`[Attempts] Recording completion for ${levelId}, hadWrongChoices=${hadWrongChoices}`);
  await this.attemptTracker.recordAttempt(levelId, hadWrongChoices);
}
  
  // Cache simplified version using LevelRepository's AsyncStorage
  private async cacheSimplifiedLevel(levelId: string, gameLevel: GameLevel): Promise<void> {
    try {
      const cacheKey = `simplified_${levelId}_easy`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        data: gameLevel,
        timestamp: Date.now(),
        version: '1.0'
      }));
      console.log(`💾 Cached simplified level: ${levelId}`);
    } catch (error) {
      console.error('Failed to cache simplified level:', error);
    }
  }

  private async getCachedSimplifiedLevel(levelId: string): Promise<GameLevel | null> {
    try {
      const cacheKey = `simplified_${levelId}_easy`;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache for 7 days
        if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
          console.log(`📦 Using cached simplified level: ${levelId}`);
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached simplified level:', error);
      return null;
    }
  }

   async clearLevelCache(levelId: string): Promise<void> {
    await AsyncStorage.removeItem(`simplified_${levelId}_easy`);
    console.log(`🗑️ Cleared cache for level: ${levelId}`);
  }

  // services/LevelService.ts - advanceToNextStep method

async advanceToNextStep(userAnswer?: any): Promise<StepResult> {
  if (!this.currentSession || this.currentSession.completed) {
    return { success: false, nextStep: null };
  }

  const currentStep = this.getCurrentStep();

  // If we're already past the last step → complete the level
  if (!currentStep) {
    return this.completeLevel();
  }

  // === Task Step ===
  if (currentStep.type === 'task') {
    const isCorrect = userAnswer?.isCorrect ?? false;
    const timeTaken = 0; // You can improve timing logic later

    this.performanceTracker?.recordTaskAttempt({
      taskId: currentStep.id,
      taskType: currentStep.taskType,
      correct: isCorrect,
      timeTaken,
    });

    // Insert continuation steps if any
    if (userAnswer?.continuationSteps?.length) {
      const currentScene = this.currentSession.level.scenes[this.currentSession.currentSceneIndex];
      const insertIndex = this.currentSession.currentStepIndex + 1;

      currentScene.steps.splice(
        insertIndex, 
        0, 
        ...userAnswer.continuationSteps
      );
    }

    // Advance index
    this.currentSession.currentStepIndex++;

    // Deduct star on wrong answer
    if (!isCorrect) {
      this.wrongChoiceCount++;
      this.currentSession.starsEarned = Math.max(0, this.currentSession.starsEarned - 1);
    }

    // Check if we finished after this advancement
    const nextStep = this.getCurrentStep();
    if (!nextStep) {
        console.log('🏁 [completeLevel] triggered from advanceToNextStep');
  console.log('🏁 [completeLevel] postQuestionAnswers at this point:', this.postQuestionAnswers)
      return this.completeLevel();
    }

    return {
      success: isCorrect,
      nextStep,
      starsDeducted: isCorrect ? 0 : 1
    };
  }

  // === Narrative / Story Step ===
  this.currentSession.currentStepIndex++;

  const nextStep = this.getCurrentStep();
  if (!nextStep) {
    return this.completeLevel();
  }

  return {
    success: true,
    nextStep
  };
}
  
  getCurrentStep(): GameStep | null {
    if (!this.currentSession) return null;
    
    const { level, currentSceneIndex, currentStepIndex } = this.currentSession;
    const currentScene = level.scenes[currentSceneIndex];
    
    if (!currentScene || currentStepIndex >= currentScene.steps.length) {
      return null;
    }
    console.log('inside levelservice' , currentScene.steps[currentStepIndex].taskType);
    return currentScene.steps[currentStepIndex];
  }
  
  getProgress(): {
    currentStep: number;
    totalSteps: number;
    starsRemaining: number;
    percentageComplete: number;
  } | null {
    if (!this.currentSession) return null;
    
    const { currentStepIndex, level, starsEarned } = this.currentSession;
    const totalSteps = level.scenes[0].steps.length;
    
    return {
      currentStep: currentStepIndex + 1,
      totalSteps,
      starsRemaining: starsEarned,
      percentageComplete: (currentStepIndex / totalSteps) * 100
    };
  }
  
  getPerformanceSummary() {
    if (!this.performanceTracker) return null;
    return this.performanceTracker.getCurrentPerformance();
  }
  
  private async completeLevel(): Promise<StepResult> {
    if (!this.currentSession) throw new Error('No active session');
    if (this.currentSession.completed) {
      return { success: true, nextStep: null };
    }

    this.currentSession.completed = true;

    // ⏳ If post questions haven't been answered yet, wait for them
    if (this.postQuestionAnswers === null) {
      console.log('⏳ [completeLevel] Waiting for post questions...');
      return { success: true, nextStep: null };
    }

    // ✅ Post questions done — proceed with save
    const session = this.currentSession;
    const hadWrongChoices = this.wrongChoiceCount > 0;
    if (hadWrongChoices) {
      await this.recordLevelCompletion(session.levelId, true);
      session.attempts = await this.getAccumulatedAttempts(session.levelId);
    }

    await levelRepository.saveProgress({
      userId: await this.getCurrentUserId(),
      levelId: session.levelId,
      chapterId: session.chapterId,
      starsEarned: session.starsEarned,
      passed: true,
      attempts: session.attempts,
      lastAttemptAt: new Date(),
      completedAt: new Date(),
      preQuestionAnswers:  this.preQuestionAnswers  ?? null,
      postQuestionAnswers: this.postQuestionAnswers ?? null,
    });

    this.preQuestionAnswers  = null;
    this.postQuestionAnswers = null;

    const chapterResult = await this.updateChapterProgress(session.chapterId);
    return {
      success: true,
      feedback: `Level complete! You earned ${session.starsEarned} stars! 🎉`,
      nextStep: null,
      rewardUnlocked: chapterResult?.rewardUnlocked ?? null,
    };
  }

  
  // ─── Chapter progress ────────────────────────────────────────────────────────
  //
  // Called after every level completion. Fetches all levels in the chapter and
  // the user's passed-level set, then writes a ChapterProgress record.
  //
  // Required repo methods (add to LevelRepository if not present):
  //   getChapterLevels(chapterId)            → { id, reward: { stars } }[]
  //   getPassedLevelIds(userId, chapterId)   → Set<string>  (levelId strings)
  //   saveChapterProgress(payload)           → void
  //   markChapterStarted({ userId, chapterId, startedAt }) → void (no-op if already set)
  //
  private async updateChapterProgress(chapterId: string): Promise<{ rewardUnlocked: any } | null> {
    const userId = await this.getCurrentUserId();
    const session = this.currentSession!;

    const result = await levelRepository.saveChapterProgress({
      userId,
      chapterId,
      completedLevelId: session.levelId,
      starsEarned: session.starsEarned,
    });

    if (result.allPassed && result.rewardUnlocked) {
      return { rewardUnlocked: result.rewardUnlocked };
    }
    return null;
  }

  private async getCurrentUserId(): Promise<string> {
    // Get from your auth system
    const userJson = await AsyncStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    return user?.id || 'anonymous';
  }

  //saving questionnaire progress
  private preQuestionAnswers: { score: number; total: number } | null = null;
  private postQuestionAnswers: { score: number; total: number } | null = null;

   setPreQuestionAnswers(answers: { score: number; total: number }) {
    this.preQuestionAnswers = answers;
  }

  async setPostQuestionAnswers(answers: { score: number; total: number }) {
    this.postQuestionAnswers = answers;

    console.log(answers); 
    console.log("inside set post",this.currentSession?.completed);

    // If gameplay already finished, trigger the save now
    if (this.currentSession?.completed) {
      await this.completeLevel();
    }
  }
  
  // Clean up when done
  destroy(): void {
    this.currentSession = null;
    this.performanceTracker = null;
  }

    getStars(): number {
    return this.currentSession?.starsEarned ?? 0;
  }
}

export const levelService = new LevelService();