// app/(auth)/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { useSessionStore } from '../community/services/userSession';

export default function AuthLayout() {
  const user = useSessionStore((s) => s.user);

  // Already logged in → skip to dashboard
  if (user) {
    return <Redirect href="/protected/dashboard" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}