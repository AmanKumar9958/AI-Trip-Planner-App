import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Appearance,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import themeColors from "../lib/themeColors.json";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const palette =
        Appearance.getColorScheme() === "dark"
          ? themeColors.dark
          : themeColors.light;

      return (
        <View style={[styles.container, { backgroundColor: palette.bg }]}>
          <View style={styles.content}>
            <Ionicons name="warning" size={64} color={palette.primary} />
            <Text style={[styles.title, { color: palette.text }]}>
              Oops! Something went wrong
            </Text>
            <Text style={[styles.message, { color: palette.mutedText }]}>
              {
                "The app encountered an unexpected error. Don't worry, you can try again."
              }
            </Text>
            {__DEV__ && this.state.error && (
              <Text style={[styles.errorDetails, { color: palette.danger }]}>
                {this.state.error.toString()}
              </Text>
            )}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: palette.primary }]}
              onPress={this.handleReset}
            >
              <Ionicons
                name="refresh"
                size={20}
                color={palette.onPrimary}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.buttonText, { color: palette.onPrimary }]}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  errorDetails: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: "Courier",
      android: "monospace",
      default: "monospace",
    }),
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ErrorBoundary;
