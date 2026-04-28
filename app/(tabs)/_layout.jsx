import { Ionicons } from "@expo/vector-icons";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import ErrorBoundary from "../../components/ErrorBoundary";
import { TabBarProvider, useTabBar } from "../../Context/TabBarContext";
import { useTheme } from "../../Context/ThemeContext";
import themeColors from "../../lib/themeColors.json";

const CustomTabBar = (props) => {
  const { isTabBarVisible } = useTabBar();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isTabBarVisible ? 0 : 120,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isTabBarVisible]);

  return (
    <Animated.View
      style={[
        styles.tabBarWrapper,
        { transform: [{ translateY }] },
      ]}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
};

function TabLayoutContent() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const palette = isDark ? themeColors.dark : themeColors.light;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? "#FF8E8E" : "#FF6B6B",
        tabBarInactiveTintColor: palette.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: isDark ? "#251C50" : "#FFFFFF",
          borderTopWidth: 0,
          borderRadius: 28,
          borderWidth: 2.5,
          borderColor: isDark ? "#3D2E7A" : "#FFD4B8",
          marginHorizontal: 16,
          marginBottom: 20,
          height: 68,
          paddingBottom: 6,
          paddingTop: 6,
          shadowColor: "#2D1B69",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: 4,
        },
        sceneStyle: {
          backgroundColor: isDark ? "#1A1035" : "#FFF9F0",
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
          tabBarLabel: "Explore",
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

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 5,
  },
});

export default function TabLayout() {
  return (
    <ErrorBoundary>
      <TabBarProvider>
        <TabLayoutContent />
      </TabBarProvider>
    </ErrorBoundary>
  );
}
