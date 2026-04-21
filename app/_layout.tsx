import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';


export const unstable_settings = {
  // anchor: '(tabs)',
  initialRouteName: 'welcome',
};

export default function RootLayout() {

  const [fontsLoaded] = useFonts({
    'Game Paused DEMO': require('../assets/fonts/Game Paused DEMO.ttf'),
    'PixelPurl': require('../assets/fonts/PixelPurl.ttf'),
    'yoster': require('../assets/fonts/yoster.ttf'),
  });

  if (!fontsLoaded) {
    return null; // or a loading screen
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack initialRouteName="welcome" screenOptions={{headerShown:false}}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
        <Stack.Screen name="register-child" options={{ title: 'Register Child' }} />
        <Stack.Screen name="game" options={{ title: 'Game' }} />
        <Stack.Screen name="community" options={{ title: 'Community' }} />
        <Stack.Screen name="diary" options={{ title: 'Diary' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="chapters" options={{ title: 'Chapters' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
