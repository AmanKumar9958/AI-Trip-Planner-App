import { Ionicons } from '@expo/vector-icons';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Share, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../Context/AuthContext';
import { useTabBar } from '../../Context/TabBarContext';
import { useTheme } from '../../Context/ThemeContext';
import { db } from '../../Firebase/FirebaseConfig';
import PageTransition from '../../components/PageTransition';
import TripDetailsModal from '../../components/TripDetailsModal';

const TripItem = ({ item, shareTrip, confirmDelete, onPress }) => {
    const swipeableRef = useRef(null);
    const timeoutRef = useRef(null);

    const handleOpen = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            swipeableRef.current?.close();
        }, 3000);
    };

    const handleClose = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <Swipeable
            ref={swipeableRef}
            overshootLeft={false}
            overshootRight={false}
            onSwipeableOpen={handleOpen}
            onSwipeableClose={handleClose}
            renderLeftActions={() => (
                <View className="justify-center">
                    <TouchableOpacity
                        onPress={() => {
                            handleClose();
                            swipeableRef.current?.close();
                            shareTrip(item);
                        }}
                        className="ml-2 px-4 py-3 bg-blue-500 rounded-xl items-center justify-center"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="share-social" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Share</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
            renderRightActions={() => (
                <View className="justify-center items-end">
                    <TouchableOpacity
                        onPress={() => {
                            handleClose();
                            swipeableRef.current?.close();
                            confirmDelete(item.id, item.userSelection?.Location);
                        }}
                        className="mr-2 px-4 py-3 bg-red-600 rounded-xl items-center justify-center"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="trash" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Delete</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        >
            <TouchableOpacity 
                onPress={onPress}
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
        </Swipeable>
    );
};

export default function MyTrip() {
    const { user } = useAuth();
    const { theme, updateTheme } = useTheme();
    const { setIsTabBarVisible } = useTabBar();
    const lastContentOffset = useRef(0);

    const onScroll = (event) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        if (currentOffset > lastContentOffset.current && currentOffset > 20) {
            setIsTabBarVisible(false);
        } else if (currentOffset < lastContentOffset.current) {
            setIsTabBarVisible(true);
        }
        lastContentOffset.current = currentOffset;
    };

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
        
        // Validate user and user.email exist
        if (!user || !user.email) {
            console.warn('Cannot fetch trips: User or user email is not available');
            setLoading(false);
            return;
        }

        try {
            const q = query(collection(db, 'AI Trips'), where('userEmailID', '==', user.email));
            
            const querySnapshot = await getDocs(q);
            
            const trips = [];
            querySnapshot.forEach((doc) => {
                trips.push({ id: doc.id, ...doc.data() });
            });
            setUserTrips(trips);
        } catch (error) {
            console.error("Error fetching trips:", error);
            // Don't show alert for fetch errors, just log them
        } finally {
            setLoading(false);
        }
    }

    const toggleTheme = () => {
        updateTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const deleteTrip = async (tripId) => {
        try {
            await deleteDoc(doc(db, 'AI Trips', tripId));
            setUserTrips((prev) => prev.filter((t) => t.id !== tripId));
        } catch (error) {
            console.error('Error deleting trip:', error);
            Alert.alert('Delete Failed', 'Could not delete the trip. Please try again.');
        }
    };

    const confirmDelete = (tripId, locationLabel) => {
        Alert.alert(
            'Delete Trip',
            `Are you sure you want to delete ${locationLabel || 'this trip'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteTrip(tripId) },
            ]
        );
    };

    const shareTrip = async (trip) => {
        try {
            const destination = trip?.userSelection?.Location || 'Trip';
            const days = trip?.userSelection?.TotalDays ? `${trip.userSelection.TotalDays} Day(s)` : '';
            const budget = trip?.userSelection?.budget ? `Budget: ${trip.userSelection.budget}` : '';
            const withWho = trip?.userSelection?.TravelingWith ? `With: ${trip.userSelection.TravelingWith}` : '';
            const summary = [destination, days, budget, withWho].filter(Boolean).join(' • ');

            await Share.share({
                message: `AI Trip Planner
${summary}

Open the app to view full itinerary.`,
            });
        } catch (error) {
            console.error('Error sharing trip:', error);
            Alert.alert('Share Failed', 'Could not share the trip.');
        }
    };

    return (
        <PageTransition>
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
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                        contentContainerStyle={{ paddingBottom: 80 }}
                        renderItem={({ item }) => (
                            <TripItem 
                                item={item}
                                shareTrip={shareTrip}
                                confirmDelete={confirmDelete}
                                onPress={() => {
                                    setSelectedTrip(item);
                                    setModalVisible(true);
                                }}
                            />
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
        </PageTransition>
    );
}
