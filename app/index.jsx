import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white h-full">
      <Image
        source={require("../assets/images/welcome.png")}
        className="w-full h-full absolute"
        contentFit="cover"
        transition={500}
      />

      <View className="flex-1 justify-end items-center pb-10 px-6 bg-black/30 h-full w-full">
        <Text
          className="text-white text-4xl font-bold text-center mb-2"
          numberOfLines={1}
        >
          Trip Genius
        </Text>
        <Text
          className="text-gray-200 text-base text-center mb-8"
          numberOfLines={1}
        >
          Discover your next adventure with AI
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/auth")}
          className="flex bg-orange-500 w-full py-4 rounded-full flex-row justify-center items-center gap-3"
        >
          <Text className="text-white text-2xl font-bold" numberOfLines={1}>
            Get Started
          </Text>
          <Ionicons name="arrow-forward-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
