import { AppColors, AppFonts, AppFontSizes, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Footer from '../components/Footer';
import NavBar from '../components/navbar';
import { useCommunity } from './useComm';

export default function CommunityFriends() {
  const { friends, loading, handleAddFriend, startSession, handleApprove, handleDeny, requests, handleRemoveFriend } = useCommunity();
  const [showCode, setShowCode] = useState(false);
  const [myCode, setMyCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Search state
  const [searchCode, setSearchCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<'sent' | 'not_found' | 'already_friends' | null>(null);

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
      <ScrollView style={styles.container}>
        <NavBar />
        <View style={styles.main}>
          <Text style={styles.title}>My Friends</Text>

          {/* ── Search by friend code ── */}
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
            {searchResult === 'sent' && (
              <Text style={styles.feedbackSuccess}>Friend request sent! 🎉</Text>
            )}
            {searchResult === 'not_found' && (
              <Text style={styles.feedbackError}>No user found with that code.</Text>
            )}
            {searchResult === 'already_friends' && (
              <Text style={styles.feedbackError}>You're already friends with this person.</Text>
            )}
          </View>

          {/* Friends list */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Friends ({friends.length})</Text>
            {friends.length === 0 && <Text style={styles.empty}>No friends yet</Text>}
            {friends.map(friend => (
              <View key={friend._id} style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {friend.username.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{friend.username}</Text>
                  <Text style={styles.level}>Level {friend.level}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.btn, styles.btnJoin]}
                  onPress={() => startSession([friend._id])}
                >
                  <Text style={styles.btnJoinText}>Join</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { borderColor: '#c0392b' }]}
                  onPress={() => handleRemoveFriend(friend._id)}
                >
                  <Text style={[styles.btnText, { color: '#c0392b' }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Friend requests */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Friend Requests ({requests.length})</Text>
            {requests.length === 0 && <Text style={styles.empty}>No pending requests</Text>}
            {requests.map(req => (
              <View key={req._id} style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {req.username.slice(0, 2).toUpperCase()}
                  </Text>
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
                  <Text style={styles.codeText}>{myCode || '------'}</Text>
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
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.lilac },
  main: { flex: 1, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg },
  title: { ...AppFonts.title, fontSize: AppFontSizes.title, color: AppColors.blue, marginBottom: 16 },

  // Search
  searchSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.blue,
    padding: 14,
    marginBottom: 16,
  },
  searchLabel: { ...AppFonts.body, fontSize: 14, color: AppColors.blue, marginBottom: 10 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: AppColors.blue,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
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
    minWidth: 60,
  },
  searchBtnText: { ...AppFonts.body, fontSize: 13, color: AppColors.lilac },
  feedbackSuccess: { marginTop: 8, fontSize: 13, color: 'green' },
  feedbackError: { marginTop: 8, fontSize: 13, color: '#c0392b' },

  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.blue,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sectionHeader: {
    ...AppFonts.body,
    fontSize: 13,
    color: AppColors.blue,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.blue,
    backgroundColor: AppColors.lilac,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderBottomWidth: 0.5, borderBottomColor: AppColors.blue },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: AppColors.lilac, borderWidth: 1, borderColor: AppColors.blue, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...AppFonts.body, fontSize: 13, color: AppColors.blue, fontWeight: '500' },
  info: { flex: 1 },
  name: { ...AppFonts.body, fontSize: 14, color: AppColors.blue },
  level: { fontSize: 12, color: AppColors.blue, opacity: 0.6, marginTop: 2 },
  empty: { padding: 16, textAlign: 'center', color: AppColors.blue, opacity: 0.5 },

  btn: { borderWidth: 1, borderColor: AppColors.blue, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  btnText: { fontSize: 12, color: AppColors.blue },
  btnJoin: { borderColor: AppColors.blue, backgroundColor: AppColors.blue },
  btnJoinText: { fontSize: 12, color: AppColors.lilac },
  btnApprove: { borderColor: 'green' },
  btnApproveText: { fontSize: 12, color: 'green' },

  codeSection: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: AppColors.blue, padding: 14 },
  codeToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  codeLabel: { ...AppFonts.body, fontSize: 14, color: AppColors.blue },
  codeSub: { fontSize: 12, color: AppColors.blue, opacity: 0.6, marginTop: 2 },
  toggle: { width: 36, height: 20, borderRadius: 10, backgroundColor: '#ccc', justifyContent: 'center', padding: 2 },
  toggleOn: { backgroundColor: AppColors.blue },
  thumb: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },
  thumbOn: { alignSelf: 'flex-end' },
  codeReveal: { marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: AppColors.blue },
  codeBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: AppColors.lilac, borderRadius: 8, padding: 10, marginBottom: 10 },
  codeText: { fontSize: 22, fontWeight: '500', color: AppColors.blue, letterSpacing: 4 },
  shareBtn: { borderWidth: 1, borderColor: AppColors.blue, borderRadius: 8, padding: 10, alignItems: 'center' },
  shareBtnText: { ...AppFonts.body, fontSize: 13, color: AppColors.blue },
});