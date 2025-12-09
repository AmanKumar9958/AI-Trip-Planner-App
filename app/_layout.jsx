import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { AuthProvider, useAuth } from "../Context/AuthContext";
import { ThemeProvider } from "../Context/ThemeContext";
import CustomSplashScreen from "../components/CustomSplashScreen";
import "../global.css";

const RootLayoutNav = () => {
  const { user, loading } = useAuth();
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
      router.replace('/index');
    }
  }, [user, loading, segments]);

  return (
    <View style={{ flex: 1 }}>
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
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}