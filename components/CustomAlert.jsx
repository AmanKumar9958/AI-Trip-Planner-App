import { Ionicons } from "@expo/vector-icons";
import { Modal, Text, TouchableOpacity, View } from "react-native";
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
  confirmButtonStyle = "destructive", // 'default' | 'destructive'
}) => {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const palette = isDark ? themeColors.dark : themeColors.light;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="w-full max-w-sm rounded-[32px] p-6 bg-app-surface dark:bg-app-dark-surface border border-app-border dark:border-app-dark-border shadow-2xl">
          {/* Icon */}
          <View className="w-14 h-14 rounded-full bg-app-surface-alt dark:bg-app-dark-surface-alt items-center justify-center mb-4 mx-auto">
            <Ionicons name={icon} size={28} color={palette.primary} />
          </View>

          {/* Title & Message */}
          <Text className="text-xl font-bold text-center mb-2 text-app-text dark:text-app-dark-text">
            {title}
          </Text>
          <Text className="text-base text-center mb-8 text-app-muted-text dark:text-app-dark-muted-text leading-6">
            {message}
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-3">
            {cancelText ? (
              <TouchableOpacity
                onPress={onCancel}
                className="flex-1 py-3.5 rounded-2xl border border-app-border dark:border-app-dark-border bg-app-surface-alt dark:bg-app-dark-surface-alt"
              >
                <Text className="text-center font-semibold text-app-text dark:text-app-dark-text">
                  {cancelText}
                </Text>
              </TouchableOpacity>
            ) : null}

            {confirmText ? (
              <TouchableOpacity
                onPress={onConfirm}
                className={`flex-1 py-3.5 rounded-2xl ${
                  confirmButtonStyle === "destructive"
                    ? "bg-app-danger dark:bg-app-dark-danger"
                    : "bg-app-primary dark:bg-app-dark-primary"
                }`}
              >
                <Text
                  className={`text-center font-bold ${
                    confirmButtonStyle === "destructive"
                      ? "text-app-on-danger dark:text-app-dark-on-danger"
                      : "text-app-on-primary dark:text-app-dark-on-primary"
                  }`}
                >
                  {confirmText}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
