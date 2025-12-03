import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../Context/AuthContext';

const auth = () => {
    const { promptAsync } = useAuth();
    return (
        <View className="flex-1 bg-blue-100 items-center justify-start rounded-2xl overflow-hidden">
            {/* Gradient Header */}
            <View className="w-full h-1/3 bg-gradient-to-b from-orange-300 to-orange-500 rounded-t-2xl justify-center items-center">
                <Image
                    source={require("../assets/images/auth-image.png")}
                    className="w-full h-full"
                    resizeMode="cover"
                />
            </View>

            {/* Content */}
            <View className="flex-1 w-full bg-white rounded-b-2xl items-center pt-8">
                <Text className="text-black text-4xl font-bold mb-12 text-center" numberOfLines={1}>Your journey starts here</Text>

                {/* Google Sign-In Button */}
                <TouchableOpacity
                    onPress={() => promptAsync()}
                    className="flex-row items-center bg-white border border-gray-300 rounded-full px-6 py-3 mb-8 w-10/12 self-center shadow">
                    <Image
                        source={require("../assets/images/google.png")}
                        style={{ width: 24, height: 24, marginRight: 8 }}
                    />
                    <Text className="text-black text-lg font-medium">Continue with Google</Text>
                </TouchableOpacity>

                {/* Terms and Privacy */}
                <Text className="text-xs text-gray-500 text-center px-6">
                    By continuing, you agree to our
                    <Text className="text-blue-500"> Terms of Service </Text>
                    &
                    <Text className="text-blue-500"> Privacy Policy</Text>
                </Text>
            </View>
        </View>
    );
};

export default auth