import { ResizeMode, Video } from "expo-av";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function CustomSplashScreen({ onFinish }) {
  const [isReady, setReady] = useState(false);
  const [hasMinTimeElapsed, setHasMinTimeElapsed] = useState(false);

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
      style={[StyleSheet.absoluteFill, { zIndex: 9999 }]}
      className="bg-[#ededed] flex-1 justify-center items-center"
    >
      <Video
        source={require("../assets/videos/Trip_Genius_Loading.mp4")}
        style={{ width: "100%", height: "60%" }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={hasMinTimeElapsed}
        rate={2.5}
        isLooping={false}
        onPlaybackStatusUpdate={handleVideoStatusUpdate}
        onReadyForDisplay={() => setReady(true)}
      />

      {(!isReady || !hasMinTimeElapsed) && (
        <Image
          source={require("../assets/images/splash.png")}
          style={[StyleSheet.absoluteFill, { backgroundColor: "white" }]}
          contentFit="contain"
          transition={500}
        />
      )}
    </View>
  );
}
