import { AppColors, AppFonts, AppFontSizes, ButtonStyles, CardStyles, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Footer from '../components/Footer';
import NavBar from '../components/navbar';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth` || 'http://localhost:5000/api/auth';

type Child = {
  _id: string;
  name: string;
  username: string;
  level?: number;
};

// ─── CHILD CARD ──────────────────────────────────────────
const ChildCard = ({ child }: { child: Child }) => {
  const initials = child.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.childCard}>
      <View style={styles.cardCornerTL} />
      <View style={styles.cardCornerBR} />

      {/* Avatar */}
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      {/* Info */}
      <View style={styles.childInfo}>
        <Text style={styles.childName}>{child.name}</Text>
        <Text style={styles.childUsername}>@{child.username}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>Level {child.level ?? 1}</Text>
        </View>
      </View>
    </View>
  );
};

// ─── EMPTY STATE ─────────────────────────────────────────
const EmptyState = ({ onRegister }: { onRegister: () => void }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyEmoji}>👧🧒</Text>
    <Text style={styles.emptyTitle}>No children registered yet</Text>
    <Text style={styles.emptyDesc}>
      Register your child's account so they can start playing Parkette.
    </Text>
    <TouchableOpacity style={styles.emptyBtn} onPress={onRegister}>
      <Text style={styles.emptyBtnText}>Register a Child</Text>
    </TouchableOpacity>
  </View>
);

// ─── MAIN SCREEN ─────────────────────────────────────────
export default function ParentDashboard() {
  const router = useRouter();
  const [parentName, setParentName] = useState('');
  const [parentId, setParentId] = useState('');
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (!userStr) return router.replace('/auth/login');
        const user = JSON.parse(userStr);
        setParentName(user.name || 'Parent');
        setParentId(user._id || user.id);
        await fetchChildren(user._id || user.id);
      } catch (e) {
        console.error('Error loading parent:', e);
      }
    };
    init();
  }, []);

  const fetchChildren = async (id: string) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/children/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setChildren(data.children || []);
      }
    } catch (e) {
      console.error('Error fetching children:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/auth/welcome');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.blue} />
      <NavBar />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroLeft}>
            <Image
              source={require('../../assets/images/profilepic.png')}
              resizeMode="contain"
            />
            <Text style={styles.heroTitle}>Hi, {parentName}!</Text>
            <Text style={styles.heroSub}>Parent Dashboard</Text>
          </View>

          <View style={styles.heroRight}>
            {/* Stats strip */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{children.length}</Text>
                <Text style={styles.statLabel}>Children</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {children.reduce((sum, c) => sum + (c.level ?? 1), 0)}
                </Text>
                <Text style={styles.statLabel}>Total Levels</Text>
              </View>
            </View>

            {/* Register button */}
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => router.push('/protected/register-child')}
            >
              <Text style={styles.registerBtnText}>+ Register a Child</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Children list */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Your Children</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={AppColors.blue}
              style={{ marginTop: Spacing.xl }}
            />
          ) : children.length === 0 ? (
            <EmptyState onRegister={() => router.push('/protected/register-child')} />
          ) : (
            <View style={styles.childrenGrid}>
              {children.map((child) => (
                <ChildCard key={child._id} child={child} />
              ))}

              {/* Add another child card */}
              <TouchableOpacity
                style={styles.addChildCard}
                onPress={() => router.push('/protected/register-child')}
              >
                <Text style={styles.addChildPlus}>+</Text>
                <Text style={styles.addChildText}>Add another child</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.lilacLight,
  },

  // ── Hero
  heroSection: {
    backgroundColor: AppColors.lilac,
    paddingVertical: 48,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    minHeight: 260,
  },
  heroLeft: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  heroRight: {
    flex: 2,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.lg,
  },
  heroTitle: {
    ...AppFonts.title,
    fontSize: 40,
    color: AppColors.blue,
  },
  heroSub: {
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    opacity: 0.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ── Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    ...CardStyles.default,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  statNumber: {
    fontFamily: AppFonts.title.fontFamily,
    fontSize: 36,
    color: AppColors.blue,
  },
  statLabel: {
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    opacity: 0.55,
    letterSpacing: 1,
  },

  // ── Register button
  registerBtn: {
    ...ButtonStyles.action,
    backgroundColor: AppColors.blue,
    shadowColor: AppColors.lilacLight,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    paddingHorizontal: Spacing.xl,
  },
  registerBtnText: {
    fontFamily: AppFonts.subhead.fontFamily,
    fontSize: AppFontSizes.body,
    color: AppColors.lilac,
    letterSpacing: 1,
  },

  // ── List section
  listSection: {
    padding: Spacing.xl,
    paddingTop: 40,
  },
  sectionTitle: {
    fontFamily: AppFonts.subhead.fontFamily,
    fontSize: AppFontSizes.title,
    color: AppColors.blue,
    marginBottom: Spacing.lg,
  },

  // ── Children grid
  childrenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },

  // ── Child card
  childCard: {
    ...CardStyles.default,
    width: 220,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    position: 'relative',
  },
  cardCornerTL: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 10,
    height: 10,
    backgroundColor: AppColors.blue,
    borderRadius: 2,
  },
  cardCornerBR: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 10,
    height: 10,
    backgroundColor: AppColors.blue,
    borderRadius: 2,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AppColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontFamily: AppFonts.subhead.fontFamily,
    fontSize: 28,
    color: AppColors.lilac,
  },
  childInfo: {
    alignItems: 'center',
    gap: 4,
  },
  childName: {
    fontFamily: AppFonts.subhead.fontFamily,
    fontSize: AppFontSizes.body,
    color: AppColors.blue,
    textAlign: 'center',
  },
  childUsername: {
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    opacity: 0.5,
  },
  levelBadge: {
    marginTop: Spacing.sm,
    backgroundColor: AppColors.blue,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  levelBadgeText: {
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.lilac,
  },

  // ── Add child card
  addChildCard: {
    width: 220,
    minHeight: 180,
    borderWidth: 3,
    borderColor: AppColors.blue,
    borderStyle: 'dashed',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    opacity: 0.5,
  },
  addChildPlus: {
    fontFamily: AppFonts.title.fontFamily,
    fontSize: 48,
    color: AppColors.blue,
    lineHeight: 52,
  },
  addChildText: {
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    letterSpacing: 1,
  },

  // ── Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontFamily: AppFonts.subhead.fontFamily,
    fontSize: AppFontSizes.subhead,
    color: AppColors.blue,
  },
  emptyDesc: {
    fontFamily: AppFonts.body.fontFamily,
    fontSize: AppFontSizes.body,
    color: AppColors.blue,
    opacity: 0.6,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 24,
  },
  emptyBtn: {
    ...ButtonStyles.action,
    backgroundColor: AppColors.blue,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    shadowColor: AppColors.lilacLight,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  emptyBtnText: {
    fontFamily: AppFonts.subhead.fontFamily,
    fontSize: AppFontSizes.body,
    color: AppColors.lilac,
  },

  // ── Logout
  logoutSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  logoutBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  logoutText: {
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    opacity: 0.4,
    textDecorationLine: 'underline',
    letterSpacing: 1,
  },
});