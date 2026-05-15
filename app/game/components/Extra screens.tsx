import CatEnd from "@/assets/svgs/game/Cat winking.svg";
import Confetti from "@/assets/svgs/game/Confettileft.svg";
import Confetti2 from "@/assets/svgs/game/Confettiright.svg";
import { AppColors, AppFonts, AppFontSizes, Spacing } from '@/constants/theme';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface EndScreenProps {
  stars: boolean[]; levelTitle: string;
  onNext: () => void; onRetry: () => void; savingProgress?: boolean;
}

export function EndScreen({ stars, onNext, onRetry, savingProgress }: EndScreenProps) {
  const count = stars.filter(Boolean).length;
  const message = count === 3 ? 'Perfect! You nailed it!' : count === 2 ? 'Great job!' : 'Nice try — keep practicing!';
  
  return (
    <View style={styles.endScreen}>
      <View style={styles.contentContainer}>
        <View style={styles.catWrapper}>
          <CatEnd />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.endTitle}>{count === 3 ? 'Level Complete!' : 'Level Finished'}</Text>
          <Text style={styles.endMessage}>{message}</Text>
        </View>
      </View>
      
      <View style={styles.buttonRow}>
        <View style={styles.confettiWrapper}>
          <Confetti />
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
          <Confetti2 />
        </View>
      </View>
    </View>
  );
}

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
  opacity: 0.8
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