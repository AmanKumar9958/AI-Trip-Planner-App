import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Linking,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../Context/ThemeContext";
import themeColors from "../lib/themeColors.json";
import Skeleton from "./Skeleton";

export default function TripDetailsModal({ trip, isVisible, onClose }) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const palette = isDark ? themeColors.dark : themeColors.light;
  const pan = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    if (isVisible) {
      pan.setValue({ x: 0, y: 0 });
    }
  }, [isVisible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: Animated.event([null, { dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          Animated.timing(pan, {
            toValue: { x: 0, y: Dimensions.get("window").height },
            duration: 200,
            useNativeDriver: false,
          }).start(onClose);
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  if (!trip) return null;

  // 1. Parse JSON if string, otherwise keep object
  let parsedData = null;
  try {
    if (typeof trip.tripData === "string") {
      parsedData = JSON.parse(trip.tripData);
    } else {
      parsedData = trip.tripData;
    }
  } catch (e) {
    console.error("Error parsing trip data", e);
  }

  // 2. FIX: Handle Double Nesting & Capitalized Keys
  // Check if there is an inner 'tripData', otherwise use the parsed data directly
  const tripPlan = parsedData?.tripData || parsedData;

  // 3. FIX: Use correct database keys (HotelOptions, Itinerary)
  const hotels = tripPlan?.HotelOptions || tripPlan?.hotels || [];
  const itinerary = tripPlan?.Itinerary || tripPlan?.itinerary || [];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < Math.floor(rating || 0) ? "star" : "star-outline"}
          size={16}
          color={palette.star}
        />,
      );
    }
    return <View className="flex-row">{stars}</View>;
  };

  const openMap = (hotel) => {
    const name = hotel.HotelName || hotel.hotel_name;
    const address = hotel.HotelAddress || hotel.hotel_address;
    const query = `${name}, ${address}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(query)}`,
      android: `geo:0,0?q=${encodeURIComponent(query)}`,
    });

    Linking.openURL(url);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <Animated.View
          style={[
            {
              transform: [
                {
                  translateY: pan.y.interpolate({
                    inputRange: [0, 1000],
                    outputRange: [0, 1000],
                    extrapolate: "clamp",
                  }),
                },
              ],
            },
            pan.getLayout(),
          ]}
          className="bg-app-surface dark:bg-app-dark-surface h-[90%] rounded-t-3xl overflow-hidden"
          paddingBottom={50}
        >
          {/* Header Image */}
          <View {...panResponder.panHandlers} className="h-60 w-full relative">
            {" "}
            <Skeleton
              width="100%"
              height="100%"
              style={{ position: "absolute" }}
            />{" "}
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop",
              }}
              style={{ width: "100%", height: "100%" }}
              className="w-full h-full"
              contentFit="cover"
              transition={500}
            />
            <View className="absolute top-2 left-0 right-0 items-center z-10">
              <View className="w-12 h-1.5 bg-white/50 rounded-full" />
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-4 right-4 bg-white/30 p-2 rounded-full backdrop-blur-md z-20"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <Text className="text-3xl font-bold text-white">
                {trip.userSelection?.Location || "Trip Details"}
              </Text>
              <Text className="text-white/90">
                {trip.userSelection?.TotalDays} Days •{" "}
                {trip.userSelection?.TravelingWith} •{" "}
                {trip.userSelection?.budget}
              </Text>
            </View>
          </View>

          <ScrollView
            className="flex-1 p-5"
            showsVerticalScrollIndicator={false}
          >
            {/* Hotels Section */}
            {hotels.length > 0 && (
              <View className="mb-6">
                <Text className="text-xl font-bold text-app-text dark:text-app-dark-text mb-4">
                  Recommended Hotels
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {hotels.map((hotel, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => openMap(hotel)}
                      className="mr-4 w-60 bg-app-surface-alt dark:bg-app-dark-surface-alt rounded-xl overflow-hidden border border-app-border dark:border-app-dark-border"
                    >
                      <View className="w-full h-32 relative">
                        <Skeleton
                          width="100%"
                          height="100%"
                          style={{ position: "absolute" }}
                        />
                        <Image
                          // Use a fallback image if specific hotel image is missing
                          source={{
                            uri:
                              hotel?.ImageUrl ||
                              "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
                          }}
                          style={{ width: "100%", height: "100%" }}
                          className="w-full h-full"
                          contentFit="cover"
                          transition={500}
                        />
                      </View>
                      <View className="p-3">
                        {/* FIX: Handle PascalCase keys often returned by AI */}
                        <Text
                          className="font-bold text-lg text-app-text dark:text-app-dark-text mb-1"
                          numberOfLines={1}
                        >
                          {hotel.HotelName || hotel.hotel_name}
                        </Text>
                        <Text
                          className="text-app-muted-text dark:text-app-dark-muted-text text-xs mb-2"
                          numberOfLines={2}
                        >
                          {hotel.HotelAddress || hotel.hotel_address}
                        </Text>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-app-primary dark:text-app-dark-primary font-bold">
                            {hotel.Price || hotel.price}
                          </Text>
                          {renderStars(hotel.Rating || hotel.rating)}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Itinerary Section */}
            {/* Logic: Handle both Array (from screenshot) and Object (Day1, Day2) structures */}
            {(Array.isArray(itinerary) ? itinerary : Object.values(itinerary))
              .length > 0 && (
              <View className="mb-2">
                <Text className="text-xl font-bold text-app-text dark:text-app-dark-text mb-4">
                  Day-wise Itinerary
                </Text>

                {/* If 'itinerary' is an array, we map using index. 
                        If it's an object with keys 'day1', 'day2', we use Object.entries. 
                        Below logic handles typical AI array responses.
                        */}
                {(Array.isArray(itinerary)
                  ? itinerary
                  : Object.values(itinerary)
                ).map((details, index) => (
                  <View
                    key={index}
                    className="mb-6 ml-4 border-l-2 border-app-primary/30 dark:border-app-dark-primary/30 pl-6 relative"
                  >
                    <View className="absolute -left-[9px] -top-1 w-4 h-4 rounded-full bg-app-primary dark:bg-app-dark-primary" />
                    <Text className="text-lg font-bold text-app-primary dark:text-app-dark-primary mb-2">
                      {details.Day?.toString().includes("Day")
                        ? details.Day
                        : `Day ${details.Day || index + 1}`}
                    </Text>

                    {/* Render Activities */}
                    <View className="mb-4 bg-app-surface-alt dark:bg-app-dark-surface-alt p-4 rounded-xl border border-app-border dark:border-app-dark-border">
                      <Text className="font-bold text-base text-app-text dark:text-app-dark-text mb-1">
                        {details.PlaceName ||
                          details.place_name ||
                          details.Activity ||
                          "Activity"}
                      </Text>
                      <Text className="text-app-muted-text dark:text-app-dark-muted-text text-sm mb-2">
                        {details.PlaceDetails ||
                          details.place_details ||
                          details.Details ||
                          details.details ||
                          details.description}
                      </Text>
                      <View className="flex-col">
                        {(details.BestTimeToVisit ||
                          details.best_time_to_visit) && (
                          <View className="flex-row items-center mb-1">
                            <Ionicons
                              name="time-outline"
                              size={16}
                              color={palette.mutedText}
                            />
                            <Text className="text-app-muted-text dark:text-app-dark-muted-text text-xs ml-2">
                              Best Time:{" "}
                              {details.BestTimeToVisit ||
                                details.best_time_to_visit}
                            </Text>
                          </View>
                        )}

                        {(details.TicketPricing || details.ticket_pricing) && (
                          <View className="flex-row items-center mb-1">
                            <Ionicons
                              name="ticket-outline"
                              size={16}
                              color={palette.mutedText}
                            />
                            <Text
                              className="text-app-muted-text dark:text-app-dark-muted-text text-xs ml-2"
                              numberOfLines={3}
                            >
                              {details.TicketPricing || details.ticket_pricing}
                            </Text>
                          </View>
                        )}

                        {(details.TravelTime ||
                          details.travel_time ||
                          details.Time ||
                          details.time) && (
                          <View className="flex-row items-center mb-1">
                            <Ionicons
                              name="navigate-circle-outline"
                              size={16}
                              color={palette.mutedText}
                            />
                            <Text className="text-app-muted-text dark:text-app-dark-muted-text text-xs ml-2">
                              {details.TravelTime ||
                                details.travel_time ||
                                details.Time ||
                                details.time}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer Button */}
          {/* <View className="absolute bottom-0 left-0 right-0 p-5 bg-app-surface dark:bg-app-dark-surface border-t border-app-border dark:border-app-dark-border">
                    <TouchableOpacity 
                        onPress={onClose}
                  className="bg-app-primary dark:bg-app-dark-primary py-4 rounded-full flex items-center justify-center"
                    >
                        <Text className="text-white font-bold text-xl" numberOfLines={1}>Close Details</Text>
                    </TouchableOpacity>
                </View> */}
        </Animated.View>
      </View>
    </Modal>
  );
}
