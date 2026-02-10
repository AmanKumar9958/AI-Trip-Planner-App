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
import themeColors from "../../lib/themeColors.json";
import { AI_PROMPT, SelectBudget, SelectMembers } from "../../Options/options";

export default function Explore() {
  const { colorScheme, updateTheme } = useTheme();
  const isDark = colorScheme === "dark";
  const palette = isDark ? themeColors.dark : themeColors.light;
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
  const [includeHotel, setIncludeHotel] = useState(true);
  const [includeTravelAllowance, setIncludeTravelAllowance] = useState(false);
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
    updateTheme(isDark ? "light" : "dark");
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
      const hotelRules = includeHotel
        ? "Provide at least 3 entries in HotelOptions, with realistic values."
        : "Set HotelOptions to an empty array [] and do not recommend hotels or accommodation. Assume the traveler returns home each evening.";
      const travelAllowanceRules = includeTravelAllowance
        ? "Include travel/transportation costs (getting around and any inter-city travel) in the overall budget guidance."
        : "Do not include inter-city travel costs (flights, trains, long-distance cabs) in the budget. Keep recommendations focused on on-ground expenses like tickets, food, and local transport.";

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
        .replace("{budgetRules}", budgetRules)
        .replace("{includeHotel}", includeHotel ? "Yes" : "No")
        .replace("{hotelRules}", hotelRules)
        .replace(
          "{includeTravelAllowance}",
          includeTravelAllowance ? "Yes" : "No",
        )
        .replace("{travelAllowanceRules}", travelAllowanceRules);

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
          IncludeHotel: includeHotel,
          IncludeTravelAllowance: includeTravelAllowance,
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
      setIncludeHotel(true);
      setIncludeTravelAllowance(false);

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
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
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
            <Text className="text-3xl font-bold text-app-text dark:text-app-dark-text">
              Explore
            </Text>
            <TouchableOpacity onPress={toggleTheme}>
              <Ionicons
                name={isDark ? "sunny" : "moon"}
                size={24}
                color={palette.text}
              />
            </TouchableOpacity>
          </View>

          {/* Destination */}
          <View className="mb-8 z-50">
            <Text className="text-xl font-bold text-app-text dark:text-app-dark-text mb-3">
              Destination
            </Text>
            <View className="flex-row items-center bg-app-surface-alt dark:bg-app-dark-surface-alt rounded-2xl p-2 border border-app-border dark:border-app-dark-border relative">
              <Ionicons
                name="search"
                size={24}
                color={palette.mutedText}
                style={{ marginRight: 10 }}
              />
              <TextInput
                placeholder="Search Destination (e.g., India, Paris)..."
                placeholderTextColor={palette.mutedText}
                className="flex-1 text-app-text dark:text-app-dark-text text-base"
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
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={palette.mutedText}
                  />
                </TouchableOpacity>
              )}
            </View>

            {suggestions.length > 0 && (
              <View className="absolute top-20 left-0 right-0 bg-app-surface dark:bg-app-dark-surface border border-app-border dark:border-app-dark-border rounded-xl shadow-lg z-50 max-h-60 overflow-hidden">
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.place_id}-${index}`}
                    onPress={() => handleSelectLocation(item)}
                    className="p-3 border-b border-app-border dark:border-app-dark-border active:bg-app-surface-alt dark:active:bg-app-dark-surface-alt"
                  >
                    <Text className="text-app-text dark:text-app-dark-text">
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedLocation && (
              <View className="mt-4 p-3 bg-app-surface-alt dark:bg-app-dark-surface-alt rounded-xl border border-app-border dark:border-app-dark-border">
                <Text className="font-bold text-app-primary dark:text-app-dark-primary mb-1">
                  Selected Location:
                </Text>
                <Text className="text-app-text dark:text-app-dark-text font-medium">
                  {selectedLocation.display_name}
                </Text>
                <Text className="text-xs text-app-muted-text dark:text-app-dark-muted-text mt-1">
                  Lat: {selectedLocation.lat}, Lon: {selectedLocation.lon}
                </Text>
              </View>
            )}
          </View>
          {/* Duration */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-app-text dark:text-app-dark-text mb-3">
              How many days?
            </Text>
            <View className="flex-row justify-between items-center bg-app-surface-alt dark:bg-app-dark-surface-alt rounded-2xl p-4 border border-app-border dark:border-app-dark-border">
              <Text className="text-base font-medium text-app-text dark:text-app-dark-text">
                Duration
              </Text>
              <View className="flex-row items-center bg-app-surface dark:bg-app-dark-surface rounded-xl p-1">
                <TouchableOpacity
                  onPress={() => handleDurationChange(-1)}
                  className="w-10 h-10 bg-app-surface-alt dark:bg-app-dark-surface-alt rounded-lg items-center justify-center"
                >
                  <Text className="text-xl font-bold text-app-text dark:text-app-dark-text">
                    -
                  </Text>
                </TouchableOpacity>
                <Text className="mx-4 text-lg font-bold text-app-text dark:text-app-dark-text w-6 text-center">
                  {duration}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDurationChange(1)}
                  className="w-10 h-10 bg-app-primary dark:bg-app-dark-primary rounded-lg items-center justify-center"
                >
                  <Text className="text-xl font-bold text-app-on-primary dark:text-app-dark-on-primary">
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Hotel */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-app-text dark:text-app-dark-text mb-3">
              Do you need a hotel?
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setIncludeHotel(true)}
                className={`w-[48%] p-4 rounded-2xl border items-center justify-center ${
                  includeHotel
                    ? "border-app-primary dark:border-app-dark-primary bg-app-surface-alt dark:bg-app-dark-surface-alt"
                    : "border-app-border dark:border-app-dark-border bg-app-surface dark:bg-app-dark-surface"
                }`}
              >
                <Text
                  className={`font-bold text-lg ${
                    includeHotel
                      ? "text-app-primary dark:text-app-dark-primary"
                      : "text-app-text dark:text-app-dark-text"
                  }`}
                >
                  Yes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIncludeHotel(false)}
                className={`w-[48%] p-4 rounded-2xl border items-center justify-center ${
                  !includeHotel
                    ? "border-app-primary dark:border-app-dark-primary bg-app-surface-alt dark:bg-app-dark-surface-alt"
                    : "border-app-border dark:border-app-dark-border bg-app-surface dark:bg-app-dark-surface"
                }`}
              >
                <Text
                  className={`font-bold text-lg ${
                    !includeHotel
                      ? "text-app-primary dark:text-app-dark-primary"
                      : "text-app-text dark:text-app-dark-text"
                  }`}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-app-muted-text dark:text-app-dark-muted-text mt-2">
              Choose “No” for same-city or day trips.
            </Text>
          </View>

          {/* Budget */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-app-text dark:text-app-dark-text mb-3">
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
                      ? "border-app-primary dark:border-app-dark-primary bg-app-surface-alt dark:bg-app-dark-surface-alt"
                      : "border-app-border dark:border-app-dark-border bg-app-surface dark:bg-app-dark-surface"
                  }`}
                >
                  <View className="mb-2">
                    <Text className="text-3xl">{option.icon}</Text>
                  </View>
                  <Text
                    className={`font-bold text-center ${
                      selectedBudget?.budget === option.budget
                        ? "text-app-primary dark:text-app-dark-primary"
                        : "text-app-text dark:text-app-dark-text"
                    }`}
                  >
                    {option.budget}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mt-4">
              <Text className="text-lg font-medium text-app-text dark:text-app-dark-text mb-2">
                Or enter a specific amount{" "}
                <Text className="text-sm font-medium text-app-danger dark:text-app-dark-danger mb-2">
                  (
                  {includeTravelAllowance
                    ? "Include travel expenses"
                    : "Do not include travel expenses"}
                  )
                </Text>
              </Text>
              <TextInput
                placeholder="Ex. 9500"
                placeholderTextColor={palette.mutedText}
                keyboardType="numeric"
                className="bg-app-surface-alt dark:bg-app-dark-surface-alt rounded-xl p-4 text-app-text dark:text-app-dark-text border border-app-border dark:border-app-dark-border"
                value={customBudget}
                onChangeText={(text) => {
                  setCustomBudget(text);
                  setSelectedBudget(null);
                }}
              />
            </View>
          </View>

          {/* Travel Allowance */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-app-text dark:text-app-dark-text mb-3">
              Include travel allowance?
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setIncludeTravelAllowance(true)}
                className={`w-[48%] p-4 rounded-2xl border items-center justify-center ${
                  includeTravelAllowance
                    ? "border-app-primary dark:border-app-dark-primary bg-app-surface-alt dark:bg-app-dark-surface-alt"
                    : "border-app-border dark:border-app-dark-border bg-app-surface dark:bg-app-dark-surface"
                }`}
              >
                <Text
                  className={`font-bold text-lg ${
                    includeTravelAllowance
                      ? "text-app-primary dark:text-app-dark-primary"
                      : "text-app-text dark:text-app-dark-text"
                  }`}
                >
                  Yes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIncludeTravelAllowance(false)}
                className={`w-[48%] p-4 rounded-2xl border items-center justify-center ${
                  !includeTravelAllowance
                    ? "border-app-primary dark:border-app-dark-primary bg-app-surface-alt dark:bg-app-dark-surface-alt"
                    : "border-app-border dark:border-app-dark-border bg-app-surface dark:bg-app-dark-surface"
                }`}
              >
                <Text
                  className={`font-bold text-lg ${
                    !includeTravelAllowance
                      ? "text-app-primary dark:text-app-dark-primary"
                      : "text-app-text dark:text-app-dark-text"
                  }`}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-app-muted-text dark:text-app-dark-muted-text mt-2">
              Turn on if you want travel/transport included.
            </Text>
          </View>

          {/* Travelers */}
          <View className="mb-24">
            <Text className="text-xl font-bold text-app-text dark:text-app-dark-text mb-3">
              Who are you traveling with?
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {SelectMembers.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedTraveler(option)}
                  className={`w-[48%] p-4 mb-4 rounded-2xl border items-center justify-center ${
                    selectedTraveler?.people === option.people
                      ? "border-app-primary dark:border-app-dark-primary bg-app-surface-alt dark:bg-app-dark-surface-alt"
                      : "border-app-border dark:border-app-dark-border bg-app-surface dark:bg-app-dark-surface"
                  }`}
                >
                  <View className="mb-2">
                    <Text className="text-3xl">{option.icon}</Text>
                  </View>
                  <Text
                    className={`font-bold text-lg ${
                      selectedTraveler?.people === option.people
                        ? "text-app-primary dark:text-app-dark-primary"
                        : "text-app-text dark:text-app-dark-text"
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
              className={`bg-app-primary dark:bg-app-dark-primary rounded-full py-4 items-center shadow-lg ${loading ? "opacity-80" : ""}`}
            >
              <View className="flex-row items-center justify-center">
                <Text
                  className="text-app-on-primary dark:text-app-dark-on-primary text-xl font-bold mr-1"
                  numberOfLines={1}
                >
                  {loading ? "Generating Trip..." : "Generate Trip"}
                </Text>
                {loading ? (
                  <ActivityIndicator size="small" color={palette.onPrimary} />
                ) : (
                  <Ionicons
                    name="sparkles"
                    size={20}
                    color={palette.onPrimary}
                  />
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
