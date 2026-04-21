// services/LevelService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameLevel, GameStep, LevelAdapter } from '../adapters/LevelAdapter';
import { levelRepository } from '../repositories/LevelRepository';
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
    
    // Save to storage
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
}

export class LevelService {
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
  
  async initializeLevel(levelId: string, userId: string, difficulty?: 'easy' | 'medium' | 'hard'): Promise<GameLevel> {
    console.log(`🎮 Initializing level ${levelId} for user ${userId}`);
    
    // Use medium difficulty for now (you can change this later)
    this.currentDifficulty = difficulty || 'medium';
    
    // Fetch and adapt level
    const rawLevel = await levelRepository.getLevelById(levelId);
    console.log('Raw level data:', rawLevel);
    const gameLevel = await LevelAdapter.toGameLevel(rawLevel, this.currentDifficulty);
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
      level: gameLevel,
      currentSceneIndex: 0,
      currentStepIndex: 0,
      starsEarned: gameLevel.reward?.stars || 3,
      attempts: this.levelRetrialCount+1,
      startTime: Date.now(),
      completed: false,
      answers: []
    };
    
    return gameLevel;
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
  const currentStep = this.getCurrentStep();
  
  if (!currentStep) {
    return this.completeLevel();
  }
  
  // Track performance for task steps
  if (currentStep.type === 'task') {
    const startTime = Date.now();
    const isCorrect = userAnswer?.isCorrect ?? false;
    const timeTaken = (Date.now() - startTime) / 1000;
    
    // Record the attempt
    this.performanceTracker?.recordTaskAttempt({
      taskId: currentStep.id,
      taskType: currentStep.taskType,
      correct: isCorrect,
      timeTaken: timeTaken,
    });
    
    // ✅ Insert continuation steps if they exist (for any answer)
    if (userAnswer?.continuationSteps?.length) {
  const currentScene = this.currentSession!.level.scenes[this.currentSession!.currentSceneIndex];

  const insertIndex = this.currentSession!.currentStepIndex + 1;

  currentScene.steps = [
    ...currentScene.steps.slice(0, insertIndex),
    ...userAnswer.continuationSteps,
    ...currentScene.steps.slice(insertIndex),
  ];
}
    // ✅ ALWAYS advance to the next step (whether correct or wrong)
    // This will now point to the inserted continuation step
    this.currentSession!.currentStepIndex++;
    
    // Handle stars deduction for wrong answers
    if (!isCorrect) {
      this.wrongChoiceCount++;
      this.currentSession!.starsEarned = Math.max(0, this.currentSession!.starsEarned - 1);
    }
    
    const nextStep = this.getCurrentStep();
    console.log('➡️ After advancement:', {
      isCorrect,
      newIndex: this.currentSession!.currentStepIndex,
      nextStepType: nextStep?.type,
      nextStepText: nextStep?.text || nextStep?.instruction
    });
    
    return {
      success: isCorrect,
      nextStep: this.getCurrentStep(),
      starsDeducted: isCorrect ? 0 : 1
    };
  }
  
