import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import contexts
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { UserProvider, useUser } from './src/context/UserContext';
import { ChatProvider, useChat } from './src/context/ChatContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Colors and styles
const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#6D6D80',
  border: '#C6C6C8',
};

// Welcome Screen with Firebase Auth integration
const WelcomeScreen = ({ navigation }) => {
  const { signInWithGoogle, signInWithApple, signInWithEmail, signInWithPhone, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      navigation.navigate('Main');
    } else {
      Alert.alert('Sign In Error', result.error);
    }
  };

  const handleAppleSignIn = async () => {
    const result = await signInWithApple();
    if (result.success) {
      navigation.navigate('Main');
    } else {
      Alert.alert('Sign In Error', result.error);
    }
  };

  const handleEmailSignIn = () => {
    navigation.navigate('EmailAuth');
  };

  const handlePhoneSignIn = () => {
    navigation.navigate('PhoneAuth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.welcomeContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>SafeTalk</Text>
        </View>
        <Text style={styles.welcomeTitle}>Connect Safely, Chat Anonymously</Text>
        <Text style={styles.welcomeSubtitle}>
          Meet new people from around the world in a safe and secure environment.
          Start with 20 minutes of free chat every day!
        </Text>
        
        <View style={styles.authButtons}>
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: '#4285F4' }]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={24} color="white" />
            <Text style={styles.authButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: '#000000' }]}
            onPress={handleAppleSignIn}
            disabled={loading}
          >
            <Ionicons name="logo-apple" size={24} color="white" />
            <Text style={styles.authButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: COLORS.success }]}
            onPress={handlePhoneSignIn}
            disabled={loading}
          >
            <Ionicons name="call" size={24} color="white" />
            <Text style={styles.authButtonText}>Continue with Phone</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: COLORS.secondary }]}
            onPress={handleEmailSignIn}
            disabled={loading}
          >
            <Ionicons name="mail" size={24} color="white" />
            <Text style={styles.authButtonText}>Continue with Email</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// Home Screen with real business logic integration
