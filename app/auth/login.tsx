import { AppColors, AppFonts, AppFontSizes, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated,
  Dimensions,
  Easing, Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSessionStore } from '../community/services/userSession';
import PrimaryButton from '../components/style/buttonHovered';
import LinkText from '../components/style/LinksHover';

const { width } = Dimensions.get('window')
const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth` || 'http://localhost:5000/api/auth';

type Tab = 'child' | 'parent';

export default function Login() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('child');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -width,      // negative of the image width (adjust to match your image)
        duration: 18000,    // speed of the scroll in ms
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const setUser = useSessionStore((s) => s.setUser);

  // Reset fields when switching tabs
  const handleTabSwitch = (tab: Tab) => {
    setActiveTab(tab);
    setUsername('');
    setPassword('');
    setFocusedField(null);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password,
          role: activeTab === 'parent' ? 'parent' : 'child'
         }),
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        if (activeTab === 'parent') {
          router.replace('/protected/parent-dashboard');
        } else {
          router.replace('/protected/dashboard');
        }
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isChild = activeTab === 'child';

  return (
    <View style={styles.container}>
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '200%',         // holds two image widths
        height: '100%',
        flexDirection: 'row',
        opacity: 0.3,
        transform: [{ translateX: scrollAnim }],
      }}
    >
      <Image
        source={require('@/assets/images/Untitled-1.png')}
        style={{ width: '50%', height: '100%', resizeMode: 'cover' }}
      />
      <Image
        source={require('@/assets/images/Untitled-1.png')}
        style={{ width: '50%', height: '100%', resizeMode: 'cover' }}
      />
    </Animated.View>
      <View style={styles.overlay} />  {/* semi-transparent dark/lilac layer */}
      <View style={styles.cont}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/images/chapters/Cat.png')}
          style={styles.catImage}
        />
        <Text style={[AppFonts.header, styles.headerTitle]}>
          {isChild ? 'Welcome back!' : 'Parent Login'}
        </Text>
      </View>

      {/* Card */}
      <View style={styles.card}>

        {/* Tab switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, isChild && styles.tabActive]}
            onPress={() => handleTabSwitch('child')}
          >
            <Text style={[styles.tabText, isChild && styles.tabTextActive]}>
              I'm a child
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isChild && styles.tabActive]}
            onPress={() => handleTabSwitch('parent')}
          >
            <Text style={[styles.tabText, !isChild && styles.tabTextActive]}>
              I'm a parent
            </Text>
          </TouchableOpacity>
        </View>

        {/* Username */}
        <View style={styles.field}>
          <Text style={styles.label}>USERNAME</Text>
          <TextInput
            style={[styles.input, focusedField === 'username' && styles.inputFocused]}
            placeholder="Username"
            placeholderTextColor={AppColors.lilac}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Password */}
        <View style={styles.field}>
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={[styles.input, focusedField === 'password' && styles.inputFocused]}
            placeholder="Password"
            placeholderTextColor={AppColors.lilac}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        <PrimaryButton
          title="LOGIN"
          onPress={handleLogin}
          loading={loading}
        />

        {/* Bottom links */}
        <View style={styles.linksContainer}>
          {isChild ? (
            // Child: no signup link, just back
            <LinkText
              title="back to welcome?"
              variant="secondary"
              onPress={() => router.push('/auth/welcome')}
            />
          ) : (
            // Parent: signup + register child + back
            <>
              <LinkText
                title="Don't have an account? Sign up"
                onPress={() => router.push('/auth/signup')}
              />
              <View style={styles.divider} />
              <Text style={styles.dividerLabel}>Already signed up? Register your child</Text>
              <LinkText
                title="Register a child account →"
                onPress={() => router.push('/protected/register-child')}
              />
              <LinkText
                title="back to welcome?"
                variant="secondary"
                onPress={() => router.push('/auth/welcome')}
              />
            </>
          )}
        </View>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.lilac,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  bg:{
    position: 'absolute',  // ← key change
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.3,
    resizeMode: 'cover',   // or 'contain'
  },
  overlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: AppColors.lilac,
  opacity: 0.5 // strong lilac wash,
  
},
  cont:{
    width: '100%',
    alignItems: 'center',
    zIndex: 1,             // sits above the image
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    marginBottom: Spacing.sm,
  },
  catImage: {
    width: 130,
    height: 130,
  },
  headerTitle: {
    color: AppColors.blue,
    letterSpacing: 5,
    textAlign: 'right',
    fontSize: AppFontSizes.title,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: AppColors.lilac,
    borderWidth: 3,
    borderColor: AppColors.blue,
    borderStyle: 'dashed',
    borderRadius: 18,
    padding: Spacing.lg,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },

  // Tab switcher
  tabRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: AppColors.blue,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: AppColors.blue,
  },
  tabText: {
    color: AppColors.blue,
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: 12,
    letterSpacing: 1,
    opacity: 0.6,
  },
  tabTextActive: {
    color: AppColors.lilac,
    opacity: 1,
    fontFamily: AppFonts.subhead.fontFamily,
  },

  field: {
    marginBottom: Spacing.md,
  },
  label: {
    color: AppColors.blue,
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 6,
    opacity: 0.8,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: AppColors.blue,
    borderRadius: 8,
    padding: Spacing.md,
    color: AppColors.blue,
    fontFamily: AppFonts.body.fontFamily,
  },
  inputFocused: {
    borderColor: '#4a6adc',
    backgroundColor: '#ffffff',
    transform: [{ scale: 1.02 }],
    shadowColor: AppColors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  linksContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.blue,
    opacity: 0.15,
    width: '80%',
    marginVertical: Spacing.sm,
  },
  dividerLabel: {
    color: AppColors.blue,
    opacity: 0.5,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: AppFonts.bodySmall.fontFamily,
  },
});