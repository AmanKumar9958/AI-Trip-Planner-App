import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function PageTransition({ children }) {
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
        <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
            {children}
        </Animated.View>
    );
}
