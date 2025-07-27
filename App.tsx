import React, { useState, useCallback, useEffect, useRef } from "react";
import { StyleSheet, StatusBar } from "react-native";
import { NavigationContainer, DarkTheme} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { onAuthStateChanged } from "firebase/auth";

import type { ChatSession } from './services/chatService';
import  { ChatService } from './services/chatService';

// Import screens
import { SignInScreen } from "./components/SignInScreen";
import { SetupScreen } from "./components/SetupScreen";
import ChatScreen from "./components/ChatScreen";
import { AccountScreen } from "./components/AccountScreen";
import { ReferralScreen } from "./components/ReferralScreen";
import { PremiumScreen } from "./components/PremiumScreen";
import { MyRewardsScreen } from "./components/MyRewardsScreen";
import { EmptyState } from "./components/EmptyState";

// Import popups/modals
import { TimerPopup } from "./components/TimerPopup";
import { RatingPopup } from "./components/RatingPopup";
import { LowTimeAlert } from "./components/LowTimeAlert";
import { InterstitialAd } from "./components/InterstitialAd";
import { AuthService } from "./services/authService";
import { MatchingService } from "./services/matchingService";
import { interlocuteurs } from "./interlocuteurs";

// Firebase
import { auth, db } from "./config/firebase";
import { doc, updateDoc } from 'firebase/firestore';

const Stack = createStackNavigator();

const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0f0f23',
  },
};

