// app/components/WrongAnswerFeedback.tsx

import catImage from '@/assets/images/chapters/Cat.png';
import { AppColors, AppFonts } from '@/constants/theme';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Circle, Ellipse, Line, Path } from 'react-native-svg';

interface WrongAnswerFeedbackProps {
  visible: boolean;
  chosenText: string;
  correctText: string;
  onDismiss: () => void;
}

function NervousLines() {
  return (
    <Svg width={80} height={80} viewBox="0 0 24 20">
      <Line x1={4} y1={0}  x2={4} y2={24}  stroke="#000000" strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={10} y1={0} x2={10} y2={24} stroke="#000000" strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={16} y1={0} x2={16} y2={24} stroke="#000000" strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

// ── Sad doodle face ───────────────────────────────────────────────────────────
function SadFace() {
  return (
    <Svg width={48} height={48} viewBox="0 0 48 48">
      {/* Head */}
      <Circle cx={24} cy={24} r={20} fill='#E7E1FF' stroke="#E05555" strokeWidth={1.5} />
      {/* Left eye */}
      <Ellipse cx={17} cy={19} rx={2.5} ry={3} fill="#E05555" />
      {/* Right eye */}
      <Ellipse cx={31} cy={19} rx={2.5} ry={3} fill="#E05555" />
      {/* Sad mouth */}
      <Path d="M16 32 Q24 26 32 32" fill="none" stroke="#E05555" strokeWidth={2.5} strokeLinecap="round" />
      {/* Eyebrows sad */}
      <Path d="M13 15 Q17 13 20 15" fill="none" stroke="#E05555" strokeWidth={2} strokeLinecap="round" />
      <Path d="M28 15 Q31 13 35 15" fill="none" stroke="#E05555" strokeWidth={2} strokeLinecap="round" />
      {/* Tear */}
      <Path d="M17 24 Q16 27 17 29" fill="none" stroke="#E05555" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

// ── Happy doodle face ─────────────────────────────────────────────────────────
function HappyFace() {
  return (
    <Svg width={48} height={48} viewBox="0 0 48 48">
      {/* Head */}
      <Circle cx={24} cy={24} r={20} fill="#E7E1FF" stroke="#27AE60" strokeWidth={2.5} />
      {/* Left eye — happy squint */}
      <Path d="M14 18 Q17 15 20 18" fill="none" stroke="#27AE60" strokeWidth={2.5} strokeLinecap="round" />
      {/* Right eye — happy squint */}
      <Path d="M28 18 Q31 15 34 18" fill="none" stroke="#27AE60" strokeWidth={2.5} strokeLinecap="round" />
      {/* Happy mouth */}
      <Path d="M16 28 Q24 36 32 28" fill="none" stroke="#27AE60" strokeWidth={2.5} strokeLinecap="round" />
      {/* Cheeks */}
      <Ellipse cx={13} cy={28} rx={4} ry={2.5} fill="#27AE60" opacity={0.2} />
      <Ellipse cx={35} cy={28} rx={4} ry={2.5} fill="#27AE60" opacity={0.2} />
      {/* Little star doodle */}
      <Line x1={39} y1={10} x2={39} y2={14} stroke="#27AE60" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={37} y1={12} x2={41} y2={12} stroke="#27AE60" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function WrongAnswerFeedback({
  visible,
  chosenText,
  correctText,
  onDismiss,
}: WrongAnswerFeedbackProps) {
  const scaleAnim   = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 50 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  // 1. Add shake animation ref alongside your existing ones
const shakeAnim = useRef(new Animated.Value(0)).current;

// 2. In the useEffect, add the shake loop after the entrance animation
useEffect(() => {
  if (visible) {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 180 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      // Start shake loop after entrance finishes
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -8, duration: 300, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,  duration: 300, useNativeDriver: true }),
        Animated.delay(800),
      ])
    ).start();
    });
  } else {
    shakeAnim.setValue(0);
    scaleAnim.setValue(0.7);
    opacityAnim.setValue(0);
  }
}, [visible]);

// 3. Interpolate shake value to rotation degrees
const rotation = shakeAnim.interpolate({
  inputRange: [-1, 1],
  outputRange: ['-15deg', '15deg'],
});

