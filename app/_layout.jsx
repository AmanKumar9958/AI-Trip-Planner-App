import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../Context/AuthContext";
import "../global.css";

const RootLayoutNav = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace('/index');
    } else {
      router.replace('/auth');
    }
  }, [user, loading]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}