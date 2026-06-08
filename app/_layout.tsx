import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useSessionStore as useCommunity } from './community/hooks/sessionStore';
import { useSessionStore } from './community/services/userSession';
import { useSessionInvite } from './community/services/useSessionInvites';
import { getSocket, useSocket } from './community/services/useSocket';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);

  const session = useCommunity((s) => s.session);

  const { isRegistered } = useSocket(user?.id ?? null);
  useSessionInvite(user?.id ?? null);

  const [fontsLoaded] = useFonts({
    'Game Paused DEMO': require('../assets/fonts/Game Paused DEMO.ttf'),
    PixelPurl: require('../assets/fonts/PixelPurl.ttf'),
    yoster: require('../assets/fonts/yoster.ttf'),
  });

  // =========================
  // RESTORE USER
  // =========================

  const setHydrated = useSessionStore((s) => s.setHydrated); // ← add selector

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.log('User load error:', err);
      } finally {
        setIsReady(true);
        setHydrated(true); // ← add this

      }
    };

    bootstrap();
  }, []);

  // =========================
  // RESTORE SESSION
  // =========================
  useEffect(() => {
    const restoreSession = async () => {
  try {
    const stored = await AsyncStorage.getItem('session');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const sessionId = parsed?._id;
    if (!sessionId) return;                              // guard

    await useCommunity.getState().hydrateSession(sessionId);
  } catch (err) {
    console.log('Session restore error:', err);
    await AsyncStorage.removeItem('session');            // clear corrupt data
  }
};

    restoreSession();
  }, []);

  // =========================
  // PERSIST SESSION CHANGES
  // =========================
  useEffect(() => {
    if (!session?._id) return;

    AsyncStorage.setItem('session', JSON.stringify(session));
  }, [session?._id]);

  // =========================
  // SOCKET REGISTER + JOIN SESSION
  // =========================
  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();

    const registerAndJoin = () => {
      socket.emit('register', user.id);

      const currentSession = useCommunity.getState().session;

      if (currentSession?._id) {
        socket.emit('join_session', currentSession._id);
      }
    };

    if (socket.connected) {
      registerAndJoin();
    } else {
      socket.on('connect', registerAndJoin);
      socket.connect();
    }

    return () => {
      socket.off('connect', registerAndJoin);
    };
  }, [user?.id, session?._id]);

if (!fontsLoaded || !isReady || (user?.id && !isRegistered)) return null;

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(protected)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}