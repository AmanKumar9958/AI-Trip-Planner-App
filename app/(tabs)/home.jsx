import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../Context/AuthContext';
import { useTheme } from '../../Context/ThemeContext';
import { db } from '../../Firebase/FirebaseConfig';

const popularDestinations = [
    { id: 1, name: 'Santorini, Greece', image: { uri: 'https://images.unsplash.com/photo-1613395877344-13d4c280d288?q=80&w=1000&auto=format&fit=crop' } },
    { id: 2, name: 'Bali, Indonesia', image: { uri: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop' } },
    { id: 3, name: 'Amalfi Coast, Italy', image: { uri: 'https://images.unsplash.com/photo-1633321088355-d0f8c1eaad48?q=80&w=1000&auto=format&fit=crop' } },
    { id: 4, name: 'Reykjavík, Iceland', image: { uri: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1000&auto=format&fit=crop' } },
];

const Home = () => {
    const { user } = useAuth();
    const { theme, updateTheme } = useTheme();
    const [userTrips, setUserTrips] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            GetMyTrips();
        }
    }, [user]);

    const GetMyTrips = async () => {
        setLoading(true);
        setUserTrips([]);
        try {
            const q = query(collection(db, 'AI Trips'), where('userEmailID', '==', user?.email));
            const querySnapshot = await getDocs(q);
            
            const trips = [];
            querySnapshot.forEach((doc) => {
                trips.push({ id: doc.id, ...doc.data() });
            });
            setUserTrips(trips);
        } catch (error) {
            console.error("Error fetching trips:", error);
        } finally {
            setLoading(false);
        }
    }

    const toggleTheme = () => {
        updateTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        <Image 
                            source={{ uri: user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} 
                            className="w-full h-full" 
                        />
                    </View>
                    <TouchableOpacity onPress={toggleTheme}>
                        <Ionicons name={theme === 'dark' ? "sunny" : "moon-outline"} size={28} color={theme === 'dark' ? "white" : "black"} />
                    </TouchableOpacity>
                </View>

                {/* Greeting */}
                <Text className="text-3xl font-bold text-black dark:text-white mb-6 leading-tight" numberOfLines={1}>
                    Hello, {user?.displayName?.split(' ')[0] || 'Traveler'}! Where to next?
                </Text>

                {/* Create New Trip Button */}
                <TouchableOpacity className="bg-orange-500 rounded-full py-4 px-6 flex-row items-center justify-center mb-8 shadow-sm">
                    <Ionicons name="add" size={24} color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white text-xl font-bold" numberOfLines={1}>Create New Trip</Text>
                </TouchableOpacity>

                {/* My Trips Section */}
                <View className="mb-8">
                    <TouchableOpacity 
                        className="flex-row justify-between items-center mb-4"
                        onPress={() => router.push('/(tabs)/mytrip')}
                    >
                        <Text className="text-xl font-bold text-black dark:text-white" numberOfLines={1}>My Trips</Text>
                        <Ionicons name="arrow-forward" size={24} color={theme === 'dark' ? "white" : "black"} />
                    </TouchableOpacity>
                    
                    {userTrips.length === 0 ? (
                        <View className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 items-center">
                            <Text className="text-gray-500 dark:text-gray-400 text-center">No trips planned yet</Text>
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                            {userTrips.map((trip) => (
                                <View key={trip.id} className="mr-5 w-64">
                                    <Image 
                                        source={{ uri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop' }} 
                                        className="w-full h-40 rounded-2xl mb-3" 
                                        resizeMode="cover" 
                                    />
                                    <Text className="text-lg font-bold text-black dark:text-white" numberOfLines={1}>
                                        {trip.userSelection?.Location || "Trip Destination"}
                                    </Text>
                                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                                        {trip.userSelection?.TotalDays ? ` • ${trip.userSelection.TotalDays} Days` : 'Date TBD'}
                                        {trip.userSelection?.budget ? ` • ${trip.userSelection.budget} Budget` : 'Date TBD'}
                                        {trip.userSelection?.TravelingWith ? ` • ${trip.userSelection.TravelingWith}` : ''}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Popular Destinations Section */}
                <View className="mb-24">
                    <Text className="text-xl font-bold text-black dark:text-white mb-4">Popular Destinations</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {popularDestinations.map((item) => (
                            <View key={item.id} className="w-[48%] mb-4 h-64 rounded-3xl overflow-hidden relative">
                                <Image source={item.image} className="w-full h-full" resizeMode="cover" />
                                <View className="absolute bottom-0 left-0 right-0 p-4 bg-black/20">
                                    <Text className="text-white font-bold text-lg shadow-sm">{item.name}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default Home;