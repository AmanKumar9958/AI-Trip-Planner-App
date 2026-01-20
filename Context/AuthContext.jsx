import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../Firebase/FirebaseConfig';
import { WEB_CLIENT_ID } from '../lib/utils';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        try {
            GoogleSignin.configure({
                webClientId: WEB_CLIENT_ID,
            });
        } catch (err) {
            console.error('Error configuring GoogleSignin:', err);
            setError(err);
        }
    }, []);

    useEffect(() => {
        try {
            const unsub = onAuthStateChanged(auth, (user) => {
                setUser(user);
                // Only set loading to false on initial load
                if (initialLoad) {
                    setLoading(false);
                    setInitialLoad(false);
                }
            });
            return () => {
                try {
                    unsub();
                } catch (err) {
                    console.error('Error unsubscribing from auth state:', err);
                }
            };
        } catch (err) {
            console.error('Error setting up auth state listener:', err);
            setError(err);
            setLoading(false);
            setInitialLoad(false);
        }
    }, [initialLoad]);

    const promptAsync = async () => {
        try {
            setError(null); // Clear previous errors
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            const idToken = response.data?.idToken;
            
            if (idToken) {
                const credential = GoogleAuthProvider.credential(idToken);
                await signInWithCredential(auth, credential);
            } else {
                const errorMsg = "No ID token found in Google Sign-In response";
                console.error(errorMsg);
                const err = new Error(errorMsg);
                setError(err);
                throw err;
            }
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            setError(error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            setError(null); // Clear previous errors
            await GoogleSignin.signOut();
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
            setError(error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, promptAsync, logout, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};