import { AppColors, AppFonts, ButtonStyles, CardStyles, Spacing } from "@/constants/theme";
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

const APIURL = "http://localhost:5000/api/levels";

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

const LevelsScreen = () => {
  const router = useRouter();
  const { chapterId, chapterTitle } = useLocalSearchParams<{ chapterId: string; chapterTitle: string }>();
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
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!userId || !chapterId) return;

    const fetchLevels = async () => {
      try {
        const response = await fetch(`${APIURL}?userId=${userId}&chapterId=${chapterId}`);
        const data = await response.json();
        setLevels(Array.isArray(data.levels) ? data.levels : []);
      } catch (error) {
        console.error("Error fetching levels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, [userId, chapterId]);

  return (
    <View style={styles.root}>
      <Text style={[styles.title, AppFonts.header]}>Levels</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.blue} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {levels.map((level) => (
            <View
              key={level.id}
              style={[
                styles.levelCard,
                CardStyles.default,
                !level.unlocked && styles.lockedCard,
              ]}
            >
              <Text style={[styles.levelOrder, AppFonts.bodySmall]}>
                Level {level.order}
              </Text>
              <Text style={[styles.levelTitle, AppFonts.title]}>{level.title}</Text>
              <Text style={[styles.levelMeta, AppFonts.bodySmall]}>
                {level.passed ? `⭐ ${level.starsEarned} stars earned` : level.unlocked ? "Not started" : "Locked"}
              </Text>

              <TouchableOpacity
                style={[
                  styles.startButton,
                  level.unlocked ? ButtonStyles.primary : styles.disabledButton,
                ]}
                onPress={() =>
                  level.unlocked &&
                  router.push({
                    pathname: "/game/levelPlayer",
                    params: { levelId: level.id, chapterId, levelTitle: level.title, chapterTitle: chapterTitle },
                  })
                }
                disabled={!level.unlocked}
              >
                <Text style={[styles.startButtonText, AppFonts.button2]}>
                  {level.passed ? "Replay" : level.unlocked ? "Start" : "Locked"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default LevelsScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.lilacLight, padding: Spacing.lg },
  title: { color: AppColors.blue, marginBottom: Spacing.lg },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: Spacing.lg },
  levelCard: { marginBottom: Spacing.lg, padding: Spacing.lg, borderRadius: 16, backgroundColor: "white" },
  levelOrder: { color: AppColors.blue, marginBottom: Spacing.xs },
  levelTitle: { color: AppColors.blue, marginBottom: Spacing.sm },
  levelMeta: { color: AppColors.blue, marginBottom: Spacing.md },
  startButton: { width: "100%", justifyContent: "center", alignItems: "center", paddingVertical: Spacing.md, borderRadius: 12 },
  startButtonText: { color: "white" },
  lockedCard: { opacity: 0.5 },
  disabledButton: { width: "100%", justifyContent: "center", alignItems: "center", paddingVertical: Spacing.md, borderRadius: 12, backgroundColor: "#ccc" },
});