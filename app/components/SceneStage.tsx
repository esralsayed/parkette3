// app/game/components/SceneStage.tsx
//
// CHANGE SUMMARY
// ──────────────
// • New prop: `inSceneGame` — a pre-built ReactNode that renders at the
//   bottom of the stage (where dialog normally lives) when a task is active.
//   This replaces the old fullscreen/modal pattern entirely.
// • Everything else (background, decorations, ground, narrate, dialog) is
//   unchanged so existing levels keep working.

import { AppColors, AppFonts, Spacing } from '@/constants/theme';
import React, { useEffect, useState } from "react";
import { Dimensions, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GameCharacter } from '../adapters/LevelAdapter';
import DialogBox from './DialogBox';
import LevelDecorations from './LevelDecorations';

const { width, height } = Dimensions.get('window');

// explaining this component ->
// this scene props has characters, currentstep, onAdvance function, bg, scenekey, gameMode, inscenegame
interface SceneStageProps {
  characters?: GameCharacter[];
  currentStep?: any;
  onAdvance?: () => void;
  backgroundImage?: any;
  sceneKey?: string;
  gameMode?: boolean;
  inSceneGame?: React.ReactNode;
}

export default function SceneStage({ 
  characters = [], 
  currentStep,
  onAdvance,
  backgroundImage = null,
  sceneKey,
  gameMode = false,
  inSceneGame,
}: SceneStageProps) {

  const isTask = currentStep?.type === 'task';
  const [side, setSide] = useState<'left' | 'right'>('left');

  //this portion is for making the dialog on the left or on the right
  const speakingCharacter = currentStep?.type === 'dialog' 
    ? characters.find(c => c.name === currentStep?.speaker || c.displayName === currentStep?.speaker)
    : null;

useEffect(() => {
  if (speakingCharacter?.side) {
    setSide(speakingCharacter.side);
  }
}, [currentStep]);

  const sceneContent = (
    <>
      <LevelDecorations sceneKey={sceneKey} />
      <View style={styles.ground} />

      {/* ── When an in-scene game is active, show it in the bottom panel ── */}
{inSceneGame && (
  <View style={styles.inSceneLayer}>
    {inSceneGame}
  </View>
)}
        {!gameMode && (
          <View style={styles.contentContainer}>

            {/* NARRATE — centered text box, no character */}
            {currentStep?.type === 'narrate' && (
              <View style={styles.narrateContainer}>
                <View style={styles.narrateBox}>
                  <View style={styles.narrateTopBar} />
                  <View style={styles.narrateLabelRow} />
                  <Text style={styles.narrateText}>{currentStep.text}</Text>
                  <Text style={styles.narrateTapHint}>tap to continue</Text>
                </View>
              </View>
            )}

            {/* DIALOG + character */}
            <View style={[
              styles.combinedContainer,
              side === 'left' ? styles.combinedLeft : styles.combinedRight
            ]}>
              {speakingCharacter && (
                <View
                  style={[
                    styles.characterWrapper,
                    side === 'left'
                      ? { marginLeft: -30 }   // overlaps dialog from right
                      : { marginRight: -30 }  // overlaps dialog from left
                  ]}
                >                  <View
                                style={[
                                  styles.characterBubble,
                                  { transform: [{ scale: speakingCharacter?.scale ?? 1 }] }
                                ]}
                              >
                    <Image 
                      source={speakingCharacter.sprite} 
                      style={styles.characterSprite}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              )}
              {currentStep && (
                <View style={styles.dialogBoxWrapper}>
                  <DialogBox
                    type={currentStep.type}
                    speaker={currentStep.speaker}
                    text={currentStep.text}
                    instruction={currentStep.instruction}
                    onTap={onAdvance}
                    canAdvance={!isTask}
                  />
                </View>
              )}
            </View>

          </View>
      )}
    </>
  );

  return (
    <TouchableOpacity 
      style={styles.container}
      activeOpacity={1}
      onPress={(gameMode || inSceneGame) ? undefined : onAdvance}
      disabled={isTask || gameMode || !!inSceneGame}
    >
      {backgroundImage ? (
        <ImageBackground
          source={backgroundImage}
          style={styles.background}
          imageStyle={styles.imageStyle}
        >
          {sceneContent}
        </ImageBackground>
      ) : (
        <View style={styles.container}>
          {sceneContent}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inSceneLayer: {
  ...StyleSheet.absoluteFillObject,
  zIndex: 25, // below dialog (30), above decorations
},
  background: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: Spacing.md,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 20,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: AppColors.blue,
    borderTopLeftRadius: Spacing.md,
    borderTopRightRadius: Spacing.md,
    zIndex: -1,
  },

  // ── In-scene game panel ────────────────────────────────────────────────────
  // Sits at the bottom of the stage, same visual weight as the dialog area.
  // The ground is behind it; decorations + characters remain visible above.
  inSceneGamePanel: {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
  backgroundColor: AppColors.lilac,
  borderWidth: 3,
  borderColor: AppColors.blue,
  borderRadius: Spacing.md,
  padding: Spacing.lg,
  minWidth: '80%',
  maxWidth: '90%',
  minHeight: 300,
  zIndex: 100,
  shadowColor: AppColors.blue,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 15,
  },

  // ── Existing layout (unchanged) ───────────────────────────────────────────
combinedContainer: {
  position: 'absolute',
  top: Spacing.xl,
  flexDirection: 'row',
  alignItems: 'flex-end',
  zIndex: 30,
},
combinedLeft: {
  left: Spacing.md,
  flexDirection: 'row', // dialog then character
},

combinedRight: {
  right: Spacing.md,
  flexDirection: 'row-reverse', // character then dialog
},
  characterWrapper: {
  justifyContent: 'flex-end',
  zIndex: 40, // above dialog
  },
  characterBubble: {
  width: 140,
  height: 140,
  alignItems: 'center',
  justifyContent: 'flex-end',
  backgroundColor: 'transparent',
    transform: [{ translateY: 10 }], // sits into dialog

  },
  characterSprite: {
    width: '100%',
    height: '100%',
  },
  dialogBoxWrapper: {
    alignSelf: 'flex-start',
    maxWidth: 300,
    minWidth: 200,
    zIndex: 30,
    marginTop: -20
  },
  narrateContainer: {
    position: 'absolute',
    bottom: '85%',
    left: Spacing.md,
    right: Spacing.md,
    alignItems: 'center',
    zIndex: 30,
  },
  narrateBox: {
    backgroundColor: AppColors.lilac,
    borderRadius: 16,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: AppColors.blue,
    width: '100%',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  narrateTopBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 5,
    backgroundColor: AppColors.blue,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  narrateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
    marginTop: 4,
  },
  narrateText: {
    ...AppFonts.body,
    fontSize: 24,
    lineHeight: 24,
    color: AppColors.blue,
    fontStyle: 'italic',
  },
  narrateTapHint: {
    ...AppFonts.bodySmall,
    marginTop: Spacing.sm,
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
    fontStyle: 'italic',
  },
});