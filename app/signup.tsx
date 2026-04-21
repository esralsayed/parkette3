import { AppColors, AppFonts, ButtonStyles, CardStyles, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = 'http://localhost:5000/api/auth'; // Update this for production

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log({ name, email, password });
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));

        Alert.alert('Success', 'Account created successfully!');
        // Navigate to register child
        router.push('/register-child');
      } else {
        Alert.alert('Error', data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, AppFonts.header]}>Sign Up as Parent</Text>
      <TextInput
        style={[styles.input, CardStyles.default]}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, CardStyles.default]}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, CardStyles.default]}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={[styles.buttonText]}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, ButtonStyles.action]}
        onPress={() => router.push('/register-child')}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Register as Child</Text>
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
  secondaryButtonText: {
    color: AppColors.blue,
  },
  link: {
    color: AppColors.blue,
    marginTop: Spacing.lg,
  }
});