import { Image } from "expo-image";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../Context/AuthContext";

const { width, height } = Dimensions.get("window");

const Auth = () => {
  const { promptAsync } = useAuth();
  return (
    <View style={styles.container}>
      {/* Full-screen travel background image */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1173&auto=format&fit=crop",
        }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={600}
      />

      {/* Gradient overlay — heavier at bottom */}
      <View style={styles.gradientOverlay} />

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <Text style={styles.heading}>Your journey{"\n"}starts here</Text>

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

        {/* Terms and Privacy */}
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
    width: width,
    height: height,
    backgroundColor: "#0d1117",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Simulate a gradient: transparent on top, dark on bottom
    backgroundColor: "rgba(10, 14, 30, 0.45)",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 52,
    backgroundColor: "rgba(13, 17, 35, 0.88)",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
  },
  heading: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 42,
    letterSpacing: 0.3,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 100,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  googleIcon: {
    width: 26,
    height: 26,
    marginRight: 12,
  },
  googleButtonText: {
    color: "#1a1a2e",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  termsText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "#4fc3f7",
    fontWeight: "600",
  },
});

export default Auth;