const HomeScreen = ({ navigation }) => {
  const { user } = useUser();
  const { dailyTimer, credits, getRemainingTime, hasTimeAvailable } = useUser();
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (dailyTimer) {
      const remaining = getRemainingTime();
      setTimeRemaining(remaining);

      const timer = setInterval(() => {
        const newRemaining = getRemainingTime();
        setTimeRemaining(newRemaining);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [dailyTimer, getRemainingTime]);

  const formatTime = (milliseconds) => {
    if (milliseconds === Infinity) return '∞';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining === Infinity) return COLORS.success;
    if (timeRemaining <= 60000) return COLORS.danger; // 1 minute
    if (timeRemaining <= 180000) return COLORS.warning; // 3 minutes
    return COLORS.primary;
  };

  const handleStartChat = () => {
    if (hasTimeAvailable()) {
      navigation.navigate('Matching');
    } else {
      Alert.alert(
        'No Time Available',
        'You have no free time or credits remaining. Please purchase credits or upgrade to premium.',
        [
          { text: 'Buy Credits', onPress: () => navigation.navigate('Credits') },
          { text: 'Go Premium', onPress: () => navigation.navigate('Premium') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.homeContainer}>
        {/* Header */}
        <View style={styles.homeHeader}>
          <Text style={styles.greeting}>Hello! 👋</Text>
          <Text style={styles.subtitle}>Ready to meet someone new?</Text>
        </View>

        {/* Timer Display */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>
            {dailyTimer?.isPremium ? 'Premium - Unlimited' : 'Time Remaining Today'}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: dailyTimer?.isPremium ? '100%' : `${Math.max(0, (timeRemaining / (dailyTimer?.timeLimit || 1200000)) * 100)}%`,
                  backgroundColor: getTimerColor()
                }
              ]} 
            />
          </View>
          <Text style={[styles.timerText, { color: getTimerColor() }]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>

        {/* Credits Display */}
        <View style={styles.creditsCard}>
          <Ionicons name="wallet" size={24} color={COLORS.secondary} />
          <Text style={styles.creditsText}>{credits?.totalCredits || 0} Credits</Text>
          <Text style={styles.creditsSubtext}>({((credits?.totalCredits || 0) * 6)} minutes)</Text>
        </View>

        {/* Main Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustration}>
            <Ionicons name="chatbubble" size={80} color={COLORS.primary} />
          </View>
          <Text style={styles.illustrationText}>
            Start an anonymous conversation
          </Text>
          <Text style={styles.illustrationSubtext}>
            Connect with people from around the world safely and securely
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.startButton, { opacity: hasTimeAvailable() ? 1 : 0.6 }]}
            onPress={handleStartChat}
          >
            <Ionicons name="play" size={24} color="white" />
            <Text style={styles.startButtonText}>Start Chatting</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyCreditsButton}
            onPress={() => navigation.navigate('Credits')}
          >
            <Ionicons name="card" size={20} color={COLORS.primary} />
            <Text style={styles.buyCreditsText}>Buy Credits</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.premiumButton}
            onPress={() => navigation.navigate('Premium')}
          >
            <Ionicons name="star" size={20} color={COLORS.warning} />
            <Text style={styles.premiumButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Matching Screen with real matchmaking logic
const MatchingScreen = ({ navigation }) => {
  const { findPartner, skipPartner, isMatching, matchingSkips } = useChat();
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    let searchTimer;
    let matchingTimer;

    if (isMatching) {
      // Start search timer for UI
      searchTimer = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);

      // Start actual partner finding
      findPartner().then(result => {
        if (result.success && result.chat) {
          navigation.navigate('Chat');
        }
      });
    }

    return () => {
      if (searchTimer) clearInterval(searchTimer);
      if (matchingTimer) clearTimeout(matchingTimer);
    };
  }, [isMatching, findPartner, navigation]);

  const handleSkip = async () => {
    const result = await skipPartner();
    
    if (result.showAd) {
      Alert.alert(
        'Skip Limit Reached',
        'You\'ve reached your skip limit. Watch an ad to continue or upgrade to premium for unlimited skips.',
        [
          { text: 'Watch Ad', onPress: () => {/* TODO: Show ad */} },
          { text: 'Go Premium', onPress: () => navigation.navigate('Premium') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const formatSearchTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.matchingHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finding Partner</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.matchingContainer}>
        <View style={styles.matchingAnimation}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
        
        <Text style={styles.matchingText}>
          Searching for someone to chat with...
        </Text>
        
        <Text style={styles.searchTime}>
          Searching for {formatSearchTime(searchTime)}
        </Text>

        <View style={styles.skipInfo}>
          <Text style={styles.skipText}>Skips used: {matchingSkips}/5</Text>
          {matchingSkips >= 3 && (
            <Text style={styles.skipWarning}>
              {5 - matchingSkips} skips left before ad
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={isMatching}
        >
          <Ionicons name="play-forward" size={20} color={COLORS.primary} />
          <Text style={styles.skipButtonText}>Skip ({matchingSkips}/5)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Chat Screen with real-time messaging
const ChatScreen = ({ navigation }) => {
  const { currentChat, messages, sendMessage, endChat, isTyping, setIsTyping } = useChat();
  const [message, setMessage] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = async () => {
    if (message.trim()) {
      await sendMessage(message);
      setMessage('');
    }
  };

  const handleEndChat = async () => {
    await endChat();
    navigation.navigate('Home');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={handleEndChat}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.chatHeaderCenter}>
          <Text style={styles.chatTitle}>Anonymous Chat</Text>
          <Text style={styles.chatSubtitle}>{formatTime(timeElapsed)} elapsed</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Matching')}>
          <Ionicons name="play-forward" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Timer Bar - placeholder for now */}
      <View style={styles.timerBar}>
        <View style={styles.timerBarHeader}>
          <Text style={styles.timerBarLabel}>Time Remaining</Text>
          <Text style={styles.timerBarText}>9:18</Text>
        </View>
        <View style={styles.timerBarProgress}>
          <View style={[styles.timerBarFill, { width: '60%' }]} />
        </View>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.map((msg) => (
          <View key={msg._id} style={[
            styles.messageRow,
            msg.user._id === currentChat?.participants[0] ? styles.messageRowRight : styles.messageRowLeft
          ]}>
            <View style={[
              styles.messageBubble,
              msg.user._id === currentChat?.participants[0] ? styles.messageBubbleMe : styles.messageBubbleOther
            ]}>
              <Text style={[
                styles.messageText,
                msg.user._id === currentChat?.participants[0] ? styles.messageTextMe : styles.messageTextOther
              ]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          value={message}
          onChangeText={(text) => {
            setMessage(text);
            setIsTyping(text.length > 0);
          }}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textSecondary}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Bottom Actions */}
      <View style={styles.chatActions}>
        <TouchableOpacity style={styles.chatAction}>
          <Ionicons name="ban" size={20} color={COLORS.danger} />
          <Text style={[styles.chatActionText, { color: COLORS.danger }]}>Block</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatAction}>
          <Ionicons name="flag" size={20} color={COLORS.warning} />
          <Text style={[styles.chatActionText, { color: COLORS.warning }]}>Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatAction} onPress={handleEndChat}>
          <Ionicons name="call-sharp" size={20} color={COLORS.textSecondary} />
          <Text style={styles.chatActionText}>End Chat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Account Screen with real user data
const AccountScreen = ({ navigation }) => {
  const { user, credits } = useUser();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.accountContainer}>
        <View style={styles.accountHeader}>
          <Text style={styles.accountTitle}>My Account</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={COLORS.textSecondary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>{user?.displayName || 'SafeTalk User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              <Text style={styles.userStatus}>
                {user?.isPremium ? '⭐ Premium User' : '🆓 Free User'}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.stats?.totalChats || 0}</Text>
              <Text style={styles.statLabel}>Total Chats</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.stats?.totalMessagesSent || 0}</Text>
              <Text style={styles.statLabel}>Messages Sent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.stats?.averageRating || 0}⭐</Text>
              <Text style={styles.statLabel}>Average Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{credits?.totalCredits || 0}</Text>
              <Text style={styles.statLabel}>Credits Available</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Premium')}
          >
            <Ionicons name="star" size={24} color={COLORS.warning} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Upgrade to Premium</Text>
              <Text style={styles.menuItemSubtitle}>Unlimited chat time + exclusive features</Text>
            </View>
            {!user?.isPremium && <Text style={styles.newBadge}>NEW</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Credits')}
          >
            <Ionicons name="wallet" size={24} color={COLORS.primary} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Buy Credits</Text>
              <Text style={styles.menuItemSubtitle}>{credits?.totalCredits || 0} credits available</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="people" size={24} color={COLORS.success} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Referrals</Text>
              <Text style={styles.menuItemSubtitle}>Invite friends and earn credits</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings" size={24} color={COLORS.textSecondary} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Settings</Text>
              <Text style={styles.menuItemSubtitle}>App preferences and privacy</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Referral Code */}
        <View style={styles.referralCard}>
          <Text style={styles.referralTitle}>Your Referral Code</Text>
          <View style={styles.referralCodeContainer}>
            <Text style={styles.referralCode}>{user?.referralCode || 'Loading...'}</Text>
            <TouchableOpacity style={styles.copyButton}>
              <Ionicons name="copy" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.referralDescription}>
            Share your code with friends and earn credits when they join!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Placeholder screens
const PremiumScreen = () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.centerContainer}>
      <Ionicons name="star" size={80} color={COLORS.warning} />
      <Text style={styles.premiumTitle}>Premium Features</Text>
      <Text style={styles.premiumSubtitle}>Coming Soon!</Text>
    </View>
  </SafeAreaView>
);

const CreditsScreen = () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.centerContainer}>
      <Ionicons name="wallet" size={80} color={COLORS.primary} />
      <Text style={styles.creditsScreenTitle}>Buy Credits</Text>
      <Text style={styles.creditsScreenSubtitle}>Coming Soon!</Text>
    </View>
  </SafeAreaView>
);

// Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Account') {
            iconName = 'person';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Chat' }} />
      <Tab.Screen name="Account" component={AccountScreen} options={{ tabBarLabel: 'My Account' }} />
    </Tab.Navigator>
  );
};

// Main App Component with Context Providers
const AppWithProviders = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <UserProvider>
        <ChatProvider>
          <Stack.Navigator initialRouteName={user ? "Main" : "Welcome"} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="Matching" component={MatchingScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Premium" component={PremiumScreen} />
            <Stack.Screen name="Credits" component={CreditsScreen} />
          </Stack.Navigator>
        </ChatProvider>
      </UserProvider>
    </NavigationContainer>
  );
};

// Main App Component
export default function App() {
  return (
    <AuthProvider>
      <AppWithProviders />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  authButtons: {
    width: '100%',
    marginBottom: 32,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    marginBottom: 16,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  homeContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  homeHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  timerCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  creditsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 32,
  },
  creditsText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
    marginRight: 4,
  },
  creditsSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  illustration: {
    width: 160,
    height: 160,
    backgroundColor: COLORS.background,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  illustrationText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  illustrationSubtext: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButtons: {
    marginBottom: 40,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    marginBottom: 16,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  buyCreditsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buyCreditsText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  premiumButtonText: {
    color: COLORS.warning,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  matchingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  matchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  matchingAnimation: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.background,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  matchingText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  searchTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  skipInfo: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  skipWarning: {
    fontSize: 12,
    color: COLORS.warning,
  },
  tipsCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  chatSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  timerBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  timerBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerBarLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  timerBarText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  timerBarProgress: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  timerBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesContent: {
    padding: 16,
  },
  messageRow: {
    marginBottom: 16,
  },
  messageRowLeft: {
    alignItems: 'flex-start',
  },
  messageRowRight: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageBubbleOther: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
  },
  messageBubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextOther: {
    color: COLORS.text,
  },
  messageTextMe: {
    color: 'white',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  messageTimeOther: {
    color: COLORS.textSecondary,
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  chatAction: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chatActionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  accountContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  accountHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  accountTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  newBadge: {
    backgroundColor: COLORS.danger,
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  referralCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  referralCode: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  copyButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
  },
  referralDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 8,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  creditsScreenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 8,
  },
  creditsScreenSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});