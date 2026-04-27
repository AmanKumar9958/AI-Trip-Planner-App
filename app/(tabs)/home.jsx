import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useCallback, useRef, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../Context/AuthContext";
import { useTabBar } from "../../Context/TabBarContext";
import { useTheme } from "../../Context/ThemeContext";
import { db } from "../../Firebase/FirebaseConfig";
import CustomAlert from "../../components/CustomAlert";
import PageTransition from "../../components/PageTransition";
import Skeleton from "../../components/Skeleton";
import themeColors from "../../lib/themeColors.json";

const popularDestinations = [
  {
    id: 1,
    name: "Santorini, Greece",
    image: {
      uri: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800&auto=format&fit=crop",
    },
  },
  {
    id: 2,
    name: "Bali, Indonesia",
    image: {
      uri: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop",
    },
  },
  {
    id: 3,
    name: "Amalfi Coast, Italy",
    image: {
      uri: "https://images.unsplash.com/photo-1612718244440-49d8fbbb7ee7?q=80&w=800&auto=format&fit=crop",
    },
  },
  {
    id: 4,
    name: "Reykjavík, Iceland",
    image: {
      uri: "https://images.unsplash.com/photo-1520769669658-f07657f5a307?q=80&w=800&auto=format&fit=crop",
    },
  },
  {
    id: 5,
    name: "Paris, France",
    image: {
      uri: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
    },
  },
  {
    id: 6,
    name: "Tokyo, Japan",
    image: {
      uri: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop",
    },
  },
  {
    id: 7,
    name: "Maldives",
    image: {
      uri: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop",
    },
  },
  {
    id: 8,
    name: "Machu Picchu, Peru",
    image: {
      uri: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=800&auto=format&fit=crop",
    },
  },
];

const Home = () => {
  const { user, logout } = useAuth();
  const { colorScheme, updateTheme } = useTheme();
  const isDark = colorScheme === "dark";
  const palette = isDark ? themeColors.dark : themeColors.light;
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
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
    updateTheme(isDark ? "light" : "dark");
  };

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setShowLogoutAlert(false);
      if (router && router.replace) {
        router.replace("/");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      setShowLogoutAlert(false);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
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
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
        <StatusBar style={isDark ? "light" : "dark"} animated={true} />
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
              <View className="w-10 h-10 rounded-full overflow-hidden bg-app-surface-alt dark:bg-app-dark-surface-alt">
                <Image
                  source={{
                    uri:
                      user?.photoURL ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  }}
                  style={{ width: "100%", height: "100%" }}
                  className="w-full h-full"
                  contentFit="cover"
                  transition={500}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme}>
              <Ionicons
                name={isDark ? "sunny" : "moon"}
                size={24}
                color={palette.text}
              />
            </TouchableOpacity>
          </View>

          {/* Greeting */}
          <Text
            className="text-3xl font-bold text-app-text dark:text-app-dark-text mb-6 leading-tight"
            numberOfLines={1}
          >
            Hello, {user?.displayName?.split(" ")[0] || "Traveler"}! Where to
            next?
          </Text>

          {/* Create New Trip Button */}
          <TouchableOpacity
            className="bg-app-primary dark:bg-app-dark-primary rounded-full py-4 px-6 flex-row items-center justify-center mb-8 shadow-sm"
            onPress={handleNavigateToExplore}
          >
            <Ionicons
              name="add"
              size={24}
              color={palette.onPrimary}
              style={{ marginRight: 8 }}
            />
            <Text
              className="text-app-on-primary dark:text-app-dark-on-primary text-xl font-bold"
              numberOfLines={1}
            >
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
                className="text-xl font-bold text-app-text dark:text-app-dark-text"
                numberOfLines={1}
              >
                My Trips
              </Text>
              <Ionicons name="arrow-forward" size={24} color={palette.text} />
            </TouchableOpacity>

            {loading ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="overflow-hidden"
              >
                {[1, 2, 3].map((item) => (
                  <View key={item} className="mr-5 w-64">
                    <Skeleton
                      width="100%"
                      height={160}
                      borderRadius={16}
                      style={{ marginBottom: 12 }}
                    />
                    <Skeleton
                      width={180}
                      height={20}
                      borderRadius={4}
                      style={{ marginBottom: 6 }}
                    />
                    <Skeleton width={120} height={14} borderRadius={4} />
                  </View>
                ))}
              </ScrollView>
            ) : userTrips.length === 0 ? (
              <View className="bg-app-surface dark:bg-app-dark-surface p-6 rounded-2xl border border-app-border dark:border-app-dark-border items-center">
                <Text className="text-app-muted-text dark:text-app-dark-muted-text text-center">
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
                      style={{ width: "100%", height: 160 }}
                      className="w-full h-40 rounded-3xl mb-3"
                      contentFit="cover"
                      transition={500}
                    />
                    <Text
                      className="text-lg font-bold text-app-text dark:text-app-dark-text"
                      numberOfLines={1}
                    >
                      {trip.userSelection?.Location || "Trip Destination"}
                    </Text>
                    <Text className="text-app-muted-text dark:text-app-dark-muted-text text-sm">
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
            <Text className="text-xl font-bold text-app-text dark:text-app-dark-text mb-4">
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
                    style={{ width: "100%", height: "100%" }}
                    className="w-full h-full"
                    contentFit="cover"
                    transition={500}
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
        <CustomAlert
          visible={showLogoutAlert}
          title="Sign Out"
          message="Are you sure you want to sign out of your account?"
          onCancel={() => setShowLogoutAlert(false)}
          onConfirm={confirmLogout}
          confirmText="Sign Out"
          icon="log-out-outline"
        />
      </SafeAreaView>
    </PageTransition>
  );
};

export default Home;
