import { Ionicons } from '@expo/vector-icons';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { TabBarProvider, useTabBar } from '../../Context/TabBarContext';
import { useTheme } from '../../Context/ThemeContext';

const CustomTabBar = (props) => {
    const { isTabBarVisible } = useTabBar();
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(translateY, {
            toValue: isTabBarVisible ? 0 : 100,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isTabBarVisible]);

    return (
        <Animated.View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            transform: [{ translateY }],
            zIndex: 100,
            elevation: 5,
        }}>
            <BottomTabBar {...props} />
        </Animated.View>
    );
};

function TabLayoutContent() {
    const { theme } = useTheme();
    
    return (
        <Tabs 
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#f97316', // Orange-500
                tabBarInactiveTintColor: theme === 'dark' ? '#9ca3af' : 'gray', // Gray-400 for dark mode
                tabBarStyle: {
                    backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
                    borderTopColor: theme === 'dark' ? '#1f2937' : '#e5e7eb', // Gray-800 vs Gray-200
                },
                sceneStyle: {
                    backgroundColor: theme === 'dark' ? '#000000' : '#ffffff'
                }
            }}
        >
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

export default function TabLayout() {
    return (
        <TabBarProvider>
            <TabLayoutContent />
        </TabBarProvider>
    );
}
