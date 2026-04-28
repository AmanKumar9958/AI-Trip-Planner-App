import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, FlatList, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../Context/AuthContext";
import { useTabBar } from "../../Context/TabBarContext";
import { useTheme } from "../../Context/ThemeContext";
import { db } from "../../Firebase/FirebaseConfig";
import CustomAlert from "../../components/CustomAlert";
import PageTransition from "../../components/PageTransition";
import Skeleton from "../../components/Skeleton";
import TripDetailsModal from "../../components/TripDetailsModal";
import themeColors from "../../lib/themeColors.json";

const TRIP_EMOJIS = ["🗺️", "✈️", "🏝️", "🏔️", "🌍", "🚂", "🏖️", "🎒", "🌴", "⛵"];

const TripItem = ({ item, index, shareTrip, confirmDelete, onPress, isDark }) => {
  const swipeableRef = useRef(null);
  const timeoutRef = useRef(null);
  const surface = isDark ? "#251C50" : "#FFFFFF";
  const border = isDark ? "#3D2E7A" : "#FFD4B8";
  const textColor = isDark ? "#F0EAFF" : "#2D1B69";
  const mutedColor = "#9B8BB4";
  const primary = isDark ? "#FF8E8E" : "#FF6B6B";

  const handleOpen = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => swipeableRef.current?.close(), 3000);
  };
  const handleClose = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  return (
    <Swipeable
      ref={swipeableRef}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableOpen={handleOpen}
      onSwipeableClose={handleClose}
      renderLeftActions={() => (
        <View style={styles.swipeActionLeft}>
          <TouchableOpacity onPress={() => { handleClose(); swipeableRef.current?.close(); shareTrip(item); }}
            style={styles.shareBtn} activeOpacity={0.85}>
            <Ionicons name="share-social" size={18} color="#FFF" />
            <Text style={styles.swipeActionText}>Share</Text>
          </TouchableOpacity>
        </View>
      )}
      renderRightActions={() => (
        <View style={styles.swipeActionRight}>
          <TouchableOpacity onPress={() => { handleClose(); swipeableRef.current?.close(); confirmDelete(item.id, item.userSelection?.Location); }}
            style={styles.deleteBtn} activeOpacity={0.85}>
            <Ionicons name="trash" size={18} color="#FFF" />
            <Text style={styles.swipeActionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.88}
        style={[styles.tripCard, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.tripCardLeft}>
          <View style={[styles.emojiCircle, { backgroundColor: isDark ? "#2E2460" : "#FFF3E0", borderColor: border }]}>
            <Text style={styles.tripEmoji}>{TRIP_EMOJIS[index % TRIP_EMOJIS.length]}</Text>
          </View>
        </View>
        <View style={styles.tripCardBody}>
          <Text style={[styles.tripTitle, { color: textColor }]} numberOfLines={1}>
            {item.userSelection?.Location || "Trip Destination"}
          </Text>
          <View style={styles.metaRow}>
            {item.userSelection?.TotalDays ? (
              <View style={[styles.metaChip, { backgroundColor: isDark ? "#2E2460" : "#FFF3E0", borderColor: border }]}>
                <Text style={[styles.metaChipText, { color: mutedColor }]}>📅 {item.userSelection.TotalDays} Days</Text>
              </View>
            ) : null}
            {item.userSelection?.budget ? (
              <View style={[styles.metaChip, { backgroundColor: isDark ? "#2E2460" : "#FFF3E0", borderColor: border }]}>
                <Text style={[styles.metaChipText, { color: mutedColor }]}>💰 {item.userSelection.budget}</Text>
              </View>
            ) : null}
          </View>
          {item.userSelection?.TravelingWith ? (
            <Text style={[styles.travelWith, { color: mutedColor }]}>👥 {item.userSelection.TravelingWith}</Text>
          ) : null}
        </View>
        <View style={styles.tripCardChevron}>
          <Ionicons name="chevron-forward" size={20} color={primary} />
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default function MyTrip() {
  const { user } = useAuth();
  const { colorScheme, updateTheme } = useTheme();
  const isDark = colorScheme === "dark";
  const { setIsTabBarVisible } = useTabBar();
  const lastContentOffset = useRef(0);

  const bg = isDark ? "#1A1035" : "#FFF9F0";
  const surface = isDark ? "#251C50" : "#FFFFFF";
  const surfaceAlt = isDark ? "#2E2460" : "#FFF3E0";
  const border = isDark ? "#3D2E7A" : "#FFD4B8";
  const textColor = isDark ? "#F0EAFF" : "#2D1B69";
  const mutedColor = "#9B8BB4";
  const primary = isDark ? "#FF8E8E" : "#FF6B6B";

  const onScroll = (event) => {
    const cur = event.nativeEvent.contentOffset.y;
    if (cur > lastContentOffset.current && cur > 20) setIsTabBarVisible(false);
    else if (cur < lastContentOffset.current) setIsTabBarVisible(true);
    lastContentOffset.current = cur;
  };

  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: "", message: "", cancelText: "Cancel", confirmText: "", onConfirm: null, confirmButtonStyle: "default" });

  const GetMyTrips = async () => {
    setLoading(true);
    setUserTrips([]);
    if (!user?.email) { setLoading(false); return; }
    try {
      const q = query(collection(db, "AI Trips"), where("userEmailID", "==", user.email));
      const snap = await getDocs(q);
      const trips = [];
      snap.forEach((doc) => trips.push({ id: doc.id, ...doc.data() }));
      setUserTrips(trips);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { if (user) GetMyTrips(); }, [user]));

  const deleteTrip = async (tripId) => {
    try {
      await deleteDoc(doc(db, "AI Trips", tripId));
      setUserTrips((prev) => prev.filter((t) => t.id !== tripId));
      setAlertConfig((p) => ({ ...p, visible: false }));
    } catch {
      setAlertConfig({ visible: true, title: "Delete Failed", message: "Could not delete. Please try again.", cancelText: "OK", confirmText: "", onCancel: () => setAlertConfig((p) => ({ ...p, visible: false })) });
    }
  };

  const confirmDelete = (tripId, locationLabel) => {
    setAlertConfig({ visible: true, title: "Delete Trip 🗑️", message: `Delete ${locationLabel || "this trip"}?`, cancelText: "Cancel", confirmText: "Delete", confirmButtonStyle: "destructive", onCancel: () => setAlertConfig((p) => ({ ...p, visible: false })), onConfirm: () => deleteTrip(tripId) });
  };

  const shareTrip = async (trip) => {
    try {
      const dest = trip?.userSelection?.Location || "Trip";
      const days = trip?.userSelection?.TotalDays ? `${trip.userSelection.TotalDays} Day(s)` : "";
      const budget = trip?.userSelection?.budget ? `Budget: ${trip.userSelection.budget}` : "";
      const withWho = trip?.userSelection?.TravelingWith ? `With: ${trip.userSelection.TravelingWith}` : "";
      const summary = [dest, days, budget, withWho].filter(Boolean).join(" · ");
      await Share.share({ message: `✈️ AI Trip Planner\n${summary}\n\nOpen the app to view full itinerary.` });
    } catch { Alert.alert("Share Failed", "Could not share the trip."); }
  };

  return (
    <PageTransition>
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
        <View style={[styles.container, { backgroundColor: bg }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: textColor }]}>My Trips 🎒</Text>
              <Text style={[styles.headerSub, { color: mutedColor }]}>Swipe left to delete, right to share</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => updateTheme(isDark ? "light" : "dark")}
                style={[styles.iconBtn, { backgroundColor: surfaceAlt, borderColor: border }]}>
                <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={GetMyTrips}
                style={[styles.iconBtn, { backgroundColor: surfaceAlt, borderColor: border }]}>
                <Ionicons name="refresh" size={20} color={primary} />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View style={styles.skeletonWrap}>
              {[1, 2, 3, 4, 5].map((item) => (
                <View key={item} style={[styles.skeletonCard, { backgroundColor: surface, borderColor: border }]}>
                  <Skeleton width={48} height={48} borderRadius={24} style={{ marginRight: 14 }} />
                  <View style={{ flex: 1 }}>
                    <Skeleton width="65%" height={18} borderRadius={5} style={{ marginBottom: 10 }} />
                    <Skeleton width="40%" height={13} borderRadius={4} />
                  </View>
                </View>
              ))}
            </View>
          ) : userTrips.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyBigEmoji}>🌍</Text>
              <Text style={[styles.emptyTitle, { color: textColor }]}>No trips yet!</Text>
              <Text style={[styles.emptyMsg, { color: mutedColor }]}>Head to "Explore" to plan your first AI-powered trip ✨</Text>
            </View>
          ) : (
            <FlatList
              data={userTrips}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              onScroll={onScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.listContent}
              renderItem={({ item, index }) => (
                <TripItem
                  item={item}
                  index={index}
                  isDark={isDark}
                  shareTrip={shareTrip}
                  confirmDelete={confirmDelete}
                  onPress={() => { setSelectedTrip(item); setModalVisible(true); }}
                />
              )}
            />
          )}
        </View>

        <TripDetailsModal trip={selectedTrip} isVisible={modalVisible} onClose={() => setModalVisible(false)} />

        <CustomAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message}
          cancelText={alertConfig.cancelText} confirmText={alertConfig.confirmText}
          confirmButtonStyle={alertConfig.confirmButtonStyle}
          onCancel={alertConfig.onCancel} onConfirm={alertConfig.onConfirm} />
      </SafeAreaView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 20, marginBottom: 22 },
  headerTitle: { fontSize: 26, fontWeight: "900" },
  headerSub: { fontSize: 12, fontWeight: "500", marginTop: 3 },
  headerActions: { flexDirection: "row", gap: 10 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  listContent: { paddingBottom: 110 },
  // Swipe actions
  swipeActionLeft: { justifyContent: "center", paddingLeft: 4, marginBottom: 14 },
  swipeActionRight: { justifyContent: "center", alignItems: "flex-end", paddingRight: 4, marginBottom: 14 },
  shareBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#4ECDC4", paddingHorizontal: 16, paddingVertical: 14, borderRadius: 18, borderWidth: 2, borderColor: "#38B0A8" },
  deleteBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FF4757", paddingHorizontal: 16, paddingVertical: 14, borderRadius: 18, borderWidth: 2, borderColor: "#D93040" },
  swipeActionText: { color: "#FFF", fontWeight: "800", fontSize: 13 },
  // Trip card
  tripCard: { flexDirection: "row", alignItems: "center", marginBottom: 14, borderRadius: 22, borderWidth: 2.5, padding: 14, shadowColor: "#2D1B69", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  tripCardLeft: { marginRight: 14 },
  emojiCircle: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  tripEmoji: { fontSize: 26 },
  tripCardBody: { flex: 1 },
  tripTitle: { fontSize: 15, fontWeight: "800", marginBottom: 6 },
  metaRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 4 },
  metaChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50, borderWidth: 1.5 },
  metaChipText: { fontSize: 11, fontWeight: "600" },
  travelWith: { fontSize: 12, fontWeight: "500" },
  tripCardChevron: { marginLeft: 8 },
  // Skeleton
  skeletonWrap: { marginTop: 4 },
  skeletonCard: { flexDirection: "row", alignItems: "center", marginBottom: 14, borderRadius: 22, borderWidth: 2.5, padding: 14 },
  // Empty state
  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 80 },
  emptyBigEmoji: { fontSize: 80, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: "900", marginBottom: 10 },
  emptyMsg: { fontSize: 14, fontWeight: "500", textAlign: "center", lineHeight: 22, paddingHorizontal: 20 },
});
