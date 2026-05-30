//import CatEnd from "@/assets/svgs/game/Cat winking.svg";
import { AppColors, AppFonts, AppFontSizes, Spacing } from '@/constants/theme';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface EndScreenProps {
  stars: boolean[]; levelTitle: string;
  onNext: () => void; onRetry: () => void; savingProgress?: boolean;
  rewardUnlocked?: { label: string; type: string; itemId: string } | null;  // ← add
  recommendation?: {                    // ← ADD
    recommendedLevelId: string | null;
    type: 'retry' | 'next' | 'challenge' | 'complete';
    reason: string;
    level?: { title: string };
    newlyUnlocked: string[];
  } | null;
}

export function EndScreen({ stars, onNext, onRetry, savingProgress, rewardUnlocked,
  recommendation
 }: EndScreenProps) {
  const count = stars.filter(Boolean).length;
  const message = count === 3 ? 'Perfect! You nailed it!' : count === 2 ? 'Great job!' : 'Nice try — keep practicing!';
  const [showReward, setShowReward] = useState(false);

  const handleNext = () => {
    if (rewardUnlocked) {
      setShowReward(true);  // show reward modal first
    } else {
      onNext();
    }
  };

  const REWARD_ICON = {
    sticker: '✏️',
    game:    '🎣',
    hair:    '💇',
  };
  
  return (
    <View style={styles.endScreen}>
      {/* ── Reward Modal ──────────────────────────────────── */}
      {showReward && rewardUnlocked && (
        <View style={rewardStyles.overlay}>
          <View style={rewardStyles.modal}>
            {/* title bar */}
            <View style={rewardStyles.titleBar}>
              <Text style={rewardStyles.titleBarText}>Chapter Complete!</Text>
            </View>

            <View style={rewardStyles.body}>
              <Text style={rewardStyles.unlockLabel}>You unlocked:</Text>
              <View style={rewardStyles.iconBox}>
                <Text style={rewardStyles.icon}>
                  {REWARD_ICON[rewardUnlocked.type as keyof typeof REWARD_ICON] ?? '🎁'}
                </Text>
              </View>
              <Text style={rewardStyles.rewardName}>{rewardUnlocked.label}</Text>

              <TouchableOpacity style={rewardStyles.btn} onPress={handleNext}>
                <Text style={rewardStyles.btnText}>Awesome!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      <View style={styles.contentContainer}>
        <View style={styles.catWrapper}>
          <Image source={require('@/assets/images/Cat winking.png')} style={{ width: 200, height: 200 }} resizeMode="contain" />
          {/* <CatEnd /> */}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.endTitle}>{count === 3 ? 'Level Complete!' : 'Level Finished'}</Text>
          <Text style={styles.endMessage}>{message}</Text>
      {(recommendation?.newlyUnlocked?.length ?? 0) > 0 && (
        <View style={unlockBannerStyles.banner}>
          <View style={unlockBannerStyles.iconWrap}>
            <Text style={unlockBannerStyles.iconText}>🔓</Text>
          </View>
          <View style={unlockBannerStyles.text}>
            <Text style={unlockBannerStyles.eyebrow}>You just unlocked</Text>
            <Text style={unlockBannerStyles.chapterName}>
              {recommendation?.level?.title ?? 'a new chapter!'}
            </Text>
          </View>
        </View>
      )}
        </View>
      </View>
      
      <View style={styles.buttonRow}>
        <View style={styles.confettiWrapper}>
         {/*<Confetti /> */}
         <Image source={require('@/assets/images/Confettileft.png')} style={{ width: 200, height: 200 }} resizeMode="contain" />
        </View>
        <View style={[{flexDirection:'column', gap:8}]}>
          <View style={styles.starsDisplay}>
            {stars.map((earned, i) => <Text key={i} style={[styles.starIcon, { opacity: earned ? 1 : 0.2 }]}>⭐</Text>)}
          </View>
          <TouchableOpacity style={styles.nextLevelBtn} onPress={onNext} disabled={savingProgress}>
            <Text style={styles.nextLevelBtnText}>{savingProgress ? 'Saving...' : 'Next Level'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.confettiWrapperRight}>
          <Image source={require('@/assets/images/Confettiright.png')} style={{ width: 200, height: 200 }} resizeMode="contain" />
        </View>
      </View>
    </View>
  );
}

const unlockBannerStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: AppColors.blue,
    borderRadius: 16,
    padding: Spacing.md,
    marginTop: Spacing.md,
    width: '100%',
    borderWidth: 3,
    borderColor: AppColors.lilac,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.lilac,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: { fontSize: 24 },
  text: { flex: 1 },
  eyebrow: {
    ...AppFonts.bodySmall,
    color: AppColors.lilac,
    fontSize: AppFontSizes.bodySmall,
    opacity: 0.75,
  },
  chapterName: {
    ...AppFonts.subhead,
    color: AppColors.lilac,
    fontSize: AppFontSizes.body,
  },
});

