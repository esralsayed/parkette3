import { AppColors, AppFonts, AppFontSizes, Spacing } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import PrimaryButton from '../components/style/buttonHovered';

const API_URL ='http://localhost:5000/api/auth';

export default function VerifyEmail() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const inputs = useRef<(TextInput | null)[]>([]);

  // Load user info and trigger first OTP send on mount
  useEffect(() => {
    const init = async () => {
        const userId = await AsyncStorage.getItem('pendingUserId');
    const email = await AsyncStorage.getItem('pendingUserEmail');
      
    if (!userId || !email) return router.push('/auth/signup');

    setUserEmail(email);
    setUserId(userId);
      await sendOTP(userId);
    };
    init();
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const sendOTP = async (id: string) => {
    try {
      await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      });
    } catch {
      Alert.alert('Error', 'Could not send verification email.');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    await sendOTP(userId);
    Alert.alert('Sent!', 'A new code has been sent to your email.');
  };

  // Handle each digit input
  const handleChange = (val: string, index: number) => {
    // Only allow digits
    if (!/^\d*$/.test(val)) return;

    const updated = [...code];
    updated[index] = val;
    setCode(updated);

    // Auto-advance to next box
    if (val && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Go back on backspace if box is empty
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      Alert.alert('Error', 'Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: fullCode }),
      });
      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.removeItem('pendingUserId');
        await AsyncStorage.removeItem('pendingUserEmail');
        router.push('/protected/register-child');
      } else {
        Alert.alert('Error', data.message || 'Invalid code');
        // Clear boxes on failure
        setCode(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/images/chapters/Cat.png')}
          style={styles.catImage}
        />
        <Text style={[AppFonts.header, styles.headerTitle]}>Check your email!</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cornerTL} />
        <View style={styles.cornerBR} />

        <Text style={styles.instructions}>
          We sent a 6-digit code to
        </Text>
        <Text style={styles.emailText}>{userEmail}</Text>
        <Text style={styles.subInstructions}>
          Enter it below to verify your account.
        </Text>

        {/* OTP boxes */}
        <View style={styles.otpRow}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputs.current[index] = ref;
              }}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : null,
              ]}
              value={digit}
              onChangeText={val => handleChange(val, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        <PrimaryButton
          title="VERIFY"
          onPress={handleVerify}
          loading={loading}
        />

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendPrompt}>Didn't get it? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0}>
            <Text style={[
              styles.resendLink,
              resendCooldown > 0 && styles.resendDisabled,
            ]}>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Wrong email escape hatch */}
        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
          <Text style={styles.wrongEmail}>Wrong email? Go back</Text>
        </TouchableOpacity>
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
    marginBottom: Spacing.md,
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
    alignItems: 'center',
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
  instructions: {
    color: AppColors.blue,
    fontFamily: AppFonts.body.fontFamily,
    fontSize: AppFontSizes.body,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  emailText: {
    color: AppColors.blue,
    fontFamily: AppFonts.subhead.fontFamily,
    fontSize: AppFontSizes.body,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 4,
  },
  subInstructions: {
    color: AppColors.blue,
    fontFamily: AppFonts.body.fontFamily,
    fontSize: AppFontSizes.bodySmall,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  otpRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  otpBox: {
    width: 48,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: AppColors.blue,
    borderRadius: 8,
    fontSize: AppFontSizes.title,
    color: AppColors.blue,
    fontFamily: AppFonts.subhead.fontFamily,
  },
  otpBoxFilled: {
    backgroundColor: '#ffffff',
    borderColor: '#4a6adc',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  resendPrompt: {
    color: AppColors.blue,
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: 13,
    opacity: 0.6,
  },
  resendLink: {
    color: AppColors.blue,
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  resendDisabled: {
    opacity: 0.4,
    textDecorationLine: 'none',
  },
  wrongEmail: {
    color: AppColors.blue,
    fontFamily: AppFonts.bodySmall.fontFamily,
    fontSize: 12,
    opacity: 0.45,
    textDecorationLine: 'underline',
    marginTop: Spacing.md,
  },
});