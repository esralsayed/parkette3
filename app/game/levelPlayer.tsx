// app/game/level/[levelId].tsx

import { AppColors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View
} from 'react-native';
import { GameCharacter, GameScene, GameStep } from '../adapters/LevelAdapter';
import NavBar from '../components/navbar';
import QuestionScreen, { Question } from '../game/components/Questions';
import { EndScreen, ErrorScreen, LoadingScreen } from "./components/Extra screens";
import WrongAnswerFeedback from './components/Feedback';
import SceneStage from './components/SceneStage';
import TaskRenderer from './components/TaskRenderer';
import { TaskAnswer } from './interfaces/TaskAnswer';
import { levelService } from './services/LevelService';

export default function LevelPlayer() {
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
  const [preQuestions, setPreQuestions]   = useState<Question[]>([]);
  const [postQuestions, setPostQuestions] = useState<Question[]>([]); 
  const [questionPhase, setQuestionPhase] = useState<'pre' | 'game' | 'post'>('pre');
  const [rewardUnlocked, setRewardUnlocked] = useState<{
    label: string; type: string; itemId: string;
  } | null>(null);
  const [recommendation, setRecommendation] = useState<{
    recommendedLevelId: string | null;
    type: 'retry' | 'next' | 'challenge' | 'complete';
    reason: string;
    level?: { title: string };
    newlyUnlocked: string[];
  } | null>(null);
  const [miniAvatar, setMiniAvatar] = useState<string | null>(null);

  //variables
  const step = currentStep;
  const router = useRouter();

  // explanation of the component -> 
  // 1- this useeffect loads the user info from AsyncStorage
  const [avatarReady, setAvatarReady] = useState(false);


  useEffect(() => {
    const loadUserName = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserName(user.name || 'User');

          // Pull miniAvatar — stored at user.avatar.miniAvatar
          const avatar = user.avatar?.miniAvatar ?? null;
          setMiniAvatar(avatar);
          console.log('🧒 Loaded miniAvatar:', avatar);
        }
      } catch (e) { console.error(e); }
      finally { setAvatarReady(true); }
    };
    loadUserName();
  }, []);

  useEffect(() => {
    if (!chapterId) {
      console.error("❌ chapterId is missing. Cannot load level.");
      // Option 1: Show error screen
      setError("Missing chapter information. Please go back and try again.");
      
      // Option 2: Auto redirect back (uncomment if you prefer)
      // setTimeout(() => router.back(), 1500);
    }
  }, [chapterId]);

  // this useeffect loads the level by ->
  // 1. get the user Id , 
  // 2. call levelService initilize level with the levelId(from the params)
  // 3. set the scene const and give it the gameLevel scenes of the first element -> the scene itself (this is a redundant step as there is only 1 scene object with mulitple steps in the level )
  // 4. then set the currentscene and setleveltitle
  // 5. get the first step and set it as the currentstep
  // 6. get the progress and set the currentstepIndex with the progress current step ? 

