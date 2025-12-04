import { makeRedirectUri } from 'expo-auth-session';
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
        // Request an ID token so we can sign in with Firebase using the id_token
        responseType: 'id_token',
        scopes: ['profile', 'email'],
    });

    // console.log("Generated Redirect URI:", makeRedirectUri({ useProxy: true }));


    useEffect(() => {
        if (response?.type === 'success') {
            // For the id_token flow the token is available under `response.params.id_token`.
            // If a different flow is used (e.g. code) you'll need a server-side exchange.
            const idToken = response.params?.id_token || response.params?.idToken || response.params?.access_token;
            if (idToken) {
                const credential = GoogleAuthProvider.credential(idToken);
                signInWithCredential(auth, credential).catch(err => {
                    console.error('Firebase signInWithCredential error:', err);
                });
            } else {
                console.error('No id_token returned from Google auth response', response);
            }
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