// app/(protected)/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { useSessionStore } from '../community/services/userSession';

export default function ProtectedLayout() {
  const user = useSessionStore((s) => s.user);

  // Not logged in → back to welcome
  if (!user) {
    return <Redirect href="/auth/welcome" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="game" />
      <Stack.Screen name="community" />
      <Stack.Screen name="diary" />
      <Stack.Screen name="chapters" />
      <Stack.Screen name="register-child" />
    </Stack>
  );
}