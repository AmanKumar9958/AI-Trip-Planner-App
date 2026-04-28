import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { useTheme } from "../Context/ThemeContext";
import themeColors from "../lib/themeColors.json";

export default function Skeleton({ width, height, borderRadius = 14, style }) {
  const { colorScheme } = useTheme();
  const palette = colorScheme === "dark" ? themeColors.dark : themeColors.light;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
    return () => shimmer.stopAnimation();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 1],
  });

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius,
          backgroundColor: palette.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
});
