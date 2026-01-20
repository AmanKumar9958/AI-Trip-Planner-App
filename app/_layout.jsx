import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from "../Context/AuthContext";
import { ThemeProvider, useTheme } from "../Context/ThemeContext";
import CustomSplashScreen from "../components/CustomSplashScreen";
import ErrorBoundary from "../components/ErrorBoundary";
import "../global.css";

const RootLayoutNav = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const [videoFinished, setVideoFinished] = useState(false);

  const isAppReady = !loading && videoFinished;

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (user && !inTabsGroup) {
      router.replace('/(tabs)/home');
    } else if (!user && inTabsGroup) {
      router.replace('/');
    }
  }, [user, loading, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000' : '#fff' }}>
      <Stack screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200,
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      
      {!isAppReady && (
        <CustomSplashScreen onFinish={() => setVideoFinished(true)} />
      )}
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}