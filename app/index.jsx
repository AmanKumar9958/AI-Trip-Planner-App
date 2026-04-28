import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Full-screen travel background */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1170&auto=format&fit=crop",
        }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={500}
      />

      {/* Soft dark overlay */}
      <View style={styles.overlay} />

      {/* Floating decorative emojis */}
      <Text style={[styles.floatEmoji, { top: height * 0.12, left: 28 }]}>☁️</Text>
      <Text style={[styles.floatEmoji, { top: height * 0.08, right: 40 }]}>✈️</Text>
      <Text style={[styles.floatEmoji, { top: height * 0.22, right: 22 }]}>⭐</Text>
      <Text style={[styles.floatEmoji, { top: height * 0.18, left: 48 }]}>🗺️</Text>

      {/* Bottom cartoon card */}
      <View style={styles.card}>
        {/* Globe emoji as mascot */}
        <View style={styles.mascotWrap}>
          <Text style={styles.mascot}>🌍</Text>
        </View>

        <Text style={styles.title}>Trip Genius</Text>
        <Text style={styles.subtitle}>
          Discover your next adventure with AI ✨
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/auth")}
          style={styles.button}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    backgroundColor: "#1A1035",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26,16,53,0.38)",
  },
  floatEmoji: {
    position: "absolute",
    fontSize: 32,
    zIndex: 2,
  },
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: "#FFD4B8",
    paddingTop: 8,
    paddingBottom: 48,
    paddingHorizontal: 28,
    alignItems: "center",
    shadowColor: "#2D1B69",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 16,
  },
  mascotWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFF3E0",
    borderWidth: 3,
    borderColor: "#FFD4B8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    marginTop: 4,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  mascot: {
    fontSize: 38,
  },
  title: {
    color: "#2D1B69",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    color: "#9B8BB4",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
    fontWeight: "500",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B6B",
    width: "100%",
    paddingVertical: 17,
    borderRadius: 100,
    borderWidth: 2.5,
    borderColor: "#FF4040",
    gap: 10,
    shadowColor: "#FF6B6B",
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
});
