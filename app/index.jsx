import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Full-screen travel background image */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1170&auto=format&fit=crop",
        }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={500}
      />

      {/* Dark overlay for readability */}
      <View style={styles.overlay}>
        {/* Bottom content card */}
        <View style={styles.bottomCard}>
          <Text
            style={styles.title}
            numberOfLines={1}
          >
            Trip Genius
          </Text>
          <Text
            style={styles.subtitle}
            numberOfLines={2}
          >
            Discover your next adventure with AI
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/auth")}
            style={styles.button}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText} numberOfLines={1}>
              Get Started
            </Text>
            <Ionicons name="arrow-forward-outline" size={24} color="#0d1117" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: "#0d1117",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    // Gradient-like dark overlay: transparent at top, dark at bottom
    backgroundColor: "transparent",
  },
  bottomCard: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 32,
    // Frosted glass bottom panel
    backgroundColor: "rgba(13, 17, 23, 0.72)",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    // Subtle top border for glass effect
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: 38,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4fc3f7",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 100,
    gap: 10,
    shadowColor: "#4fc3f7",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  buttonText: {
    color: "#0d1117",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
