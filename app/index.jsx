import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Animated, Dimensions, StatusBar, Text, TouchableOpacity, View } from "react-native";



const carouselData = [
  {
    image: require("../assets/images/onboard_1.png"),
    title: "Let's discover & enjoy the world!!",
    subtitle:
      "Engage efficient strategies for versatile benefits. Redefine the standard.",
  },
  {
    image: require("../assets/images/onboard_2.png"),
    title: "Plan smarter, travel better!",
    subtitle:
      "Leverage AI to create personalized itineraries and make every trip unforgettable.",
  },
  {
    image: require("../assets/images/onboard_3.png"),
    title: "Save and share your adventures!",
    subtitle:
      "Keep track of your journeys and inspire others with your travel stories.",
  },
];

const { height } = Dimensions.get("window");


const Index = () => {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));

  // Fade effect when changing carousel
  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        setCurrent((prev) => (prev + 1) % carouselData.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [fadeAnim]);

  return (
    <View className="flex-1 bg-white justify-center items-center px-4">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Carousel - covers half screen */}
      <View style={{ height: height * 0.5 }} className="w-full items-center justify-center mt-8">
        <Animated.Image
          source={carouselData[current].image}
          className="w-48 h-40 mb-6"
          resizeMode="contain"
          style={{ opacity: fadeAnim }}
        />
      </View>
      {/* Dots */}
      <View className="flex-row justify-center items-center mb-6">
        {carouselData.map((_, idx) => (
          <View
            key={idx}
            className={`w-2 h-2 rounded-full mx-1 ${current === idx ? "bg-blue-400" : "bg-blue-200"}`}
          />
        ))}
      </View>
      {/* Title */}
      <Text className="text-black text-3xl font-bold text-center mb-2">
        {carouselData[current].title}
      </Text>
      {/* Subtitle */}
      <Text className="text-gray-500 text-center mb-8 px-2 text-md" numberOfLines={2}>
        {carouselData[current].subtitle}
      </Text>
      {/* Continue Button */}
      <TouchableOpacity
        className="bg-teal-400 rounded-lg py-3 w-full mb-4"
        onPress={() => router.push("/auth")}
      >
        <Text className="text-white font-semibold text-center text-2xl">Continue</Text>
      </TouchableOpacity>
      {/* Skip for now */}
      <TouchableOpacity onPress={() => {}}>
        <Text className="text-gray-400 text-center text-base mb-4">Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Index;