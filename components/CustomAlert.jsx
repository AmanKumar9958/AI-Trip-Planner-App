import { Ionicons } from "@expo/vector-icons";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../Context/ThemeContext";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View
          className={`w-full max-w-sm rounded-[32px] p-6 ${isDark ? "bg-gray-900 border border-gray-800" : "bg-white"} shadow-2xl`}
        >
          {/* Icon */}
          <View
            className={`w-14 h-14 rounded-full ${isDark ? "bg-gray-800" : "bg-orange-50"} items-center justify-center mb-4 mx-auto`}
          >
            <Ionicons
              name={icon}
              size={28}
              color={isDark ? "#fff" : "#FB923C"}
            />
          </View>

          {/* Title & Message */}
          <Text
            className={`text-xl font-bold text-center mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {title}
          </Text>
          <Text
            className={`text-base text-center mb-8 ${isDark ? "text-gray-400" : "text-gray-500"} leading-6`}
          >
            {message}
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              className={`flex-1 py-3.5 rounded-2xl border ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}
            >
              <Text
                className={`text-center font-semibold ${isDark ? "text-white" : "text-gray-700"}`}
              >
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              className={`flex-1 py-3.5 rounded-2xl ${confirmButtonStyle === "destructive" ? "bg-red-500" : "bg-black dark:bg-white"}`}
            >
              <Text
                className={`text-center font-bold ${confirmButtonStyle === "destructive" ? "text-white" : isDark ? "text-black" : "text-white"}`}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
