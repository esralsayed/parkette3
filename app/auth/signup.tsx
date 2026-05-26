import { AppColors, AppFonts, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import PrimaryButton from '../components/style/buttonHovered';
import LinkText from '../components/style/LinksHover';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth` || 'http://localhost:5000/api/auth';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!name || !username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        // Go to email verification screen, not directly to register-child
        router.push('/auth/verifymail');
      } else {
        Alert.alert('Error', data.message || 'Signup failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/images/chapters/Cat.png')}
          style={styles.catImage}
        />
        <Text style={[AppFonts.header, styles.headerTitle]}>Parent Sign Up</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.cornerTL} />
        <View style={styles.cornerBR} />

        {/* Full Name */}
        <View style={styles.field}>
          <Text style={styles.label}>FULL NAME</Text>
          <TextInput
            style={[styles.input, focusedField === 'name' && styles.inputFocused]}
            placeholder="Full name"
            placeholderTextColor={AppColors.lilac}
            value={name}
            onChangeText={setName}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
          />
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

        {/* Email */}
        <View style={styles.field}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={[styles.input, focusedField === 'email' && styles.inputFocused]}
            placeholder="Email"
            placeholderTextColor={AppColors.lilac}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setFocusedField('email')}
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
          title="SIGN UP"
          onPress={handleSignup}
          loading={loading}
        />

        {/* Bottom links — clean and minimal */}
        <View style={styles.linksContainer}>
          <LinkText
            title="back to welcome?"
            variant="secondary"
            onPress={() => router.push('/auth/welcome')}
          />
          <View style={styles.divider} />
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  catImage: {
    width: 130,
    height: 130,
  },
  headerTitle: {
    fontSize: 48,
    color: AppColors.blue,
    letterSpacing: 2,
    textAlign: 'right',
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
    marginTop: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.blue,
    opacity: 0.15,
    width: '80%',
    marginVertical: Spacing.sm,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginPrompt: {
    color: AppColors.blue,
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: 13,
    opacity: 0.6,
  },
  loginLink: {
    color: AppColors.blue,
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: 13,
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
});