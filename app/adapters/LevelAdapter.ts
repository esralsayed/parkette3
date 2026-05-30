// adapters/LevelAdapter.ts

import { ImageSourcePropType } from 'react-native';
import { DialogStep, DifficultyVariant, LevelData, Question } from '../game/types/level.types';


// ──────────────────────────────────────────────────────────
// TARGET INTERFACES (What your React components expect)
// ──────────────────────────────────────────────────────────

export interface GameLevel {
  id: string;                    // Clean ID without MongoDB's _id
  title: string;
  order: number;
  currentDifficulty: 'easy' | 'medium' | 'hard';
  scenes: GameScene[];           // Array of scenes (your level may have multiple)
  reward: { stars: number };
  maxRetries: number;
  preQuestions:  Question[];
  postQuestions: Question[];
}

export interface GameScene {
  id: string;
  name?: string;                 // Scene name (e.g., "Kitchen", "Bedroom")
  background: React.FC<any> | ImageSourcePropType | null; // Allow SVG components
  characters: GameCharacter[];
  steps: GameStep[];
}

export interface GameCharacter {
  id: string;
  name: string;                  // Display name (capitalized)
  displayName: string;           // Name with proper casing
  sprite?: ImageSourcePropType;  // Local image asset
  position: CharacterPosition;   // Where on screen they stand
  voiceId?: string;              // For text-to-speech
  scale?: number;
  side: 'left' | 'right' ;
}

export interface GameStep {
  id: string;
  type: 'narrate' | 'dialog' | 'task';
  sceneKey?: string;             // NEW — to link back to scene config for decorations
  text?: string;
  speaker?: string;
  speakerId?: string;            // ID to lookup character sprite
  instruction?: string;
  taskType?: 'choice' | 'tap_object' | 'drag_drop' | 'speak' | 'image_choice';
  gameType?: string;            // e.g. "FindFriendsGame"
  content?: any;
  correctFeedback?: string;
  wrongFeedback?: string;
  metadata?: {
    requiresAudio?: boolean;
    timeLimit?: number;
    hints?: string[];
  };
}

type CharacterPosition = 'left' | 'center-left' | 'center-right' | 'right' | 'center';

// ──────────────────────────────────────────────────────────
// THE ADAPTER - Translates DB format to UI format
// ──────────────────────────────────────────────────────────

export class LevelAdapter {
  
