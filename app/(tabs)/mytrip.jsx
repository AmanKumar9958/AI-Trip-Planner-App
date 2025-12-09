import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../Context/AuthContext';
import { useTheme } from '../../Context/ThemeContext';
import { db } from '../../Firebase/FirebaseConfig';
import TripDetailsModal from '../../components/TripDetailsModal';

export default function MyTrip() {
    const { user } = useAuth();
    const { theme, updateTheme } = useTheme();
    const [userTrips, setUserTrips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

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
        <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000' : '#fff' }}>
            <View className="px-5 pt-6 flex-1">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-3xl font-bold text-black dark:text-white">My Trips</Text>
                    <View className="flex-row items-center gap-8">
                        <TouchableOpacity onPress={toggleTheme}>
                            <Ionicons name={theme === 'dark' ? "sunny" : "moon"} size={24} color={theme === 'dark' ? "white" : "black"} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={GetMyTrips}>
                            <Ionicons name="refresh" size={24} color={theme === 'dark' ? "white" : "black"} />
                        </TouchableOpacity>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#f97316" className="mt-10" />
                ) : userTrips.length === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-xl font-bold text-gray-400 dark:text-gray-500">No trips planned yet</Text>
                    </View>
                ) : (
                    <FlatList
                        data={userTrips}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                onPress={() => {
                                    setSelectedTrip(item);
                                    setModalVisible(true);
                                }}
                                className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
                            >
                                <Text className="text-lg font-bold text-black dark:text-white">
                                    {item.userSelection?.Location || "Trip Destination"}
                                </Text>
                                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                                    {item.userSelection?.TotalDays ? `${item.userSelection.TotalDays} Days` : ''} 
                                    {item.userSelection?.budget ? ` • ${item.userSelection.budget} Budget` : ''}
                                    {item.userSelection?.TravelingWith ? ` • ${item.userSelection.TravelingWith}` : ''}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
            
            <TripDetailsModal 
                trip={selectedTrip}
                isVisible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </SafeAreaView>
    );
}
