import { AppColors, AppFonts, AppFontSizes, ButtonStyles, CardStyles, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Footer from '../components/Footer';
import NavBar from '../components/navbar';

const API_URL     = `${process.env.EXPO_PUBLIC_API_URL}/api/auth` || 'http://localhost:5000/api/auth';
const ALERTS_URL  = `${process.env.EXPO_PUBLIC_API_URL}/api/parent` || 'http://localhost:5000/api/parent';

// ─── TYPES ────────────────────────────────────────────────
type Child = {
  _id: string;
  name: string;
  username: string;
  level?: number;
};

type Alert = {
  _id: string;
  alertType: 'message_flagged' | 'message_blocked' | 'emotion_severe';
  childId: Child;
  createdAt: string;
  dismissed: boolean;
  // message fields
  messageContent?: string;
  flagReasons?: string[];
  // emotion fields
  severity?: 'mild' | 'moderate' | 'severe';
  topEmotion?: string;
  confidence?: number;
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
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
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

// ─── ALERT CARD ──────────────────────────────────────────
const ALERT_META = {
  message_flagged: {
    label: 'Caution',
    color: '#D97706',   // amber
    bg:    '#FEF3C7',
    border: '#FCD34D',
  },
  message_blocked: {
    label: 'Blocked',
    color: '#DC2626',   // red
    bg:    '#FEE2E2',
    border: '#FCA5A5',
  },
  emotion_severe: {
    label: 'Emotion Alert',
    color: '#7C3AED',   // violet
    bg:    '#EDE9FE',
    border: '#C4B5FD',
  },
};

const REASON_LABELS: Record<string, string> = {
  bullying:              'Bullying',
  inappropriate_language:'Inappropriate language',
  adult_content:         'Adult content',
  personal_info_detected:'Personal info shared',
  other:                 'Other',
};

const AlertCard = ({
  alert,
  onDismiss,
}: {
  alert: Alert;
  onDismiss: (id: string) => void;
}) => {
  const meta     = ALERT_META[alert.alertType];
  const childName = alert.childId?.name ?? 'Your child';
  const date      = new Date(alert.createdAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={[styles.alertCard, { backgroundColor: meta.bg, borderColor: meta.border }]}>
      {/* Header row */}
      <View style={styles.alertHeader}>
        <View style={styles.alertHeaderLeft}>
          <View>
            <View style={[styles.alertBadge, { backgroundColor: meta.color }]}>
              <Text style={styles.alertBadgeText}>{meta.label}</Text>
            </View>
            <Text style={[styles.alertChild, { color: meta.color }]}>{childName}</Text>
          </View>
        </View>
        <Text style={styles.alertDate}>{date}</Text>
      </View>

      {/* Message alert body */}
      {(alert.alertType === 'message_flagged' || alert.alertType === 'message_blocked') && (
        <View style={styles.alertBody}>
          {alert.messageContent ? (
            <View style={styles.messageQuote}>
              <Text style={styles.messageQuoteText}>"{alert.messageContent}"</Text>
            </View>
          ) : null}
          {alert.flagReasons && alert.flagReasons.length > 0 && (
            <View style={styles.reasonsRow}>
              {alert.flagReasons.map((r) => (
                <View key={r} style={[styles.reasonChip, { borderColor: meta.color }]}>
                  <Text style={[styles.reasonChipText, { color: meta.color }]}>
                    {REASON_LABELS[r] ?? r}
                  </Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.alertDescription}>
            {alert.alertType === 'message_blocked'
              ? 'This message was blocked and not delivered.'
              : 'This message was flagged and delivered in a sanitized form.'}
          </Text>
        </View>
      )}

      {/* Emotion alert body */}
      {alert.alertType === 'emotion_severe' && (
        <View style={styles.alertBody}>
          <Text style={styles.emotionLine}>
            <Text style={styles.emotionLabel}>Detected emotion: </Text>
            <Text style={[styles.emotionValue, { color: meta.color }]}>
              {alert.topEmotion ?? 'distress'}
            </Text>
            {alert.confidence != null
              ? ` (${Math.round(alert.confidence * 100)}% confidence)`
              : ''}
          </Text>
          {alert.severity && (
            <Text style={styles.emotionLine}>
              <Text style={styles.emotionLabel}>Severity: </Text>
              <Text style={[styles.emotionValue, { color: meta.color }]}>
                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
              </Text>
            </Text>
          )}
          <Text style={styles.alertDescription}>
            A diary entry showed a strongly negative emotional tone. You may want to check in with {childName}.
          </Text>
        </View>
      )}

      {/* Dismiss */}
      <TouchableOpacity style={styles.dismissBtn} onPress={() => onDismiss(alert._id)}>
        <Text style={[styles.dismissText, { color: meta.color }]}>Dismiss</Text>
      </TouchableOpacity>
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

const NoAlerts = () => (
  <View style={styles.noAlerts}>
    <Text style={styles.noAlertsText}>No active alerts — all clear!</Text>
  </View>
);

// ─── MAIN SCREEN ─────────────────────────────────────────
export default function ParentDashboard() {
  const router = useRouter();
  const [parentName, setParentName] = useState('');
  const [parentId,   setParentId]   = useState('');
  const [children,   setChildren]   = useState<Child[]>([]);
  const [alerts,     setAlerts]     = useState<Alert[]>([]);
  const [unread,     setUnread]     = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsTab,  setAlertsTab]  = useState<'all' | 'message_flagged' | 'message_blocked' | 'emotion_severe'>('all');

  useEffect(() => {
    const init = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (!userStr) return router.replace('/auth/login');
        const user = JSON.parse(userStr);
        setParentName(user.name || 'Parent');
        const id = user._id || user.id;
        setParentId(id);
        await Promise.all([fetchChildren(id), fetchAlerts(id, 'all')]);
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
      const res   = await fetch(`${API_URL}/children/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setChildren(data.children || []);
    } catch (e) {
      console.error('Error fetching children:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async (
    id: string,
    type: 'all' | 'message_flagged' | 'message_blocked' | 'emotion_severe'
  ) => {
    setAlertsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const params = new URLSearchParams({ type, dismissed: 'false', limit: '50' });
      const res   = await fetch(`${ALERTS_URL}/alerts/${id}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAlerts(data.alerts || []);
        setUnread(data.unreadCount ?? 0);
      }
    } catch (e) {
      console.error('Error fetching alerts:', e);
    } finally {
      setAlertsLoading(false);
    }
  };

  const handleTabChange = (tab: typeof alertsTab) => {
    setAlertsTab(tab);
    fetchAlerts(parentId, tab);
  };

  const handleDismiss = async (alertId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${ALERTS_URL}/alerts/${alertId}/dismiss`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
      setUnread((n) => Math.max(0, n - 1));
    } catch (e) {
      console.error('Dismiss failed:', e);
    }
  };

  const handleDismissAll = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${ALERTS_URL}/alerts/dismiss-all`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parentId }),
      });
      setAlerts([]);
      setUnread(0);
    } catch (e) {
      console.error('Dismiss all failed:', e);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/auth/welcome');
  };

  const TABS: { key: typeof alertsTab; label: string }[] = [
    { key: 'all',              label: 'All' },
    { key: 'message_flagged',  label: 'Caution' },
    { key: 'message_blocked',  label: 'Blocked' },
    { key: 'emotion_severe',   label: 'Emotion' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.blue} />
      <NavBar />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Hi, {parentName}!</Text>
            <Text style={styles.heroSub}>Parent Dashboard</Text>
          </View>

          <View style={styles.heroRight}>
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
              {/* Alerts badge stat */}
              <View style={[styles.statCard, unread > 0 && styles.statCardAlert]}>
                <Text style={[styles.statNumber, unread > 0 && styles.statNumberAlert]}>
                  {unread}
                </Text>
                <Text style={[styles.statLabel, unread > 0 && styles.statLabelAlert]}>
                  Alerts
                </Text>
              </View>
            </View>

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
            <ActivityIndicator size="large" color={AppColors.blue} style={{ marginTop: Spacing.xl }} />
          ) : children.length === 0 ? (
            <EmptyState onRegister={() => router.push('/protected/register-child')} />
          ) : (
            <View style={styles.childrenGrid}>
              {children.map((child) => (
                <ChildCard key={child._id} child={child} />
              ))}
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

        {/* ── Safety Alerts ─────────────────────────── */}
        <View style={styles.alertsSection}>
          {/* Section header */}
          <View style={styles.alertsSectionHeader}>
            <View style={styles.alertsTitleRow}>
              <Text style={styles.sectionTitle}>Safety Alerts</Text>
              {unread > 0 && (
                <View style={styles.unreadPill}>
                  <Text style={styles.unreadPillText}>{unread}</Text>
                </View>
              )}
            </View>
            {alerts.length > 0 && (
              <TouchableOpacity onPress={handleDismissAll}>
                <Text style={styles.dismissAllText}>Dismiss all</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Filter tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsContainer}
          >
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, alertsTab === tab.key && styles.tabActive]}
                onPress={() => handleTabChange(tab.key)}
              >
                <Text style={[styles.tabText, alertsTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Alerts list */}
          {alertsLoading ? (
            <ActivityIndicator size="large" color={AppColors.blue} style={{ marginTop: Spacing.xl }} />
          ) : alerts.length === 0 ? (
            <NoAlerts />
          ) : (
            <View style={styles.alertsList}>
              {alerts.map((alert) => (
                <AlertCard key={alert._id} alert={alert} onDismiss={handleDismiss} />
              ))}
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
    flexWrap: 'wrap',
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
  statCardAlert: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  statNumber: {
    fontFamily: AppFonts.title.fontFamily,
    fontSize: 36,
    color: AppColors.blue,
  },
  statNumberAlert: {
    color: '#DC2626',
  },
  statLabel: {
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    opacity: 0.55,
    letterSpacing: 1,
  },
  statLabelAlert: {
    color: '#DC2626',
    opacity: 1,
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
  emptyEmoji: { fontSize: 56 },
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

  // ── Alerts section
  alertsSection: {
    padding: Spacing.xl,
    paddingTop: 8,
  },
  alertsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  alertsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  unreadPill: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: Spacing.lg,
  },
  unreadPillText: {
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  dismissAllText: {
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    opacity: 0.5,
    textDecorationLine: 'underline',
    marginBottom: Spacing.lg,
  },

  // ── Filter tabs
  tabsScroll: {
    marginBottom: Spacing.lg,
    flexGrow: 0,
  },
  tabsContainer: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: AppColors.blue,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: AppColors.blue,
  },
  tabText: {
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: AppColors.lilac,
  },

  alertsList: {
    gap: Spacing.md,
  },

  // ── Alert card
  alertCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  alertHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  alertEmoji: {
    fontSize: 22,
    lineHeight: 28,
  },
  alertBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  alertBadgeText: {
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  alertChild: {
    fontFamily: AppFonts.subhead.fontFamily,
    fontSize: AppFontSizes.bodySmall,
  },
  alertDate: {
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },

  alertBody: {
    gap: 8,
    marginTop: 4,
  },
  messageQuote: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 8,
    padding: 10,
  },
  messageQuoteText: {
    fontFamily: AppFonts.body.fontFamily,
    fontSize: AppFontSizes.bodySmall,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  reasonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reasonChip: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  reasonChipText: {
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  alertDescription: {
    fontFamily: AppFonts.body.fontFamily,
    fontSize: AppFontSizes.bodySmall,
    color: '#6B7280',
    lineHeight: 18,
    marginTop: 2,
  },

  // Emotion alert
  emotionLine: {
    fontFamily: AppFonts.body.fontFamily,
    fontSize: AppFontSizes.bodySmall,
    color: '#374151',
  },
  emotionLabel: {
    opacity: 0.7,
  },
  emotionValue: {
    fontFamily: AppFonts.subhead.fontFamily,
    fontWeight: '700',
  },

  dismissBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  dismissText: {
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: AppFontSizes.bodySmall,
    textDecorationLine: 'underline',
    opacity: 0.7,
  },

  // ── No alerts
  noAlerts: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
    opacity: 0.5,
  },
  noAlertsText: {
    fontFamily: AppFonts.body.fontFamily,
    fontSize: AppFontSizes.body,
    color: AppColors.blue,
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