const DAILY_FREE_LIMIT_SEC = 20 * 60

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [isSearchingPartner, setIsSearchingPartner] = useState(false); // 🆕 État de recherche
  const navigationRef = React.useRef<any>(null);
  const profileUnsubscribe = useRef<(() => void) | null>(null);

  const freeTimeRemaining =
  userData?.isPremium
    ? Infinity
    : Math.max(0, DAILY_FREE_LIMIT_SEC - (userData?.dailyFreeTimeUsed ?? 0));

  function getPartnerUsername(session: ChatSession | null, currentUserId: string | undefined): string | undefined {
    if (!session || !currentUserId) return undefined;
    const partnerId = session.participants.find(id => id !== currentUserId);
    return partnerId ? session.participantProfiles[partnerId]?.username : undefined;
  }

 useEffect(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, async user => {
    if (user) {
      const profile = await AuthService.getUserProfile(user.uid);
      setUserData(profile);
      setIsAuthenticated(true);

      profileUnsubscribe.current?.();
      profileUnsubscribe.current = AuthService.subscribeToUserProfile(
        user.uid,
        updated => {
          if (updated) {
            setUserData(updated);
          }
        }
      );

      await updateDoc(doc(db, "users", user.uid), {
        isOnline: true,
        lastSeen: new Date().toISOString()
      });

      const sessions = await ChatService.getUserActiveSessions(user.uid);
      setChatSession(sessions.length > 0 ? sessions[0] : null);
      setSetupCompleted(profile.hasCompletedSetup);
    } else {
      profileUnsubscribe.current?.();
      profileUnsubscribe.current = null;
      setUserData(null);
      setIsAuthenticated(false);
      setSetupCompleted(false);
      setChatSession(null);
    }
  });

  return () => {
    unsubscribeAuth();
    profileUnsubscribe.current?.();
    profileUnsubscribe.current = null;
  };
}, []);

  const handleSignIn = async (_username: string,profile: any) => {
    setUserData(profile);
    setIsAuthenticated(true);

    const sessions = await ChatService.getUserActiveSessions(profile.uid);
    setChatSession(sessions.length > 0 ? sessions[0] : null);
    setSetupCompleted(profile.hasCompletedSetup);
  };

  // 🆕 Logique de matchmaking centralisée
  const startMatchmaking = async (shouldNavigateToEmpty = false) => {
    if (!userData || isSearchingPartner) return;
    
    setIsSearchingPartner(true);
    console.log('🔍 Starting partner search...');
    
    // Si on doit naviguer vers EmptyState (pour voir l'animation)
    if (shouldNavigateToEmpty) {
      navigationRef.current?.navigate('Empty');
    }
    
    try {
      const { promise } = await MatchingService.findMatch(userData);
      const result = await promise;
      
      if (result.success && result.chatId) {
        console.log('✅ Match found! Navigating to chat...');
        const newSession = await ChatService.getSessionById(result.chatId);
        setChatSession(newSession);
        setIsSearchingPartner(false);
        navigationRef.current?.navigate('Chat', {
          sessionId: result.chatId,
          chatType: 'human'
        });
      } else {
        console.log('❌ No match found, creating mock session...');
        // Fallback: créer une session avec un utilisateur de test
        const randomUser = interlocuteurs[Math.floor(Math.random() * interlocuteurs.length)];
        const mockSession = await ChatService.createChatSession(userData, randomUser, 'human', false);
        setChatSession(mockSession);
        setIsSearchingPartner(false);
        navigationRef.current?.navigate('Chat', {
          sessionId: mockSession.id,
          chatType: 'human'
        });
      }
    } catch (error) {
      console.error('❌ Error during partner search:', error);
      setIsSearchingPartner(false);
      // Optionnel: afficher une erreur à l'utilisateur
    }
  };

  // Handler pour Find Partner depuis EmptyState
  const handleFindPartner = () => {
    startMatchmaking(false); // Pas besoin de naviguer, on est déjà sur EmptyState
  };

  // 🆕 Handler pour Change Partner depuis ChatScreen (SANS navigation)
  const handleChangePartner = async (currentSessionId: string) => {
    if (!userData || isSearchingPartner) return;
    
    console.log('🔄 Changing partner for session:', currentSessionId);
    
    setIsSearchingPartner(true);
    
    try {
      // Terminer la session actuelle
      await ChatService.endChatSession(
        currentSessionId,
        Math.floor((Date.now() - (chatSession?.metadata.startTime || Date.now())) / 1000),
        0
      );
      
      console.log('✅ Current session ended, starting new matchmaking...');
      
      // Démarrer le matchmaking SANS navigation
      const { promise } = await MatchingService.findMatch(userData);
      const result = await promise;
      
      if (result.success && result.chatId) {
        console.log('✅ New match found! Updating session...');
        const newSession = await ChatService.getSessionById(result.chatId);
        setChatSession(newSession);
        setIsSearchingPartner(false);
        // PAS de navigation - on reste sur ChatScreen qui se met à jour automatiquement
      } else {
        console.log('❌ No match found, creating mock session...');
        // Fallback: créer une session avec un utilisateur de test
        const randomUser = interlocuteurs[Math.floor(Math.random() * interlocuteurs.length)];
        const mockSession = await ChatService.createChatSession(userData, randomUser, 'human', false);
        setChatSession(mockSession);
        setIsSearchingPartner(false);
        // PAS de navigation - on reste sur ChatScreen
      }
    } catch (error) {
      console.error('❌ Error during partner change:', error);
      setIsSearchingPartner(false);
    }
  };
  
  // Chat avec AI (inchangé)
  const handleChatWithAI = async () => {
    if (!userData) return;
    try {
      const aiSession = await ChatService.createChatSession(
        userData,
        null,
        'ai',
        false
      );
      setChatSession(aiSession);
      navigationRef.current?.navigate('Chat', {
        sessionId: aiSession.id,
        chatType: 'ai'
      });
    } catch (error) {
      console.error('Failed to start AI chat:', error);
    }
  };

  const handleCloseChat = (
    _freeTimeLeft: number,
    _paidTimeLeft: number
  ) => {
    setChatSession(null);
    setIsSearchingPartner(false); // 🆕 Reset l'état de recherche
    navigationRef.current?.navigate('Empty');
  };
  
  const handleResumeChat = () => {
    if (chatSession) {
      navigationRef.current?.navigate("Chat", { 
        sessionId: chatSession.id,
        chatType: chatSession.isAIChat ? 'ai' : 'human'
      });
    }
  };
  
const handleLogout = async () => {
  await AuthService.signOut();
  profileUnsubscribe.current?.();
  profileUnsubscribe.current = null;
  setIsAuthenticated(false);
  setUserData(null);
  setSetupCompleted(false);
  setIsSearchingPartner(false); // 🆕 Reset l'état de recherche
};

