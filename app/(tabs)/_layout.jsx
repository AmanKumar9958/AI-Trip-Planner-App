import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f97316', // Orange-500
        tabBarInactiveTintColor: 'gray',
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
