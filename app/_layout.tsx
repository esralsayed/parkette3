import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useSessionStore } from './services/userSession';

export default function RootLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);

  const [fontsLoaded] = useFonts({
    'Game Paused DEMO': require('../assets/fonts/Game Paused DEMO.ttf'),
    PixelPurl: require('../assets/fonts/PixelPurl.ttf'),
    yoster: require('../assets/fonts/yoster.ttf'),
  });

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.log('Session load error:', err);
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();
  }, []);

  if (!fontsLoaded || !isReady) return null;

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />

        <Stack.Screen name="dashboard" />
        <Stack.Screen name="game" />
        <Stack.Screen name="community" />
        <Stack.Screen name="diary" />
        <Stack.Screen name="chapters" />

        <Stack.Screen name="register-child" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}