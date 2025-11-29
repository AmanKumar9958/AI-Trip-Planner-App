import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return(
    <>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      {/* <StatusBar translucent backgroundColor="transparent" barStyle="light-content" /> */}
    </>
  );
}