import { useState } from 'react';

const rewardStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 30,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: 320,
    borderWidth: 4,
    borderColor: AppColors.blue,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: AppColors.lilac,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  titleBar: {
    backgroundColor: AppColors.blue,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  titleBarText: {
    ...AppFonts.subhead,
    color: AppColors.lilac,
    fontSize: AppFontSizes.body,
    textAlign: 'center',
  },
  body: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  unlockLabel: {
    ...AppFonts.body,
    color: AppColors.blue,
    fontSize: AppFontSizes.subhead,
    opacity: 0.7,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: AppColors.lilac,
  },
  icon: {
    fontSize: 36,
  },
  rewardName: {
    ...AppFonts.subhead,
    color: AppColors.blue,
    fontSize: AppFontSizes.subhead,
    textAlign: 'center',
  },
  btn: {
    marginTop: Spacing.sm,
    backgroundColor: AppColors.blue,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    shadowColor: AppColors.lilac,
    shadowOffset: { width: 4, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  btnText: {
    ...AppFonts.body,
    color: AppColors.lilac,
    fontSize: AppFontSizes.body,
  },
});

interface ErrorScreenProps { message: string; onBack: () => void; }
export function ErrorScreen({ message, onBack }: ErrorScreenProps) {
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

export function LoadingScreen() {
  return (
    <View style={styles.centerScreen}>
      <ActivityIndicator size="large" color={AppColors.blue} />
      <Text style={styles.loadingText}>Loading level…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // End screen
endScreen: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 20,        // ← above navbar and scene
  justifyContent: 'center', 
  alignItems: 'center',
  paddingHorizontal: Spacing.lg, 
  backgroundColor: AppColors.lilac,
  opacity: 0.9
},
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    flexDirection: 'column',
    width: '100%'
  },
  catWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    width: '100%'
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  endEmoji: { 
    fontSize: 56, 
    marginBottom: Spacing.lg 
  },
  endTitle: { 
    ...AppFonts.header, 
    fontSize: AppFontSizes.title, 
    color: AppColors.blue, 
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  endMessage: { 
    ...AppFonts.body, 
    fontSize: AppFontSizes.subhead, 
    color: AppColors.dark, 
    textAlign: 'center' 
  },
  starsDisplay: { 
    flexDirection: 'row', 
    gap: Spacing.md, 
    marginVertical: Spacing.sm 
  },
  starIcon: { 
    fontSize: 40 
  },
  nextLevelBtn: { 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.lilac,
    borderWidth: 3,
    borderColor: AppColors.blue,
    borderRadius: 8,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4, 
  },
  nextLevelBtnText: {     
    ...AppFonts.bodySmall,
    color: AppColors.blue,
    fontSize: AppFontSizes.body 
  },
  retryBtn: {     
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.blue,
    borderWidth: 3,
    borderColor: AppColors.lilac,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    shadowColor: AppColors.lilac,
    shadowOffset: { width: 4, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4, 
  },
  retryBtnText: {     
    ...AppFonts.bodySmall,
    color: AppColors.lilac,
    fontSize: AppFontSizes.bodySmall 
  },
  confettiWrapper: {
    position: 'absolute',
    left: -300,
    top: '30%',
  }, 
  confettiWrapperRight: {
    position: 'absolute',
    right: -300,
    top: '30%',
  },

  //error screen
  centerScreen: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: Spacing.md, 
    fontSize: 14, 
    color: '#666' 
  },
  errorEmoji: { 
    fontSize: 48, 
    marginBottom: Spacing.md 
  },
  errorText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: AppColors.dark, 
    marginBottom: Spacing.sm 
  },
  errorDetail: { 
    fontSize: 13, 
    color: '#666', 
    marginBottom: Spacing.lg 
  },
  header: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: Spacing.md, 
    paddingHorizontal: Spacing.lg,
    backgroundColor: AppColors.white, 
    borderBottomWidth: 2, 
    borderBottomColor: AppColors.blue,
  },
})