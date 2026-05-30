import { AppColors, AppFonts, AppFontSizes, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';
import PrimaryButton from '../components/style/buttonHovered';
import LinkText from '../components/style/LinksHover';
const { width } = Dimensions.get('window')

const API_URL = 'http://localhost:5000/api/auth';

const DEFAULT_PERMISSIONS = {
  communityAccess: false,
  diaryEmotionalAnalysis: true,
  diaryAiSuggestions: true,
  insightReports: true,
};

const PERMISSION_LABELS: Record<keyof typeof DEFAULT_PERMISSIONS, { label: string; hint: string }> = {
  communityAccess:        { label: 'Community Access',         hint: 'Allow your child to interact with the community' },
  diaryEmotionalAnalysis: { label: 'Diary Emotional Analysis', hint: 'AI analyses emotional tone in diary entries' },
  diaryAiSuggestions:     { label: 'Diary AI Suggestions',     hint: 'AI offers writing suggestions in the diary' },
  insightReports:         { label: 'Insight Reports',          hint: 'Send you regular insight reports about your child' },
};

export default function RegisterChild() {
  const router = useRouter();
  const [childName, setChildName] = useState('');
  const [childUsername, setChildUsername] = useState('');
  const [childPassword, setChildPassword] = useState('');
  const [parentId, setParentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);

  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -width,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
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

  const togglePermission = (key: keyof typeof DEFAULT_PERMISSIONS) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notify = (title: string, message: string) => {
  if (typeof window !== 'undefined') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

  const handleRegisterChild = async () => {
    if (!childName || !childUsername || !childPassword) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: childName,
          username: childUsername,
          password: childPassword,
          parentId,
          permissions,
        }),
      });
      const raw = await response.text(); // 👈 read as text first
      const data = JSON.parse(raw);
      if (response.ok) {
        Alert.alert('Success', "Child registered successfully! They can now log in.");
        router.replace('/protected/parent-dashboard');
      } else {
        console.log('field:', data.field); // 👈 add this
      // Handle specific field errors
      if (data.field === 'username') {
        notify('Username Unavailable', data.message);
        Alert.alert('Username Unavailable', data.message);
        // Optionally focus the username input
      } else if (data.field === 'parentId') {
        notify('Session Expired', 'Please log in again.');
        Alert.alert('Session Expired', 'Please log in again.');
        router.replace('/auth/login');
      } else {
        notify('Error', data.message || 'Registration failed');
      }
    }
    } catch (error) {
        console.log('Caught error:', error); // 👈 and this
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '200%',
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
      <View style={styles.overlay} />
      <View style={styles.cont}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Image
            source={require('../../assets/images/chapters/Cat.png')}
            style={styles.catImage}
          />
          <Text style={[AppFonts.header, styles.headerTitle]}>Register Your Child</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Two Column Layout */}
          <View style={styles.twoColumnRow}>
            {/* Left Column - Form Fields */}
            <View style={styles.leftColumn}>
              {/* Child's Name */}
              <View style={styles.field}>
                <Text style={styles.label}>CHILD'S NAME</Text>
                <TextInput
                  style={[styles.input, focusedField === 'name' && styles.inputFocused]}
                  placeholder="Full name"
                  placeholderTextColor={AppColors.lilac}
                  value={childName}
                  onChangeText={setChildName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Child's Username */}
              <View style={styles.field}>
                <Text style={styles.label}>USERNAME</Text>
                <TextInput
                  style={[styles.input, focusedField === 'username' && styles.inputFocused]}
                  placeholder="Username"
                  placeholderTextColor={AppColors.lilac}
                  value={childUsername}
                  onChangeText={setChildUsername}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Child's Password */}
              <View style={styles.field}>
                <Text style={styles.label}>PASSWORD</Text>
                <TextInput
                  style={[styles.input, focusedField === 'password' && styles.inputFocused]}
                  placeholder="Password"
                  placeholderTextColor={AppColors.lilac}
                  value={childPassword}
                  onChangeText={setChildPassword}
                  secureTextEntry
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Right Column - Permissions */}
            <View style={styles.rightColumn}>
              <View style={styles.permissionsContainer}>
                <Text style={styles.permissionsTitle}>PERMISSIONS</Text>
                <Text style={styles.permissionsSubtitle}>
                  Choose what your child can access. You can change these anytime.
                </Text>

                {(Object.keys(DEFAULT_PERMISSIONS) as Array<keyof typeof DEFAULT_PERMISSIONS>).map((key, index, arr) => (
                  <View
                    key={key}
                    style={[
                      styles.permissionRow,
                      index === arr.length - 1 && styles.permissionRowLast,
                    ]}
                  >
                    <View style={styles.permissionText}>
                      <Text style={styles.permissionLabel}>
                        {PERMISSION_LABELS[key].label}
                      </Text>
                      <Text style={styles.permissionHint}>
                        {PERMISSION_LABELS[key].hint}
                      </Text>
                    </View>
                    <Switch
                      value={permissions[key]}
                      onValueChange={() => togglePermission(key)}
                      trackColor={{ false: 'rgba(255,255,255,0.3)', true: AppColors.blue }}
                      thumbColor={'#ffffff'}
                      ios_backgroundColor="rgba(255,255,255,0.3)"
                    />
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* hint for parent - now full width below both columns */}
          <Text style={styles.hint}>
            Your child will use their username and password to log in.
          </Text>

          <PrimaryButton
            title="REGISTER CHILD"
            onPress={handleRegisterChild}
            loading={loading}
          />

          <View style={styles.linksContainer}>
            <LinkText
              title="back"
              variant="secondary"
              onPress={() => router.back()}
            />
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
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.3,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AppColors.lilac,
    opacity: 0.5,
  },
  cont: {
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
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
    maxWidth: 800, // Increased to accommodate two columns
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
  twoColumnRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
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
  permissionsContainer: {
    borderWidth: 1.5,
    borderColor: AppColors.blue,
    borderRadius: 10,
    padding: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    height: '100%', // Makes permissions container fill the column height
  },
  permissionsTitle: {
    color: AppColors.blue,
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 4,
    opacity: 0.8,
  },
  permissionsSubtitle: {
    color: AppColors.blue,
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: 10,
    opacity: 0.5,
    marginBottom: Spacing.sm,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  permissionRowLast: {
    borderBottomWidth: 0,
  },
  permissionText: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  permissionLabel: {
    color: AppColors.blue,
    fontFamily: AppFonts.body.fontFamily,
    fontSize: 13,
  },
  permissionHint: {
    color: AppColors.blue,
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: 10,
    opacity: 0.5,
    marginTop: 2,
  },
  hint: {
    color: AppColors.blue,
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: 11,
    opacity: 0.5,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  linksContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: -20
  },
});