  // For narrative steps, just advance
  this.currentSession!.currentStepIndex++;
  return {
    success: true,
    nextStep: this.getCurrentStep()
  };
}

  // Check if level needs simplification based on retries and wrong choices
  needsSimplification(): boolean {
    // Simplify after 2 level retries AND still making wrong choices
    const hasMultipleRetries = this.levelRetrialCount >= 2;
    const hasWrongChoices = this.wrongChoiceCount > 0;
    
    return hasMultipleRetries && hasWrongChoices;
  }
  
  // Get recommendation for next difficulty level
  getRecommendedDifficulty(): 'easy' | 'medium' | 'hard' {
    if (this.needsSimplification()) {
      // If already on easy, stay on easy
      if (this.currentDifficulty === 'easy') return 'easy';
      // Otherwise simplify by one level
      if (this.currentDifficulty === 'medium') return 'easy';
      if (this.currentDifficulty === 'hard') return 'medium';
    }
    return this.currentDifficulty;
  }

    // Reset for level retry with potentially easier difficulty
    // who uses this function? 
  async retryLevelWithSimplification(): Promise<GameLevel> {
    this.levelRetrialCount++;
    
    const recommendedDifficulty = this.getRecommendedDifficulty();
    const willSimplify = recommendedDifficulty !== this.currentDifficulty;
    
    console.log(`🔄 Retrying level (attempt #${this.levelRetrialCount + 1})`, {
      currentDifficulty: this.currentDifficulty,
      recommendedDifficulty,
      willSimplify,
      wrongChoicesThisAttempt: this.wrongChoiceCount
    });
    
    if (willSimplify) {
      console.log(`✨ Simplifying language from ${this.currentDifficulty} to ${recommendedDifficulty}`);
      this.currentDifficulty = recommendedDifficulty;
    }
    
    // Reset wrong choice counter for new attempt
    this.wrongChoiceCount = 0;
    
    // Re-initialize level with new difficulty
    const userId = await this.getCurrentUserId();
    return this.initializeLevel(this.currentSession!.levelId, userId, this.currentDifficulty);
  }

  getLevelRetryInfo() {
    return {
      retryCount: this.levelRetrialCount,
      currentDifficulty: this.currentDifficulty,
      wrongChoicesThisAttempt: this.wrongChoiceCount,
      needsSimplification: this.needsSimplification()
    };
  }
  
  private async validateAnswer(step: GameStep, answer: any): Promise<boolean> {
    switch (step.taskType) {
      case 'choice':
        return this.validateChoiceAnswer(step, answer);
      case 'tap_object':
        return this.validateTapObjectAnswer(step, answer);
      case 'drag_drop':
        return this.validateDragDropAnswer(step, answer);
      case 'speak':
        return this.validateSpeakAnswer(step, answer);
      default:
        return false;
    }
  }
  
  private validateChoiceAnswer(step: GameStep, answer: any): boolean {
    console.log('does the code run here?');
    if (typeof answer === 'object' && answer.isCorrect !== undefined) {
      return answer.isCorrect;
    }
    if (answer && answer.correct !== undefined) {
      return answer.correct;
    }
    if (typeof answer === 'number' && step.content?.options) {
      return step.content.options[answer]?.correct === true;
    }
    return false;
  }
  
  private validateTapObjectAnswer(step: GameStep, answer: any): boolean {
  // Game completion — all friends found
  if (answer?.foundCount !== undefined) {
    const required = step.content?.objectsInScene?.length || 
                     step.content?.objectsToFind?.length || 1;
    return answer.foundCount >= required;
  }
  
  // Single object tap
  const correctObject = step.content?.correctObject;
  if (correctObject) {
    return answer?.objectId === correctObject;
  }

  // If no correctObject defined, any completion counts as correct
  return true;
}
  
  private validateDragDropAnswer(step: GameStep, answer: any): boolean {
    const matches = step.content?.matches || [];
    return matches.every((match: any) => answer[match.item] === match.target);
  }
  
  private async validateSpeakAnswer(step: GameStep, answer: any): Promise<boolean> {
    const expectedPhrase = step.content?.expectedPhrase;
    const spokenText = answer?.spokenText || answer;
    
    if (!expectedPhrase) return false;
    
    if (step.content?.acceptSimilar) {
      return this.fuzzyMatch(spokenText, expectedPhrase);
    }
    
    return spokenText.toLowerCase() === expectedPhrase.toLowerCase();
  }
  
  private fuzzyMatch(spoken: string, expected: string): boolean {
    const normalizedSpoken = spoken.toLowerCase().trim();
    const normalizedExpected = expected.toLowerCase().trim();
    return normalizedSpoken.includes(normalizedExpected);
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
    if (!this.currentSession) {
      throw new Error('No active session');
    }
    
    const session = this.currentSession;
    session.completed = true;
    
    // Get final performance summary
    const performance = this.performanceTracker?.getCurrentPerformance();
    
    console.log('🏆 Level Completed!', {
      stars: session.starsEarned,
      accuracy: performance?.accuracy,
      avgTime: performance?.averageResponseTime
    });
    
    // Save progress to repository
    await levelRepository.saveProgress({
      userId: await this.getCurrentUserId(),
      levelId: session.levelId,
      starsEarned: session.starsEarned,
      passed: true,
      attempts: session.attempts,
      lastAttemptAt: new Date(),
      completedAt: new Date()
    });
    
    return {
      success: true,
      feedback: `Level complete! You earned ${session.starsEarned} stars! 🎉`,
      nextStep: null
    };
  }
  
  private async getCurrentUserId(): Promise<string> {
    // Get from your auth system
    const userJson = await AsyncStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    return user?.id || 'anonymous';
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