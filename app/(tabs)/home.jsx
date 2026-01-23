import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useCallback, useRef, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../Context/AuthContext";
import { useTabBar } from "../../Context/TabBarContext";
import { useTheme } from "../../Context/ThemeContext";
import { db } from "../../Firebase/FirebaseConfig";
import PageTransition from "../../components/PageTransition";

const popularDestinations = [
  {
    id: 1,
    name: "Santorini, Greece",
    image: {
      uri: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  },
  {
    id: 2,
    name: "Bali, Indonesia",
    image: {
      uri: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop",
    },
  },
  {
    id: 3,
    name: "Amalfi Coast, Italy",
    image: {
      uri: "https://images.unsplash.com/photo-1729854776205-38b5fc6cd0b9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  },
  {
    id: 4,
    name: "Reykjavík, Iceland",
    image: {
      uri: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1000&auto=format&fit=crop",
    },
  },
];

const Home = () => {
  const { user, logout } = useAuth();
  const { theme, updateTheme } = useTheme();
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setIsTabBarVisible } = useTabBar();
  const lastContentOffset = useRef(0);

  const onScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (currentOffset > lastContentOffset.current && currentOffset > 20) {
      setIsTabBarVisible(false);
    } else if (currentOffset < lastContentOffset.current) {
      setIsTabBarVisible(true);
    }
    lastContentOffset.current = currentOffset;
  };

  const GetMyTrips = async () => {
    setLoading(true);
    setUserTrips([]);

    // Validate user and user.email exist
    if (!user || !user.email) {
      console.warn("Cannot fetch trips: User or user email is not available");
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "AI Trips"),
        where("userEmailID", "==", user.email),
      );
      const querySnapshot = await getDocs(q);

      const trips = [];
      querySnapshot.forEach((doc) => {
        trips.push({ id: doc.id, ...doc.data() });
      });
      setUserTrips(trips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      // Don't show alert for fetch errors, just log them
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user) {
        GetMyTrips();
      }
    }, [user]),
  );

  const toggleTheme = () => {
    updateTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await logout();
            if (router && router.replace) {
              router.replace("/");
            }
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleNavigateToExplore = () => {
    try {
      if (!router || !router.push) {
        console.error("Router is not available");
        return;
      }
      router.push("/(tabs)/generate");
    } catch (error) {
      console.error("Error navigating to explore:", error);
      Alert.alert("Error", "Failed to navigate. Please try again.");
    }
  };

  const handleNavigateToMyTrip = () => {
    try {
      if (!router || !router.push) {
        console.error("Router is not available");
        return;
      }
      router.push("/(tabs)/mytrip");
    } catch (error) {
      console.error("Error navigating to mytrip:", error);
      Alert.alert("Error", "Failed to navigate. Please try again.");
    }
  };

  return (
    <PageTransition>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme === "dark" ? "#000" : "#fff" }}
      >
        <StatusBar
          style={theme === "dark" ? "light" : "dark"}
          animated={true}
        />
        <ScrollView
          className="flex-1 px-5 pt-7"
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={handleLogout}>
              <View className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                <Image
                  source={{
                    uri:
                      user?.photoURL ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  }}
                  className="w-full h-full"
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme}>
              <Ionicons
                name={theme === "dark" ? "sunny" : "moon"}
                size={24}
                color={theme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
          </View>

          {/* Greeting */}
          <Text
            className="text-3xl font-bold text-black dark:text-white mb-6 leading-tight"
            numberOfLines={1}
          >
            Hello, {user?.displayName?.split(" ")[0] || "Traveler"}! Where to
            next?
          </Text>

          {/* Create New Trip Button */}
          <TouchableOpacity
            className="bg-orange-500 rounded-full py-4 px-6 flex-row items-center justify-center mb-8 shadow-sm"
            onPress={handleNavigateToExplore}
          >
            <Ionicons
              name="add"
              size={24}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text className="text-white text-xl font-bold" numberOfLines={1}>
              Create New Trip
            </Text>
          </TouchableOpacity>

          {/* My Trips Section */}
          <View className="mb-8">
            <TouchableOpacity
              className="flex-row justify-between items-center mb-4"
              onPress={handleNavigateToMyTrip}
            >
              <Text
                className="text-xl font-bold text-black dark:text-white"
                numberOfLines={1}
              >
                My Trips
              </Text>
              <Ionicons
                name="arrow-forward"
                size={24}
                color={theme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>

            {userTrips.length === 0 ? (
              <View className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 items-center">
                <Text className="text-gray-500 dark:text-gray-400 text-center">
                  No trips planned yet
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="overflow-hidden"
              >
                {userTrips.slice(0, 3).map((trip) => (
                  <View key={trip.id} className="mr-5 w-64">
                    <Image
                      source={{
                        uri: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop",
                      }}
                      className="w-full h-40 rounded-2xl mb-3"
                      resizeMode="cover"
                    />
                    <Text
                      className="text-lg font-bold text-black dark:text-white"
                      numberOfLines={1}
                    >
                      {trip.userSelection?.Location || "Trip Destination"}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      {trip.userSelection?.TotalDays
                        ? ` • ${trip.userSelection.TotalDays} Days`
                        : "Date TBD"}
                      {trip.userSelection?.budget
                        ? ` • ${trip.userSelection.budget} Budget`
                        : "Date TBD"}
                      {trip.userSelection?.TravelingWith
                        ? ` • ${trip.userSelection.TravelingWith}`
                        : ""}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Popular Destinations Section */}
          <View className="mb-24">
            <Text className="text-xl font-bold text-black dark:text-white mb-4">
              Popular Destinations
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {popularDestinations.map((item) => (
                <View
                  key={item.id}
                  className="w-[48%] mb-4 h-64 rounded-3xl overflow-hidden relative"
                >
                  <Image
                    source={item.image}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-0 left-0 right-0 p-4 bg-black/20">
                    <Text className="text-white font-bold text-lg shadow-sm">
                      {item.name}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </PageTransition>
  );
};

export default Home;
