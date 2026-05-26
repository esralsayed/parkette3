import { AppColors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          router.replace('/protected/dashboard');
        } else {
          router.replace('/auth/welcome');
        }
      } catch {
        router.replace('/auth/welcome');
      }
    };
    checkAuth();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColors.lilac }}>
      <ActivityIndicator size="large" color={AppColors.blue} />
    </View>
  );
}