import { AppColors, AppFonts, Spacing } from '@/constants/theme';
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
import { useSessionStore } from '../services/userSession';

interface NavBarProps {
  onLogout?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onLogout }) => {
  const session = useSessionStore((s) => s.user);
  const userName = useSessionStore((s) => s.user?.name);
  const level = useSessionStore((s) => s.user?.level);
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

  const handleLogout = () => {
    setShowDropdown(false);
    onLogout?.();
  };

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => router.push('/dashboard')}>
        <Text style={styles.navLogo}>Parkette</Text>
      </TouchableOpacity>

      <View style={styles.navLinks}>
        <TouchableOpacity onPress={() => router.push('/game/main')}>
          <Text style={styles.navLink}>Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
  onPress={() => {
    if (communitySession) {
      router.push('/community/components/communityLanding');
    } else {
      router.push('/community/main');
    }
  }}
>
          <Text style={styles.navLink}>Community</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/diary/Diary')}>
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
            <Image
              source={require('../../assets/images/profilepic.png')}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          // ── Logged-out
          <>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.navLogin}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navSignupBtn}
              onPress={() => router.push('/signup')}
            >
              <Text style={styles.navSignupText}>Sign Up</Text>
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
              <Image
                source={require('../../assets/images/profilepic.png')}
                style={styles.dropdownAvatar}
                resizeMode="cover"
              />
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
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: AppColors.lilac,
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