const handleUpdateUsername = async (newUsername: string) => {
  if (!userData?.uid) return;
  try {
    await AuthService.updateUserProfile(userData.uid, { username: newUsername });
    setUserData({ ...userData, username: newUsername });
    console.log("✅ Nom d'utilisateur mis à jour :", newUsername);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du nom d'utilisateur :", error);
  }
};

  const handleConvertCredits = () => {
    const rewardsEarned = Math.floor((userData?.giftableCredits ?? 0) / 15);
    const creditsUsed = rewardsEarned * 15;

    setUserData((prev: any) => ({
      ...prev,
      giftableCredits: prev.giftableCredits - creditsUsed,
      totalRewards: prev.totalRewards + rewardsEarned,
    }));
  };

  const handleUpgrade = () => {
    setUserData((prev: any) => ({ ...prev, isPremium: true }));
  };

  const handleSetupComplete = async (role: string) => {
    if (userData?.uid) {
      try {
        await AuthService.completeSetup(userData.uid, role as 'talk' | 'listen' | 'both');
      } catch (error) {
        console.error('❌ Error completing setup:', error);
      }
    }
    if (userData) {
        setUserData({ ...userData, role, hasCompletedSetup: true });
    }
    setSetupCompleted(true);
    navigationRef.current?.navigate('Empty');
  };

  const hasActiveSession = () => {
    return chatSession?.status === 'active';
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        <NavigationContainer theme={MyTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SignIn">
              {() => <SignInScreen onSignIn={handleSignIn} />}
            </Stack.Screen> 
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  if (!setupCompleted) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        <NavigationContainer theme={MyTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Setup">
              {() => (
                <SetupScreen
                  onComplete={handleSetupComplete}
                  onShowAccount={() => navigationRef.current?.navigate("Account")}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      <NavigationContainer ref={navigationRef} theme={MyTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Empty">
        <Stack.Screen name="Empty">
            {() => (
              <EmptyState
                onBack={() => navigationRef.current?.navigate("Setup")}
                onFindPartner={handleFindPartner}
                onChatWithAI={handleChatWithAI}
                onShowAccount={() => navigationRef.current?.navigate("Account")}
                isSearchingPartner={isSearchingPartner} // 🆕 Passer l'état de recherche
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Chat">
            {() => (
              <ChatScreen 
                onCloseChat={handleCloseChat}
                onChangePartner={handleChangePartner} // 🆕 Passer la fonction
                isSearchingPartner={isSearchingPartner} // 🆕 Passer l'état de recherche
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Account">
            {({ navigation }) => (
              <AccountScreen
                username={userData?.username}
                credits={userData?.credits}
                isPremium={userData?.isPremium}
                dailyFreeTimeRemaining={freeTimeRemaining}
                paidTimeAvailable={userData?.paidTimeAvailable || 0}
                onBack={() => navigation.goBack()}
                onShowReferral={() => navigationRef.current?.navigate("Referral")}
                onShowRewards={() => navigationRef.current?.navigate("Rewards")}
                onPremium={() => navigationRef.current?.navigate("Premium")}
                onLogout={handleLogout}
                onUpdateUsername={handleUpdateUsername}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Setup">
            {() => (
              <SetupScreen
                onShowAccount={() => navigationRef.current?.navigate("Account")}
                onComplete={handleSetupComplete}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Referral">
            {({ navigation }) => (
              <ReferralScreen
                onBack={() => navigation.goBack()}
                isPremium={userData?.isPremium}
                referralCount={userData?.referralCount}
                totalRewards={userData?.totalRewards}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Rewards">
            {({ navigation }) => (
              <MyRewardsScreen
                onBack={() => navigation.goBack()}
                giftableCredits={userData?.giftableCredits}
                isPremium={userData?.isPremium}
                onConvertCredits={handleConvertCredits}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Premium">
            {({ navigation }) => (
              <PremiumScreen
                onBack={() => navigation.goBack()}
                isPremium={userData?.isPremium}
                onUpgrade={handleUpgrade}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>

        {/* Modals */}
        <TimerPopup isOpen={false} onClose={() => {}} credits={0} onExtendTime={() => {}} onGoToPremium={() => {}} />
        <LowTimeAlert isOpen={false} onClose={() => {}} freeTimeLeft={0} paidTimeLeft={0} credits={0} onBuyTime={() => {}} onGoToPremium={() => {}} />
        <InterstitialAd isOpen={false} onClose={() => {}} onWatchAd={() => {}} partnerChangeCount={0} />
        <RatingPopup isOpen={false} onClose={() => {}} interlocutorName="" onSubmitRating={() => {}} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}