useEffect(() => {
    if (!avatarReady) return; // ← wait for avatar to load before initializing level
    if (!levelId || !chapterId) {
      setError("Invalid level access: Missing chapter or level ID");
      setLoading(false);
      return;
    }

    const loadLevel = async () => {
      try {
        setLoading(true);
        const userId = await getCurrentUserId();

        await levelService.clearLevelCache(levelId as string); // ← ADD TEMPORARILY

        const gameLevel = await levelService.initializeLevel(levelId as string, chapterId as string, userId, undefined, miniAvatar);
        
        const scene = gameLevel.scenes[0];
        setCurrentScene(scene);
        setLevelTitle(gameLevel.title);
        setStars(gameLevel.reward?.stars || 3);
        const pre  = gameLevel.preQuestions  ?? [];
        const post = gameLevel.postQuestions ?? [];

        setPreQuestions(pre);
        setPostQuestions(post);

        setQuestionPhase(pre.length > 0 ? 'pre' : 'game');  // ← key fix


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

    loadLevel();

    return () => { levelService.destroy(); };
  }, [levelId, chapterId, avatarReady]); // ← added avatarReady dependency

  const advance = useCallback(async () => {
    if (step?.type === 'task') return;
    const result = await levelService.advanceToNextStep();
    if (!result.nextStep) {
      if (result.rewardUnlocked) setRewardUnlocked(result.rewardUnlocked);
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
    }, [step]);

    const handlePreQuestionsComplete = (score: number, total: number) => {
      setQuestionPhase('game');
      levelService.setPreQuestionAnswers({ score, total });  // ← ADD
    };

    const handlePostQuestionsComplete = async (score: number, total: number) => {
      await levelService.setPostQuestionAnswers({ score, total }); // ← ADD
      await fetchRecommendation(); 
      setQuestionPhase('game');  // ← exit the post gate first
      setPhase('end');
    };

  const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api` || "http://localhost:5000/api";

  const finishLevel = async () => {
    if (phase === 'end' || questionPhase === 'post') return;

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

  if (postQuestions.length > 0) {
    setQuestionPhase('post');
    // ⏳ stop here — recommendation fetch happens after post questions
  } else {
    await fetchRecommendation(); // extract this into its own function
    setPhase('end');
  }

};

const isFetchingRecommendation = React.useRef(false);

const fetchRecommendation = async () => {
  if (isFetchingRecommendation.current) return;  // ← guard
  isFetchingRecommendation.current = true;
  
  try {
    const userId = await getCurrentUserId();
    const res = await fetch(
      `${API_URL}/recommend/${userId}?completedLevelId=${levelId}`
    );
    const rec = await res.json();
    setRecommendation(rec);
    await AsyncStorage.setItem('lastRecommendation', JSON.stringify(rec));
    if (rec.rewardUnlocked) setRewardUnlocked(rec.rewardUnlocked);
  } catch (e) {
    console.error('⚠️ recommendation fetch failed:', e);
  } finally {
    isFetchingRecommendation.current = false;  // ← reset
  }
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
        if (result.rewardUnlocked) setRewardUnlocked(result.rewardUnlocked); 
        finishLevel();
        return;
      }

      setCurrentStep(result.nextStep);
    } finally {
      isAdvancingRef.current = false;
    }
  };

const handleFeedbackDismiss = () => {
  isAdvancingRef.current = false;
  setFeedbackPopup(null);
  if (pendingNextStep) {
    setCurrentStep(pendingNextStep);
    setPendingNextStep(null);
  } else if (phase !== 'end') {  // ← guard against double finish
    finishLevel();
  }
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
    await levelService.initializeLevel(levelId as string, chapterId as string, userId, undefined, miniAvatar);

    setCurrentStep(levelService.getCurrentStep());
    setLoading(false);
  };

    if (loading) return <LoadingScreen />;
    if (error) return <ErrorScreen message={error} onBack={() => router.back()} />;
      // ── Pre-questions gate ─────────────────────────────────────────────────────
  if (questionPhase === 'pre' && preQuestions.length > 0) {
    return (
      <QuestionScreen
        mode="pre"
        questions={preQuestions}
        levelTitle={levelTitle}
        onComplete={handlePreQuestionsComplete}
        onSkip={() => setQuestionPhase('game')}   // optional — remove if you want forced
      />
    );
  }
 
  // ── Post-questions ─────────────────────────────────────────────────────────
  if (questionPhase === 'post' && postQuestions.length > 0) {
    return (
      <QuestionScreen
        mode="post"
        questions={postQuestions}
        levelTitle={levelTitle}
        onComplete={handlePostQuestionsComplete}
      />
    );
  }
    if (!step) {
    return <LoadingScreen />;
  }
  const isTaskStep = step.type === 'task';

  return (
    <SafeAreaView style={styles.container}>
      <NavBar/>
        <>
          <View style={styles.sceneArea}>
            <SceneStage
              characters={getActiveCharacters()}
              currentStep={step}
              onAdvance={step.type !== 'task' ? advance : undefined}
              backgroundImage={currentScene?.background}
              sceneKey={currentStep?.sceneKey}
              gameMode={false}
              avatarImage={currentScene?.avatarImage} // Pass avatar image to SceneStage
            />
          </View>
          <WrongAnswerFeedback
            visible={!!feedbackPopup}
            chosenText={feedbackPopup?.chosenText ?? ''}
            correctText={feedbackPopup?.correctText ?? ''}
            onDismiss={handleFeedbackDismiss}
          />

          {/* Word-choice tasks still use the modal */}
          {isTaskStep && step.gameType && (
              console.log('🔑 Rendering TaskRenderer with key:', currentStepIndex),
            <View style={styles.taskRendererContainer}>
              <TaskRenderer 
              key={currentStepIndex}  // ← add this
              step={step} 
              onAnswered={handleTaskAnswered} 
              onInSceneComplete={handleInSceneGameComplete} />
            </View>
          )}
        </>

      {phase === 'end' && (
        <EndScreen
          stars={earnedStarsDisplay}
          levelTitle={levelTitle}
          onNext={() => router.push(`/game/${chapterId}`)}
          onRetry={handleRetry}
          savingProgress={savingProgress}
          rewardUnlocked={rewardUnlocked}
          recommendation={recommendation}           // ← ADD
        />
      )}
    </SafeAreaView>
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
});

