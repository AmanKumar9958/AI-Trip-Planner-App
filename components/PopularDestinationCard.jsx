import { Image } from "expo-image";
import { Text, View } from "react-native";

export default function PopularDestinationCard({ item }) {
  return (
    <View className="mr-4 relative rounded-2xl overflow-hidden w-40 h-60">
      <Image
        source={item.image}
        style={{ width: "100%", height: "100%" }}
        className="w-full h-full absolute"
        contentFit="cover"
        transition={500}
      />
      <View className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
        <Text className="text-white text-lg font-bold">{item.name}</Text>
      </View>
    </View>
  );
}
