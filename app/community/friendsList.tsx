import { AppColors, AppFonts, AppFontSizes, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Footer from '../components/Footer';
import NavBar from '../components/navbar';
import { useSessionStore } from '../services/userSession';
import { useSessionStore as useCommunitySession } from './sessionStore';
import { useCommunity } from './useComm';

export default function CommunityFriends() {
  const { width } = useWindowDimensions(); // reactive to rotation/resize
  const isWide = width >= 800;
  //router
  const router = useRouter(); 
  //loading session
  const session = useCommunitySession((s) => s.session);
  const user = useSessionStore((s) => s.user); // from your auth store
  const hasActiveSession = session !== null;
  const isParticipant = session?.participants?.some(
  (p: any) => p._id === user?.id
);

//-------------------//
  const { friends, loading, handleAddFriend, startSession, handleApprove, handleDeny, requests, handleRemoveFriend } = useCommunity();
  const [showCode, setShowCode] = useState(false);
  const [myCode, setMyCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  const [searchCode, setSearchCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<'sent' | 'not_found' | 'already_friends' | null>(null);

  //useeffects + functions 
  
  useEffect(() => {
    AsyncStorage.getItem('user').then(str => {
      if (str) setMyCode(JSON.parse(str).friendCode ?? '');
    });
  }, []);

  const handleShare = async () => {
    await Share.share({ message: `Add me on the app! My friend code is: ${myCode}` });
  };

  const handleCopy = async () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearch = async () => {
    if (!searchCode.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      await handleAddFriend(searchCode.trim());
      setSearchResult('sent');
      setSearchCode('');
    } catch (e: any) {
      const msg = e?.message ?? '';
      if (msg.includes('already')) setSearchResult('already_friends');
      else setSearchResult('not_found');
    } finally {
      setSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <NavBar />

        {/* ── Centered content wrapper with max-width on wide screens */}
        <View style={[styles.main, isWide && styles.mainWide]}>
          <Text style={[styles.title, isWide && styles.titleWide]}>My Friends</Text>

          {/* ── On wide screens: two-column layout ── */}
          <View style={[styles.layout, isWide && styles.layoutWide]}>

            {/* ── LEFT / TOP: Search + Friend code ── */}
            <View style={[styles.sidebar, isWide && styles.sidebarWide]}>

              {/* Search */}
              <View style={styles.searchSection}>
                <Text style={styles.searchLabel}>Add a friend</Text>
                <View style={styles.searchRow}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Enter friend code…"
                    placeholderTextColor={AppColors.blue + '80'}
                    value={searchCode}
                    onChangeText={t => { setSearchCode(t); setSearchResult(null); }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="send"
                    onSubmitEditing={handleSearch}
                  />
                  <TouchableOpacity
                    style={[styles.searchBtn, searching && { opacity: 0.6 }]}
                    onPress={handleSearch}
                    disabled={searching}
                  >
                    {searching
                      ? <ActivityIndicator size="small" color={AppColors.lilac} />
                      : <Text style={styles.searchBtnText}>Send</Text>}
                  </TouchableOpacity>
                </View>
                {searchResult === 'sent' && <Text style={styles.feedbackSuccess}>Friend request sent!</Text>}
                {searchResult === 'not_found' && <Text style={styles.feedbackError}>No user found with that code.</Text>}
                {searchResult === 'already_friends' && <Text style={styles.feedbackError}>You're already friends with this person.</Text>}
              </View>

              {/* Friend code */}
              <View style={styles.codeSection}>
                <View style={styles.codeToggleRow}>
                  <View>
                    <Text style={styles.codeLabel}>Share your code</Text>
                    <Text style={styles.codeSub}>Let friends find you</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggle, showCode && styles.toggleOn]}
                    onPress={() => setShowCode(v => !v)}
                  >
                    <View style={[styles.thumb, showCode && styles.thumbOn]} />
                  </TouchableOpacity>
                </View>
                {showCode && (
                  <View style={styles.codeReveal}>
                    <View style={styles.codeBox}>
                      <Text style={[styles.codeText, !isWide && styles.codeTextNarrow]}>
                        {myCode || '------'}
                      </Text>
                      <TouchableOpacity style={styles.btn} onPress={handleCopy}>
                        <Text style={styles.btnText}>{copied ? 'Copied!' : 'Copy'}</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                      <Text style={styles.shareBtnText}>Share with a friend</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* ── RIGHT / BOTTOM: Tabbed friends + requests ── */}
            <View style={[styles.content, isWide && styles.contentWide]}>
              <View style={styles.section}>

                {/* Tab bar */}
                <View style={styles.tabBar}>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
                    onPress={() => setActiveTab('friends')}
                  >
                    <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
                      Friends {friends.length > 0 && `(${friends.length})`}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
                    onPress={() => setActiveTab('requests')}
                  >
                    <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
                      Requests
                    </Text>
                    {requests.length > 0 && (
                      <View style={[styles.badge, activeTab === 'requests' && styles.badgeActive]}>
                        <Text style={[styles.badgeText, activeTab === 'requests' && styles.badgeTextActive]}>
                          {requests.length}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Friends list */}
                {activeTab === 'friends' && (
                  <>
                    {friends.length === 0 && <Text style={styles.empty}>No friends yet</Text>}
                    {friends.map(friend => (
                      <View key={friend._id} style={[styles.row, isWide && styles.rowWide]}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>{friend.username.slice(0, 2).toUpperCase()}</Text>
                        </View>
                        <View style={styles.info}>
                          <Text style={styles.name}>{friend.username}</Text>
                          <Text style={styles.level}>Level {friend.level}</Text>
                        </View>

                        <TouchableOpacity
                          style={[styles.btn, styles.btnJoin]}
                          onPress={() => startSession([friend._id])}
                        >
                          <Text style={styles.btnJoinText}>Create</Text>
                        </TouchableOpacity>

                        {hasActiveSession && isParticipant && (
                          <TouchableOpacity
                            style={[styles.btn, styles.btnApprove]}
                            onPress={() => router.push('/community/communityLanding')}
                          >
                            <Text style={styles.btnApproveText}>Join</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          style={[styles.btn, { borderColor: '#c0392b' }]}
                          onPress={() => handleRemoveFriend(friend._id)}
                        >
                          <Text style={[styles.btnText, { color: '#c0392b' }]}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </> 
                )}            

                {/* Requests list */}
                {activeTab === 'requests' && (
                  <>
                    {requests.length === 0 && <Text style={styles.empty}>No pending requests</Text>}
                    {requests.map(req => (
                      <View key={req._id} style={[styles.row, isWide && styles.rowWide]}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>{req.username.slice(0, 2).toUpperCase()}</Text>
                        </View>
                        <View style={styles.info}>
                          <Text style={styles.name}>{req.username}</Text>
                          <Text style={styles.level}>Level {req.level}</Text>
                        </View>
                        <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={() => handleApprove(req._id)}>
                          <Text style={styles.btnApproveText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btn} onPress={() => handleDeny(req._id)}>
                          <Text style={styles.btnText}>Deny</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </>
                )}
              </View>
            </View>

          </View>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.lilac },
  scrollContent: { flexGrow: 1 },

  // ── Page wrapper
  main: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  mainWide: {
    //maxWidth: ,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Spacing.xl,
  },

  title: {
    ...AppFonts.title,
    fontSize: AppFontSizes.title,
    color: AppColors.blue,
    marginBottom: 16,
  },
  titleWide: {
    fontSize: AppFontSizes.title * 1.3,
    marginBottom: 24,
  },

  // ── Responsive layout: stacked on mobile, side-by-side on wide
  layout: {
    flexDirection: 'column',
    gap: 24,
  },
  layoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 42,
  },

  // ── Left sidebar (search + code)
  sidebar: {
    gap: 16,
  },
  sidebarWide: {
    width: 500,
    flexShrink: 0,
  },

  // ── Right content (tabbed list)
  content: {
    flex: 1,
  },
  contentWide: {
    flex: 1,
  },

  // ── Search
  searchSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.blue,
    padding: 14,
    width: '100%'
  },
  searchLabel: { ...AppFonts.body, fontSize: AppFontSizes.body, color: AppColors.blue, marginBottom: 10 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: {
    ...AppFonts.bodySmall,
    flex: 1,
    minWidth: 0,
    width: '100%',
    borderWidth: 1,
    borderColor: AppColors.blue,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: AppFontSizes.bodySmall,
    color: AppColors.blue,
    backgroundColor: AppColors.lilac,
  },
  searchBtn: {
    backgroundColor: AppColors.blue,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: { ...AppFonts.bodySmall, fontSize: AppFontSizes.bodySmall, color: AppColors.lilac },
  feedbackSuccess: { ...AppFonts.body, marginTop: 8, fontSize: 24, color: 'green' },
  feedbackError: { ...AppFonts.body, marginTop: 8, fontSize: 24, color: '#c0392b' },

  // ── Tabbed section
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.blue,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: AppColors.blue,
    backgroundColor: AppColors.lilac,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  tabActive: { backgroundColor: AppColors.blue },
  tabText: { ...AppFonts.body, fontSize: AppFontSizes.body, color: AppColors.blue },
  tabTextActive: { color: AppColors.lilac },
  badge: {
    backgroundColor: AppColors.blue,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeActive: { backgroundColor: AppColors.lilac },
  badgeText: { ...AppFonts.bodySmall,fontSize: AppFontSizes.bodySmall, color: AppColors.lilac, fontWeight: '700' },
  badgeTextActive: { color: AppColors.blue },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: AppColors.blue,
  },
  rowWide: { paddingHorizontal: 16, paddingVertical: 14 },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AppColors.lilac,
    borderWidth: 1,
    borderColor: AppColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...AppFonts.body, fontSize: AppFontSizes.body, color: AppColors.blue, fontWeight: '500' },
  info: { flex: 1 },
  name: { ...AppFonts.body, fontSize: AppFontSizes.body, color: AppColors.blue },
  level: { ...AppFonts.bodySmall,fontSize: AppFontSizes.bodySmall, color: AppColors.blue, opacity: 0.6, marginTop: 2 },
  empty: { ...AppFonts.bodySmall,padding: 16, textAlign: 'center', color: AppColors.blue, opacity: 0.5, fontSize: AppFontSizes.bodySmall },

  btn: { borderWidth: 1, borderColor: AppColors.blue, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  btnText: { ...AppFonts.bodySmall,fontSize: AppFontSizes.button2, color: AppColors.blue },
  btnJoin: { borderColor: AppColors.blue, backgroundColor: AppColors.blue },
  btnJoinText: { ...AppFonts.bodySmall, fontSize: AppFontSizes.button2, color: AppColors.lilac },
  btnApprove: { borderColor: 'green' },
  btnApproveText: { ...AppFonts.bodySmall, fontSize: AppFontSizes.bodySmall, color: 'green' },

  // ── Friend code
  codeSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.blue,
    padding: 14,
  },
  codeToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  codeLabel: { ...AppFonts.body, fontSize: AppFontSizes.body, color: AppColors.blue },
  codeSub: { ...AppFonts.bodySmall, fontSize: AppFontSizes.bodySmall, color: AppColors.blue, opacity: 0.6, marginTop: 2 },
  toggle: { width: 36, height: 20, borderRadius: 10, backgroundColor: '#ccc', justifyContent: 'center', padding: 2 },
  toggleOn: { backgroundColor: AppColors.blue },
  thumb: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },
  thumbOn: { alignSelf: 'flex-end' },
  codeReveal: { marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: AppColors.blue },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.lilac,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  codeText: { fontSize: AppFontSizes.body, fontWeight: '500', color: AppColors.blue, letterSpacing: 4 },
  codeTextNarrow: { fontSize: 18, letterSpacing: 3 },
  shareBtn: { borderWidth: 1, borderColor: AppColors.blue, borderRadius: 8, padding: 10, alignItems: 'center' },
  shareBtnText: { ...AppFonts.bodySmall, fontSize: AppFontSizes.bodySmall, color: AppColors.blue },
});