const catHeight = 100; 

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.modalContainer, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
        >
           {/* Cat peeks over the top — sits above the card */}
<Animated.View style={[
  styles.catContainer,
  { transform: [{ translateY: shakeAnim }] }
]}>
<Image source={catImage} style={styles.catImage} resizeMode="contain" />
  <View style={styles.nervousLines}>
    <NervousLines />
  </View>
  </Animated.View>
          <View style={styles.modal}>
            <View style={[styles.pixelCorner, styles.pcTL]} />
            <View style={[styles.pixelCorner, styles.pcTR]} />
            <View style={[styles.pixelCorner, styles.pcBL]} />
            <View style={[styles.pixelCorner, styles.pcBR]} />

            {/* Header — centered, no close button */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Not Quite!</Text>
            </View>

            {/* Body */}
            <View style={styles.body}>
              <View style={styles.divider} />

              {/* Wrong answer row */}
              <View style={styles.answerBlock}>
                <View style={styles.labelRow}>
                  <HappyFace />
                  <View style={styles.labelHighlightCorrect}>
                    <Text style={styles.labelText}>The right answer was</Text>
                  </View>
                  <Text style={styles.arrow}>→</Text>
                  <Text style={styles.answerText} numberOfLines={2}>{correctText}</Text>
                </View>
              </View>

              {/* Correct answer row */}
              <View style={styles.answerBlock}>
                <View style={styles.labelRow}>
                  <SadFace />
                  <View style={styles.labelHighlightWrong}>
                    <Text style={styles.labelText}>But you choose</Text>
                  </View>
                  <Text style={styles.arrow}>→</Text>
                  <Text style={styles.answerText} numberOfLines={2}>{chosenText}</Text>
                </View>
              </View>

              <Text style={styles.hint}>Next time be more careful!</Text>

              <TouchableOpacity style={styles.gotItBtn} onPress={onDismiss}>
                <Text style={styles.gotItText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 50, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    position: 'relative',
  },
  modal: {
    width: '100%',
    backgroundColor: AppColors.lilac,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: AppColors.blue,
    overflow: 'hidden',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
catContainer: {
  zIndex: 20,
  alignSelf: 'center',
  width: 200,
  height: 200,
  bottom: -110,
  left:350,
  position: 'absolute'
},
catImage: {
  width: 200,
  height: 200,
},
nervousLines: {
  position: 'absolute',
  top: -10,
  left: 160,
},
  pixelCorner: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: AppColors.lilac,
    zIndex: 10,
  },
  pcTL: { top: 0, left: 0 },
  pcTR: { top: 0, right: 0 },
  pcBL: { bottom: 0, left: 0 },
  pcBR: { bottom: 0, right: 0 },
  header: {
    backgroundColor: AppColors.blue,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',          // ← centered
    borderBottomWidth: 3,
    borderBottomColor: AppColors.dark,
  },
  headerTitle: {
    ...AppFonts.body,
    color: AppColors.lilac,
    fontSize: 36,
    letterSpacing: 1,
    textAlign: 'center',
  },
  body: {
    padding: 20,
    paddingBottom: 24,
    gap: 16,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: AppColors.blue,
    borderStyle: 'dashed',
  },
  answerBlock: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  // Baby red pill highlight
  labelHighlightWrong: {
    backgroundColor: '#FFD6D6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: '#E05555',
  },
  // Baby green pill highlight
  labelHighlightCorrect: {
    backgroundColor: '#D6FFE4',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: '#27AE60',
  },
  labelText: {
    ...AppFonts.body,
    fontSize: 18,
    color: AppColors.blue,
  },
  arrow: {
    ...AppFonts.body,
    fontSize: 24,
    color: AppColors.blue,
  },
  answerText: {
    ...AppFonts.body,
    fontSize: 24,
    color: AppColors.blue,
    flex: 1,
    lineHeight: 24,
  },
  hint: {
    ...AppFonts.body,
    fontSize: 16,
    color: AppColors.blue,
    textAlign: 'center',
    opacity: 0.6,
  },
  gotItBtn: {
    backgroundColor: AppColors.blue,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: AppColors.lilac,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    marginTop: 4,
  },
  gotItText: {
    ...AppFonts.body,
    fontSize: 24,
    color: AppColors.lilac,
    letterSpacing: 1,
  },
});