import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
  const { setIsTabBarVisible } = useTabBar();
  const { user } = useAuth();
  const router = useRouter();
  const lastContentOffset = useRef(0);

  const bg = isDark ? "#1A1035" : "#FFF9F0";
  const surface = isDark ? "#251C50" : "#FFFFFF";
  const surfaceAlt = isDark ? "#2E2460" : "#FFF3E0";
  const border = isDark ? "#3D2E7A" : "#FFD4B8";
  const textColor = isDark ? "#F0EAFF" : "#2D1B69";
  const mutedColor = "#9B8BB4";
  const primary = isDark ? "#FF8E8E" : "#FF6B6B";
  const secondary = isDark ? "#6EDDD5" : "#4ECDC4";

  const onScroll = (event) => {
    const cur = event.nativeEvent.contentOffset.y;
    if (cur > lastContentOffset.current && cur > 20) setIsTabBarVisible(false);
    else if (cur < lastContentOffset.current) setIsTabBarVisible(true);
    lastContentOffset.current = cur;
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
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: "", message: "", buttons: [] });
  const timerRef = useRef(null);
  const API_KEY = process.env.EXPO_PUBLIC_PLACE_API;

  const fetchSuggestions = async (q) => {
    const query = q.trim();
    if (!query || query.length < 2) { setSuggestions([]); return; }
    if (!API_KEY) { Alert.alert("Config Error", "Location search not configured."); return; }
    try {
      const url = `https://api.locationiq.com/v1/autocomplete?key=${API_KEY}&q=${encodeURIComponent(query)}&limit=5&format=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSuggestions(data || []);
    } catch { setSuggestions([]); }
  };

  const handleInputChange = (text) => {
    setDestination(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(text), 500);
  };

  const handleSelectLocation = (location) => {
    setDestination(location.display_name || location.name || "Unknown");
    setSelectedLocation(location);
    setSuggestions([]);
  };

  const handleDurationChange = (v) => { if (duration + v > 0) setDuration(duration + v); };

  const onGenerateTrip = async () => {
    if (!user) {
      setAlertConfig({ visible: true, title: "Not Logged In", message: "Please log in first.", onCancel: () => setAlertConfig(p => ({ ...p, visible: false })), cancelText: "OK", confirmText: "" });
      return;
    }
    if (!destination || (!selectedBudget && !customBudget) || !selectedTraveler) {
      setAlertConfig({ visible: true, title: "Missing Info", message: "Please fill all fields.", onCancel: () => setAlertConfig(p => ({ ...p, visible: false })), cancelText: "OK", confirmText: "" });
      return;
    }
    setLoading(true);
    try {
      const userUsageRef = doc(db, "UserDailyUsage", user.email);
      const userUsageSnap = await getDoc(userUsageRef);
      const todayDate = new Date().toLocaleDateString();
      if (userUsageSnap.exists()) {
        const data = userUsageSnap.data();
        if (data.date === todayDate && data.count >= 1) {
          setLoading(false);
          setAlertConfig({ visible: true, title: "Limit Reached", message: "You can generate 1 trip per day. More coming soon!", onCancel: () => setAlertConfig(p => ({ ...p, visible: false })), cancelText: "OK", confirmText: "" });
          return;
        }
      }
      let budgetValue = selectedBudget?.budget;
      let budgetRules = "";
      const hotelRules = includeHotel ? "Provide at least 3 entries in HotelOptions." : "Set HotelOptions to [].";
      const travelAllowanceRules = includeTravelAllowance ? "Include travel/transport costs." : "Do not include inter-city travel costs.";
      if (customBudget) { budgetValue = customBudget; budgetRules = `Keep under ${customBudget}.`; }
      else if (selectedBudget?.budget === "Low") budgetRules = "Keep under ₹7,000.";
      else if (selectedBudget?.budget === "Medium") budgetRules = "Keep under ₹15,000.";
      else if (selectedBudget?.budget === "High") budgetRules = "Allow over ₹25,000.";
      const finalPrompt = AI_PROMPT
        .replace("{location}", destination).replace("{totalDays}", duration)
        .replace("{traveler}", selectedTraveler.people).replace("{budget}", budgetValue)
        .replace("{budgetRules}", budgetRules).replace("{includeHotel}", includeHotel ? "Yes" : "No")
        .replace("{hotelRules}", hotelRules).replace("{includeTravelAllowance}", includeTravelAllowance ? "Yes" : "No")
        .replace("{travelAllowanceRules}", travelAllowanceRules);
      const result = await chatSession.sendMessage(finalPrompt);
      if (!result?.response) throw new Error("Invalid AI response");
      const responseText = result.response.text();
      if (!responseText) throw new Error("Empty AI response");
      let cleanText = responseText;
      const jsonMatch = cleanText.match(/```json([\s\S]*?)```/) || cleanText.match(/```([\s\S]*?)```/);
      if (jsonMatch) cleanText = jsonMatch[1].trim();
      const tripData = JSON.parse(cleanText);
      if (!tripData || typeof tripData !== "object") throw new Error("Invalid trip data");
      if (!user.email) throw new Error("No user email");
      const docId = Date.now().toString();
      await setDoc(doc(db, "AI Trips", docId), { userSelection: { Location: destination, TotalDays: duration, budget: budgetValue, TravelingWith: selectedTraveler.people, IncludeHotel: includeHotel, IncludeTravelAllowance: includeTravelAllowance }, tripData, userEmailID: user.email, id: docId });
      await setDoc(userUsageRef, { date: todayDate, count: (userUsageSnap.exists() && userUsageSnap.data().date === todayDate) ? userUsageSnap.data().count + 1 : 1 });
      setLoading(false);
      setSelectedLocation(null); setDestination(""); setDuration(5);
      setSelectedBudget(null); setCustomBudget(""); setSelectedTraveler(null);
      setIncludeHotel(true); setIncludeTravelAllowance(false);
      router.push("/(tabs)/mytrip");
    } catch (error) {
      setLoading(false);
      let msg = "Failed to generate trip. Please try again.";
      if (error instanceof SyntaxError) msg = "Error processing trip data. Try different parameters.";
      else if (error.name === "NetworkError" || error instanceof TypeError) msg = "Network error. Check your connection.";
      Alert.alert("Error", msg, [{ text: "OK" }]);
    }
  };

  const isSelected = (check, value) => check === value;

  return (
    <PageTransition>
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content} onScroll={onScroll}
          scrollEventThrottle={16} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: textColor }]}>Plan Your Trip ✈️</Text>
              <Text style={[styles.headerSub, { color: mutedColor }]}>Let AI craft your perfect journey</Text>
            </View>
            <TouchableOpacity onPress={() => updateTheme(isDark ? "light" : "dark")}
              style={[styles.iconBtn, { backgroundColor: surfaceAlt, borderColor: border }]}>
              <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={primary} />
            </TouchableOpacity>
          </View>

          {/* Destination */}
          <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>📍</Text>
              <Text style={[styles.cardTitle, { color: textColor }]}>Where to?</Text>
            </View>
            <View style={[styles.inputRow, { backgroundColor: surfaceAlt, borderColor: border }]}>
              <Ionicons name="search" size={20} color={mutedColor} style={{ marginRight: 8 }} />
              <TextInput placeholder="Search destination (e.g., Paris, Bali)..."
                placeholderTextColor={mutedColor} style={[styles.input, { color: textColor }]}
                value={destination} onChangeText={handleInputChange} />
              {destination.length > 0 && (
                <TouchableOpacity onPress={() => { setDestination(""); setSuggestions([]); setSelectedLocation(null); }}>
                  <Ionicons name="close-circle" size={20} color={mutedColor} />
                </TouchableOpacity>
              )}
            </View>
            {suggestions.length > 0 && (
              <View style={[styles.dropdown, { backgroundColor: surface, borderColor: border }]}>
                {suggestions.map((item, index) => (
                  <TouchableOpacity key={`${item.place_id}-${index}`} onPress={() => handleSelectLocation(item)}
                    style={[styles.suggestionItem, { borderBottomColor: border }]}>
                    <Ionicons name="location-outline" size={16} color={primary} style={{ marginRight: 8 }} />
                    <Text style={[styles.suggestionText, { color: textColor }]} numberOfLines={2}>{item.display_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {selectedLocation && (
              <View style={[styles.selectedChip, { backgroundColor: surfaceAlt, borderColor: primary }]}>
                <Text style={styles.selectedChipEmoji}>✅</Text>
                <Text style={[styles.selectedChipText, { color: textColor }]} numberOfLines={2}>{selectedLocation.display_name}</Text>
              </View>
            )}
          </View>

          {/* Duration */}
          <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>📅</Text>
              <Text style={[styles.cardTitle, { color: textColor }]}>How many days?</Text>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => handleDurationChange(-1)}
                style={[styles.stepBtn, { backgroundColor: surfaceAlt, borderColor: border }]}>
                <Text style={[styles.stepBtnText, { color: textColor }]}>−</Text>
              </TouchableOpacity>
              <View style={[styles.stepCount, { backgroundColor: surfaceAlt, borderColor: primary }]}>
                <Text style={[styles.stepCountText, { color: primary }]}>{duration}</Text>
                <Text style={[styles.stepCountSub, { color: mutedColor }]}>days</Text>
              </View>
              <TouchableOpacity onPress={() => handleDurationChange(1)}
                style={[styles.stepBtnPrimary, { backgroundColor: primary, borderColor: isDark ? "#FF6060" : "#FF4040" }]}>
                <Text style={styles.stepBtnPrimaryText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hotel */}
          <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>🏨</Text>
              <Text style={[styles.cardTitle, { color: textColor }]}>Need a hotel?</Text>
            </View>
            <View style={styles.toggleRow}>
              {[true, false].map((val) => (
                <TouchableOpacity key={String(val)} onPress={() => setIncludeHotel(val)}
                  style={[styles.toggleChip, includeHotel === val ? [styles.toggleChipActive, { backgroundColor: primary, borderColor: isDark ? "#FF6060" : "#FF4040" }] : { backgroundColor: surfaceAlt, borderColor: border }]}>
                  <Text style={[styles.toggleChipText, { color: includeHotel === val ? "#FFF" : textColor }]}>
                    {val ? "Yes 🏨" : "No 🏠"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.hintText, { color: mutedColor }]}>Choose "No" for day trips or same-city adventures.</Text>
          </View>

          {/* Budget */}
          <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>💰</Text>
              <Text style={[styles.cardTitle, { color: textColor }]}>What's your budget?</Text>
            </View>
            <View style={styles.budgetRow}>
              {SelectBudget.map((option) => (
                <TouchableOpacity key={option.id} onPress={() => { setSelectedBudget(option); setCustomBudget(""); }}
                  style={[styles.budgetCard, selectedBudget?.budget === option.budget ? [styles.budgetCardActive, { backgroundColor: primary, borderColor: isDark ? "#FF6060" : "#FF4040" }] : { backgroundColor: surfaceAlt, borderColor: border }]}>
                  <Text style={styles.budgetEmoji}>{option.icon}</Text>
                  <Text style={[styles.budgetLabel, { color: selectedBudget?.budget === option.budget ? "#FFF" : textColor }]}>{option.budget}</Text>
                  <Text style={[styles.budgetAmount, { color: selectedBudget?.budget === option.budget ? "rgba(255,255,255,0.8)" : mutedColor }]}>{option.amount}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.orText, { color: mutedColor }]}>— or enter a specific amount —</Text>
            <View style={[styles.inputRow, { backgroundColor: surfaceAlt, borderColor: border }]}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>💵</Text>
              <TextInput placeholder="e.g. 9500" placeholderTextColor={mutedColor} keyboardType="numeric"
                style={[styles.input, { color: textColor }]} value={customBudget}
                onChangeText={(t) => { setCustomBudget(t); setSelectedBudget(null); }} />
            </View>
          </View>

          {/* Travel Allowance */}
          <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>🚂</Text>
              <Text style={[styles.cardTitle, { color: textColor }]}>Include travel allowance?</Text>
            </View>
            <View style={styles.toggleRow}>
              {[true, false].map((val) => (
                <TouchableOpacity key={String(val)} onPress={() => setIncludeTravelAllowance(val)}
                  style={[styles.toggleChip, includeTravelAllowance === val ? [styles.toggleChipActive, { backgroundColor: secondary, borderColor: isDark ? "#50C0B8" : "#38B0A8" }] : { backgroundColor: surfaceAlt, borderColor: border }]}>
                  <Text style={[styles.toggleChipText, { color: includeTravelAllowance === val ? "#FFF" : textColor }]}>
                    {val ? "Yes ✈️" : "No 🏙️"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.hintText, { color: mutedColor }]}>Turn on to include flights/trains in your budget.</Text>
          </View>

          {/* Travelers */}
          <View style={[styles.card, { backgroundColor: surface, borderColor: border, marginBottom: 100 }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>👥</Text>
              <Text style={[styles.cardTitle, { color: textColor }]}>Traveling with?</Text>
            </View>
            <View style={styles.travelGrid}>
              {SelectMembers.map((option) => (
                <TouchableOpacity key={option.id} onPress={() => setSelectedTraveler(option)}
                  style={[styles.travelerCard, selectedTraveler?.people === option.people ? [styles.travelerCardActive, { backgroundColor: primary, borderColor: isDark ? "#FF6060" : "#FF4040" }] : { backgroundColor: surfaceAlt, borderColor: border }]}>
                  <Text style={styles.travelerEmoji}>{option.icon}</Text>
                  <Text style={[styles.travelerLabel, { color: selectedTraveler?.people === option.people ? "#FFF" : textColor }]}>{option.people}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Generate Button — sticky */}
        <View style={[styles.generateWrap, { backgroundColor: bg }]}>
          <TouchableOpacity onPress={onGenerateTrip} disabled={loading}
            style={[styles.generateBtn, loading && { opacity: 0.75 }]} activeOpacity={0.85}>
            <View style={styles.generateBtnInner}>
              <Text style={styles.generateBtnText}>{loading ? "Generating..." : "Generate Trip ✨"}</Text>
              {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="sparkles" size={20} color="#FFF" />}
            </View>
          </TouchableOpacity>
        </View>

        <CustomAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message}
          onCancel={alertConfig.onCancel} cancelText={alertConfig.cancelText}
          confirmText={alertConfig.confirmText || ""} onConfirm={alertConfig.onConfirm} />
      </SafeAreaView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 18 },
  content: { paddingTop: 20, paddingBottom: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 },
  headerTitle: { fontSize: 26, fontWeight: "900" },
  headerSub: { fontSize: 13, fontWeight: "500", marginTop: 3 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  card: { borderRadius: 24, borderWidth: 2.5, padding: 18, marginBottom: 16, shadowColor: "#2D1B69", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  cardEmoji: { fontSize: 24 },
  cardTitle: { fontSize: 17, fontWeight: "800" },
  inputRow: { flexDirection: "row", alignItems: "center", borderRadius: 18, borderWidth: 2, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, fontSize: 14, fontWeight: "500" },
  dropdown: { position: "absolute", top: 102, left: 18, right: 18, borderRadius: 18, borderWidth: 2, zIndex: 99, overflow: "hidden", shadowColor: "#2D1B69", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10 },
  suggestionItem: { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1 },
  suggestionText: { flex: 1, fontSize: 13, fontWeight: "500" },
  selectedChip: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 2, padding: 10, marginTop: 10, gap: 8 },
  selectedChipEmoji: { fontSize: 16 },
  selectedChipText: { flex: 1, fontSize: 13, fontWeight: "600" },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
  stepBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, alignItems: "center", justifyContent: "center" },
  stepBtnText: { fontSize: 24, fontWeight: "900" },
  stepCount: { width: 80, height: 80, borderRadius: 40, borderWidth: 2.5, alignItems: "center", justifyContent: "center" },
  stepCountText: { fontSize: 28, fontWeight: "900" },
  stepCountSub: { fontSize: 12, fontWeight: "600" },
  stepBtnPrimary: { width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, alignItems: "center", justifyContent: "center", shadowColor: "#FF6B6B", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 5 },
  stepBtnPrimaryText: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  toggleRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  toggleChip: { flex: 1, paddingVertical: 14, borderRadius: 100, borderWidth: 2.5, alignItems: "center" },
  toggleChipActive: { shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 5 },
  toggleChipText: { fontSize: 15, fontWeight: "800" },
  hintText: { fontSize: 12, fontWeight: "500" },
  budgetRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  budgetCard: { flex: 1, alignItems: "center", padding: 14, borderRadius: 20, borderWidth: 2.5 },
  budgetCardActive: { shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 5 },
  budgetEmoji: { fontSize: 26, marginBottom: 6 },
  budgetLabel: { fontSize: 13, fontWeight: "800", marginBottom: 2 },
  budgetAmount: { fontSize: 10, fontWeight: "600", textAlign: "center" },
  orText: { textAlign: "center", fontSize: 12, fontWeight: "600", marginVertical: 12 },
  travelGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  travelerCard: { width: "47%", alignItems: "center", padding: 16, borderRadius: 20, borderWidth: 2.5 },
  travelerCardActive: { shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 5 },
  travelerEmoji: { fontSize: 28, marginBottom: 8 },
  travelerLabel: { fontSize: 14, fontWeight: "800" },
  generateWrap: { paddingHorizontal: 18, paddingBottom: 100, paddingTop: 12, borderTopWidth: 0 },
  generateBtn: { backgroundColor: "#FF6B6B", borderRadius: 100, borderWidth: 2.5, borderColor: "#FF4040", shadowColor: "#FF6B6B", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 10 },
  generateBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 18, gap: 10 },
  generateBtnText: { color: "#FFF", fontSize: 18, fontWeight: "900" },
});
