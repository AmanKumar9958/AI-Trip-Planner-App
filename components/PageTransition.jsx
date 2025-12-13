import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import { useTheme } from '../Context/ThemeContext';

const { width } = Dimensions.get('window');

export default function PageTransition({ children }) {
    const { theme } = useTheme();
    const slideAnim = useRef(new Animated.Value(width)).current;

    useFocusEffect(
        useCallback(() => {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 0,
                speed: 4,
            }).start();

            return () => {
                slideAnim.setValue(width);
            };
        }, [slideAnim])
    );

    return (
        <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }], backgroundColor: theme === 'dark' ? '#000' : '#fff' }}>
            {children}
        </Animated.View>
    );
}
