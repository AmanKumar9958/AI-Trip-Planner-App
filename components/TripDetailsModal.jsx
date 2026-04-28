import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Linking, Modal, PanResponder, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../Context/ThemeContext";
import themeColors from "../lib/themeColors.json";
import Skeleton from "./Skeleton";

export default function TripDetailsModal({ trip, isVisible, onClose }) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  const surface = isDark ? "#251C50" : "#FFFFFF";
  const surfaceAlt = isDark ? "#2E2460" : "#FFF3E0";
  const border = isDark ? "#3D2E7A" : "#FFD4B8";
  const textColor = isDark ? "#F0EAFF" : "#2D1B69";
  const mutedColor = "#9B8BB4";
  const primary = isDark ? "#FF8E8E" : "#FF6B6B";
  const secondary = isDark ? "#6EDDD5" : "#4ECDC4";

  const pan = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    if (isVisible) pan.setValue({ x: 0, y: 0 });
  }, [isVisible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
      onPanResponderMove: Animated.event([null, { dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 100) {
          Animated.timing(pan, { toValue: { x: 0, y: Dimensions.get("window").height }, duration: 200, useNativeDriver: false }).start(onClose);
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  if (!trip) return null;

  let parsedData = null;
  try {
    parsedData = typeof trip.tripData === "string" ? JSON.parse(trip.tripData) : trip.tripData;
  } catch (e) { console.error("Error parsing trip data", e); }

  const tripPlan = parsedData?.tripData || parsedData;
  const hotels = tripPlan?.HotelOptions || tripPlan?.hotels || [];
  const itinerary = tripPlan?.Itinerary || tripPlan?.itinerary || [];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(<Ionicons key={i} name={i < Math.floor(rating || 0) ? "star" : "star-outline"} size={14} color="#FFB703" />);
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };

  const openMap = (hotel) => {
    const name = hotel.HotelName || hotel.hotel_name;
    const address = hotel.HotelAddress || hotel.hotel_address;
    const q = `${name}, ${address}`;
    const url = Platform.select({ ios: `maps:0,0?q=${encodeURIComponent(q)}`, android: `geo:0,0?q=${encodeURIComponent(q)}` });
    Linking.openURL(url);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: surface },
            { transform: [{ translateY: pan.y.interpolate({ inputRange: [0, 1000], outputRange: [0, 1000], extrapolate: "clamp" }) }] },
          ]}
        >
          {/* Hero image with drag handle */}
          <View {...panResponder.panHandlers} style={styles.heroWrap}>
            <Skeleton width="100%" height="100%" style={{ position: "absolute" }} />
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop" }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={500}
            />
            {/* Overlay gradient */}
            <View style={styles.heroOverlay} />
            {/* Drag handle */}
            <View style={styles.dragHandle} />
            {/* Close button */}
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.85}>
              <Ionicons name="close" size={22} color="#2D1B69" />
            </TouchableOpacity>
            {/* Trip info overlay */}
            <View style={styles.heroInfo}>
              <Text style={styles.heroTitle} numberOfLines={1}>
                {trip.userSelection?.Location || "Trip Details"}
              </Text>
              <View style={styles.heroBadgeRow}>
                {trip.userSelection?.TotalDays ? (
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>📅 {trip.userSelection.TotalDays} Days</Text>
                  </View>
                ) : null}
                {trip.userSelection?.TravelingWith ? (
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>👥 {trip.userSelection.TravelingWith}</Text>
                  </View>
                ) : null}
                {trip.userSelection?.budget ? (
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>💰 {trip.userSelection.budget}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Content */}
          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* Hotels */}
            {hotels.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionEmoji}>🏨</Text>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>Recommended Hotels</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {hotels.map((hotel, index) => (
                    <TouchableOpacity key={index} onPress={() => openMap(hotel)} activeOpacity={0.88}
                      style={[styles.hotelCard, { backgroundColor: surfaceAlt, borderColor: border }]}>
                      <View style={styles.hotelImgWrap}>
                        <Skeleton width="100%" height="100%" style={{ position: "absolute" }} />
                        <Image
                          source={{ uri: hotel?.ImageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop" }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                          transition={500}
                        />
                        <View style={[styles.mapPinBadge, { backgroundColor: primary }]}>
                          <Ionicons name="location" size={12} color="#FFF" />
                        </View>
                      </View>
                      <View style={styles.hotelBody}>
                        <Text style={[styles.hotelName, { color: textColor }]} numberOfLines={1}>
                          {hotel.HotelName || hotel.hotel_name}
                        </Text>
                        <Text style={[styles.hotelAddress, { color: mutedColor }]} numberOfLines={2}>
                          {hotel.HotelAddress || hotel.hotel_address}
                        </Text>
                        <View style={styles.hotelFooter}>
                          <Text style={[styles.hotelPrice, { color: primary }]}>{hotel.Price || hotel.price || hotel.PriceRange}</Text>
                          {renderStars(hotel.Rating || hotel.rating)}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Itinerary */}
            {(Array.isArray(itinerary) ? itinerary : Object.values(itinerary)).length > 0 && (
              <View style={[styles.section, { paddingBottom: 30 }]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionEmoji}>🗓️</Text>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>Day-wise Itinerary</Text>
                </View>

                {(Array.isArray(itinerary) ? itinerary : Object.values(itinerary)).map((details, index) => (
                  <View key={index} style={styles.dayWrap}>
                    {/* Timeline connector */}
                    <View style={styles.timelineCol}>
                      <View style={[styles.dayDot, { backgroundColor: primary, borderColor: isDark ? "#FF6060" : "#FF4040" }]} />
                      {index < (Array.isArray(itinerary) ? itinerary : Object.values(itinerary)).length - 1 && (
                        <View style={[styles.timelineLine, { backgroundColor: isDark ? "#3D2E7A" : "#FFD4B8" }]} />
                      )}
                    </View>

                    <View style={styles.dayContent}>
                      {/* Day badge */}
                      <View style={[styles.dayBadge, { backgroundColor: primary }]}>
                        <Text style={styles.dayBadgeText}>
                          {details.Day?.toString().includes("Day") ? details.Day : `Day ${details.Day || index + 1}`}
                        </Text>
                      </View>

                      {/* Activity card */}
                      <View style={[styles.activityCard, { backgroundColor: surfaceAlt, borderColor: border }]}>
                        <Text style={[styles.activityTitle, { color: textColor }]}>
                          {details.PlaceName || details.place_name || details.Activity || "Activity"}
                        </Text>
                        <Text style={[styles.activityDesc, { color: mutedColor }]}>
                          {details.PlaceDetails || details.place_details || details.Details || details.details || details.description}
                        </Text>

                        <View style={styles.activityMeta}>
                          {(details.BestTimeToVisit || details.best_time_to_visit) && (
                            <View style={styles.metaRow}>
                              <Ionicons name="time-outline" size={14} color={secondary} />
                              <Text style={[styles.metaText, { color: mutedColor }]}>
                                Best: {details.BestTimeToVisit || details.best_time_to_visit}
                              </Text>
                            </View>
                          )}
                          {(details.TicketPricing || details.ticket_pricing) && (
                            <View style={styles.metaRow}>
                              <Ionicons name="ticket-outline" size={14} color={secondary} />
                              <Text style={[styles.metaText, { color: mutedColor }]} numberOfLines={2}>
                                {details.TicketPricing || details.ticket_pricing}
                              </Text>
                            </View>
                          )}
                          {(details.TravelTime || details.travel_time || details.Time || details.time) && (
                            <View style={styles.metaRow}>
                              <Ionicons name="navigate-circle-outline" size={14} color={secondary} />
                              <Text style={[styles.metaText, { color: mutedColor }]}>
                                {details.TravelTime || details.travel_time || details.Time || details.time}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(45,27,105,0.6)", justifyContent: "flex-end" },
  sheet: { height: "92%", borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: "hidden", borderTopWidth: 3, borderLeftWidth: 3, borderRightWidth: 3, borderColor: "#FFD4B8" },
  // Hero
  heroWrap: { height: 240, width: "100%", position: "relative" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(45,27,105,0.35)" },
  dragHandle: { position: "absolute", top: 12, left: "50%", marginLeft: -24, width: 48, height: 5, backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 100, zIndex: 10 },
  closeBtn: { position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center", zIndex: 20, borderWidth: 2, borderColor: "#FFD4B8" },
  heroInfo: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 18 },
  heroTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "900", marginBottom: 8, textShadowColor: "rgba(0,0,0,0.3)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  heroBadgeRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  heroBadge: { backgroundColor: "rgba(255,255,255,0.88)", borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1.5, borderColor: "#FFD4B8" },
  heroBadgeText: { color: "#2D1B69", fontSize: 11, fontWeight: "700" },
  // Content
  contentScroll: { flex: 1, paddingHorizontal: 18 },
  section: { marginTop: 22 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionEmoji: { fontSize: 22 },
  sectionTitle: { fontSize: 18, fontWeight: "900" },
  // Hotel cards
  hotelCard: { width: 220, marginRight: 14, borderRadius: 20, borderWidth: 2.5, overflow: "hidden", shadowColor: "#2D1B69", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  hotelImgWrap: { width: "100%", height: 120, position: "relative" },
  mapPinBadge: { position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  hotelBody: { padding: 12 },
  hotelName: { fontSize: 14, fontWeight: "800", marginBottom: 4 },
  hotelAddress: { fontSize: 11, fontWeight: "500", marginBottom: 8, lineHeight: 16 },
  hotelFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hotelPrice: { fontSize: 13, fontWeight: "800" },
  starsRow: { flexDirection: "row" },
  // Itinerary
  dayWrap: { flexDirection: "row", marginBottom: 8 },
  timelineCol: { width: 28, alignItems: "center" },
  dayDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2.5, marginTop: 14, zIndex: 2 },
  timelineLine: { width: 2.5, flex: 1, marginTop: 2, borderRadius: 2 },
  dayContent: { flex: 1, paddingLeft: 12 },
  dayBadge: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, marginBottom: 10, shadowColor: "#FF6B6B", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 4 },
  dayBadgeText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  activityCard: { borderRadius: 20, borderWidth: 2.5, padding: 14, marginBottom: 8, shadowColor: "#2D1B69", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  activityTitle: { fontSize: 15, fontWeight: "800", marginBottom: 6 },
  activityDesc: { fontSize: 13, fontWeight: "500", lineHeight: 19, marginBottom: 10 },
  activityMeta: { gap: 6 },
  metaRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  metaText: { fontSize: 12, fontWeight: "500", flex: 1 },
});
