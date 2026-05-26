
import { AppColors, AppFonts, ButtonStyles, CardStyles, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth` || 'http://localhost:5000/api/auth'; // Update this for production

export default function RegisterChild() {
  const router = useRouter();
  const [childName, setChildName] = useState('');
  const [childUsername, setChildUsername] = useState('');
  const [childEmail, setChildEmail] = useState('');
  const [childPassword, setChildPassword] = useState('');
  const [parentId, setParentId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get parent ID from stored user data
    const getParentId = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setParentId(user.id);
        }
      } catch (error) {
        console.error('Error getting parent ID:', error);
      }
    };
    getParentId();
  }, []);

  const handleRegisterChild = async () => {
    if (!childName || !childUsername || !childEmail || !childPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!parentId) {
      Alert.alert('Error', 'Parent information not found. Please sign up first.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register-child`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: childName,
          username: childUsername,
          email: childEmail,
          password: childPassword,
          parentId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Child registered successfully!');
        // Navigate to tabs
        router.replace('/auth/welcome');
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Register child error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, AppFonts.header]}>Register Your Child</Text>
      <TextInput
        style={[styles.input, CardStyles.default]}
        placeholder="Child's Full Name"
        value={childName}
        onChangeText={setChildName}
      />
      <TextInput
        style={[styles.input, CardStyles.default]}
        placeholder="Child's Username"
        value={childUsername}
        onChangeText={setChildUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, CardStyles.default]}
        placeholder="Child's Email"
        value={childEmail}
        onChangeText={setChildEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, CardStyles.default]}
        placeholder="Child's Password"
        value={childPassword}
        onChangeText={setChildPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button, ButtonStyles.primary, { backgroundColor: AppColors.blue }, loading && styles.disabled]}
        onPress={handleRegisterChild}
        disabled={loading}
      >
        <Text style={[styles.buttonText, AppFonts.button2]}>
          {loading ? 'Registering...' : 'Register Child'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={[styles.link, AppFonts.bodySmall]}>Back</Text>
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
  link: {
    color: AppColors.blue,
    marginTop: Spacing.lg,
  },
});