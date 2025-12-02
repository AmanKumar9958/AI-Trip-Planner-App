import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../Context/AuthContext';

export default function Index() {
  const { user, logout } = useAuth();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Welcome Home</Text>
      {user && <TouchableOpacity onPress={logout}><Text>Logout</Text></TouchableOpacity>}
    </View>
  )
}