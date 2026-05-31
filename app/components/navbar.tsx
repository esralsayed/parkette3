import { AppColors, AppFonts, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSessionStore as useCommunityStore } from '../community/hooks/sessionStore';
import { useSessionStore } from '../community/services/userSession';
import { resolveAvatarImage } from '../resolveAvatar';

interface NavBarProps {
  onLogout?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onLogout }) => {
  const session = useSessionStore((s) => s.user);
  const userName = useSessionStore((s) => s.user?.name);
  const level = useSessionStore((s) => s.user?.level);
  const miniAvatar = useSessionStore((s) => s.user?.avatar?.miniAvatar ?? null);
  const avatarSource = resolveAvatarImage(miniAvatar) ?? require('../../assets/images/profilepic.png');
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [avatarLayout, setAvatarLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const avatarRef = useRef<View>(null);
     const communitySession =
  useCommunityStore((s) => s.session);

  const handleAvatarPress = () => {
    avatarRef.current?.measureInWindow((x, y, width, height) => {
      setAvatarLayout({ x, y, width, height });
      setShowDropdown(true);
    });
  };

// Replace handleLogout
  const handleLogout = async () => {
    setShowDropdown(false);
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      useSessionStore.getState().clearUser();
    } catch (e) {
      console.error('Logout error:', e);
    }
    onLogout?.();
    router.replace('/auth/welcome');
  };

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => router.push('/protected/dashboard')}>
        <Text style={styles.navLogo}>Parkette</Text>
      </TouchableOpacity>

      <View style={styles.navLinks}>
        <TouchableOpacity onPress={() => router.push('/protected/Game')}>
          <Text style={styles.navLink}>Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
        onPress={() => {
          if (communitySession) {
            router.push('/community/components/communityLanding');
          } else {
            router.push('/protected/Community');
          }
        }}
      >
          <Text style={styles.navLink}>Community</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/protected/Diary')}>
          <Text style={styles.navLink}>Diary</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navActions}>
        {userName ? (
          // ── Logged-in: "Hi! Name" + profile pic avatar
          <TouchableOpacity
            ref={avatarRef}
            style={styles.userArea}
            onPress={handleAvatarPress}
            activeOpacity={0.85}
          >
            <Text style={styles.hiText}>Hi! {userName.split(' ')[0]}</Text>
            <View style={styles.avatarImage}>
              <Image
                source={avatarSource}
                style={{
                  position: 'absolute', 
                  top: 11,
                  left: -2,
                  width: '100%',
                  height: '100%',
                  transform: [{ scale: 2 }],        // ← zoom level, adjust to taste
                }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        ) : (
          // ── Logged-out
          <>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.navLogin}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navSignupBtn}
              onPress={() => router.push('/auth/signup')}
            >
              <Text style={styles.navSignupText}>Parent signup</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* ── Logout dropdown */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDropdown(false)}>
          <View
            style={[
              styles.dropdown,
              {
                top: avatarLayout.y + avatarLayout.height + 8,
                right: 16,
              },
            ]}
          >
            {/* Header with avatar + name */}
            <View style={styles.dropdownHeader}>
            <View style={styles.dropdownAvatar}>
              <Image
                source={avatarSource}
                style={{
                  width: '100%',
                  height: '100%',
                  top: 5, 
                  left: -2,
                  transform: [{ scale: 2 }],
                }}
                resizeMode="contain"
              />
            </View>
              <View>
                <Text style={styles.dropdownHi}>Hi! {userName}</Text>
                <Text style={styles.dropdownSubtext}>Level: {level}</Text>
              </View>
            </View>

            <View style={styles.dropdownDivider} />

            <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
              <Text style={styles.dropdownLogout}>Log out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // ── Navbar
  navbar: {
    backgroundColor: AppColors.blue,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    elevation: 6,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 100,
  },
  navLogo: {
    color: AppColors.lilac,
    fontSize: 24,
    fontFamily: AppFonts.title.fontFamily,
    padding: Spacing.md,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 16,
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  navLink: {
    color: AppColors.lilac,
    fontSize: 16,
    fontFamily: AppFonts.title.fontFamily,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginRight: Spacing.sm,
  },
  navLogin: {
    color: AppColors.lilac,
    fontSize: 16,
    fontFamily: AppFonts.title.fontFamily,
  },
  navSignupBtn: {
    backgroundColor: AppColors.lilac,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: 50,
  },
  navSignupText: {
    color: AppColors.blue,
    fontSize: 16,
    fontFamily: AppFonts.title.fontFamily,
  },

  // ── Logged-in user area (tappable row)
  userArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hiText: {
    color: AppColors.lilac,
    fontSize: 16,
    fontFamily: AppFonts.title.fontFamily, // matches heroTitle font
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: AppColors.lilac,
    overflow: 'hidden',   // ← required for scale + borderRadius to work together
  },

  // ── Dropdown
  modalOverlay: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: AppColors.lilac,      // matches dashboard card color
    borderRadius: 16,
    minWidth: 200,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: AppColors.blue,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: AppColors.lilacLight,
  },
  dropdownAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: AppColors.blue,
    overflow: 'hidden'
  },
  dropdownHi: {
    color: AppColors.blue,
    fontSize: 16,
    fontFamily: AppFonts.title.fontFamily,  // same heroTitle style
  },
  dropdownSubtext: {
    color: AppColors.blue,
    fontSize: 14,
    fontFamily: AppFonts.bodySmall.fontFamily,
    opacity: 0.6,
    marginTop: 1,
  },
  dropdownDivider: {
    height: 1.5,
    backgroundColor: AppColors.blue,
    opacity: 0.15,
  },
  dropdownItem: {
    padding: 16,
  },
  dropdownLogout: {
    color: '#e53935',
    fontSize: 15,
    fontFamily: AppFonts.title.fontFamily,
    fontWeight: '600',
  },
});

export default NavBar;