
import { AppColors, AppFonts, ButtonStyles, CardStyles, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = 'http://localhost:5000/api/auth'; // Update this for production

export default function Login() {
  const router = useRouter();
  const [userType, setUserType] = useState('parent'); // 'parent' or 'child'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          role: userType,
        }),
      });

      const data = await response.json();
console.log('Login response:', data);
      if (response.ok) {
        // Store token and user data
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));

        Alert.alert('Success', 'Login successful!');
        // Navigate to dashboard
        router.replace('/dashboard');
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, AppFonts.header]}>Login</Text>
      <View style={[styles.userTypeContainer, CardStyles.default]}>
        <TouchableOpacity
          style={[styles.userTypeButton, userType === 'parent' && styles.selected]}
          onPress={() => setUserType('parent')}
        >
          <Text style={AppFonts.button2}>Parent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.userTypeButton, userType === 'child' && styles.selected]}
          onPress={() => setUserType('child')}
        >
          <Text style={AppFonts.button2}>Child</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={[styles.input, CardStyles.default]}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, CardStyles.default]}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button, ButtonStyles.primary, { backgroundColor: AppColors.blue }, loading && styles.disabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={[styles.buttonText, AppFonts.button2]}>
          {loading ? 'Logging In...' : 'Login'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/welcome')}>
        <Text style={[styles.link, AppFonts.bodySmall]}>Back to Welcome</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: AppColors.lilac,
  },
  title: {
    color: AppColors.blue,
    marginBottom: Spacing.lg,
  },
  userTypeContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    backgroundColor: 'white',
  },
  userTypeButton: {
    padding: Spacing.md,
    marginHorizontal: Spacing.sm,
    borderRadius: ButtonStyles.icon.borderRadius,
  },
  selected: {
    backgroundColor: AppColors.blue,
  },
  input: {
    width: '100%',
    padding: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: 'white',
    color: AppColors.blue,
  },
  button: {
    width: '80%',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
  },
  link: {
    color: AppColors.blue,
    marginTop: Spacing.lg,
  },
});