import Section3Card from '@/assets/svgs/main/game screen.svg';
import { AppColors, AppFonts, AppFontSizes, ButtonStyles, CardStyles, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar as RnCalendar } from 'react-native-calendars';
import { useCommunity } from '../community/hooks/useComm';
import Footer from '../components/Footer';
import NavBar from '../components/navbar';
import SecondaryButton from '../components/style/SecondaryButton';

const { width } = Dimensions.get('window');
const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`|| "http://localhost:5000/api"

// ─── DIARY PREVIEW CARD ──────────────────────────────────
const DiaryPreviewCard = ({ onPress }: { onPress: () => void }) => {
  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.diaryPreviewCard}>
      <View style={styles.diarySpine} />
      <View style={styles.diaryPreviewInner}>
        <Text style={styles.diaryPreviewTitle}>My Diary</Text>
        <Text style={styles.diaryPreviewDate}>Today · {dateLabel}</Text>
        <View style={styles.diaryLines}>
          {[1, 2, 3].map((_, i) => (
            <View key={i} style={[styles.diaryLine, i === 2 && { width: '55%' }]} />
          ))}
        </View>
        <View style={styles.diaryBadge}>
          <Text style={styles.diaryBadgeText}>✏ Write note</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── SECTION 1: HERO ─────────────────────────────────────
const HeroSection = ({
  userName,
  onOpenCalendar,
  onOpenDiary,
}: {
  userName: string;
  onOpenCalendar: () => void;
  onOpenDiary: () => void;
}) => {
  const today = new Date();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const days = [-2, -1, 0, 1, 2].map((offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return {
      name: dayNames[d.getDay()],
      number: d.getDate(),
      isToday: offset === 0,
    };
  });

  return (
    <View style={styles.heroSection}>

      {/* left col */}
      <View style={styles.heroCol}>
        <Image source={require('../../assets/images/profilepic.png')} resizeMode="contain" />
        <Text style={styles.heroTitle}>Hi! {userName}</Text>
      </View>

      {/* center col */}
      <View style={[styles.heroCol, { flex: 2 }]}>
        <TouchableOpacity style={styles.calendarCard} onPress={onOpenCalendar} activeOpacity={0.85}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarChevron}>‹</Text>
            <Text style={styles.calendarMonth}>
              {monthNames[today.getMonth()]} {today.getFullYear()}
            </Text>
            <Text style={styles.calendarChevron}>›</Text>
          </View>
          <View style={styles.calendarPreviewRow}>
            {days.map((day, index) => (
              <View key={index} style={[styles.previewDay, day.isToday && styles.previewDayActive]}>
                <Text style={[styles.previewDayName, day.isToday && styles.previewDayNameActive]}>
                  {day.name}
                </Text>
                <Text style={[styles.previewDayNumber, day.isToday && styles.previewDayNumberActive]}>
                  {day.number}
                </Text>
                {day.isToday && <View style={styles.previewDayDot} />}
              </View>
            ))}
          </View>
        </TouchableOpacity>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btnAction}><Text style={styles.btnActionText}>Total</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btnAction}><Text style={styles.btnActionText}>Missed</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btnAction}><Text style={styles.btnActionText}>Favorite</Text></TouchableOpacity>
        </View>
      </View>

      {/* right col */}
      <View style={styles.heroCol}>
        <DiaryPreviewCard onPress={onOpenDiary} />
      </View>

    </View>
  );
};

import HairReward from '@/assets/svgs/avatar/hairs/Hair 9.svg';
import FeedReward from '@/assets/svgs/community/animals/dog.svg'; // fish game
import StickerReward from '@/assets/svgs/diary/stickers/sticker8.svg'; // music sticker

const REWARD_SVG_MAP: Record<string, React.ComponentType<any>> = {
  sticker: StickerReward,
  game:    FeedReward,
  hair:    HairReward,
};

// ─── TOKEN REWARD DISPLAY ─────────────────────────────────
const REWARD_DEFS = [
  { chapter: 1, icon: '✏️', label: 'Music Sticker', type: 'sticker' },
  { chapter: 2, icon: '🎣', label: 'Feed Game',     type: 'game'    },
  { chapter: 3, icon: '💇', label: 'New Hair',      type: 'hair'    },
];

const TokenRewards = ({ completedChapters }: { completedChapters: number[] }) => (
  <View style={styles.tokenRow}>
    {REWARD_DEFS.map((r) => {
      const unlocked = completedChapters.includes(r.chapter);
      return (
        <View key={r.chapter} style={styles.tokenItem}>
          <View style={[styles.tokenCoin, unlocked && styles.tokenCoinUnlocked]}>
            <Text style={styles.tokenIcon}>{unlocked ? r.icon : '🔒'}</Text>
          </View>
          <Text style={[styles.tokenLabel, unlocked && styles.tokenLabelUnlocked]}>
            {r.label}
          </Text>
        </View>
      );
    })}
  </View>
);

// ─── GAME PROGRESS CARD ──────────────────────────────────
  const GameProgressCard = ({ userId, recommendation }: { 
    userId: string | null;
    recommendation: {
      recommendedLevelId: string;
      type: 'retry' | 'next' | 'challenge' | 'complete';
      reason: string;
      level?: { title: string; order: number };
      newlyUnlocked: string[];
    } | null;
  }) => {
  const router = useRouter();
  const [data, setData] = useState<{
    starsEarned: number;
    totalStars: number;
    completedChapters: number[];
    nextReward: string;
    currentLevel: { _id?: string; title?: string; order: number; chapterId?: string };
    currentChapter: { _id?: string; order: number };
    chapterProgressMap: Record<string, { completed: number; total: number }>;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetch_ = async () => {
      try {
        const [progressRes, rewardsRes] = await Promise.all([
          fetch(`${API_URL}/progress/${userId}`),
          fetch(`${API_URL}/chapters/${userId}/rewards`),
        ]);
        const progress = await progressRes.json();
        const rewards  = await rewardsRes.json();
        console.log(rewards);
        console.log(progress);

        const nextChapter = [1, 2, 3].find(
          (c) => !rewards.completedChapters.includes(c)
        );
        const nextRewardLabel = nextChapter
          ? REWARD_DEFS[nextChapter - 1].label
          : 'All unlocked!';

        setData({
          starsEarned: progress.chapterStarsEarned ?? 0,  // ← was progress.totalStars
          totalStars:  progress.chapterTotalStars  ?? 6,  // ← was hardcoded 100
          completedChapters: rewards.completedChapters ?? [],
          nextReward: nextRewardLabel,
          currentLevel: progress.currentLevel ?? { order: 1 },      // ← fallback
          currentChapter: progress.currentChapter ?? { order: 1 },
          chapterProgressMap: progress.chapterProgressMap ?? {},  // ← add this
        });
        console.log(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetch_();
  }, [userId]);

  if (!data) return null;

  return (
    <View>
    <View
      style={styles.gameCard}
    >
      {/* Left: level + arrows */}
      <View style={styles.gameCardLeft}>
        <View style={styles.gameCardLeftOne}>
          <Text style={styles.gameCardLabel}>Your level</Text>
          <Text style={styles.gameCardLabel}>Press to play</Text>
          <TouchableOpacity style={styles.levelBlockActive}
          onPress={() => router.push('/protected/chapters')}>
            <Text style={styles.levelBlockNumber}>{data.currentLevel.order}</Text>
          </TouchableOpacity>
          <Text style={styles.gameCardChapter}>Chapter {data.currentChapter.order}</Text>
        </View>
      </View>

      {/* Center: 3 token coins */}
      <View style={styles.gameCardTokens}>
        <Text style={styles.tokenSectionTitle}>Play to unlock:</Text>
        <TokenRewards completedChapters={data.completedChapters} />
      </View>

      {/* Right: progress bar */}
      {/* Right: SVG progress fill */}
      <View style={styles.gameCardRight}>
        {(() => {
          const CHAPTER_ORDER_TO_ID: Record<number, string> = {
            1: '69d2f1ce4c52af68e2ff6468',
            2: '69fddebbf6b5e57336dca3b2',
            3: '69fde9a3f6b5e57336dca3b6',
          };

          const nextChapterIndex = [1, 2, 3].find(c => !data.completedChapters.includes(c));
          const chapterId = nextChapterIndex ? CHAPTER_ORDER_TO_ID[nextChapterIndex] : null;
          const chapterProgress = chapterId
            ? (data.chapterProgressMap?.[chapterId] ?? { completed: 0, total: 1 })
            : null;
          const percent = chapterProgress
            ? Math.min(100, Math.round((chapterProgress.completed / chapterProgress.total) * 100))
            : 100;

          const currentReward = nextChapterIndex ? REWARD_DEFS[nextChapterIndex - 1] : null;
          const RewardSvg = currentReward ? REWARD_SVG_MAP[currentReward.type] : null;

          return (
            <View style={styles.svgFillWrapper}>
              {RewardSvg && <RewardSvg width={84} height={84} style={styles.svgBase} opacity={0.15} />}
              {RewardSvg && (
                <View style={[styles.svgFillClip, { height: `${percent}%` }]}>
                  <View style={{ position: 'absolute', bottom: 0 }}>
                    <RewardSvg width={64} height={64} />
                  </View>
                </View>
              )}
              <Text style={styles.cityBarPercent}>{percent}%</Text>
              {currentReward && <Text style={styles.rewardHintText}>{currentReward.label}</Text>}
            </View>
          );
        })()}
      </View>
    </View>
        {recommendation &&
        recommendation.recommendedLevelId !== data?.currentLevel?._id
        && recommendation.recommendedLevelId && recommendation.type !== 'complete' && (
        <CoachTipCard recommendation={recommendation} userId={userId} />
      )}
    </View>
  );
};

// ─── SECTION 3: GAME + FRIENDS ────────────────────────────
const Section3 = () => {
  const router = useRouter();
  const { friends, loading } = useCommunity();

  return (
    <View style={styles.section3Wrapper}>
      <View style={styles.section3SvgContainer}>
        {/* SVG background */}
        <Section3Card width="100%" />

          {/* Join Friends button — top right */}
          <TouchableOpacity
            style={styles.joinFriendsBtn}
            onPress={() => router.push('/protected/Community')}
            activeOpacity={0.85}
          >
            <Text style={styles.joinFriendsBtnText}>Join Friends</Text>
          </TouchableOpacity>

          {/* Friends list — bottom area */}
          <View style={styles.friendsListOverlay}>
            <Text style={styles.friendsListTitleOverlay}>My Friends</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : friends.length === 0 ? (
              <View style={[{alignContent: 'center' , flexDirection: 'column', marginBottom: 10}]}>
              <Text style={styles.friendsEmptyOverlay}>No friends yet — add some!</Text>
              <SecondaryButton
              title='Add friends'
              onPress={() => router.push('/community/components/friendsList')} />
              </View>
            ) : (
              friends.map((f) => (
                <View key={f._id} style={styles.friendRowOverlay}>
                  <View style={styles.friendAvatarOverlay}>
                    <Text style={styles.friendAvatarTextOverlay}>
                      {f.username.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.friendNameOverlay}>{f.username}</Text>
                    <Text style={styles.friendLevelOverlay}>Level {f.level}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

      </View>
    </View>
  );
};

const CoachTipCard = ({ recommendation, userId }: {
  recommendation: {
    recommendedLevelId: string;
    type: 'retry' | 'next' | 'challenge' | 'complete';
    reason: string;
    level?: { title: string; order: number };
    newlyUnlocked: string[];
  };
  userId: string | null;
}) => {
  const router = useRouter();

  const copy = {
    retry:     { label: 'Keep practising',  subtext: 'Your coach wants you to try this again',        emoji: '💪' },
    next:      { label: 'Next practice',    subtext: 'Your coach picked this one for you today',      emoji: '⭐' },
    challenge: { label: 'Ready to level up?', subtext: 'Your coach thinks you\'re ready for this',   emoji: '🚀' },
    complete:  { label: '',                 subtext: '',                                              emoji: '' },
  }[recommendation.type];

  return (
    <TouchableOpacity
      style={coachStyles.card}
      onPress={() => router.push(`/game/level/${recommendation.recommendedLevelId}`)}
      activeOpacity={0.85}
    >
      {/* coach identity */}
      <View style={coachStyles.header}>
        <View style={coachStyles.avatarWrap}>
          <Text style={{ fontSize: 20 }}>🐱</Text>
        </View>
        <Text style={coachStyles.headerText}>Coach Cat says...</Text>
      </View>

      {/* recommendation body */}
      <View style={coachStyles.body}>
        <View style={coachStyles.textBlock}>
          <Text style={coachStyles.subtext}>{copy.subtext}</Text>
          <Text style={coachStyles.levelTitle}>
            {copy.emoji}  {recommendation.level?.title ?? `Level ${recommendation.level?.order}`}
          </Text>
          {/* reason comes from your backend — one sentence, show it directly */}
          <Text style={coachStyles.reason}>{recommendation.reason}</Text>
        </View>

        <View style={coachStyles.playBtn}>
          <Text style={coachStyles.playBtnText}>Go!</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const coachStyles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: AppColors.blue,
    backgroundColor: AppColors.lilac,
    overflow: 'hidden',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  header: {
    backgroundColor: AppColors.blue,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  avatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.lilac,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    ...AppFonts.subhead,
    color: AppColors.lilac,
    fontSize: AppFontSizes.body,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  subtext: {
    ...AppFonts.bodySmall,
    color: AppColors.blue,
    fontSize: AppFontSizes.bodySmall,
    opacity: 0.65,
  },
  levelTitle: {
    ...AppFonts.subhead,
    color: AppColors.blue,
    fontSize: AppFontSizes.body,
  },
  reason: {
    ...AppFonts.bodySmall,
    color: AppColors.blue,
    fontSize: AppFontSizes.bodySmall,
    opacity: 0.55,
    fontStyle: 'italic',
  },
  playBtn: {
    backgroundColor: AppColors.blue,
    borderRadius: 10,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    shadowColor: AppColors.lilac,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  playBtnText: {
    ...AppFonts.subhead,
    color: AppColors.lilac,
    fontSize: AppFontSizes.body,
  },
});

// ─── MAIN SCREEN ─────────────────────────────────────────
export default function dashboard() {
  const router = useRouter(); // ← must be inside the component
  const [userName, setUserName] = useState('User');
  const [userId, setUserId] = useState<string | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarDays, setCalendarDays] = useState<{ date: string; status: string }[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<{
    recommendedLevelId: string;
    type: 'retry' | 'next' | 'challenge' | 'complete';
    reason: string;
    level?: { title: string; order: number };
    newlyUnlocked: string[];
  } | null>(null)

  useEffect(() => {
  AsyncStorage.getItem('lastRecommendation').then(raw => {
    if (raw) setRecommendation(JSON.parse(raw));
  });
}, []);

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserName(user.name || 'User');
          setUserId(user.id || null);
        }
      } catch (error) {
        console.error('Error loading user name:', error);
      }
    };
    loadUserName();
  }, []);


  useEffect(() => {
    if (!calendarVisible || !userId) return;
    const fetchCalendar = async () => {
      setCalendarLoading(true);
      try {
        const response = await fetch(`${API_URL}/calender/${userId}`);
        const data = await response.json();
        setCalendarDays(data.days || []);
      } catch (error) {
        console.error('Error fetching calendar:', error);
      } finally {
        setCalendarLoading(false);
      }
    };
    fetchCalendar();
  }, [calendarVisible, userId]);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const markedDates = useMemo(() => {
    return calendarDays.reduce<Record<string, { marked: boolean; dotColor: string; selected?: boolean; selectedColor?: string }>>((acc, day) => {
      const dateKey = day.date.split('T')[0];
      const color = day.status === 'missed' ? '#FF6B6B' : day.status === 'favorite' ? '#FFD700' : '#7B61FF';
      acc[dateKey] = {
        marked: true,
        dotColor: color,
        selected: dateKey === formatDate(new Date()),
        selectedColor: AppColors.blue,
      };
      return acc;
    }, {});
  }, [calendarDays]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.blue} />
      <NavBar />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.main}>
        <HeroSection
          userName={userName}
          onOpenCalendar={() => setCalendarVisible(true)}
          onOpenDiary={() => router.push('/protected/Diary')}
        />
        <GameProgressCard userId={userId} recommendation={recommendation} />   {/* ← add this */}
        <Section3 />
        <View></View>
      <Footer />

      </ScrollView>

      <Modal visible={calendarVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Full Calendar</Text>
              <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                <Text style={styles.modalClose}>X</Text>
              </TouchableOpacity>
            </View>
            {calendarLoading ? (
              <ActivityIndicator size="large" color={AppColors.blue} />
            ) : (
              <RnCalendar
                markedDates={markedDates}
                theme={{
                  todayTextColor: AppColors.blue,
                  arrowColor: AppColors.blue,
                  monthTextColor: AppColors.blue,
                  textDayFontFamily: AppFonts.body.fontFamily,
                  textMonthFontFamily: AppFonts.subhead.fontFamily,
                  textDayHeaderFontFamily: AppFonts.bodySmall.fontFamily,
                }}
                style={styles.fullCalendar}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.lilacLight,
    overflow: 'hidden',
  },
  main: {
    flexDirection: 'column',
  },

  // ── Hero
  heroSection: {
    backgroundColor: AppColors.lilac,
    paddingVertical: 48,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',   // all three cols share the same vertical centre
    gap: Spacing.xl,        // uniform spacing between every column
    minHeight: 320,
    overflow: 'hidden',
  },
  // Shared column — flex:1, centred content, no ad-hoc margins
  heroCol: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },

  heroTitle: {
    ...AppFonts.title,
    fontSize: 50,
    color: AppColors.blue,
    lineHeight: 60,
    marginBottom: Spacing.md,
  },

  btnAction: {
    ...ButtonStyles.primary,
    backgroundColor: AppColors.lilac,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  btnActionText: {
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    ...AppFonts.bodySmall,
  },

  // ── Calendar card
  calendarCard: {
    ...CardStyles.default,
    minHeight: 180,
    width: '100%',
    padding: Spacing.lg,
    justifyContent: 'space-between',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  calendarHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  calendarMonth: {
    fontSize: AppFontSizes.subhead,
    color: AppColors.blue,
    fontFamily: AppFonts.body.fontFamily,
  },
  calendarChevron: {
    fontSize: 36,
    color: AppColors.blue,
    fontWeight: '500',
    lineHeight: 26,
  },
  calendarPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  previewDay: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: AppColors.lilacLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  previewDayActive: {
    backgroundColor: AppColors.blue,
  },
  previewDayName: {
    fontSize: AppFontSizes.subhead,
    color: AppColors.blue,
    fontFamily: AppFonts.body.fontFamily,
  },
  previewDayNameActive: { color: 'white' },
  previewDayNumber: {
    fontSize: AppFontSizes.subhead,
    color: AppColors.blue,
    fontFamily: AppFonts.body.fontFamily,
  },
  previewDayNumberActive: { color: 'white' },
  previewDayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginTop: 2,
  },

  // ── Diary preview card
  diaryPreviewCard: {
    ...CardStyles.default,
    flexDirection: 'row',
    width: '100%',
    minHeight: 180,         // matches calendarCard so tops align
    overflow: 'hidden',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  diarySpine: {
    width: 10,
    backgroundColor: AppColors.blue,
    borderRadius: 0,
  },
  diaryPreviewInner: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  diaryPreviewTitle: {
    ...AppFonts.subhead,
    fontSize: AppFontSizes.body,
    color: AppColors.blue,
  },
  diaryPreviewDate: {
    ...AppFonts.body,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    opacity: 0.55,
    marginBottom: Spacing.sm,
  },
  diaryLines: {
    gap: 5,
  },
  diaryLine: {
    height: 2,
    width: '100%',
    backgroundColor: AppColors.blue,
    borderRadius: 2,
    opacity: 0.2,
    marginBottom: 5,
  },
  diaryBadge: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: AppColors.blue,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  diaryBadgeText: {
    ...AppFonts.bodySmall,
    color: AppColors.lilac,
    fontSize: AppFontSizes.bodySmall,
  },



  // ── Section shared
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: AppColors.blue,
    marginBottom: Spacing.sm,
    fontFamily: AppFonts.subhead.fontFamily,
  },
  sectionDesc: {
    fontSize: 18,
    color: AppColors.blue,
    opacity: 0.65,
    lineHeight: 32,
    marginBottom: Spacing.xl,
    fontFamily: AppFonts.bodySmall.fontFamily,
  },

  // ── Modal
  fullCalendar: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: AppColors.lilac,
    borderRadius: 28,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: AppColors.blue,
    fontFamily: AppFonts.subhead.fontFamily,
  },
  modalClose: {
    color: AppColors.blue,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: AppFonts.body.fontFamily,
  },
  modalButton: {
    ...ButtonStyles.action,
    marginTop: Spacing.lg,
    alignSelf: 'center',
    width: '100%',
  },
  modalButtonText: {
    ...ButtonStyles.primary,
    textAlign: 'center',
  },

section3Wrapper: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    marginTop: Spacing.lg,
  },
  section3SvgContainer: {
    position: 'relative',
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  section3Overlay: {
    position: 'absolute',
    top: 0,
    left: 1300,
    right: 0,
    bottom: 350,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },

  // ── Button (top-right)
  joinFriendsBtn: {
    position: 'absolute',
    bottom: 35, 
    left: '45%', 
    right: 0,
    top: 0,
    width: 200,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: AppColors.lilac,
        borderWidth: 3,
    borderColor: AppColors.blue,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4, 
  },
  joinFriendsBtnText: {
    ...AppFonts.body,
    color: AppColors.blue,
    fontSize: AppFontSizes.body,
    //fontWeight: '700',
  },

  // ── Friends list (bottom, blended)
  friendsListOverlay: {
    position: 'absolute',
    top: '12%',
    left: '71.5%',
    right: 0,
    width: 200,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    backdropFilter: 'blur(8px)', // web only; harmless on native
  },
  friendsListTitleOverlay: {
    ...AppFonts.subhead,
    fontSize: AppFontSizes.body,
    color: '#fff',
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  friendsEmptyOverlay: {
    ...AppFonts.bodySmall,
    color: '#fff',
    opacity: 0.7,
    padding: Spacing.sm,
    textAlign: 'center',
    fontSize: AppFontSizes.bodySmall,
  },
  friendRowOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  friendAvatarOverlay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarTextOverlay: {
    ...AppFonts.body,
    fontSize: AppFontSizes.bodySmall,
    color: '#fff',
    fontWeight: '600',
  },
  friendNameOverlay: {
    ...AppFonts.body,
    fontSize: AppFontSizes.bodySmall,
    color: '#fff',
  },
  friendLevelOverlay: {
    ...AppFonts.bodySmall,
    fontSize: AppFontSizes.bodySmall,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
  },

  ///game card
  // ── Game Progress Card
gameCard: {
  width: '70%', 
  height: 300,
  flexDirection: 'row',
  marginHorizontal: Spacing.xl,
  marginTop: Spacing.lg,
  borderRadius: 16,
  borderWidth: 3,
  borderColor: AppColors.blue,
  backgroundColor: AppColors.lilac,
  overflow: 'hidden',
  shadowColor: AppColors.blue,
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 6,
  padding: Spacing.md,
  alignItems: 'center',
  gap: Spacing.md,
  alignSelf: 'center'
},
gameCardLeft: {
  flex: 1, 
  flexDirection: 'row',
  marginLeft: 20 
},
gameCardLeftOne: {
  justifyContent: 'center',
  alignItems: 'center', 
  alignContent: 'center'
},
gameCardLeftTwo: {
  justifyContent: 'center',
  alignItems: 'center', 
  marginLeft: 40
},
gameCardLabel: {
  ...AppFonts.body,
  color: AppColors.blue,
  fontSize: AppFontSizes.header,
},
gameCardChapter: {
  ...AppFonts.body,
  color: AppColors.blue,
  marginTop: 50,
  fontSize: AppFontSizes.bodySmall,
},
gameCardCenter: {
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
},
levelBlockRow: {
  alignItems: 'center',
},
levelArrow: {
  padding: 4,
},
levelArrowText: {
  color: AppColors.blue,
  fontSize: 12,
},
levelBlockActive: {
  width: 68,
  height: 68,
  backgroundColor: AppColors.lilac,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  marginTop: 10,
  borderColor: AppColors.blue,
    shadowColor: AppColors.blue,
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 6,
},
levelBlockNumber: {
  ...AppFonts.body,
  fontSize: AppFontSizes.title,
  color: AppColors.blue,
},
gameCardRight: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
},
cityBarWrapper: {
  alignItems: 'center',
  marginBottom: Spacing.sm,
},
cityBarBg: {
  width: 48,
  height: 60,
  backgroundColor: AppColors.lilac,
  borderRadius: 6,
  borderWidth: 3,
  borderColor: AppColors.blue,
  overflow: 'hidden',
  justifyContent: 'flex-end',
},
cityBarFill: {
  width: '100%',
  backgroundColor: AppColors.lilac,
  borderRadius: 4,
},
cityBarPercent: {
  ...AppFonts.bodySmall,
  color: AppColors.blue,
  fontSize: AppFontSizes.bodySmall,
  marginTop: 0,
},
gameCardPlayLabel: {
  ...AppFonts.bodySmall,
  color: AppColors.blue,
  fontSize: AppFontSizes.bodySmall,
},
gameCardReward: {
  ...AppFonts.body,
  color: AppColors.blue,
  fontSize: AppFontSizes.bodySmall,
  fontWeight: '700',
},
tokenRow: {
  flexDirection: 'row',
  gap: Spacing.sm,
  marginTop: Spacing.sm,
},
tokenItem: {
  alignItems: 'center',
  gap: 4,
},
tokenCoin: {
  width: 64,
  height: 64,
  borderRadius: 22,
  backgroundColor: AppColors.lilac,
  borderWidth: 2,
  borderColor: AppColors.blue,
  borderStyle: 'dashed',
  alignItems: 'center',
  justifyContent: 'center',
},
tokenCoinUnlocked: {
  backgroundColor: AppColors.lilac,
  borderStyle: 'solid',
  borderColor: '#fff',
},
tokenIcon: {
  fontSize: 20,
},
tokenLabel: {
  ...AppFonts.bodySmall,
  color: AppColors.blue,
  fontSize: 9,
  textAlign: 'center',
  maxWidth: 50,
},
tokenLabelUnlocked: {
  color: AppColors.blue,
},
tokenSectionTitle: {
  ...AppFonts.body,
  color: AppColors.blue,
  fontSize: AppFontSizes.title,
},
gameCardTokens: {
  flex: 2,
  alignItems: 'center',
  justifyContent: 'center',
},
svgFillWrapper: {
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 4,
},
svgBase: {
  position: 'absolute',
  bottom: 24,  // leave room for percent text
},
svgFillClip: {
  position: 'absolute',
  bottom: 24,
  width: 84,
  overflow: 'hidden',   // ← this is what clips the SVG
  justifyContent: 'flex-end',
},
rewardHintText: {
  ...AppFonts.bodySmall,
  color: AppColors.blue,
  fontSize: 16,
  textAlign: 'center',
  maxWidth: 100,
},

});