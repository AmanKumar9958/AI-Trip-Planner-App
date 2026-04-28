import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useCallback, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  { id: 1, name: "Santorini, Greece", image: { uri: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800&auto=format&fit=crop" } },
  { id: 2, name: "Bali, Indonesia", image: { uri: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop" } },
  { id: 3, name: "Amalfi Coast, Italy", image: { uri: "https://images.unsplash.com/photo-1612718244440-49d8fbbb7ee7?q=80&w=800&auto=format&fit=crop" } },
  { id: 4, name: "Reykjavík, Iceland", image: { uri: "https://images.unsplash.com/photo-1520769669658-f07657f5a307?q=80&w=800&auto=format&fit=crop" } },
  { id: 5, name: "Paris, France", image: { uri: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop" } },
  { id: 6, name: "Tokyo, Japan", image: { uri: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop" } },
  { id: 7, name: "Maldives", image: { uri: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop" } },
  { id: 8, name: "Machu Picchu, Peru", image: { uri: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=800&auto=format&fit=crop" } },
];

const TRIP_EMOJIS = ["🗺️", "✈️", "🏝️", "🏔️", "🌍", "🚂", "🏖️", "🎒"];

const Home = () => {
  const { user, logout } = useAuth();
  const { colorScheme, updateTheme } = useTheme();
  const isDark = colorScheme === "dark";
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const router = useRouter();
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

  const confirmLogout = async () => {
    try { await logout(); setShowLogoutAlert(false); router.replace("/"); }
    catch { setShowLogoutAlert(false); Alert.alert("Error", "Failed to logout."); }
  };

  return (
    <PageTransition>
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
        <StatusBar style={isDark ? "light" : "dark"} animated />
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
          onScroll={onScroll} scrollEventThrottle={16}
          contentContainerStyle={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowLogoutAlert(true)}>
              <View style={[styles.avatarRing, { borderColor: border, backgroundColor: surfaceAlt }]}>
                <Image source={{ uri: user?.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
                  style={styles.avatar} contentFit="cover" transition={500} />
              </View>
            </TouchableOpacity>
            <View style={[styles.brandBadge, { backgroundColor: surface, borderColor: border }]}>
              <Text style={styles.brandEmoji}>🌍</Text>
              <Text style={[styles.brandText, { color: primary }]}>Trip Genius</Text>
            </View>
            <TouchableOpacity onPress={() => updateTheme(isDark ? "light" : "dark")}
              style={[styles.iconBtn, { backgroundColor: surfaceAlt, borderColor: border }]}>
              <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={primary} />
            </TouchableOpacity>
          </View>

          {/* Greeting */}
          <Text style={[styles.greeting, { color: textColor }]}>
            Hello, {user?.displayName?.split(" ")[0] || "Traveler"}! 👋
          </Text>
          <Text style={[styles.subGreeting, { color: mutedColor }]}>Where are we going today?</Text>

          {/* CTA Button */}
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push("/(tabs)/generate")} activeOpacity={0.85}>
            <Text style={styles.ctaEmoji}>✨</Text>
            <Text style={styles.ctaText}>Plan New Trip</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>

          {/* My Trips */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.sectionRow} onPress={() => router.push("/(tabs)/mytrip")} activeOpacity={0.85}>
              <View style={styles.sectionLeft}>
                <Text style={styles.secEmoji}>🎒</Text>
                <Text style={[styles.secTitle, { color: textColor }]}>My Trips</Text>
              </View>
              <View style={[styles.seeAllPill, { backgroundColor: surfaceAlt, borderColor: border }]}>
                <Text style={[styles.seeAllTxt, { color: primary }]}>See All</Text>
                <Ionicons name="arrow-forward" size={13} color={primary} />
              </View>
            </TouchableOpacity>

            {loading ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[1,2,3].map(i => (
                  <View key={i} style={{ marginRight: 16, width: 220 }}>
                    <Skeleton width="100%" height={140} borderRadius={20} style={{ marginBottom: 10 }} />
                    <Skeleton width={160} height={16} borderRadius={5} style={{ marginBottom: 6 }} />
                    <Skeleton width={100} height={12} borderRadius={4} />
                  </View>
                ))}
              </ScrollView>
            ) : userTrips.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: surface, borderColor: border }]}>
                <Text style={styles.emptyEmoji}>🗺️</Text>
                <Text style={[styles.emptyTitle, { color: textColor }]}>No trips planned yet!</Text>
                <Text style={[styles.emptyMsg, { color: mutedColor }]}>Tap "Plan New Trip" to start your adventure</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {userTrips.slice(0, 3).map((trip, idx) => (
                  <TouchableOpacity key={trip.id}
                    style={[styles.tripCard, { backgroundColor: surface, borderColor: border }]}
                    onPress={() => router.push("/(tabs)/mytrip")} activeOpacity={0.88}>
                    <Image source={{ uri: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop" }}
                      style={styles.tripImg} contentFit="cover" transition={500} />
                    <View style={[styles.tripEmojiBadge, { backgroundColor: surface, borderColor: border }]}>
                      <Text style={{ fontSize: 16 }}>{TRIP_EMOJIS[idx % TRIP_EMOJIS.length]}</Text>
                    </View>
                    <View style={styles.tripBody}>
                      <Text style={[styles.tripTitle, { color: textColor }]} numberOfLines={1}>
                        {trip.userSelection?.Location || "Destination"}
                      </Text>
                      <Text style={[styles.tripMeta, { color: mutedColor }]} numberOfLines={1}>
                        {trip.userSelection?.TotalDays ? `${trip.userSelection.TotalDays} Days` : ""}
                        {trip.userSelection?.budget ? ` · ${trip.userSelection.budget}` : ""}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Popular Destinations */}
          <View style={styles.section}>
            <View style={styles.sectionLeft}>
              <Text style={styles.secEmoji}>🏆</Text>
              <Text style={[styles.secTitle, { color: textColor }]}>Popular Destinations</Text>
            </View>
            <View style={styles.destGrid}>
              {popularDestinations.map((item) => (
                <TouchableOpacity key={item.id} style={styles.destCard} activeOpacity={0.88}>
                  <Image source={item.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={500} />
                  <View style={styles.destOverlay} />
                  <View style={styles.destPill}>
                    <Text style={styles.destPillText} numberOfLines={1}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <CustomAlert visible={showLogoutAlert} title="Sign Out ✌️"
          message="Are you sure you want to sign out?"
          onCancel={() => setShowLogoutAlert(false)}
          onConfirm={confirmLogout} confirmText="Sign Out" icon="log-out-outline" />
      </SafeAreaView>
    </PageTransition>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  content: { paddingTop: 20, paddingBottom: 110 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  avatarRing: { width: 46, height: 46, borderRadius: 23, borderWidth: 2.5, overflow: "hidden" },
  avatar: { width: "100%", height: "100%" },
  brandBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 2 },
  brandEmoji: { fontSize: 18 },
  brandText: { fontWeight: "800", fontSize: 14 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  greeting: { fontSize: 27, fontWeight: "900", marginBottom: 4 },
  subGreeting: { fontSize: 14, fontWeight: "500", marginBottom: 22 },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FF6B6B", borderRadius: 100, paddingVertical: 16, paddingHorizontal: 24, marginBottom: 30, borderWidth: 2.5, borderColor: "#FF4040", gap: 8, shadowColor: "#FF6B6B", shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 8 },
  ctaEmoji: { fontSize: 20 },
  ctaText: { color: "#FFF", fontSize: 17, fontWeight: "900", flex: 1, textAlign: "center" },
  section: { marginBottom: 26 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionLeft: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  secEmoji: { fontSize: 22 },
  secTitle: { fontSize: 19, fontWeight: "900" },
  seeAllPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 2 },
  seeAllTxt: { fontSize: 12, fontWeight: "700" },
  emptyBox: { borderRadius: 24, borderWidth: 2.5, padding: 28, alignItems: "center" },
  emptyEmoji: { fontSize: 46, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "800", marginBottom: 6 },
  emptyMsg: { fontSize: 13, fontWeight: "500", textAlign: "center" },
  tripCard: { width: 220, marginRight: 16, borderRadius: 22, borderWidth: 2.5, overflow: "hidden", shadowColor: "#2D1B69", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 5 },
  tripImg: { width: "100%", height: 130 },
  tripEmojiBadge: { position: "absolute", top: 10, right: 10, width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  tripBody: { padding: 12 },
  tripTitle: { fontSize: 14, fontWeight: "800", marginBottom: 4 },
  tripMeta: { fontSize: 12, fontWeight: "500" },
  destGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  destCard: { width: "47.5%", height: 150, borderRadius: 22, overflow: "hidden", borderWidth: 2.5, borderColor: "#FFD4B8", shadowColor: "#2D1B69", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 8, elevation: 5 },
  destOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(45,27,105,0.18)" },
  destPill: { position: "absolute", bottom: 8, left: 8, right: 8, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 50, paddingVertical: 5, paddingHorizontal: 10, borderWidth: 1.5, borderColor: "#FFD4B8", alignItems: "center" },
  destPillText: { color: "#2D1B69", fontWeight: "800", fontSize: 11 },
});

export default Home;
