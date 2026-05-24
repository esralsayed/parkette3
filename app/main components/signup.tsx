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
  const [signupHover, setSignupHover] = useState(false);
  const [backLoginHover, setBackLoginHover] = useState(false);
  const [backWelcomeHover, setBackWelcomeHover] = useState(false);

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
        Alert.alert('Success', 'Account created successfully!');
        router.push('/main components/register-child');
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
      {/* Header section with cat and title */}
      <View style={styles.headerContainer}>
        <Image 
          source={require('../../assets/images/chapters/Cat.png')}
          style={styles.catImage}
        />
        <Text style={[AppFonts.header, styles.headerTitle]}>Sign Up</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.cornerTL} />
        <View style={styles.cornerBR} />

        {/* Full Name Field */}
        <View style={styles.field}>
          <Text style={styles.label}>FULL NAME</Text>
          <TextInput
            style={[
              styles.input,
              focusedField === 'name' && styles.inputFocused
            ]}
            placeholder="Full name"
            placeholderTextColor={AppColors.lilac}
            value={name}
            onChangeText={setName}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

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

        {/* Email Field */}
        <View style={styles.field}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={[
              styles.input,
              focusedField === 'email' && styles.inputFocused
            ]}
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
          title="SIGN UP"
          onPress={handleSignup}
          loading={loading}
        />

        {/* Back links section */}
        <View style={styles.linksContainer}>
          <LinkText
            title="← Back to Login"
            onPress={() => router.push('/main components/login')}
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
    justifyContent: 'space-between', // cleaner
  },
  catImage: {
    width: 130,
    height: 130,
  },
  headerTitle: {
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
  signupBtn: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: AppColors.blue,
    borderRadius: 10,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  linksContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  backLoginLink: {
    color: AppColors.blue,
  },
  backWelcomeLink: {
    color: AppColors.blue,
    fontSize: 15
  },
  linkHover: {
    color: '#4a6adc',
    textDecorationLine: 'underline',
  },
});