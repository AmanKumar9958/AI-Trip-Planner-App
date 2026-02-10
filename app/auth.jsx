import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../Context/AuthContext";

const Auth = () => {
  const { promptAsync } = useAuth();
  return (
    <View className="flex-1 bg-app-bg dark:bg-app-dark-bg items-center justify-start rounded-2xl overflow-hidden">
      {/* Gradient Header */}
      <View className="w-full h-[45%] bg-gradient-to-b from-app-primary to-app-secondary dark:from-app-dark-primary dark:to-app-dark-secondary rounded-t-2xl justify-center items-center">
        <Image
          source={require("../assets/images/auth-image.png")}
          className="w-full h-full"
          contentFit="cover"
          transition={500}
        />
      </View>

      {/* Content */}
      <View className="flex-1 w-full bg-app-surface dark:bg-app-dark-surface -mt-10 rounded-t-3xl shadow-2xl items-center pt-10">
        <Text
          className="text-app-text dark:text-app-dark-text text-4xl font-bold mb-12 text-center"
          numberOfLines={1}
        >
          Your journey starts here
        </Text>

        {/* Google Sign-In Button */}
        <TouchableOpacity
          onPress={() => promptAsync()}
          className="flex-row items-center bg-app-surface dark:bg-app-dark-surface border border-app-border dark:border-app-dark-border rounded-full px-6 py-3 mb-8 w-10/12 self-center shadow"
        >
          <Image
            source={require("../assets/images/google.png")}
            style={{ width: 24, height: 24, marginRight: 8 }}
            contentFit="contain"
          />
          <Text className="text-app-text dark:text-app-dark-text text-lg font-medium">
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <Text className="text-xs text-app-muted-text dark:text-app-dark-muted-text text-center px-6">
          By continuing, you agree to our
          <Text className="text-app-primary dark:text-app-dark-primary">
            {" "}
            Terms of Service{" "}
          </Text>
          &
          <Text className="text-app-primary dark:text-app-dark-primary">
            {" "}
            Privacy Policy
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default Auth;
