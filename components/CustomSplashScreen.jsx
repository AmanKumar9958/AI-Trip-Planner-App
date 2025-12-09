import { ResizeMode, Video } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function CustomSplashScreen({ onFinish }) {
  const [status, setStatus] = useState('image'); // 'image' | 'video'

    useEffect(() => {
        const timer = setTimeout(() => {
        setStatus('video');
        }, 500); // 0.5s for image

        return () => clearTimeout(timer);
    }, []);

    const handleVideoStatusUpdate = (playbackStatus) => {
        if (playbackStatus.didJustFinish) {
        onFinish();
        }
    };

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]} className="bg-[#ededed] flex-1 justify-center items-center">
            <StatusBar style={'dark'}/>
            {status === 'image' && (
                <Image
                source={require('../assets/images/splash.png')}
                style={StyleSheet.absoluteFill}
                resizeMode="contain"
                />
            )}
            {status === 'video' && (
                <Video
                source={require('../assets/videos/Trip_Genius_Loading.mp4')}
                style={{ width: '100%', height: '60%' }}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                rate={1.25}
                isLooping={false}
                onPlaybackStatusUpdate={handleVideoStatusUpdate}
                />
            )}
        </View>
    );
}
