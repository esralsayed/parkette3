// frontend/types/level.types.ts
// This should MATCH your backend schema


// First, define DialogStep (since it's used in LevelData)
export interface DialogStep {
  type: 'narrate' | 'dialog' | 'task';
  text?: string;
  speaker?: string;
  sceneKey?: string; // NEW — link to scene config for this step
  
  // Task-specific fields
  taskType?: 'choice' | 'tap_object' | 'drag_drop' | 'speak' | 'image_choice';
  gameType?: string; // e.g. "FindFriendsGame"
  instruction?: string;
  content?: any;
  correctFeedback?: string;
  wrongFeedback?: string;
  
  // Continuation steps
  continuationSteps?: DialogStep[];
  
  // Internal flags (optional)
  _isContinuation?: boolean;
  _parentTask?: DialogStep;
}

export interface DifficultyVariant {
  dialog: DialogStep[];
}

export interface LevelData {
  _id: string;
  chapterId: string;        // Matches backend
  title: string;            // Matches backend
  order: number;            // Matches backend
  scene: {                  // Matches backend
    backgroundImage?: string;
    characters: string[];
    narrative: string;
  };
  dialog: DialogStep[];     // Matches backend
  difficultyVariants?: {
    easy?: DifficultyVariant;
    medium?: DifficultyVariant;
    hard?: DifficultyVariant;
  };
  
  reward?: { stars: number };
  maxRetries?: number;
  isActive?: boolean;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LevelProgress {
  userId: string;
  levelId: string;
  chapterId?: string;
  starsEarned: number;
  passed: boolean;
  attempts: number;
  lastAttemptAt: Date;
  completedAt?: Date;
  lastStepIndex?: number;
  metadata?: {
    timeSpent?: number;
    accuracy?: number;
    finalStars?: number;
  };
}

export interface ChapterProgressPayload {
  userId: string;
  chapterId: string;
  completedLevelId: string;
  starsEarned: number;       // stars earned on THIS level
}