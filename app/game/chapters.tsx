import { AppColors, AppFonts, ButtonStyles, CardStyles, Spacing } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const APIURL = "http://localhost:5000/api/chapters";

type Chapter = {
  id: string;
  title: string;
  description?: string;
  unlocked?: boolean;
  levelCount?: number;
};

const Chapters = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userId, setUserId] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserName(user.name || "User");
          setUserId(user.id || null);
          setUserLevel(typeof user.level === "number" ? user.level : Number(user.level) || 1);
        }
      } catch (error) {
        console.error("Error loading user name:", error);
      }
    };

    loadUserName();
  }, []);

  useEffect(() => {
    if (!userId) return;

   const fetchChapters = async () => {
  try {
    const response = await fetch(`${APIURL}?userId=${userId}`);
    const data = await response.json();
    const chaptersData = Array.isArray(data) ? data : Array.isArray(data.chapters) ? data.chapters : [];

    setChapters(
      chaptersData.map((chapter: any) => ({
        id: String(chapter.id ?? chapter._id),
        title: chapter.title || chapter.name || "Untitled Chapter",
        description: chapter.description,
        levelCount: chapter.levels?.length ?? chapter.levelCount ?? 0,
        unlocked: chapter.unlockedOn <= userLevel, // compare directly, no need for unlocked array
      }))
    );
    console.log("Chapters fetched:", chaptersData);
  } catch (error) {
    console.error("Error fetching chapters:", error);
  } finally {
    setLoading(false);
  }
};

    fetchChapters();
  }, [userId]);

  const unlockedChapters = chapters.filter((chapter) => chapter.unlocked);
  const lockedChapters = chapters.filter((chapter) => !chapter.unlocked);

  return (
    <View style={styles.root}>
      <Text style={[styles.title, AppFonts.header]}>Chapters</Text>
      <Text style={[styles.subtitle, AppFonts.body]}>Unlocked chapters appear below. Locked chapters are dimmed.</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.blue} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {chapters.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, AppFonts.bodySmall]}>No chapters available yet.</Text>
            </View>
          ) : (
            [...unlockedChapters, ...lockedChapters].map((chapter) => (
              <View
                key={chapter.id}
                style={[
                  styles.chapterCard,
                  CardStyles.default,
                  !chapter.unlocked && styles.lockedCard,
                ]}
              >
                <Text style={[styles.chapterTitle, AppFonts.title]}>{chapter.title}</Text>
                <Text style={[styles.chapterDescription, AppFonts.bodySmall]}>
                  {chapter.description || `${chapter.levelCount} levels available`}
                </Text>
                <Text style={[styles.chapterMeta, AppFonts.bodySmall]}>
                  {chapter.levelCount} levels • {chapter.unlocked ? "Unlocked" : "Locked"}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    chapter.unlocked ? ButtonStyles.primary : styles.disabledButton,
                  ]}
                  onPress={() =>
                    chapter.unlocked &&
                    router.push({ pathname: '/game/[chapterId]', params: { chapterId: chapter.id, chapterTitle: chapter.title } })
                  }
                  disabled={!chapter.unlocked}
                >
                  <Text style={[styles.startButtonText, AppFonts.button2]}>
                    {chapter.unlocked ? "Start" : "Locked"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default Chapters;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.lilacLight,
    padding: Spacing.lg,
  },
  title: {
    color: AppColors.blue,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: AppColors.blue,
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  chapterCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    backgroundColor: "white",
  },
  chapterTitle: {
    color: AppColors.blue,
    marginBottom: Spacing.sm,
  },
  chapterDescription: {
    color: AppColors.blue,
    marginBottom: Spacing.sm,
  },
  chapterMeta: {
    color: AppColors.blue,
    marginBottom: Spacing.md,
  },
  startButton: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: 12,
    backgroundColor: AppColors.blue,
  },
  startButtonText: {
    color: "white",
  },
  emptyState: {
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  emptyText: {
    color: AppColors.blue,
  },
  lockedCard: {
    opacity: 0.5,
  },
  disabledButton: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: 12,
    backgroundColor: "#ccc",
  },
});
