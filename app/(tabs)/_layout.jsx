import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';

export default function TabLayout() {
    const { theme } = useTheme();
    
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#f97316', // Orange-500
            tabBarInactiveTintColor: theme === 'dark' ? '#9ca3af' : 'gray', // Gray-400 for dark mode
            tabBarStyle: {
                backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
                borderTopColor: theme === 'dark' ? '#1f2937' : '#e5e7eb', // Gray-800 vs Gray-200
            }
        }}>
        <Tabs.Screen
            name="home"
            options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
            ),
            }}
        />
        <Tabs.Screen
            name="explore"
            options={{
            tabBarLabel: 'Explore',
            tabBarIcon: ({ color, size }) => (
                <Ionicons name="map" size={size} color={color} />
            ),
            }}
        />
        <Tabs.Screen
            name="mytrip"
            options={{
            tabBarLabel: 'My Trips',
            tabBarIcon: ({ color, size }) => (
                <Ionicons name="airplane" size={size} color={color} />
            ),
            }}
        />
        </Tabs>
    );
}
