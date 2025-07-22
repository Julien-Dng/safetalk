import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import auth from '@react-native-firebase/auth';
import { initializeFirebase } from './src/config/firebase';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import LoadingScreen from './src/screens/LoadingScreen';
import { AuthProvider } from './src/context/AuthContext';
import { UserProvider } from './src/context/UserContext';
import { ChatProvider } from './src/context/ChatContext';

const Stack = createStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Initialize Firebase
  useEffect(() => {
    initializeFirebase();
  }, []);

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    <PaperProvider>
      <AuthProvider>
        <UserProvider>
          <ChatProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              {user ? <MainNavigator /> : <AuthNavigator />}
            </NavigationContainer>
          </ChatProvider>
        </UserProvider>
      </AuthProvider>
    </PaperProvider>
  );
}