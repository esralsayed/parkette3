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
import Footer from './components/Footer';
import NavBar from './components/navbar';

const { width } = Dimensions.get('window');

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
        <Image source={require('../assets/images/profilepic.png')} resizeMode="contain" />
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

// ─── FOOTER COLS ─────────────────────────────────────────
const footerCols = [
  { title: 'Play', links: ['Games', 'Leaderboard', 'Challenges'] },
  { title: 'Connect', links: ['Community', 'Chat', 'Events'] },
  { title: 'You', links: ['Diary', 'Profile', 'Settings'] },
];

// ─── MAIN SCREEN ─────────────────────────────────────────
export default function dashboard() {
  const router = useRouter(); // ← must be inside the component
  const [userName, setUserName] = useState('User');
  const [userId, setUserId] = useState<string | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarDays, setCalendarDays] = useState<{ date: string; status: string }[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);

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
        const response = await fetch(`http://localhost:5000/api/calendar/${userId}`);
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
          onOpenDiary={() => router.push('/diary/Diary')}
        />
        <View></View>
        <View></View>
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
      <Footer />
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.lilacLight,
  },
  main: {
    flex: 1,
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

  // ── Shared card bits
  card: {
    ...CardStyles.default,
    width: '100%',
    height: 100,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.blue,
    marginBottom: Spacing.sm,
    fontFamily: AppFonts.subhead.fontFamily,
  },
  cardCaption: {
    fontSize: 13,
    color: AppColors.blue,
    opacity: 0.75,
    fontFamily: AppFonts.bodySmall.fontFamily,
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

});