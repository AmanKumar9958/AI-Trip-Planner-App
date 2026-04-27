import { ResizeMode, Video } from "expo-av";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Appearance, StyleSheet, View } from "react-native";
import themeColors from "../lib/themeColors.json";

export default function CustomSplashScreen({ onFinish }) {
  const [isReady, setReady] = useState(false);
  const [hasMinTimeElapsed, setHasMinTimeElapsed] = useState(false);
  const scheme =
    Appearance.getColorScheme() === "dark"
      ? themeColors.dark
      : themeColors.light;

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMinTimeElapsed(true);
    }, 500); // 0.5s minimum for image

    return () => clearTimeout(timer);
  }, []);

  const handleVideoStatusUpdate = (playbackStatus) => {
    if (playbackStatus.didJustFinish) {
      onFinish();
    }
  };

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { zIndex: 9999, backgroundColor: scheme.bg },
      ]}
      className="flex-1 justify-center items-center"
    >
      <Video
        source={require("../assets/videos/Trip_Genius_Loading.mp4")}
        style={{ width: "100%", height: "100%" }}
        resizeMode={ResizeMode.COVER}
        shouldPlay={hasMinTimeElapsed}
        rate={2.5}
        isLooping={false}
        onPlaybackStatusUpdate={handleVideoStatusUpdate}
        onReadyForDisplay={() => setReady(true)}
      />

      {(!isReady || !hasMinTimeElapsed) && (
        <Image
          source={require("../assets/images/splash.png")}
          style={[StyleSheet.absoluteFill, { backgroundColor: scheme.surface }]}
          contentFit="contain"
          transition={500}
        />
      )}
    </View>
  );
}
