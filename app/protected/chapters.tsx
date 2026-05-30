import ArrowRight from "@/assets/svgs/game/arrowright.svg";
import HomeBg from "@/assets/svgs/game/home.png";
import Arrow from "@/assets/svgs/game/left arrow.svg";
import Lock from "@/assets/svgs/game/Lock.svg";
import ParkBg from "@/assets/svgs/game/park.png";
import SchoolBg from "@/assets/svgs/game/school2.png";
import { AppColors, AppFonts, AppFontSizes, ButtonStyles, Spacing } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
const { width, height } = Dimensions.get("window");

const APIURL = `${process.env.EXPO_PUBLIC_API_URL}/api/chapters` || "http://localhost:5000/api/chapters";

type Chapter = {
  id: string;
  title: string;
  description?: string;
  unlocked?: boolean;
  levelCount?: number;
};

// Function to get background component based on chapter title
const getChapterBackground = (title: string) => {
  const titleLower = title.toLowerCase();
  
  switch (titleLower) {
    case "the park":
      return ParkBg;
    case "home":
      return HomeBg; 
    case "school safety":
      return SchoolBg; 
    default:
      return null;
  }
};

const cardWidth = width * 0.30; // Set to 65% of screen width for better visibility
const cardMarginHorizontal = 40;

