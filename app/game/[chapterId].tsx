import {
  AppColors,
  AppFonts,
  AppFontSizes,
  ButtonStyles,
  Spacing,
} from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Uncomment when you add your SVG background:
import BackgroundSVG from "@/assets/svgs/game/Background.svg";
import NavBar from "../components/navbar";

const APIURL = `${process.env.EXPO_PUBLIC_API_URL}/api/levels` || "http://localhost:5000/api/levels";

type Level = {
  id: string;
  title: string;
  order: number;
  unlocked: boolean;
  passed: boolean;
  starsEarned: number;
  attempts: number;
  reward?: { stars: number; xp: number };
};

// ── Pixel-art lock icon ──────────────────────────────────────────────────────
const LockIcon = () => (
  <View style={lockStyles.icon}>
    <View style={lockStyles.shackle} />
    <View style={lockStyles.body}>
      <View style={lockStyles.hole} />
    </View>
  </View>
);

const lockStyles = StyleSheet.create({
  icon: { alignItems: "center", width: 20, height: 24 },
  shackle: {
    width: 12,
    height: 9,
    borderWidth: 3,
    borderColor: AppColors.blue,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    marginBottom: -1,
  },
  body: {
    width: 18,
    height: 14,
    backgroundColor: AppColors.blue,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  hole: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.lilacLight,
  },
});

// ── Stars ────────────────────────────────────────────────────────────────────
const StarRow = ({ count }: { count: number }) => (
  <View style={starStyles.row}>
    {[1, 2, 3].map((i) => (
      <Text key={i} style={[starStyles.star, i <= count && starStyles.filled]}>
        ★
      </Text>
    ))}
  </View>
);

const starStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 2, marginBottom: Spacing.xs },
  star: { fontSize: 22, color: AppColors.lilacMid, ...AppFonts.bodySmall },
  filled: { color: "#F5C842" },
});

// ── Main Screen ──────────────────────────────────────────────────────────────
const LevelsScreen = () => {
  const router = useRouter();
  const { chapterId, chapterTitle } = useLocalSearchParams<{
    chapterId: string;
    chapterTitle: string;
  }>();
  const [userId, setUserId] = useState<string | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserId(user.id || null);
        }
      } catch (e) {
        console.error("Error loading user:", e);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!userId || !chapterId) return;
    const fetchLevels = async () => {
      try {
        const res = await fetch(
          `${APIURL}?userId=${userId}&chapterId=${chapterId}`
        );
        const data = await res.json();
        setLevels(Array.isArray(data.levels) ? data.levels : []);
      } catch (e) {
        console.error("Error fetching levels:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLevels();
  }, [userId, chapterId]);

  return (
    <View style={styles.root}>
      <NavBar />
      {/* SVG background — drop your component here */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <BackgroundSVG width="100%" height="100%" preserveAspectRatio="xMidYMid slice" /> 
      </View>

      {/* Chapter title banner */}
      <View style={styles.titleBanner}>
        <Text style={styles.titleText}>
          "{chapterTitle || "Levels"}"
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.lilac} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {levels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelCard,
                  level.passed && styles.levelCardPassed,
                  !level.unlocked && styles.levelCardLocked,
                ]}
                onPress={() =>
                  level.unlocked &&
                  router.push({
                    pathname: "/game/levelPlayer",
                    params: {
                      levelId: level.id,
                      chapterId,
                      levelTitle: level.title,
                      chapterTitle,
                    },
                  })
                }
                disabled={!level.unlocked}
                activeOpacity={level.unlocked ? 0.75 : 1}
              >
                {level.passed && <StarRow count={level.starsEarned} />}

                <Text
                  style={[
                    styles.levelNumber,
                    !level.unlocked && styles.levelNumberLocked,
                  ]}
                >
                  {level.order}
                </Text>

                {!level.unlocked && (
                  <View style={styles.lockOverlay}>
                    <LockIcon />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default LevelsScreen;

// ── Styles ───────────────────────────────────────────────────────────────────
const CARD_SIZE = 100;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.lilac,
  },

  // Title banner
  titleBanner: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: ButtonStyles.level.borderWidth,
    borderColor: AppColors.lilac,
    borderRadius: ButtonStyles.level.borderRadius,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xl,
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    shadowColor: AppColors.lilac,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  titleText: {
    ...AppFonts.header,
    fontSize: AppFontSizes.super,
    color: AppColors.blue,
    textAlign: "center",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Grid
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg + 4,
    justifyContent: "center",
  },

  // Level card — uses ButtonStyles.level dimensions + theme tokens
  levelCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: AppColors.lilac,
    borderWidth: ButtonStyles.level.borderWidth,
    borderColor: AppColors.blue,
    borderRadius: ButtonStyles.level.borderRadius,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: AppColors.blue,
    shadowOffset: { width: 6, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  levelCardPassed: {
    backgroundColor: AppColors.lilacMid,
    borderColor: AppColors.lilacMid,
  },
  levelCardLocked: {
    backgroundColor: AppColors.lilacLight,
    borderColor: AppColors.lilacMid,
    opacity: 0.65,
  },

  // Level number
  levelNumber: {
    ...AppFonts.body,
    fontSize: AppFontSizes.super,
    color: AppColors.blue,
  },
  levelNumberLocked: {
    color: AppColors.lilacMid,
  },

  // Lock badge (top-right corner)
  lockOverlay: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
  },
});