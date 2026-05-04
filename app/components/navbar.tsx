import { AppColors, AppFonts, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NavBarProps {
  userName?: string;
}

const NavBar: React.FC<NavBarProps> = ({ userName }) => {
  const router = useRouter();

  return (
    <View style={styles.navbar}>
      <Text style={styles.navLogo}>Parkette</Text>
      <View style={styles.navLinks}>
        <TouchableOpacity onPress={() => router.push('/game/main')}>
          <Text style={styles.navLink}>Game</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/community/main')}>
          <Text style={styles.navLink}>Community</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/diary/Diary')}>
          <Text style={styles.navLink}>Diary</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.navActions}>
        {userName ? (
          <Text style={styles.navLogin}>Hi {userName}</Text>
        ) : (
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
    padding: Spacing.md
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
});

export default NavBar;