  // Main public method - entry point for all transformations
  static async toGameLevel(
    dbLevel: LevelData, 
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<GameLevel> {
    
  const variant = dbLevel.difficultyVariants?.[difficulty];
  
  // Check if variant exists AND has dialog
  const hasStoredVariant = variant && Array.isArray(variant.dialog) && variant.dialog.length > 0;
  
  let dialogToUse = dbLevel.dialog;

  if (hasStoredVariant) {
    // Use pre-generated variant dialog
    dialogToUse = variant.dialog;
    console.log(`✅ Using stored ${difficulty} variant dialog`);
  } else if (difficulty === 'easy') {
    // Only use AI for easy mode if no stored variant
    console.log('⚠️ No stored easy variant — falling back to live AI simplification');
  } else {
    // For medium/hard without variants, use the base dialog
    console.log(`📝 No stored ${difficulty} variant, using base dialog`);
  }

    // Transform the dialog steps with difficulty applied
    const adaptedSteps = this.adaptDialogSteps(dbLevel.dialog, variant, difficulty);
    
    // Build the complete GameLevel object
    return {
      id: `level_${dbLevel.order}`,
      title: dbLevel.title,
      order: dbLevel.order,
      currentDifficulty: difficulty,
      scenes: [{
        id: `${dbLevel._id}_scene_main`,
        background: this.convertBackgroundImage(dbLevel.scene.backgroundImage),
        characters: this.extractCharacters(dbLevel.scene.characters),
        steps: adaptedSteps
      }],
      reward: dbLevel.reward || { stars: 3 },
      maxRetries: dbLevel.maxRetries ?? 3,
      preQuestions:  dbLevel.preQuestions  ?? [],   // ← ADD
      postQuestions: dbLevel.postQuestions ?? [],   // ← ADD
    };
  }

  // ──────────────────────────────────────────────────────────
  // 1. Dialog Step Adaptation (Most Important)
  // ──────────────────────────────────────────────────────────
  
private static adaptDialogSteps(
  dialog: DialogStep[],
  variant?: DifficultyVariant,
  difficulty?: string
): GameStep[] {
  
  const steps: GameStep[] = [];
  
  for (let i = 0; i < dialog.length; i++) {
    const step = dialog[i];

    const adaptedStep: GameStep = {
      id: `step_${i}`,
      type: step.type,
      text: step.text,
      sceneKey: step.sceneKey,
      gameType: step.gameType,
      speaker: step.speaker,
      instruction: step.instruction,
      taskType: step.taskType,
      content: step.content,
      correctFeedback: step.correctFeedback,
      wrongFeedback: step.wrongFeedback,
    };

    
    // For tap_object tasks, add the objects to find with sprites
    if (step.taskType === 'tap_object' && step.content?.objectsInScene) {

      adaptedStep.content = {
        ...step.content,
        objectsToFind: step.content.objectsInScene.map((obj: string, index: number) => ({
          id: `${index}`,
          name: obj,
          image: this.getSpriteForObject(obj), // Use your existing loadSprite method
          x: Math.random() * 70 + 15, // Random position between 15% and 85%
          y: Math.random() * 60 + 20, // Random position between 20% and 80%
          found: false
        }))
      };
    }

    if (step.taskType === 'image_choice' && step.content?.options) {
  adaptedStep.content = {
    ...step.content,
    options: step.content.options.map((opt: any) => ({
      ...opt,
      image: this.resolveImage(opt.image),
    })),
  };
}
      // Apply difficulty-specific adaptations
      // if (step.type === 'task') {
      //   this.adaptTaskForDifficulty(adaptedStep, difficulty);
      // }
      
      // Add speaker metadata for character lookup
      if (step.speaker) {
        adaptedStep.speakerId = this.getCharacterId(step.speaker);
      }
      
      steps.push(adaptedStep);
      
      // Handle continuation steps (if task has follow-up dialogue)
      if (step.continuationSteps?.length) {
        const continuationSteps = this.adaptContinuationSteps(step.continuationSteps);
        steps.push(...continuationSteps);
      }
    }
    
    return steps;
  }
  
  // ──────────────────────────────────────────────────────────
  // 2. Task Difficulty Adaptation
  // ──────────────────────────────────────────────────────────
  
  // ──────────────────────────────────────────────────────────
  // 3. Character Extraction & Mapping
  // ──────────────────────────────────────────────────────────
  
  private static extractCharacters(characterNames: string[]): GameCharacter[] {
    // Central mapping of character names to their visual assets
    const CHARACTER_DATABASE: Record<string, {
      displayName: string;
      spritePath?: string;
      position: CharacterPosition;
      voiceId?: string;
      scale?:number; 
      side: 'left' | 'right'
    }> = {
      'child': {
        displayName: 'Me',
        spritePath: 'child/child-normal.png',
        position: 'center-left',
        voiceId: 'en-US-child',
        scale: 1.0,
        side: 'left'
      },
      'mother': {
        displayName: 'Mom',
        spritePath: 'mother/mom-normal.png',
        position: 'center-right',
        voiceId: 'en-US-female',
        scale: 1.8,
        side: 'right'
      },
      'friend': {
        displayName: 'Friend',
        spritePath: 'friend/friend-normal.png',
        position: 'right',
        voiceId: 'en-US-male', 
        scale: 1.1,
        side: 'right'
      },
      'stranger': {
        displayName: 'Stranger',
        spritePath: 'stranger/stranger-normal.png',
        position: 'center',
        voiceId: 'en-US-female-professional',
        scale: 1.0,
        side: 'right'
      },
      'teacher' : {
        displayName: 'Teacher',
        spritePath: 'teacher/teacher-normal.png',
        position: 'center',
        voiceId: 'en-US-female-professional',
        scale: 1.1,
        side: 'left'
      }
    };
    
    return characterNames.map(name => {
      const lowerName = name.toLowerCase();
      const config = CHARACTER_DATABASE[lowerName] || {
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
        emoji: '🧑',
        position: 'center',
        color: '#CCCCCC'
      };
      
      return {
        id: lowerName,
        name: config.displayName,
        displayName: config.displayName,
        sprite: config.spritePath ? this.loadSprite(config.spritePath) : undefined,
       position: config.position,
        voiceId: config.voiceId,
        scale: config.scale, 
        side: config.side
      };
    });
  }
  
  // ──────────────────────────────────────────────────────────
  // 4. Asset Loading (URLs → Local requires)
  // ──────────────────────────────────────────────────────────
  
private static convertBackgroundImage(url?: string): any {
  if (!url) return null;
  const key = url.toLowerCase().trim();
  if (this.IMAGE_MAP[key]) return this.IMAGE_MAP[key]; // SVG component
  if (url.startsWith('http') || url.startsWith('@/') || url.startsWith('./')) {
    return { uri: url };
  }
  return { uri: url };
}

  private static IMAGE_MAP: Record<string, any> = {
  slide1: require('@/assets/svgs/game/chapters/slide2.png'),
  slide2: require('@/assets/svgs/game/chapters/slide1.png'),
  slide3: require('@/assets/svgs/game/chapters/slide3.png'),
};

private static resolveImage(key: string | undefined): any {
  if (!key) return undefined;

  if (typeof key !== 'string') return key;

  const cleaned = key.toLowerCase().trim();
  return this.IMAGE_MAP[cleaned] ?? { uri: key };
}
  
  private static loadSprite(path: string): ImageSourcePropType {
    // In a real React Native app, you'd have actual require statements
    // For example: return require(`@/assets/characters/${path}`);
    
    // Since we can't dynamically require in React Native, you'd maintain a map:
    const SPRITE_MAP: Record<string, any> = {
      'child/child-normal.png': require('../../assets/images/chapters/Nina pp.png'),
      'mother/mom-normal.png': require('../../assets/images/chapters/Mom PP.png'),
      'friend/friend-normal.png': require('../../assets/images/chapters/Friend.png'),
      'stranger/stranger-normal.png': require('../../assets/images/chapters/Man pp.png'),
      'friend/friend1.png': require('../../assets/images/chapters/friend1.png'),
      'friend/friend2.png': require('../../assets/images/chapters/friend2.png'),
      'teacher/teacher-normal.png': require('../../assets/images/chapters/teacher.png'),
    };
    
    return SPRITE_MAP[path] || { uri: path };
  }

private static getSpriteForObject(objectName: string): ImageSourcePropType {
  const SPRITE_MAP: Record<string, any> = {
    // Map directly to require() — skip the path lookup entirely
    'noura':    require('../../assets/images/chapters/friend2.png'),
    'omar':     require('../../assets/images/chapters/friend1.png'),
    'child':    require('../../assets/images/chapters/Nina pp.png'),
    'nina':     require('../../assets/images/chapters/Nina pp.png'),
    'mother':   require('../../assets/images/chapters/Mom PP.png'),
    'mom':      require('../../assets/images/chapters/Mom PP.png'),
    'friend':   require('../../assets/images/chapters/Friend.png'),
    'stranger': require('../../assets/images/chapters/Man pp.png'),
    'teacher': require('../../assets/images/chapters/teacher.png'),
  };

  const key = objectName.toLowerCase().trim();
  const sprite = SPRITE_MAP[key];
  
  if (!sprite) {
    console.warn(`No sprite for "${objectName}" — using fallback`);
    return require('../../assets/images/chapters/Friend.png');
  }

  return sprite;
}
  
  // ──────────────────────────────────────────────────────────
  // 5. Helper Methods
  // ──────────────────────────────────────────────────────────
  
  private static sanitizeId(id: string): string {
    // Convert MongoDB ObjectId to clean string
    return id.toString();
  }
  
  private static getCharacterId(speakerName: string): string {
    const mapping: Record<string, string> = {
      'Mom': 'mother',
      'Dad': 'father',
      'Me': 'child',
      'friend': 'friend',
      'Teacher': 'teacher',
      'stranger': 'stranger',
    };
    return mapping[speakerName] || speakerName.toLowerCase();
  }
  
  private static adaptContinuationSteps(steps: DialogStep[]): GameStep[] {
  const result: GameStep[] = [];

  steps.forEach((step, idx) => {
    const adapted: GameStep = {
      id: `continuation_${idx}`,
      sceneKey: step.sceneKey, // You can set this if you want to link back to scene config
      gameType: step.gameType,
      type: step.type,
      text: step.text,
      speaker: step.speaker,
      instruction: step.instruction,
      taskType: step.taskType,           // ✅ copy taskType
      content: step.content,             // ✅ copy content
      correctFeedback: step.correctFeedback,
      wrongFeedback: step.wrongFeedback,
      speakerId: step.speaker ? this.getCharacterId(step.speaker) : undefined,
    };

    // Same tap_object enrichment as the main loop
    if (step.taskType === 'tap_object' && step.content?.objectsInScene) {
      adapted.content = {
        ...step.content,
        objectsToFind: step.content.objectsInScene.map((obj: string, i: number) => ({
          id: `${i}`,
          name: obj,
          image: this.getSpriteForObject(obj),
          x: Math.random() * 70 + 15,
          y: Math.random() * 60 + 20,
          found: false,
        })),
      };
    }

    result.push(adapted);

    // ✅ Recurse for nested continuationSteps
    if (step.continuationSteps?.length) {
      result.push(...this.adaptContinuationSteps(step.continuationSteps));
    }
  });

  return result;
}
}