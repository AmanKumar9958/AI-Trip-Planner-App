import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, LayoutAnimation, Platform, UIManager } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const ThemeContext = createContext();

// Default fallback values for when context is not available
const DEFAULT_THEME_CONTEXT = {
    theme: 'light',
    updateTheme: () => {},
    colorScheme: 'light',
    toggleColorScheme: () => {}
};

export const ThemeProvider = ({ children }) => {
    const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme();
    const [theme, setTheme] = useState('system'); // 'light', 'dark', 'system'

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('user-theme');
                if (savedTheme) {
                    setTheme(savedTheme);
                    if (savedTheme === 'system') {
                        const systemScheme = Appearance.getColorScheme();
                        setColorScheme(systemScheme);
                    } else {
                        setColorScheme(savedTheme);
                    }
                }
            } catch (error) {
                console.error('Failed to load theme', error);
            }
        };
        loadTheme();
    }, [setColorScheme]);

    const updateTheme = async (newTheme) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        try {
            setTheme(newTheme);
            await AsyncStorage.setItem('user-theme', newTheme);
            
            if (newTheme === 'system') {
                const systemScheme = Appearance.getColorScheme();
                setColorScheme(systemScheme);
            } else {
                setColorScheme(newTheme);
            }
        } catch (error) {
            console.error('Failed to save theme', error);
        }
    };

    // Listen for system changes if theme is 'system'
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
            if (theme === 'system') {
                setColorScheme(newColorScheme);
            }
        });
        return () => subscription.remove();
    }, [theme, setColorScheme]);

    return (
        <ThemeContext.Provider value={{ theme, updateTheme, colorScheme, toggleColorScheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        console.warn('useTheme must be used within ThemeProvider');
        return DEFAULT_THEME_CONTEXT;
    }
    return context;
};
