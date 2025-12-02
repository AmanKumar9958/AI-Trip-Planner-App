import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../Firebase/FirebaseConfig';

import { ANDROID_CLIENT_ID, IOS_CLIENT_ID, WEB_CLIENT_ID } from '../lib/utils';

WebBrowser.maybeCompleteAuthSession();

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [, response, promptAsync] = Google.useAuthRequest({
        iosClientId: IOS_CLIENT_ID,
        androidClientId: ANDROID_CLIENT_ID,
        webClientId: WEB_CLIENT_ID,
        // The redirect URI must match what is in Google Cloud Console.
        // If makeRedirectUri({ useProxy: true }) returns an exp:// URL, use the explicit proxy URL below.
        // Format: https://auth.expo.io/@<your-expo-username>/AI-Trip-Planner-App
        // Example: https://auth.expo.io/@amankumar9958/AI-Trip-Planner-App
        redirectUri: 'https://auth.expo.io/@amanwebdev24/AI-Trip-Planner-App', 
    });

    // console.log('Expo redirectUri:', makeRedirectUri({ useProxy: true }));


    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential);
        }
    }, [response]);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, promptAsync, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};