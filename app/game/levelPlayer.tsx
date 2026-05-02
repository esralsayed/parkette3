// app/game/level/[levelId].tsx

import { AppColors, AppFonts, ButtonStyles, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaViewBase,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import catImage from '../../assets/images/chapters/Cat.png';
import { GameCharacter, GameScene, GameStep } from '../adapters/LevelAdapter';
import WrongAnswerFeedback from '../components/Feedback';
import HowToPlayModal from '../components/howtoplay';
import FindFriendsGame from '../components/minigames/FindFriendsGame';
import ImageChoiceGame from '../components/minigames/imageChoice';
import NavBar from '../components/navbar';
import SceneStage from '../components/SceneStage';
import TaskRenderer from '../components/TaskRenderer';
import { TaskAnswer } from '../interfaces/TaskAnswer';
import { levelService } from '../services/LevelService';

export default function LevelPlayer() {
  const router = useRouter();
  const { levelId, chapterId, chapterTitle } = useLocalSearchParams();
  const [userName, setUserName] = useState('User');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<GameStep | null>(null);
  const [stars, setStars] = useState(3);
  const [phase, setPhase] = useState<'playing' | 'end'>('playing');
  const [earnedStarsDisplay, setEarnedStarsDisplay] = useState([false, false, false]);
  const [savingProgress, setSavingProgress] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [levelTitle, setLevelTitle] = useState('');
  const [currentScene, setCurrentScene] = useState<GameScene | null>(null);
  const isAdvancingRef = React.useRef(false);
  const [feedbackPopup, setFeedbackPopup] = useState<{ chosenText: string; correctText: string } | null>(null);
const [pendingNextStep, setPendingNextStep] = useState<GameStep | null>(null);
  // ── How To Play ────────────────────────────────────────────────────────────
  // true  → modal is open (auto-shown when task starts, or user taps ?)
  // false → modal dismissed, in-scene game is visible
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const step = currentStep;


  // explanation of the component -> 
  // 1- this useeffect loads the user info from AsyncStorage

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserName(user.name || 'User');
        }
      } catch (e) { console.error(e); }
    };
    loadUserName();
  }, []);

  // this useeffect loads the level by ->
  // 1. get the user Id , 
  // 2. call levelService initilize level with the levelId(from the params)
  // 3. set the scene const and give it the gameLevel scenes of the first element -> the scene itself (this is a redundant step as there is only 1 scene object with mulitple steps in the level )
  // 4. then set the currentscene and setleveltitle
  // 5. get the first step and set it as the currentstep
  // 6. get the progress and set the currentstepIndex with the progress current step ? 

  useEffect(() => {
    const loadLevel = async () => {
      try {
        setLoading(true);
        const userId = await getCurrentUserId();
        const gameLevel = await levelService.initializeLevel(levelId as string, userId);
        const scene = gameLevel.scenes[0];
        setCurrentScene(scene);
        setLevelTitle(gameLevel.title);
        setStars(gameLevel.reward?.stars || 3);
        const firstStep = levelService.getCurrentStep();
        setCurrentStep(firstStep);
        const progress = levelService.getProgress();
        if (progress) setCurrentStepIndex(progress.currentStep - 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load level');
      } finally {
        setLoading(false);
      }
    };
    if (levelId) loadLevel();
    return () => { levelService.destroy(); };
  }, [levelId]);

  // Auto-show HowToPlay whenever we arrive at a new task step
  useEffect(() => {
    if (currentStep?.type === 'task') {
      setShowHowToPlay(true);
    } else {
      setShowHowToPlay(false);
    }
  }, [currentStep]);

  const advance = useCallback(async () => {
    if (step?.type === 'task') return;
    const result = await levelService.advanceToNextStep();
    console.log('level player result',result);
    if (result.nextStep === null) {
      finishLevel();
    } else {
if (!result.nextStep) {
  console.warn('⚠️ nextStep is undefined/null — stopping update');
  finishLevel();
  return;
}
setCurrentStep(result.nextStep);      
const progress = levelService.getProgress();
      if (progress) {
        setCurrentStepIndex(progress.currentStep - 1);
        setStars(progress.starsRemaining);
      }
    }
  }, [step]);

  const finishLevel = async () => {
    setPhase('end');
    await saveLevelProgress();
    const finalStars = levelService.getStars();
    setStars(finalStars);
    for (let i = 0; i < finalStars; i++) {
      setTimeout(() => {
        setEarnedStarsDisplay(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 350 + 200);
    }
  };

  const saveLevelProgress = async () => {
    setSavingProgress(true);
    try {
      const userId = await getCurrentUserId();
      const finalStars = levelService.getStars();
      const performance = levelService.getPerformanceSummary();
      await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/progress/level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, levelId, chapterId,
          starsEarned: finalStars, passed: true, attempts: 1,
          lastAttemptAt: new Date(), completedAt: new Date(),
          performance: performance ? {
            accuracy: performance.accuracy,
            averageResponseTime: performance.averageResponseTime,
            tasksCompleted: performance.tasksAttempted,
          } : undefined,
        }),
      });
    } catch (e) { console.error(e); }
    finally { setSavingProgress(false); }
  };

  const getCurrentUserId = async (): Promise<string> => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) return JSON.parse(userJson).id || 'anonymous';
    } catch (e) { console.error(e); }
    return 'anonymous';
  };


  // this function takes an answer 
  const advanceStep = async (answer: TaskAnswer) => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    try {
      const result = await levelService.advanceToNextStep(answer);
        if (!answer.isCorrect && answer.choice && answer.correctText) {
          setFeedbackPopup({ chosenText: answer.choice, correctText: answer.correctText });
          setPendingNextStep(result.nextStep);
          return;
        }

      if (!result.nextStep) {
        finishLevel();
        return;
      }

      setCurrentStep(result.nextStep);
    } finally {
      isAdvancingRef.current = false;
    }
  };

  const handleFeedbackDismiss = () => {
  setFeedbackPopup(null);
  if (!pendingNextStep) finishLevel();
  else { setCurrentStep(pendingNextStep); setPendingNextStep(null); }
};

  const handleTaskAnswered = useCallback(async (answer:TaskAnswer) => {
    await advanceStep(answer);
  }, [step]);

  const handleInSceneGameComplete = useCallback(async (correct: boolean, extra?: any) => {
  if (!step || !step.type) {
    console.warn('⚠️ Invalid step detected:', step);
    return null;
  }    await advanceStep({ isCorrect: correct, ...extra });
  }, [step]);

  // ── Build in-scene game ────────────────────────────────────────────────────
  // Returns null while HowToPlay is open — game appears only after X is tapped
  const buildInSceneGame = (): React.ReactNode => {
    if (!step || step.type !== 'task' || showHowToPlay) return null;

    const gameType = step.gameType ?? step.taskType;
    console.log(gameType, 'inside levelplayer');
    switch (gameType) {
      case 'slide_choice':
        return (
           <ImageChoiceGame
            gameType={gameType}
            instruction={step.instruction ?? step.content?.instruction ?? 'Choose the right one!'}
            options={step.content?.options ?? []}
            onComplete={(correct, selectedId, chosenText, correctText) =>
              handleInSceneGameComplete(correct, { selectedId, chosenText, correctText })
            }
          />
        );
      case 'find_friends':
          console.log('FindFriendsGame data:', step.content?.objectsToFind);

        return (
          <FindFriendsGame
            friends={step.content?.objectsToFind ?? []}
            instruction={step.instruction ?? 'Find all your friends!'}
            onComplete={(success, foundCount) =>
              handleInSceneGameComplete(success, { foundCount })
            }
            isEmbedded
          />
        );
      case 'choice':
        return null; // handled by TaskRenderer
      default:
        console.warn(`No in-scene game for gameType: "${gameType}"`);
        return null;
    }
  };

  // ── HowToPlay content per game type ───────────────────────────────────────
  // Add a case here whenever you add a new game type
  const getHowToPlayContent = (step: GameStep) => {
    const gameType = step.gameType ?? step.taskType;
    switch (gameType) {
      case 'find_friends':
        return {
          title: 'How to Play',
          instructions: 'Search for your friends and uncover their secret hideouts! Spot one? Tap them quick! Find them all!',
          highlightPhrases: ['Tap them quick!', 'Find them all!'],
          characters: [
            { emoji: '🧒', label: 'You' },
            { emoji: '❓', label: 'Friend', hidden: true },
            { emoji: '❓', label: 'Friend', hidden: true },
          ],
          steps: [
            { icon: '🔍', label: 'Search the scene' },
            { icon: '👊', label: 'Tap to catch!' },
            { icon: '🌟', label: 'Find them all!' },
          ],
        };
 case 'slide_choice':
        return {
          title: 'Make a Choice',
          instructions: step.instruction ?? 'Look at the options and tap the one you think is right!',
          highlightPhrases: ['tap'],
          characters: undefined,
          steps: [
            { icon: '👀', label: 'Look carefully' },
            { icon: '👆', label: 'Tap your answer' },
          ],
        };
      default:
        return {
          title: 'How to Play',
          instructions: step.instruction ?? 'Complete the task to continue!',
          highlightPhrases: [] as string[],
          characters: undefined,
          steps: [] as { icon: string; label: string }[],
        };
    }
  };

  // this function gets all the active characters to pass to scenestage
  const getActiveCharacters = (): GameCharacter[] => {
    if (!currentScene) return [];
    return currentScene.characters;
  };

  // this function is responsible when the level ends and user clicks retry
  // it resets phase to playing 
  const handleRetry = async () => {
    setStars(3);
    setPhase('playing');
    setEarnedStarsDisplay([false, false, false]);

    setLoading(true);

    const userId = await getCurrentUserId();
    await levelService.initializeLevel(levelId as string, userId);

    setCurrentStep(levelService.getCurrentStep());
    setLoading(false);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onBack={() => router.back()} />;
  if (!step) {
  return <LoadingScreen />;
}
  const isTaskStep = step.type === 'task';
  const inSceneGame = buildInSceneGame();
  const howToPlayContent = isTaskStep ? getHowToPlayContent(step) : null;

  return (
    <SafeAreaViewBase style={styles.container}>
      <NavBar userName={userName} />

      {phase === 'playing' && (
        <>
          <View style={styles.sceneArea}>
            <SceneStage
              characters={getActiveCharacters()}
              currentStep={step}
              onAdvance={step.type !== 'task' ? advance : undefined}
              backgroundImage={currentScene?.background}
              sceneKey={currentStep?.sceneKey}
              gameMode={false}
              inSceneGame={inSceneGame}
            />
          </View>
          <WrongAnswerFeedback
            visible={!!feedbackPopup}
            chosenText={feedbackPopup?.chosenText ?? ''}
            correctText={feedbackPopup?.correctText ?? ''}
            onDismiss={handleFeedbackDismiss}
          />

          {/* Word-choice tasks still use the modal */}
          {isTaskStep && step.taskType === 'choice' && (
            <View style={styles.taskRendererContainer}>
              <TaskRenderer step={step} onAnswered={handleTaskAnswered} />
            </View>
          )}

          {/* ? button — floats top-right once HowToPlay is dismissed */}
          {isTaskStep && step.taskType !== 'choice' && !showHowToPlay && (
            <TouchableOpacity
              style={styles.helpBtn}
              onPress={() => setShowHowToPlay(true)}
            >
              <Text style={styles.helpBtnText}>?</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {phase === 'end' && (
        <EndScreen
          stars={earnedStarsDisplay}
          levelTitle={levelTitle}
          onNext={() => router.push(`/game/${chapterId}`)}
          onRetry={handleRetry}
          savingProgress={savingProgress}
        />
      )}

      {/* HowToPlay — rendered last so it overlays everything */}
      {isTaskStep && step.taskType !== 'choice' && howToPlayContent && (
        <HowToPlayModal
          isVisible={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
          title={howToPlayContent.title}
          instructions={howToPlayContent.instructions}
          highlightPhrases={howToPlayContent.highlightPhrases}
          steps={howToPlayContent.steps}
          characters={howToPlayContent.characters}
          catImageSource={catImage}
        />
      )}
    </SafeAreaViewBase>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.gameBg },
  sceneArea: { flex: 1, justifyContent: 'flex-end' },
  taskRendererContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    elevation: 5, zIndex: 10,
  },

  // Floating ? button
  helpBtn: {
    position: 'absolute',
    top: 70,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 4,
    backgroundColor: AppColors.lilac,
    borderWidth: 2,
    borderColor: AppColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  helpBtnText: {
    color: AppColors.blue,
    fontWeight: '800',
    fontSize: 18,
    fontFamily: 'monospace',
    lineHeight: 20,
  },

  // End screen
  endScreen: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: Spacing.lg, backgroundColor: AppColors.gameBg,
  },
  endEmoji:   { fontSize: 56, marginBottom: Spacing.lg },
  endTitle:   { ...AppFonts.header, fontSize: 32, color: AppColors.blue, marginBottom: Spacing.sm },
  endMessage: { ...AppFonts.body, fontSize: 16, color: AppColors.dark, marginBottom: Spacing.lg, textAlign: 'center' },
  starsDisplay: { flexDirection: 'row', gap: Spacing.md, marginVertical: Spacing.lg },
  starIcon: { fontSize: 40 },
  nextLevelBtn: { ...ButtonStyles.bigAction, backgroundColor: AppColors.blue, borderColor: AppColors.lilac, marginBottom: Spacing.md },
  nextLevelBtnText: { ...AppFonts.button, fontSize: 18, color: AppColors.white },
  retryBtn: { ...ButtonStyles.action, backgroundColor: AppColors.white, borderColor: AppColors.blue },
  retryBtnText: { ...AppFonts.button2, fontSize: 14, color: AppColors.blue },

  // Loading / error
  centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: Spacing.md, fontSize: 14, color: '#666' },
  errorEmoji: { fontSize: 48, marginBottom: Spacing.md },
  errorText: { fontSize: 16, fontWeight: '700', color: AppColors.dark, marginBottom: Spacing.sm },
  errorDetail: { fontSize: 13, color: '#666', marginBottom: Spacing.lg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
    backgroundColor: AppColors.white, borderBottomWidth: 2, borderBottomColor: AppColors.blue,
  },
});

// ─── Sub-components ───────────────────────────────────────────────────────────

interface EndScreenProps {
  stars: boolean[]; levelTitle: string;
  onNext: () => void; onRetry: () => void; savingProgress?: boolean;
}
function EndScreen({ stars, onNext, onRetry, savingProgress }: EndScreenProps) {
  const count = stars.filter(Boolean).length;
  const message = count === 3 ? 'Perfect! You nailed it!' : count === 2 ? 'Great job!' : 'Nice try — keep practicing!';
  const emoji = count === 3 ? '🎉' : count === 2 ? '👍' : '💪';
  return (
    <View style={styles.endScreen}>
      <Text style={styles.endEmoji}>{emoji}</Text>
      <Text style={styles.endTitle}>{count === 3 ? 'Level Complete!' : 'Level Finished'}</Text>
      <Text style={styles.endMessage}>{message}</Text>
      <View style={styles.starsDisplay}>
        {stars.map((earned, i) => <Text key={i} style={[styles.starIcon, { opacity: earned ? 1 : 0.2 }]}>⭐</Text>)}
      </View>
      <TouchableOpacity style={styles.nextLevelBtn} onPress={onNext} disabled={savingProgress}>
        <Text style={styles.nextLevelBtnText}>{savingProgress ? 'Saving...' : 'Next Level →'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryBtnText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.centerScreen}>
      <ActivityIndicator size="large" color={AppColors.blue} />
      <Text style={styles.loadingText}>Loading level…</Text>
    </View>
  );
}

interface ErrorScreenProps { message: string; onBack: () => void; }
function ErrorScreen({ message, onBack }: ErrorScreenProps) {
  return (
    <View style={styles.centerScreen}>
      <Text style={styles.errorEmoji}>⚠️</Text>
      <Text style={styles.errorText}>Failed to load level</Text>
      <Text style={styles.errorDetail}>{message}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onBack}>
        <Text style={styles.retryBtnText}>← Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}