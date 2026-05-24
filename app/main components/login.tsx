import { AppColors, AppFonts, AppFontSizes, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSessionStore } from '../community/services/userSession';
import PrimaryButton from '../components/style/buttonHovered';
import LinkText from '../components/style/LinksHover';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth`|| 'http://localhost:5000/api/auth';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const setUser = useSessionStore((s) => s.setUser);

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
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        console.log(data.user)
        Alert.alert('Success', 'Login successful!');
        router.replace('/main components/dashboard');
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header section with cat and title */}
      <View style={styles.headerContainer}>
        <Image 
          source={require('../../assets/images/chapters/Cat.png')}
          style={styles.catImage}
        />
        <Text style={[AppFonts.header, styles.headerTitle]}>Login</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.cornerTL} />
        <View style={styles.cornerBR} />

        {/* Username Field */}
        <View style={styles.field}>
          <Text style={styles.label}>USERNAME</Text>
          <TextInput
            style={[
              styles.input,
              focusedField === 'username' && styles.inputFocused
            ]}
            placeholder="Username"
            placeholderTextColor={AppColors.lilac}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Password Field */}
        <View style={styles.field}>
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={[
              styles.input,
              focusedField === 'password' && styles.inputFocused
            ]}
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

        {/* Back links section */}
        <View style={styles.linksContainer}>
          <LinkText
            title="New to the game? Signup!"
            onPress={() => router.push('/main components/signup')}
          />

          <LinkText
            title="back to welcome?"
            variant="secondary"
            onPress={() => router.push('/main components/welcome')}
          />
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
    letterSpacing: 2,
    textAlign: 'right',
    fontSize: AppFontSizes.title,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 3,
    borderColor: AppColors.blue,
    borderStyle: 'dashed',
    borderRadius: 18,
    padding: Spacing.lg,
    shadowColor: '#b0b8e8',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cornerTL: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 10,
    height: 10,
    backgroundColor: AppColors.blue,
    borderRadius: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 10,
    height: 10,
    backgroundColor: AppColors.blue,
    borderRadius: 2,
  },
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    color: AppColors.blue,
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
});