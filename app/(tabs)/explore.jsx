import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { useRef, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chatSession } from '../../AI/Modal';
import PageTransition from '../../components/PageTransition';
import { useAuth } from '../../Context/AuthContext';
import { useTabBar } from '../../Context/TabBarContext';
import { useTheme } from '../../Context/ThemeContext';
import { db } from '../../Firebase/FirebaseConfig';
import { AI_PROMPT, SelectBudget, SelectMembers } from '../../Options/options';

export default function Explore() {
    const { theme, updateTheme } = useTheme();
    const { setIsTabBarVisible } = useTabBar();
    const { user } = useAuth();
    const router = useRouter();
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

    const [destination, setDestination] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [duration, setDuration] = useState(5);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [selectedTraveler, setSelectedTraveler] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const timerRef = useRef(null);
    const API_KEY = process.env.EXPO_PUBLIC_PLACE_API;

    const toggleTheme = () => {
        updateTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const fetchSuggestions = async (q) => {
        const query = q.trim();
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }
        try {
            const url = `https://api.locationiq.com/v1/autocomplete?key=${API_KEY}&q=${encodeURIComponent(query)}&limit=5&format=json`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error("Error fetching location data:", error);
            setSuggestions([]);
        }
    };

    const handleInputChange = (text) => {
        setDestination(text);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => fetchSuggestions(text), 500);
    };

    const handleSelectLocation = (location) => {
        const locationName = location.display_name || location.name || "Unknown Location";
        setDestination(locationName);
        setSelectedLocation(location);
        setSuggestions([]);
    };

    const handleDurationChange = (value) => {
        if (duration + value > 0) {
            setDuration(duration + value);
        }
    };

    const onGenerateTrip = async () => {
        if (!destination || !selectedBudget || !selectedTraveler) {
            Alert.alert('Missing Information', 'Please fill all the fields to generate your trip plan.', [
                { text: 'OK' }
            ]);
            return;
        }

        setLoading(true);

        try {
            const finalPrompt = AI_PROMPT
                .replace('{location}', destination)
                .replace('{totalDays}', duration)
                .replace('{traveler}', selectedTraveler.people)
                .replace('{budget}', selectedBudget.budget);

            console.log("Sending Prompt:", finalPrompt);

            const result = await chatSession.sendMessage(finalPrompt);
            const responseText = result.response.text();
            console.log("AI Response:", responseText);
            
            const tripData = JSON.parse(responseText);

            // Save to Firebase
            const docId = Date.now().toString();
            await setDoc(doc(db, "AI Trips", docId), {
                userSelection: {
                    Location: destination,
                    TotalDays: duration,
                    budget: selectedBudget.budget,
                    TravelingWith: selectedTraveler.people
                },
                tripData: tripData,
                userEmailID: user?.email,
                id: docId
            });

            setLoading(false);
            setSelectedLocation(null);
            setDestination('');
            setDuration(5);
            setSelectedBudget(null);
            setSelectedTraveler(null);
            router.push('/(tabs)/mytrip');

        } catch (error) {
            console.error("Trip Generation Error:", error);
            Alert.alert("Error", "Failed to generate trip. Please try again.");
            setLoading(false);
        }
    };

    const renderIcon = (iconName, iconFamily, size = 24, color = "black") => {
        if (iconFamily === 'FontAwesome5') {
            return <FontAwesome5 name={iconName} size={size} color={color} solid />;
        }
        return <Ionicons name={iconName} size={size} color={color} />;
    };

    return (
        <PageTransition>
            <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000' : '#fff' }}>
                <ScrollView 
                    className="flex-1 px-5 pt-8" 
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={{ paddingBottom: 80 }}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-8">
                    <Text className="text-3xl font-bold text-black dark:text-white">Explore</Text>
                    <TouchableOpacity onPress={toggleTheme}>
                        <Ionicons name={theme === 'dark' ? "sunny" : "moon"} size={24} color={theme === 'dark' ? "white" : "black"} />
                    </TouchableOpacity>
                </View>

                {/* Destination */}
                <View className="mb-8 z-50">
                    <Text className="text-xl font-bold text-black dark:text-white mb-3">Destination</Text>
                    <View className="flex-row items-center bg-gray-100 dark:bg-gray-900 rounded-2xl p-2 border border-gray-200 dark:border-gray-800 relative">
                        <Ionicons name="search" size={24} color="gray" style={{ marginRight: 10 }} />
                        <TextInput
                            placeholder="Search Destination (e.g., Paris, Tokyo)..."
                            placeholderTextColor="gray"
                            className="flex-1 text-black dark:text-white text-base"
                            value={destination}
                            onChangeText={handleInputChange}
                        />
                        {destination.length > 0 && (
                            <TouchableOpacity onPress={() => {
                                setDestination('');
                                setSuggestions([]);
                                setSelectedLocation(null);
                            }}>
                                <Ionicons name="close-circle" size={24} color="gray" />
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    {suggestions.length > 0 && (
                        <View className="absolute top-20 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 max-h-60 overflow-hidden">
                            {suggestions.map((item, index) => (
                                <TouchableOpacity 
                                    key={`${item.place_id}-${index}`}
                                    onPress={() => handleSelectLocation(item)}
                                    className="p-3 border-b border-gray-100 dark:border-gray-800 active:bg-gray-100 dark:active:bg-gray-800"
                                >
                                    <Text className="text-black dark:text-white">{item.display_name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {selectedLocation && (
                        <View className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                            <Text className="font-bold text-orange-600 dark:text-orange-400 mb-1">Selected Location:</Text>
                            <Text className="text-black dark:text-white font-medium">{selectedLocation.display_name}</Text>
                            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Lat: {selectedLocation.lat}, Lon: {selectedLocation.lon}
                            </Text>
                        </View>
                    )}
                </View>
                {/* Duration */}
                <View className="mb-8">
                    <Text className="text-xl font-bold text-black dark:text-white mb-3">How many days?</Text>
                    <View className="flex-row justify-between items-center bg-gray-100 dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
                        <Text className="text-base font-medium text-black dark:text-white">Duration</Text>
                        <View className="flex-row items-center bg-white dark:bg-black rounded-xl p-1">
                            <TouchableOpacity 
                                onPress={() => handleDurationChange(-1)}
                                className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg items-center justify-center"
                            >
                                <Text className="text-xl font-bold text-black dark:text-white">-</Text>
                            </TouchableOpacity>
                            <Text className="mx-4 text-lg font-bold text-black dark:text-white w-6 text-center">{duration}</Text>
                            <TouchableOpacity 
                                onPress={() => handleDurationChange(1)}
                                className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg items-center justify-center"
                            >
                                <Text className="text-xl font-bold text-orange-600 dark:text-orange-400">+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Budget */}
                <View className="mb-8">
                    <Text className="text-xl font-bold text-black dark:text-white mb-3">What is your budget?</Text>
                    <View className="flex-row justify-between">
                        {SelectBudget.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setSelectedBudget(option)}
                                className={`w-[31%] p-4 rounded-2xl border items-center justify-center ${
                                    selectedBudget?.budget === option.budget 
                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                                }`}
                            >
                                <View className="mb-2">
                                    {renderIcon(option.iconName, option.iconFamily, 30, selectedBudget?.budget === option.budget ? '#ea580c' : (theme === 'dark' ? 'white' : 'black'))}
                                </View>
                                <Text className={`font-bold text-center ${
                                    selectedBudget?.budget === option.budget ? 'text-orange-600 dark:text-orange-400' : 'text-black dark:text-white'
                                }`}>{option.budget}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Travelers */}
                <View className="mb-24">
                    <Text className="text-xl font-bold text-black dark:text-white mb-3">Who are you traveling with?</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {SelectMembers.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setSelectedTraveler(option)}
                                className={`w-[48%] p-4 mb-4 rounded-2xl border items-center justify-center ${
                                    selectedTraveler?.people === option.people 
                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                                }`}
                            >
                                <View className="mb-2">
                                    {renderIcon(option.iconName, option.iconFamily, 30, selectedTraveler?.people === option.people ? '#ea580c' : (theme === 'dark' ? 'white' : 'black'))}
                                </View>
                                <Text className={`font-bold text-lg ${
                                    selectedTraveler?.people === option.people ? 'text-orange-600 dark:text-orange-400' : 'text-black dark:text-white'
                                }`}>{option.people}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                {/* Generate Button */}
                <View className="absolute bottom-20 left-5 right-5 mb-10">
                    <TouchableOpacity 
                        onPress={onGenerateTrip}
                        className="bg-orange-500 rounded-full py-4 items-center shadow-lg"
                    >
                        <View className="flex-row items-center">
                            <Text className="text-white text-xl font-bold mr-2">Generate Trip</Text>
                            <Ionicons name="sparkles" size={20} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
        </PageTransition>
    );
}
