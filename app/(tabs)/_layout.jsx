import { Ionicons } from "@expo/vector-icons";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import ErrorBoundary from "../../components/ErrorBoundary";
import { TabBarProvider, useTabBar } from "../../Context/TabBarContext";
import { useTheme } from "../../Context/ThemeContext";
import themeColors from "../../lib/themeColors.json";

const CustomTabBar = (props) => {
  const { isTabBarVisible } = useTabBar();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isTabBarVisible ? 0 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isTabBarVisible]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        transform: [{ translateY }],
        zIndex: 100,
        elevation: 5,
      }}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
};

function TabLayoutContent() {
  const { colorScheme } = useTheme();
  const palette = colorScheme === "dark" ? themeColors.dark : themeColors.light;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.tabInactive,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
        sceneStyle: {
          backgroundColor: palette.bg,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          tabBarLabel: "Generate",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mytrip"
        options={{
          tabBarLabel: "My Trips",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="airplane" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <ErrorBoundary>
      <TabBarProvider>
        <TabLayoutContent />
      </TabBarProvider>
    </ErrorBoundary>
  );
}
