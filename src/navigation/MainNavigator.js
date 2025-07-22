import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser } from '../context/UserContext';

// Screens
import EmptyStateScreen from '../screens/main/EmptyStateScreen';
import ChatScreen from '../screens/main/ChatScreen';
import MyAccountScreen from '../screens/main/MyAccountScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import PremiumScreen from '../screens/main/PremiumScreen';
import CreditsScreen from '../screens/main/CreditsScreen';
import ReferralScreen from '../screens/main/ReferralScreen';
import MatchingScreen from '../screens/main/MatchingScreen';
import AdScreen from '../screens/main/AdScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ChatStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmptyState" component={EmptyStateScreen} />
      <Stack.Screen name="Matching" component={MatchingScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Ad" component={AdScreen} />
    </Stack.Navigator>
  );
}

function AccountStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyAccount" component={MyAccountScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
      <Stack.Screen name="Credits" component={CreditsScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const { user } = useUser();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Chat') {
            iconName = 'chat';
          } else if (route.name === 'Account') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Chat" 
        component={ChatStackNavigator}
        options={{ tabBarLabel: 'Chat' }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountStackNavigator}
        options={{ tabBarLabel: 'My Account' }}
      />
    </Tab.Navigator>
  );
}