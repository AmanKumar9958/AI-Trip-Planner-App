import { createContext, useContext, useState } from 'react';

const TabBarContext = createContext();

// Default fallback values for when context is not available
const DEFAULT_TABBAR_CONTEXT = {
    isTabBarVisible: true,
    setIsTabBarVisible: () => {}
};

export const TabBarProvider = ({ children }) => {
    const [isTabBarVisible, setIsTabBarVisible] = useState(true);

    return (
        <TabBarContext.Provider value={{ isTabBarVisible, setIsTabBarVisible }}>
            {children}
        </TabBarContext.Provider>
    );
};

export const useTabBar = () => {
    const context = useContext(TabBarContext);
    if (!context) {
        console.warn('useTabBar must be used within TabBarProvider');
        return DEFAULT_TABBAR_CONTEXT;
    }
    return context;
};
