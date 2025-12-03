import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../Context/AuthContext';
import PopularDestinationCard from '../../components/PopularDestinationCard';

const popularDestinations = [
    { id: 1, name: 'Bali, Indonesia', image: { uri: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop' } },
    { id: 2, name: 'Jaipur, India', image: { uri: 'https://unsplash.com/photos/brown-concrete-building-during-daytime-y97sM41-g9k' } },
    { id: 3, name: 'Phuket, Thailand', image: { uri: 'https://unsplash.com/photos/aerial-photography-of-body-of-water-TejFa7VW5e4' } },
    { id: 4, name: 'Kerala, India', image: { uri: 'https://unsplash.com/photos/brown-boat-on-body-of-water-near-green-trees-during-daytime-29ezCWtMtnM' } },
];

const Home = () => {
    const { user } = useAuth();

    return (
        <ScrollView className="flex-1 bg-white px-4 pt-6" showsVerticalScrollIndicator={false}>
            {/* header */}
            <View className="flex-row justify-between items-center mb-6">
                {user && user.profilePicture && (
                    <View className="w-16 h-16 rounded-full overflow-hidden mb-4">
                        <Image source={{ uri: user.profilePicture }} style={{ width: 64, height: 64 }} />
                    </View>
                )}
                <View>
                    <Ionicons name="moon-outline" size={24} color="black" />
                </View>
            </View>

            {/* Welcoming the user */}
            <Text className="text-2xl font-bold mb-4" numberOfLines={1}>Hello, {user?.name || 'Traveler'}! Where to next?</Text>

            {/* Plan a new trip button */}
            <View>
                <TouchableOpacity className="bg-orange-500 rounded-full px-6 py-4 mb-8 flex-row items-center justify-center shadow-sm">
                    <Ionicons name="map-outline" size={24} color="white" style={{marginRight: 8}} />
                    <Text className="text-white text-center text-lg font-bold" numberOfLines={1}>Plan a New Trip</Text>
                </TouchableOpacity>
            </View>

            {/* Your Trips Section (Placeholder) */}
            <View className="mb-10">
                <Text className="text-xl font-bold mb-4 text-gray-900">Your Recent Trips</Text>
                <View className="bg-gray-50 rounded-2xl p-8 items-center justify-center border border-gray-100 border-dashed">
                    <Text className="text-gray-400 text-center">No trips planned yet</Text>
                </View>
            </View>

            {/* Popular destinations */}
            <View className="mb-10">
                <Text className="text-xl font-bold mb-4 text-gray-900">Popular Destinations</Text>
                <FlatList
                    data={popularDestinations}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => <PopularDestinationCard item={item} />}
                />
            </View>
        </ScrollView>
    );
}

export default Home;