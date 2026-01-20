import { createContext, useContext, useState } from 'react';

const TabBarContext = createContext();

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
    // Return safe defaults if context is not available
    // This prevents crashes when components try to use the context before it's initialized
    if (!context) {
        console.warn('useTabBar must be used within a TabBarProvider. Returning safe defaults.');
        return {
            isTabBarVisible: true,
            setIsTabBarVisible: () => {},
        };
    }
    return context;
};
