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
        const unsub = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        }, (err) => {
            console.error('Auth state change error:', err);
            setError(err);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const promptAsync = async () => {
        try {
            setError(null);
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            const idToken = response.data?.idToken;
            
            if (idToken) {
                const credential = GoogleAuthProvider.credential(idToken);
                await signInWithCredential(auth, credential);
            } else {
                const errorMsg = "No ID token found in Google Sign-In response";
                console.error(errorMsg);
                setError(new Error(errorMsg));
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            setError(error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            setError(null);
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