import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { chatSession } from "../../AI/Modal";
import CustomAlert from "../../components/CustomAlert";
import PageTransition from "../../components/PageTransition";
import { useAuth } from "../../Context/AuthContext";
import { useTabBar } from "../../Context/TabBarContext";
import { useTheme } from "../../Context/ThemeContext";
import { db } from "../../Firebase/FirebaseConfig";
import { AI_PROMPT, SelectBudget, SelectMembers } from "../../Options/options";

export default function Explore() {
  const { theme, updateTheme } = useTheme();
  const { setIsTabBarVisible } = useTabBar();
  const { user } = useAuth();
  const router = useRouter();
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

  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [duration, setDuration] = useState(5);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [customBudget, setCustomBudget] = useState("");
  const [selectedTraveler, setSelectedTraveler] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

  const timerRef = useRef(null);
  const API_KEY = process.env.EXPO_PUBLIC_PLACE_API;

  const toggleTheme = () => {
    updateTheme(theme === "dark" ? "light" : "dark");
  };

  const fetchSuggestions = async (q) => {
    const query = q.trim();
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Check if API key is available
    if (!API_KEY) {
      console.error("Location API key is not configured");
      Alert.alert(
        "Configuration Error",
        "Location search is not configured. Please contact support or enter your destination manually.",
        [{ text: "OK" }],
      );
      return;
    }

    try {
      const url = `https://api.locationiq.com/v1/autocomplete?key=${API_KEY}&q=${encodeURIComponent(query)}&limit=5&format=json`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setSuggestions(data || []);
    } catch (error) {
      console.error("Error fetching location data:", error);
      setSuggestions([]);
      // Don't show alert for every failed search, just log it
    }
  };

  const handleInputChange = (text) => {
    setDestination(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(text), 500);
  };

  const handleSelectLocation = (location) => {
    const locationName =
      location.display_name || location.name || "Unknown Location";
    setDestination(locationName);
    setSelectedLocation(location);
    setSuggestions([]);
  };

  const handleDurationChange = (value) => {
    if (duration + value > 0) {
      setDuration(duration + value);
    }
  };

  const onGenerateTrip = async () => {
    // Validate user is logged in
    if (!user) {
      setAlertConfig({
        visible: true,
        title: "Not Logged In",
        message:
          "You must be logged in to generate a trip. Please log in and try again.",
        onCancel: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
        cancelText: "OK",
        confirmText: "", // Hide confirm button
      });
      return;
    }

    // Validate all required fields
    if (
      !destination ||
      (!selectedBudget && !customBudget) ||
      !selectedTraveler
    ) {
      setAlertConfig({
        visible: true,
        title: "Missing Information",
        message: "Please fill all the fields to generate your trip plan.",
        onCancel: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
        cancelText: "OK",
        confirmText: "", // Hide confirm button
      });
      return;
    }

    setLoading(true);

    try {
      // Check Daily Limit
      const userUsageRef = doc(db, "UserDailyUsage", user.email);
      const userUsageSnap = await getDoc(userUsageRef);
      const todayDate = new Date().toLocaleDateString();

      if (userUsageSnap.exists()) {
        const data = userUsageSnap.data();
        if (data.date === todayDate && data.count >= 1) {
          setLoading(false);
          setAlertConfig({
            visible: true,
            title: "Limit Reached",
            message:
              "Currently, you can only generate 1 trip and future updates will include generating more trips",
            onCancel: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
            cancelText: "OK",
            confirmText: "",
          });
          return;
        }
      }

      let budgetValue = selectedBudget?.budget;
      let budgetRules = "";

      if (customBudget) {
        budgetValue = `${customBudget}`;
        budgetRules = `Ensure total entire trip recommendations fit under ${customBudget}.`;
      } else {
        // Default rules for selected categories
        if (selectedBudget.budget === "Low") {
          budgetRules =
            "Ensure total entire trip recommendations fit under ₹7,000.";
        } else if (selectedBudget.budget === "Medium") {
          budgetRules =
            "Ensure total entire trip recommendations fit under ₹15,000.";
        } else if (selectedBudget.budget === "High") {
          budgetRules = "Allow spending more than ₹25,000 for entire trip.";
        }
      }

      const finalPrompt = AI_PROMPT.replace("{location}", destination)
        .replace("{totalDays}", duration)
        .replace("{traveler}", selectedTraveler.people)
        .replace("{budget}", budgetValue)
        .replace("{budgetRules}", budgetRules);

      // console.log("Sending Prompt:", finalPrompt);

      // Generate trip with AI
      const result = await chatSession.sendMessage(finalPrompt);

      if (!result || !result.response) {
        throw new Error("Invalid response from AI service");
      }

      const responseText = result.response.text();

      if (!responseText) {
        throw new Error("Empty response from AI service");
      }

      let cleanText = responseText;
      const jsonMatch =
        cleanText.match(/```json([\s\S]*?)```/) ||
        cleanText.match(/```([\s\S]*?)```/);
      if (jsonMatch) {
        cleanText = jsonMatch[1].trim();
      }

      const tripData = JSON.parse(cleanText);

      // Validate trip data has required structure
      if (!tripData || typeof tripData !== "object") {
        throw new Error("Invalid trip data format received");
      }

      // Validate user email before saving
      if (!user.email) {
        throw new Error("User email is not available");
      }

      // Save to Firebase
      const docId = Date.now().toString();
      await setDoc(doc(db, "AI Trips", docId), {
        userSelection: {
          Location: destination,
          TotalDays: duration,
          budget: budgetValue,
          TravelingWith: selectedTraveler.people,
        },
        tripData: tripData,
        userEmailID: user.email,
        id: docId,
      });

      // Update Daily Usage
      await setDoc(userUsageRef, {
        date: todayDate,
        count:
          userUsageSnap.exists() && userUsageSnap.data().date === todayDate
            ? userUsageSnap.data().count + 1
            : 1,
      });

      setLoading(false);

      // Reset form
      setSelectedLocation(null);
      setDestination("");
      setDuration(5);
      setSelectedBudget(null);
      setCustomBudget("");
      setSelectedTraveler(null);

      // Navigate to my trips page
      if (router && router.push) {
        router.push("/(tabs)/mytrip");
      }
    } catch (error) {
      console.error("Trip Generation Error:", error);
      setLoading(false);

      // Classify error and show appropriate user-friendly message
      // Prioritize specific error types for reliable detection
      let errorMessage = "Failed to generate trip. Please try again.";

      // JSON parsing errors - most reliable check
      if (error instanceof SyntaxError) {
        errorMessage =
          "Error processing trip data. Please try again with different parameters.";
      }
      // Network/fetch errors - check error name and type
      else if (error.name === "NetworkError" || error instanceof TypeError) {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      }
      // Request timeout
      else if (error.name === "AbortError" || error.name === "TimeoutError") {
        errorMessage = "Request timed out. Please try again.";
      }
      // Generic fallback - provides the default message

      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    }
  };

  return (
    <PageTransition>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme === "dark" ? "#000" : "#fff" }}
      >
        <ScrollView
          className="flex-1 px-5 pt-8"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-3xl font-bold text-black dark:text-white">
              Explore
            </Text>
            <TouchableOpacity onPress={toggleTheme}>
              <Ionicons
                name={theme === "dark" ? "sunny" : "moon"}
                size={24}
                color={theme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
          </View>

          {/* Destination */}
          <View className="mb-8 z-50">
            <Text className="text-xl font-bold text-black dark:text-white mb-3">
              Destination
            </Text>
            <View className="flex-row items-center bg-gray-100 dark:bg-gray-900 rounded-2xl p-2 border border-gray-200 dark:border-gray-800 relative">
              <Ionicons
                name="search"
                size={24}
                color="gray"
                style={{ marginRight: 10 }}
              />
              <TextInput
                placeholder="Search Destination (e.g., India, Paris)..."
                placeholderTextColor="gray"
                className="flex-1 text-black dark:text-white text-base"
                value={destination}
                onChangeText={handleInputChange}
              />
              {destination.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setDestination("");
                    setSuggestions([]);
                    setSelectedLocation(null);
                  }}
                >
                  <Ionicons name="close-circle" size={24} color="gray" />
                </TouchableOpacity>
              )}
            </View>

            {suggestions.length > 0 && (
              <View className="absolute top-20 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 max-h-60 overflow-hidden">
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.place_id}-${index}`}
                    onPress={() => handleSelectLocation(item)}
                    className="p-3 border-b border-gray-100 dark:border-gray-800 active:bg-gray-100 dark:active:bg-gray-800"
                  >
                    <Text className="text-black dark:text-white">
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedLocation && (
              <View className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <Text className="font-bold text-orange-600 dark:text-orange-400 mb-1">
                  Selected Location:
                </Text>
                <Text className="text-black dark:text-white font-medium">
                  {selectedLocation.display_name}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Lat: {selectedLocation.lat}, Lon: {selectedLocation.lon}
                </Text>
              </View>
            )}
          </View>
          {/* Duration */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-black dark:text-white mb-3">
              How many days?
            </Text>
            <View className="flex-row justify-between items-center bg-gray-100 dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
              <Text className="text-base font-medium text-black dark:text-white">
                Duration
              </Text>
              <View className="flex-row items-center bg-white dark:bg-black rounded-xl p-1">
                <TouchableOpacity
                  onPress={() => handleDurationChange(-1)}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg items-center justify-center"
                >
                  <Text className="text-xl font-bold text-black dark:text-white">
                    -
                  </Text>
                </TouchableOpacity>
                <Text className="mx-4 text-lg font-bold text-black dark:text-white w-6 text-center">
                  {duration}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDurationChange(1)}
                  className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg items-center justify-center"
                >
                  <Text className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Budget */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-black dark:text-white mb-3">
              What is your budget?
            </Text>
            <View className="flex-row justify-between">
              {SelectBudget.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedBudget(option);
                    setCustomBudget("");
                  }}
                  className={`w-[31%] p-4 rounded-2xl border items-center justify-center ${
                    selectedBudget?.budget === option.budget
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  }`}
                >
                  <View className="mb-2">
                    <Text className="text-3xl">{option.icon}</Text>
                  </View>
                  <Text
                    className={`font-bold text-center ${
                      selectedBudget?.budget === option.budget
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-black dark:text-white"
                    }`}
                  >
                    {option.budget}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mt-4">
              <Text className="text-lg font-medium text-black dark:text-white mb-2">
                Or enter a specific amount{" "}
                <Text className="text-sm font-medium text-red-500 dark:text-red-500 mb-2">
                  (Do not include travel expenses)
                </Text>
              </Text>
              <TextInput
                placeholder="Ex. 9500"
                placeholderTextColor="gray"
                keyboardType="numeric"
                className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 text-black dark:text-white border border-gray-200 dark:border-gray-800"
                value={customBudget}
                onChangeText={(text) => {
                  setCustomBudget(text);
                  setSelectedBudget(null);
                }}
              />
            </View>
          </View>

          {/* Travelers */}
          <View className="mb-24">
            <Text className="text-xl font-bold text-black dark:text-white mb-3">
              Who are you traveling with?
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {SelectMembers.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedTraveler(option)}
                  className={`w-[48%] p-4 mb-4 rounded-2xl border items-center justify-center ${
                    selectedTraveler?.people === option.people
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  }`}
                >
                  <View className="mb-2">
                    <Text className="text-3xl">{option.icon}</Text>
                  </View>
                  <Text
                    className={`font-bold text-lg ${
                      selectedTraveler?.people === option.people
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-black dark:text-white"
                    }`}
                  >
                    {option.people}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* Generate Button */}
          <View className="absolute bottom-20 left-5 right-5 mb-10">
            <TouchableOpacity
              onPress={onGenerateTrip}
              disabled={loading}
              className={`bg-orange-500 rounded-full py-4 items-center shadow-lg ${loading ? "opacity-80" : ""}`}
            >
              <View className="flex-row items-center justify-center">
                <Text
                  className="text-white text-xl font-bold mr-1"
                  numberOfLines={1}
                >
                  {loading ? "Generating Trip..." : "Generate Trip"}
                </Text>
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="sparkles" size={20} color="white" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          onCancel={alertConfig.onCancel}
          cancelText={alertConfig.cancelText}
          // Only pass onConfirm/confirmText if you need a second button.
          // In CustomAlert usage above, we're mimicking a single "OK" button using cancelText.
          // To hide the confirm button, you might need to adjust CustomAlert or pass a dummy prop if it always renders two buttons.
          // Assuming CustomAlert always renders two buttons, we'll adapt:
          // If confirmText is empty, CustomAlert currently renders it empty.
          // Ideally update CustomAlert to conditionally render buttons.
          // For now, let's use the simplest integration.
          confirmText={alertConfig.confirmText || ""}
          onConfirm={alertConfig.onConfirm}
          // Hide confirm button if text is empty (requires CustomAlert update or CSS trick)
          // For this request, checking CustomAlert implementation:
          // It renders both buttons unconditionally. I should fix CustomAlert first or adapt here.
          // I will update CustomAlert to optionally hide buttons.
        />
      </SafeAreaView>
    </PageTransition>
  );
}