const Chapters = () => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
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

  useFocusEffect(
    React.useCallback(() => {
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
            unlocked: chapter.unlockedOn <= userLevel,
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
  }, [userId])
)

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (cardWidth + 16));
    setCurrentIndex(index);
  };

  const scrollTo = (index: number) => {
    if (scrollViewRef.current && index >= 0 && index < allChapters.length) {
      scrollViewRef.current.scrollTo({ x: index * (cardWidth + 16), animated: true });
      setCurrentIndex(index);
    }
  };

  const unlockedChapters = chapters.filter((chapter) => chapter.unlocked);
  const lockedChapters = chapters.filter((chapter) => !chapter.unlocked);
  const allChapters = [...unlockedChapters, ...lockedChapters];

  return (
    <View style={styles.root}>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <Text style={[styles.title, AppFonts.header]}>Chapters</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.blue} />
        </View>
      ) : (
        <>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            contentContainerStyle={styles.scrollContentContainer}
          >
            {allChapters.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, AppFonts.bodySmall]}>No chapters available yet.</Text>
              </View>
            ) : (
              allChapters.map((chapter, index) => {
                const BackgroundImage = getChapterBackground(chapter.title);
                
                return (
                  <View 
                  key={chapter.id} 
                  style={[
                    styles.chapterSlideWrapper,
                    { width: cardWidth, marginHorizontal: cardMarginHorizontal }
                  ]}
                >
                    {!chapter.unlocked && (
                    <View style={styles.lockedOverlay}>
                      <View style={styles.lockedIconWrapper}>
                        <Lock width={200} height={200} />
                      </View>
                    </View>
                  )}
                  <View style={[styles.chapterSlide]}>                    
                    {/* 1. Blue top bar */}
                    <View style={[styles.blueTopBar, !chapter.unlocked && styles.lockedBlueBar]}>
                      <Text style={styles.levelIndicator}>
                        {chapter.levelCount} Levels
                      </Text>
                    </View>
                    
                    {/* 2. Image Background Layer - fixed size */}
                    <View style={styles.imageWrapper}>
                      {BackgroundImage && (
                        <ImageBackground
                          source={BackgroundImage}
                          style={[chapter.unlocked ? styles.imageBackground : styles.lockedImage]}
                          resizeMode="cover" // Ensures all images fill the space uniformly
                        />
                      )}
                    </View>
                    
                    {/* 3. Card content container */}
                    <View style={styles.contentWrapper}>
                      <View style={[styles.cardContent, !chapter.unlocked && styles.lockedCardContent]}>
                        <Text style={[styles.chapterTitle, AppFonts.title]} numberOfLines={2}>
                          {chapter.title}
                        </Text>
                      </View>
                      
                      {/* 4. Dividing line */}
                      <View style={styles.divider} />
                      
                      {/* 5. Start button */}
                      <View style={styles.buttonContainer}>
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
                    </View>
                  </View>
                </View>
                );
              })
            )}
          </ScrollView>

          {/* Navigation Arrows */}
          {allChapters.length > 0 && (
            <View style={styles.navigationContainer}>
              <TouchableOpacity 
                style={[styles.arrowButton, currentIndex === 0 && styles.arrowButtonDisabled]} 
                onPress={() => scrollTo(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                <Arrow width={100} height={60} />
              </TouchableOpacity>
              
              {/* Gap between arrows */}
              <View style={styles.arrowGap} />
              
              <TouchableOpacity 
                style={[styles.arrowButton, currentIndex === allChapters.length - 1 && styles.arrowButtonDisabled]} 
                onPress={() => scrollTo(currentIndex + 1)}
                disabled={currentIndex === allChapters.length - 1}
              >
                <ArrowRight width={100} height={60} />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default Chapters;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.lilacLight,
  },
  chapterSlideWrapper :{
    position: 'relative', 
    height: height * 0.60
  },
  headerContainer: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: AppColors.lilacLight,
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    fontSize: AppFontSizes.super,
    color: AppColors.blue,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: AppFontSizes.subhead,
    color: AppColors.blue,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContentContainer: {
    paddingHorizontal: (width - cardWidth - 450) / 2, // Match card width
    alignItems: 'center',
  },
  chapterSlide: {
    flex: 1, 
    borderRadius: 20,
    borderWidth: 3,
    borderColor: AppColors.blue,
    overflow: 'hidden',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 5,
    backgroundColor: AppColors.lilac,
    display: 'flex',
    flexDirection: 'column',
  },
  blueTopBar: {
    backgroundColor: AppColors.blue,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'flex-end',
    zIndex: 3, // Ensure top bar stays above image
  },
  lockedBlueBar: {
    opacity: 0.6,
  },
  levelIndicator: {
    ...AppFonts.bodySmall,
    color: AppColors.lilacLight,
    fontSize: AppFontSizes.button2,
    fontWeight: 'bold',
  },
  imageWrapper: {
    height: '45%', // Fixed percentage for image area
    width: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    // resizeMode is handled in the component
  },
  lockedImage:{
    width: '100%',
    height: '100%',
    opacity: 0.6
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    zIndex: 2,
  },
  cardContent: {
    marginBottom: Spacing.sm,
  },
  lockedCardContent: {
    opacity: 0.6,
  },
lockedOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 30,
},
lockedIconWrapper: {
  position: 'absolute',
  // top: 400,      // move this instead
  // right: 400,    // move this instead
  top: -50,
  right: -50,
  zIndex: 30,
},
  chapterTitle: {
    fontSize: AppFontSizes.header,
    color: AppColors.blue,
    textAlign: 'center',
  },
  chapterDescription: {
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    textAlign: 'center',
  },
  divider: {
    height: 2,
    backgroundColor: AppColors.blue,
    marginVertical: Spacing.sm,
    opacity: 1,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  startButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.lilac,
    borderWidth: 3,
    borderColor: AppColors.blue,
    borderRadius: 8,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xl,
    minWidth: 300,
    minHeight: 60,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  startButtonText: {
    ...AppFonts.body,
    color: AppColors.blue,
    fontSize: AppFontSizes.body,
    //fontWeight: 'bold',
  },
  disabledButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: 12,
    backgroundColor: "#ccc",
    opacity: 0.4,
    minWidth: 300,
    minHeight: 70,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: AppColors.lilacLight,
  },
  arrowButton: {
    padding: Spacing.sm,
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  arrowGap: {
    width: 20,
  },
  emptyState: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyText: {
    ...AppFonts.body,
    color: AppColors.blue,
    textAlign: 'center',
  },
});