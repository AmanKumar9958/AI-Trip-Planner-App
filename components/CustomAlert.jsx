import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../Context/ThemeContext";
import themeColors from "../lib/themeColors.json";

const CustomAlert = ({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Confirm",
  icon = "alert-circle",
  confirmButtonStyle = "destructive",
}) => {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const palette = isDark ? themeColors.dark : themeColors.light;

  const cardBg = isDark ? "#251C50" : "#FFFFFF";
  const cardBorder = isDark ? "#3D2E7A" : "#FFD4B8";
  const cancelBg = isDark ? "#2E2460" : "#FFF3E0";
  const cancelBorder = isDark ? "#3D2E7A" : "#FFD4B8";
  const cancelText_ = isDark ? "#F0EAFF" : "#2D1B69";
  const dangerColor = isDark ? "#FF6B79" : "#FF4757";
  const primaryColor = isDark ? "#FF8E8E" : "#FF6B6B";

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {/* Cartoon icon circle */}
          <View style={[styles.iconCircle, { backgroundColor: "#FFF3E0", borderColor: "#FFD4B8" }]}>
            <Ionicons name={icon} size={30} color={primaryColor} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: isDark ? "#F0EAFF" : "#2D1B69" }]}>
            {title}
          </Text>

          {/* Message */}
          <Text style={[styles.message, { color: isDark ? "#9B8BB4" : "#9B8BB4" }]}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            {cancelText ? (
              <TouchableOpacity
                onPress={onCancel}
                style={[styles.btn, styles.cancelBtn, { backgroundColor: cancelBg, borderColor: cancelBorder }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.cancelBtnText, { color: cancelText_ }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            ) : null}

            {confirmText ? (
              <TouchableOpacity
                onPress={onConfirm}
                style={[
                  styles.btn,
                  confirmButtonStyle === "destructive"
                    ? [styles.dangerBtn, { backgroundColor: dangerColor, borderColor: "#FF2030" }]
                    : [styles.primaryBtn, { backgroundColor: primaryColor, borderColor: "#FF4040" }],
                ]}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmBtnText}>{confirmText}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(45,27,105,0.55)",
    paddingHorizontal: 28,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 32,
    borderWidth: 2.5,
    padding: 28,
    alignItems: "center",
    shadowColor: "#2D1B69",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 14,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 2.5,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {},
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  primaryBtn: {
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  dangerBtn: {
    shadowColor: "#FF4757",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});

export default CustomAlert;
