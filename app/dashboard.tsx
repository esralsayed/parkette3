import { AppColors, AppFonts, ButtonStyles, CardStyles, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// // ─── DECORATIVE SVG ILLUSTRATION ─────────────────────────
// const HeroIllustration = () => (
//   <Svg width={300} height={300} viewBox="0 0 300 300" fill="none"></Svg>
// );

// ─── SUB-COMPONENTS ──────────────────────────────────────
// const Tag = ({
//   label,
//   bgColor = AppColors.blue,
//   textColor = AppColors.lilac,
// }: {
//   label: string;
//   bgColor?: string;
//   textColor?: string;
// }) => (
//   <View style={[styles.tag, { backgroundColor: bgColor }]}>
//     <Text style={[styles.tagText, { color: textColor }]}>{label.toUpperCase()}</Text>
//   </View>
// );

// ─── SECTION 1: HERO ─────────────────────────────────────
//simplify this later
const HeroSection = ({ userName, onOpenCalendar }: { userName: string; onOpenCalendar: () => void }) => {
  const today = new Date();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  // build 5 days: 2 before today, today, 2 after
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
      <View style={{ flexDirection: 'column', flex: 1, marginRight: Spacing.xl, marginLeft: Spacing.xl, alignItems: 'flex-start', justifyContent: 'center' }}>
        <Image source={require('../assets/images/profilepic.png')} resizeMode="contain" />
        <Text style={styles.heroTitle}>Hi! {userName}</Text>
      </View>

      {/* center col */}
      <View style={{ flexDirection: 'column', flex: 2, alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity style={styles.calendarCard} onPress={onOpenCalendar} activeOpacity={0.85}>
          
          {/* month header */}
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarChevron}>‹</Text>
            <Text style={styles.calendarMonth}>
              {monthNames[today.getMonth()]} {today.getFullYear()}
            </Text>
            <Text style={styles.calendarChevron}>›</Text>
          </View>

          {/* day strip */}
          <View style={styles.calendarPreviewRow}>
            {days.map((day, index) => (
              <View
                key={index}
                style={[styles.previewDay, day.isToday && styles.previewDayActive]}
              >
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

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={styles.btnAction}><Text style={styles.btnActionText}>Total</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btnAction}><Text style={styles.btnActionText}>Missed</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btnAction}><Text style={styles.btnActionText}>Favorite</Text></TouchableOpacity>
        </View>
      </View>

      {/* right col */}
      <View style={{ flexDirection: 'column', flex: 1, marginRight: Spacing.xl, marginLeft: Spacing.xl, justifyContent: 'center', alignContent: 'center' }}>
        <View style={styles.card} />
        <TouchableOpacity style={styles.btnAction}>
          <Text style={styles.btnActionText}>Write Today's note</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


// const GameSection = () => (
// <View style={styles.gameSection}>
//   <View style={styles.gameCard}>
//   </View>
// </View>
// );

// // ─── SECTION 3: COMMUNITY ────────────────────────────────
// const CommunitySection = () => (
// <View style={styles.shadowWrapper}>
//   <View style={styles.shadowLayer} />
//   <View style={styles.commCard}>
//   </View>
// </View>
// );


// ─── FOOTER ──────────────────────────────────────────────
const footerCols = [
  { title: 'Play', links: ['Games', 'Leaderboard', 'Challenges'] },
  { title: 'Connect', links: ['Community', 'Chat', 'Events'] },
  { title: 'You', links: ['Diary', 'Profile', 'Settings'] },
];

// const Footer = () => (
// <Footer />
// );

// ─── MAIN SCREEN ─────────────────────────────────────────
export default function dashboard() {
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
    if (!calendarVisible || !userId) {
      return;
    }

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
      <NavBar userName={userName} />
      <ScrollView showsVerticalScrollIndicator={false}
      style={styles.main}>
        <HeroSection userName={userName} onOpenCalendar={() => setCalendarVisible(true)} />
          <View></View>
          <View></View>
        {/* <GameSection />
        <CommunitySection /> */}
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

  main:{
    flex: 1,
    flexDirection: 'column'
  },

  btnAction: {
     ...ButtonStyles.primary,
    backgroundColor: AppColors.lilac,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    marginTop: Spacing.lg,
    alignSelf: 'flex-start',
    marginRight: Spacing.lg,
  },
  btnActionText: {

     color: AppColors.blue,
    ...AppFonts.button,
    
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

  // ── Section 1: Hero
  heroSection: {
    backgroundColor: AppColors.lilac,
    paddingTop: 48,
    paddingBottom: 52,
    paddingLeft: Spacing.xl,
    paddingRight: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 320,
  },

card:{
    ...CardStyles.default,
    //padding: Spacing.md,
    width: '100%', 
    height: 100,
},

  heroTitle: {
    ...AppFonts.title,
    fontSize: 50,
    color: AppColors.blue,
    lineHeight: 60,
    marginBottom: Spacing.md,
  },
  // replace / add these in your StyleSheet:

calendarCard: {
  ...CardStyles.default,
  minHeight: 180,
  width: '100%',
  padding: Spacing.lg,
  justifyContent: 'space-between',
},
calendarHeader: {
  flexDirection: 'row',
  // alignItems: 'center',
  // justifyContent: 'center',
  gap: Spacing.md,
  marginBottom: Spacing.lg,
},
calendarMonth: {
  fontSize: 36,
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
  backgroundColor: AppColors.blue,  // today is highlighted
},
previewDayName: {
  fontSize: 36,
  color: AppColors.blue,
  fontFamily: AppFonts.body.fontFamily,
},
previewDayNameActive: {
  color: 'white',
},
previewDayNumber: {
  fontSize: 36,
  color: AppColors.blue,
  fontFamily: AppFonts.body.fontFamily,
},
previewDayNumberActive: {
  color: 'white',
},
previewDayDot: {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: 'white',
  marginTop: 2,
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
  // ── Section 2: Game
    gameSection: {alignItems: 'center', justifyContent: 'center', padding: Spacing.xl}, 
    gameCard : {
        ...CardStyles.default,
        width: width - Spacing.xl * 2,
        height: 200,
    },

  // ── Section 3: Community
  communitySection: {
    backgroundColor: AppColors.lilac,
    padding: Spacing.xl,
    paddingVertical: 48,
  },

    commCard: {...CardStyles.default, width: width - Spacing.xl * 2, height: 200},

    shadowWrapper: {
        backgroundColor: AppColors.lilac,
  position: 'relative',
  alignSelf: 'flex-start',
},

shadowLayer: {
  position: 'absolute',
  top: 6,          // 👈 controls shadow thickness (vertical)
  left: 0,
  right: 0,
  bottom: -6,
  backgroundColor: AppColors.blue,
  borderRadius: 24,
},

  // ── Footer
  footer: {
    backgroundColor: AppColors.dark,
    padding: Spacing.xl,
    paddingVertical: 48,
  },
  footerBrand: {
    fontSize: 26,
    fontWeight: '900',
    color: AppColors.lilac,
    marginBottom: Spacing.sm,
    fontFamily: AppFonts.subhead.fontFamily,
  },
  footerBrandDesc: {
    fontSize: 13,
    color: AppColors.lilac,
    opacity: 0.5,
    lineHeight: 20,
    marginBottom: Spacing.xxl,
    fontFamily: AppFonts.bodySmall.fontFamily,
  },
  footerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  footerCol: { gap: Spacing.sm },
  footerColTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: AppColors.lilac,
    opacity: 0.5,
    letterSpacing: 1.5,
    marginBottom: Spacing.xs,
    fontFamily: AppFonts.subhead.fontFamily,
  },
  footerLink: {
    fontSize: 13,
    color: AppColors.lilac,
    opacity: 0.7,
    fontFamily: AppFonts.bodySmall.fontFamily,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,184,232,0.1)',
    paddingTop: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerCopy: {
    fontSize: 11,
    color: AppColors.lilac,
    opacity: 0.35,
    fontFamily: AppFonts.bodySmall.fontFamily,
  },
  footerSocials: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  socialDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(201,184,232,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialDotText: {
    color: AppColors.lilac,
    fontSize: 11,
    opacity: 0.6,
    fontFamily: AppFonts.bodySmall.fontFamily,
  },
});