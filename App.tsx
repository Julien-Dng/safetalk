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
import { PresenceService } from "./services/presenceService";
import { interlocuteurs } from "./interlocuteurs";

// Firebase
import { auth, db } from "./config/firebase";
import { doc, updateDoc } from 'firebase/firestore';
import { database } from './config/firebase'

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
  const [isSearchingPartner, setIsSearchingPartner] = useState(false);
  const [presenceInitialized, setPresenceInitialized] = useState(false);
  const [presenceError, setPresenceError] = useState<string | null>(null);
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

  // 🧪 FONCTIONS DE DIAGNOSTIC INTÉGRÉES

  // Fonction de diagnostic complète
  const runComprehensiveDiagnostic = async () => {
    console.log('🔍 DIAGNOSTIC: Starting comprehensive matching check...');
    console.log('==========================================');
    
    if (!userData) {
      console.log('❌ DIAGNOSTIC: No user data available');
      return;
    }
    
    console.log(`👤 DIAGNOSTIC: Current user: ${userData.username} (${userData.uid})`);
    console.log(`🎭 DIAGNOSTIC: User role: ${userData.role}`);
    console.log(`💎 DIAGNOSTIC: Premium: ${userData.isPremium}`);
    console.log(`🌟 DIAGNOSTIC: Ambassador: ${userData.isAmbassador}`);
    console.log('==========================================');
    
    // 1. Vérifier la configuration Firebase
    console.log('🔥 DIAGNOSTIC: Checking Firebase configuration...');
    try {
      console.log('🌐 DIAGNOSTIC: Database URL:', database.app.options.databaseURL);
      console.log('📱 DIAGNOSTIC: App name:', database.app.name);
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Firebase config check failed:', error);
    }
    
    // 2. Vérifier l'état de la présence
    console.log('📡 DIAGNOSTIC: Checking presence service...');
    try {
      await PresenceService.debugPresenceState();
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Presence check failed:', error);
    }
    
    // 3. Vérifier les statistiques de présence
    console.log('📊 DIAGNOSTIC: Getting presence statistics...');
    try {
      const stats = await PresenceService.getPresenceStats();
      console.log('📊 DIAGNOSTIC: Presence stats:', {
        totalOnline: stats.totalOnline,
        searching: stats.searching,
        inChat: stats.inChat,
        available: stats.available
      });
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Stats check failed:', error);
    }
    
    // 4. Vérifier les utilisateurs disponibles
    console.log('🔍 DIAGNOSTIC: Looking for available users...');
    try {
      const availableUsers = await PresenceService.getAvailableUsers([userData.uid]);
      console.log(`👥 DIAGNOSTIC: Found ${availableUsers.length} available users`);
      
      if (availableUsers.length > 0) {
        console.log('👥 DIAGNOSTIC: Available users details:');
        availableUsers.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.username} (${user.userId})`);
          console.log(`     Role: ${user.role}`);
          console.log(`     Status: ${user.status}`);
          console.log(`     Premium: ${user.isPremium}`);
          
          // Tester la compatibilité
          const compatible = PresenceService.debugRoleCompatibility(userData.role, user.role);
          console.log(`     Compatible with you: ${compatible ? '✅ YES' : '❌ NO'}`);
        });
      } else {
        console.log('📭 DIAGNOSTIC: No available users found');
      }
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Available users check failed:', error);
    }
    
    // 5. Tester la compatibilité des rôles
    console.log('🤝 DIAGNOSTIC: Testing role compatibility matrix...');
    const roles = ['talk', 'listen', 'both'];
    roles.forEach(role1 => {
      roles.forEach(role2 => {
        PresenceService.debugRoleCompatibility(role1, role2);
      });
    });
    
    // 6. Vérifier les statistiques de matchmaking
    console.log('📊 DIAGNOSTIC: Getting matchmaking statistics...');
    try {
      const matchStats = await MatchingService.getMatchStats();
      console.log('📊 DIAGNOSTIC: Matchmaking stats:', {
        waitingCount: matchStats.waitingCount,
        activeMatches: matchStats.activeMatches,
        averageWaitTime: `${matchStats.averageWaitTime}s`
      });
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Matchmaking stats failed:', error);
    }
    
    // 7. Test de l'instant matching
    console.log('⚡ DIAGNOSTIC: Testing instant matching capability...');
    try {
      const instantUsers = await PresenceService.getAvailableUsers([userData.uid], userData.role);
      if (instantUsers.length > 0) {
        console.log('⚡ DIAGNOSTIC: Instant matching possible with:', instantUsers[0].username);
      } else {
        console.log('⚡ DIAGNOSTIC: No instant match available');
      }
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Instant matching test failed:', error);
    }
    
    console.log('==========================================');
    console.log('✅ DIAGNOSTIC: Comprehensive check completed');
  };

  // Fonction pour créer un utilisateur mock pour tester
  const createMockUserForTesting = async () => {
    if (!userData) return;
    
    // Créer un utilisateur mock avec un rôle compatible
    const mockRole = userData.role === 'talk' ? 'listen' : 
                     userData.role === 'listen' ? 'talk' : 'both';
                     
    const mockUsername = `MockUser_${mockRole}_${Math.random().toString(36).substring(7)}`;
    
    console.log(`🧪 Creating mock user: ${mockUsername} with role: ${mockRole}`);
    await PresenceService.debugCreateMockUser(mockUsername, mockRole);
    
    // Attendre un peu puis chercher des utilisateurs
    setTimeout(async () => {
      console.log('🔍 Checking for mock user...');
      const users = await PresenceService.getAvailableUsers([userData.uid]);
      console.log(`Found ${users.length} users after mock creation`);
    }, 1000);
  };

  // Fonction pour nettoyer et redémarrer la présence
  const restartPresence = async () => {
    if (!userData) return;
    
    console.log('🔄 Restarting presence service...');
    try {
      await PresenceService.endPresence();
      setPresenceInitialized(false);
      
      setTimeout(async () => {
        await PresenceService.initializePresence(userData);
        setPresenceInitialized(true);
        console.log('✅ Presence restarted successfully');
      }, 1000);
    } catch (error) {
      console.error('❌ Error restarting presence:', error);
    }
  };

  // Fonction pour forcer le statut "searching"
  const forceSearchingStatus = async () => {
    if (!presenceInitialized) {
      console.log('❌ Presence not initialized');
      return;
    }
    
    console.log('🔍 Forcing searching status...');
    await PresenceService.updateUserStatus('searching');
    
    // Vérifier après 2 secondes
    setTimeout(async () => {
      const stats = await PresenceService.getPresenceStats();
      console.log('📊 Stats after forcing search:', stats);
    }, 2000);
  };

  // 🔥 Auth state avec intégration de la présence optimisée et gestion d'erreur améliorée
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async user => {
      if (user) {
        try {
          console.log('🔄 App: User authenticated, loading profile...');
          const profile = await AuthService.getUserProfile(user.uid);
          
          if (!profile) {
            console.error('❌ App: Profile not found for user');
            await AuthService.signOut();
            return;
          }

          setUserData(profile);
          setIsAuthenticated(true);

          // Cleanup ancien listener de profil
          profileUnsubscribe.current?.();
          profileUnsubscribe.current = AuthService.subscribeToUserProfile(
            user.uid,
            async updated => {
              if (updated) {
                console.log('🔄 App: Profile updated');
                setUserData(updated);
                
                // 🆕 Synchroniser la présence quand le profil change (seulement si déjà initialisée)
                if (presenceInitialized) {
                  try {
                    await PresenceService.syncWithUserProfile(updated);
                  } catch (error) {
                    console.error('❌ App: Error syncing presence with profile:', error);
                  }
                }
              }
            }
          );

          // Marquer l'utilisateur comme en ligne dans Firestore
          try {
            await updateDoc(doc(db, "users", user.uid), {
              isOnline: true,
              lastSeen: new Date().toISOString()
            });
          } catch (error) {
            console.error('⚠️ App: Error updating online status:', error);
          }

          // 🆕 Initialiser la présence temps réel si setup completé
          if (profile.hasCompletedSetup) {
            try {
              console.log('🟢 App: Initializing presence for', profile.username);
              await PresenceService.initializePresence(profile);
              setPresenceInitialized(true);
              setPresenceError(null);
              console.log('✅ App: Presence initialized successfully');
            } catch (error: any) {
              console.error('❌ App: Failed to initialize presence:', error);
              setPresenceInitialized(false);
              setPresenceError(error.message || 'Failed to initialize presence');
            }
          }

          // Récupérer les sessions actives
          try {
            const sessions = await ChatService.getUserActiveSessions(user.uid);
            const activeSession = sessions.length > 0 ? sessions[0] : null;
            setChatSession(activeSession);
            
            // 🆕 Mettre à jour le statut selon la session active (seulement si présence initialisée)
            if (presenceInitialized) {
              if (activeSession && activeSession.status === 'active') {
                await PresenceService.updateUserStatus('in_chat', { 
                  currentChatId: activeSession.id 
                });
              } else {
                await PresenceService.updateUserStatus('online');
              }
            }
          } catch (error) {
            console.error('❌ App: Error loading chat sessions:', error);
          }
          
          setSetupCompleted(profile.hasCompletedSetup);
        } catch (error) {
          console.error('❌ App: Error during authentication setup:', error);
          await AuthService.signOut();
        }
      } else {
        console.log('🔴 App: User logged out, cleaning up...');
        
        // 🆕 Nettoyer la présence lors de la déconnexion
        if (presenceInitialized) {
          try {
            await PresenceService.endPresence();
          } catch (error) {
            console.error('❌ App: Error ending presence:', error);
          }
          setPresenceInitialized(false);
        }
        
        // Cleanup profil listener
        profileUnsubscribe.current?.();
        profileUnsubscribe.current = null;
        
        // Reset states
        setUserData(null);
        setIsAuthenticated(false);
        setSetupCompleted(false);
        setChatSession(null);
        setIsSearchingPartner(false);
        setPresenceError(null);
      }
    });

    return () => {
      console.log('🧹 App: Cleaning up auth listener...');
      unsubscribeAuth();
      profileUnsubscribe.current?.();
      profileUnsubscribe.current = null;
      
      // Cleanup présence final
      if (presenceInitialized) {
        PresenceService.endPresence().catch(console.error);
      }
    };
  }, []); // Supprimer presenceInitialized des dépendances pour éviter les loops

  const handleSignIn = async (_username: string, profile: any) => {
    try {
      setUserData(profile);
      setIsAuthenticated(true);

      const sessions = await ChatService.getUserActiveSessions(profile.uid);
      setChatSession(sessions.length > 0 ? sessions[0] : null);
      setSetupCompleted(profile.hasCompletedSetup);
    } catch (error) {
      console.error('❌ App: Error during sign in:', error);
    }
  };

  // 🆕 Logique de matchmaking centralisée avec présence et gestion d'erreur améliorée
  const startMatchmaking = async (shouldNavigateToEmpty = false) => {
    if (!userData || isSearchingPartner) {
      console.warn('⚠️ App: Cannot start matchmaking - no user data or already searching');
      return;
    }
    
    setIsSearchingPartner(true);
    console.log('🔍 App: Starting partner search with presence...');
    
    // Si on doit naviguer vers EmptyState (pour voir l'animation)
    if (shouldNavigateToEmpty) {
      navigationRef.current?.navigate('Empty');
    }
    
    try {
      // 🆕 Le MatchingService gère maintenant automatiquement la présence
      const { promise } = await MatchingService.findMatch(userData);
      const result = await promise;
      
      if (result.success && result.chatId) {
        console.log('✅ App: Match found with presence! Navigating to chat...');
        const newSession = await ChatService.getSessionById(result.chatId);
        setChatSession(newSession);
        setIsSearchingPartner(false);
        
        // 🆕 Le statut 'in_chat' est déjà mis à jour par MatchingService
        navigationRef.current?.navigate('Chat', {
          sessionId: result.chatId,
          chatType: 'human'
        });
      } else {
        console.log('❌ App: No match found with presence, trying fallback...');
        // Fallback: créer une session avec un utilisateur de test
        const randomUser = interlocuteurs[Math.floor(Math.random() * interlocuteurs.length)];
        const mockSession = await ChatService.createChatSession(userData, randomUser, 'human', false);
        setChatSession(mockSession);
        setIsSearchingPartner(false);
        
        // 🆕 Mettre à jour le statut pour la session mock
        if (presenceInitialized) {
          try {
            await PresenceService.updateUserStatus('in_chat', { 
              currentChatId: mockSession.id 
            });
          } catch (error) {
            console.error('❌ App: Error updating presence for mock session:', error);
          }
        }
        
        navigationRef.current?.navigate('Chat', {
          sessionId: mockSession.id,
          chatType: 'human'
        });
      }
    } catch (error) {
      console.error('❌ App: Error during partner search with presence:', error);
      setIsSearchingPartner(false);
      
      // 🆕 Revenir au statut online en cas d'erreur
      if (presenceInitialized) {
        try {
          await PresenceService.updateUserStatus('online');
        } catch (presenceError) {
          console.error('❌ App: Error reverting presence status:', presenceError);
        }
      }
    }
  };

  // Handler pour Find Partner depuis EmptyState
  const handleFindPartner = () => {
    startMatchmaking(false); // Pas besoin de naviguer, on est déjà sur EmptyState
  };

  // 🆕 Handler pour Change Partner avec présence (SANS navigation) et gestion d'erreur améliorée
  const handleChangePartner = async (currentSessionId: string) => {
    if (!userData || isSearchingPartner) {
      console.warn('⚠️ App: Cannot change partner - no user data or already searching');
      return;
    }
    
    console.log('🔄 App: Changing partner with presence for session:', currentSessionId);
    
    setIsSearchingPartner(true);
    
    try {
      // Terminer la session actuelle
      await ChatService.endChatSession(
        currentSessionId,
        Math.floor((Date.now() - (chatSession?.metadata.startTime || Date.now())) / 1000),
        0
      );
      
      console.log('✅ App: Current session ended, starting new matchmaking with presence...');
      
      // 🆕 Mettre à jour le statut en 'searching' puis démarrer le matchmaking
      if (presenceInitialized) {
        try {
          await PresenceService.updateUserStatus('searching');
        } catch (error) {
          console.error('❌ App: Error updating status to searching:', error);
        }
      }
      
      // Démarrer le matchmaking SANS navigation (l'utilisateur reste sur ChatScreen)
      const { promise } = await MatchingService.findMatch(userData);
      const result = await promise;
      
      if (result.success && result.chatId) {
        console.log('✅ App: New match found with presence! Updating session...');
        const newSession = await ChatService.getSessionById(result.chatId);
        setChatSession(newSession);
        setIsSearchingPartner(false);
        // Le statut 'in_chat' est déjà mis à jour par MatchingService
      } else {
        console.log('❌ App: No match found with presence, creating mock session...');
        // Fallback: créer une session avec un utilisateur de test
        const randomUser = interlocuteurs[Math.floor(Math.random() * interlocuteurs.length)];
        const mockSession = await ChatService.createChatSession(userData, randomUser, 'human', false);
        setChatSession(mockSession);
        setIsSearchingPartner(false);
        
        // Mettre à jour le statut pour la session mock
        if (presenceInitialized) {
          try {
            await PresenceService.updateUserStatus('in_chat', { 
              currentChatId: mockSession.id 
            });
          } catch (error) {
            console.error('❌ App: Error updating presence for mock session:', error);
          }
        }
      }
    } catch (error) {
      console.error('❌ App: Error during partner change with presence:', error);
      setIsSearchingPartner(false);
      
      if (presenceInitialized) {
        try {
          await PresenceService.updateUserStatus('online');
        } catch (presenceError) {
          console.error('❌ App: Error reverting presence status:', presenceError);
        }
      }
    }
  };
  
  // Chat avec AI (avec présence et gestion d'erreur)
  const handleChatWithAI = async () => {
    if (!userData) {
      console.warn('⚠️ App: Cannot start AI chat - no user data');
      return;
    }
    
    try {
      const aiSession = await ChatService.createChatSession(
        userData,
        null,
        'ai',
        false
      );
      setChatSession(aiSession);
      
      // 🆕 Mettre à jour le statut pour le chat AI
      if (presenceInitialized) {
        try {
          await PresenceService.updateUserStatus('in_chat', { 
            currentChatId: aiSession.id 
          });
        } catch (error) {
          console.error('❌ App: Error updating presence for AI chat:', error);
        }
      }
      
      navigationRef.current?.navigate('Chat', {
        sessionId: aiSession.id,
        chatType: 'ai'
      });
    } catch (error) {
      console.error('❌ App: Failed to start AI chat:', error);
    }
  };

  const handleCloseChat = (
    _freeTimeLeft: number,
    _paidTimeLeft: number
  ) => {
    setChatSession(null);
    setIsSearchingPartner(false);
    
    // 🆕 Revenir au statut online quand on ferme le chat
    if (presenceInitialized) {
      PresenceService.updateUserStatus('online').catch(error => {
        console.error('❌ App: Error updating presence when closing chat:', error);
      });
    }
    
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
    try {
      console.log('🔴 App: Logging out...');
      
      // 🆕 Nettoyer la présence avant de se déconnecter
      if (presenceInitialized) {
        try {
          await PresenceService.endPresence();
          setPresenceInitialized(false);
        } catch (error) {
          console.error('❌ App: Error ending presence during logout:', error);
        }
      }
      
      // Cleanup profil listener
      profileUnsubscribe.current?.();
      profileUnsubscribe.current = null;
      
      // Sign out
      await AuthService.signOut();
      
      // Reset states
      setIsAuthenticated(false);
      setUserData(null);
      setSetupCompleted(false);
      setIsSearchingPartner(false);
      setPresenceError(null);
      
      console.log('✅ App: Logout completed');
    } catch (error) {
      console.error('❌ App: Error during logout:', error);
    }
  };

  const handleUpdateUsername = async (newUsername: string) => {
    if (!userData?.uid) {
      console.warn('⚠️ App: Cannot update username - no user data');
      return;
    }
    
    try {
      await AuthService.updateUserProfile(userData.uid, { username: newUsername });
      setUserData({ ...userData, username: newUsername });
      console.log("✅ App: Username updated:", newUsername);
    } catch (error) {
      console.error("❌ App: Error updating username:", error);
    }
  };

  const handleConvertCredits = () => {
    if (!userData) return;
    
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
    if (!userData?.uid) {
      console.error('❌ App: Cannot complete setup - no user data');
      return;
    }
    
    try {
      console.log('🔄 App: Completing setup with role:', role);
      await AuthService.completeSetup(userData.uid, role as 'talk' | 'listen' | 'both');
      
      // Mettre à jour le userData local avec le nouveau rôle
      const updatedUserData = { ...userData, role, hasCompletedSetup: true };
      setUserData(updatedUserData);
      
      // 🆕 Initialiser la présence après setup avec le profil complet
      try {
        console.log('🟢 App: Initializing presence after setup for', updatedUserData.username);
        await PresenceService.initializePresence(updatedUserData);
        setPresenceInitialized(true);
        setPresenceError(null);
        console.log('✅ App: Presence initialized after setup');
      } catch (error: any) {
        console.error('❌ App: Failed to initialize presence after setup:', error);
        setPresenceInitialized(false);
        setPresenceError(error.message || 'Failed to initialize presence');
      }
      
      setSetupCompleted(true);
      navigationRef.current?.navigate('Empty');
    } catch (error) {
      console.error('❌ App: Error completing setup:', error);
    }
  };

  const hasActiveSession = () => {
    return chatSession?.status === 'active';
  };

  // 🆕 Debug info pour le développement
  useEffect(() => {
    if (__DEV__) {
      console.log('🐛 App Debug Info:', {
        isAuthenticated,
        setupCompleted,
        presenceInitialized,
        presenceError,
        isSearchingPartner,
        hasUserData: !!userData,
        hasChatSession: !!chatSession
      });
    }
  }, [isAuthenticated, setupCompleted, presenceInitialized, presenceError, isSearchingPartner, userData, chatSession]);

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
                isSearchingPartner={isSearchingPartner}
                presenceInitialized={presenceInitialized}
                presenceError={presenceError}
                // 🧪 Fonctions de debug ajoutées comme props
                onRunDiagnostic={runComprehensiveDiagnostic}
                onCreateMockUser={createMockUserForTesting}
                onRestartPresence={restartPresence}
                onForceSearching={forceSearchingStatus}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Chat">
            {() => (
              <ChatScreen 
                onCloseChat={handleCloseChat}
                onChangePartner={handleChangePartner}
                isSearchingPartner={isSearchingPartner}
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