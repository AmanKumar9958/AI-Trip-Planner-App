import { Image } from "expo-image";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../Context/AuthContext";

const { width, height } = Dimensions.get("window");

const Auth = () => {
  const { promptAsync } = useAuth();

  return (
    <View style={styles.container}>
      {/* Full-screen travel background */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1173&auto=format&fit=crop",
        }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={600}
      />

      {/* Soft overlay */}
      <View style={styles.overlay} />

      {/* Floating decorations */}
      <Text style={[styles.floatEmoji, { top: height * 0.10, left: 32 }]}>🏖️</Text>
      <Text style={[styles.floatEmoji, { top: height * 0.07, right: 38 }]}>🌴</Text>
      <Text style={[styles.floatEmoji, { top: height * 0.20, right: 26 }]}>⭐</Text>

      {/* Cartoon bottom sheet */}
      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Suitcase mascot */}
        <View style={styles.mascotWrap}>
          <Text style={styles.mascot}>🧳</Text>
        </View>

        <Text style={styles.heading}>Your journey{"\n"}starts here! 🗺️</Text>

        {/* Google Sign-In Button */}
        <TouchableOpacity
          onPress={() => promptAsync()}
          style={styles.googleButton}
          activeOpacity={0.85}
        >
          <Image
            source={require("../assets/images/google.png")}
            style={styles.googleIcon}
            contentFit="contain"
          />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          By continuing, you agree to our{" "}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {" & "}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    backgroundColor: "#1A1035",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26,16,53,0.30)",
  },
  floatEmoji: {
    position: "absolute",
    fontSize: 34,
    zIndex: 2,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: "#FFD4B8",
    paddingBottom: 52,
    paddingHorizontal: 28,
    paddingTop: 12,
    alignItems: "center",
    shadowColor: "#2D1B69",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 18,
  },
  handle: {
    width: 48,
    height: 5,
    backgroundColor: "#FFD4B8",
    borderRadius: 100,
    marginBottom: 16,
  },
  mascotWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFF3E0",
    borderWidth: 3,
    borderColor: "#FFD4B8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  mascot: {
    fontSize: 36,
  },
  heading: {
    color: "#2D1B69",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 40,
    letterSpacing: 0.3,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9F0",
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 100,
    borderWidth: 2.5,
    borderColor: "#FFD4B8",
    marginBottom: 20,
    shadowColor: "#2D1B69",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  googleIcon: {
    width: 26,
    height: 26,
    marginRight: 12,
  },
  googleButtonText: {
    color: "#2D1B69",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  termsText: {
    color: "#9B8BB4",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "500",
  },
  termsLink: {
    color: "#FF6B6B",
    fontWeight: "700",
  },
});

export default Auth;
