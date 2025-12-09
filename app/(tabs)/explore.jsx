import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../Context/ThemeContext';

const BudgetOptions = [
    { id: 'Cheap', title: 'Low', icon: '💵', desc: 'Stay conscious of costs' },
    { id: 'Moderate', title: 'Medium', icon: '💰', desc: 'Keep cost on the average' },
    { id: 'Luxury', title: 'High', icon: '💎', desc: "Don't worry about cost" },
];

const TravelerOptions = [
    { id: 'Just Me', title: 'Solo', icon: '✈️', desc: 'A sole traveler in exploration' },
    { id: 'Couple', title: 'Couple', icon: '🥂', desc: 'Two travelers in tandem' },
    { id: 'Family', title: 'Family', icon: '🏡', desc: 'A group of fun loving adv.' },
    { id: 'Friends', title: 'Friends', icon: '⛵', desc: 'A bunch of thrill-seekes' },
];

export default function Explore() {
    const { theme, updateTheme } = useTheme();
    const [destination, setDestination] = useState('');
    const [duration, setDuration] = useState(7);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [selectedTraveler, setSelectedTraveler] = useState(null);

    const toggleTheme = () => {
        updateTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleDurationChange = (value) => {
        if (duration + value > 0) {
            setDuration(duration + value);
        }
    };

    const onGenerateTrip = () => {
        if (!destination || !selectedBudget || !selectedTraveler) {
            Alert.alert('Missing Information', 'Please fill all the fields to generate your trip plan.', [
                { text: 'OK' }
            ]);
            return;
        }
        
        // TODO: Proceed with trip generation
        console.log("Generating trip with:", { destination, duration, selectedBudget, selectedTraveler });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000' : '#fff' }}>
            <ScrollView className="flex-1 px-5 pt-8" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header */}
                <View className="flex-row justify-between items-center mb-8">
                    <Text className="text-3xl font-bold text-black dark:text-white">Explore</Text>
                    <TouchableOpacity onPress={toggleTheme}>
                        <Ionicons name={theme === 'dark' ? "sunny" : "moon"} size={24} color={theme === 'dark' ? "white" : "black"} />
                    </TouchableOpacity>
                </View>

                {/* Destination */}
                <View className="mb-8">
                    <Text className="text-xl font-bold text-black dark:text-white mb-3">Destination</Text>
                    <View className="flex-row items-center bg-gray-100 dark:bg-gray-900 rounded-2xl p-2 border border-gray-200 dark:border-gray-800">
                        <Ionicons name="search" size={24} color="gray" style={{ marginRight: 10 }} />
                        <TextInput
                            placeholder="Search Destination (e.g., Paris, Tokyo)..."
                            placeholderTextColor="gray"
                            className="flex-1 text-black dark:text-white text-base"
                            value={destination}
                            onChangeText={setDestination}
                        />
                    </View>
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
                        {BudgetOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                onPress={() => setSelectedBudget(option.id)}
                                className={`w-[31%] p-4 rounded-2xl border items-center justify-center ${
                                    selectedBudget === option.id 
                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                                }`}
                            >
                                <Text className="text-3xl mb-2">{option.icon}</Text>
                                <Text className={`font-bold text-center ${
                                    selectedBudget === option.id ? 'text-orange-600 dark:text-orange-400' : 'text-black dark:text-white'
                                }`}>{option.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Travelers */}
                <View className="mb-24">
                    <Text className="text-xl font-bold text-black dark:text-white mb-3">Who are you traveling with?</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {TravelerOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                onPress={() => setSelectedTraveler(option.id)}
                                className={`w-[48%] p-4 mb-4 rounded-2xl border items-center justify-center ${
                                    selectedTraveler === option.id 
                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                                }`}
                            >
                                <Text className="text-4xl mb-2">{option.icon}</Text>
                                <Text className={`font-bold text-lg ${
                                    selectedTraveler === option.id ? 'text-orange-600 dark:text-orange-400' : 'text-black dark:text-white'
                                }`}>{option.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Generate Button */}
            <View className="absolute bottom-5 left-5 right-5">
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
        </SafeAreaView>
    );
}
