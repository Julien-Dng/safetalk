import React, { useState, useCallback } from "react";
import { StyleSheet, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Import screens
import { WelcomeScreen } from "./components/WelcomeScreen";
import { SignInScreen } from "./components/SignInScreen";
import { SetupScreen } from "./components/SetupScreen";
import { ChatScreen } from "./components/ChatScreen";
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

type Screen = 
  | "welcome" 
  | "signin" 
  | "setup" 
  | "chat" 
  | "account" 
  | "referral" 
  | "rewards"
  | "premium" 
  | "empty";

interface UserData {
  username: string;
  role: string;
  credits: number;
  isPremium: boolean;
  referralCount: number;
  totalRewards: number;
  giftableCredits: number;
  dailyFreeTimeUsed: number; // Track daily free time used in seconds
  paidTimeAvailable: number; // Track paid time available in seconds (from credits)
  partnerChangeCount: number; // Track partner changes for ads
  dailyResetDate: string; // Track when daily time was last reset
  hasCompletedSetup: boolean; // Track if user has previously completed setup
  preservedFreeTime?: number; // Preserve remaining free time when exiting chat
  preservedPaidTime?: number; // Preserve remaining paid time when exiting chat
}

interface SessionData {
  duration: number; // in seconds
  messageCount: number;
  interlocutor: {
    username: string;
    rating: number;
    isAmbassador: boolean;
  };
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "partner" | "system";
  timestamp: Date;
}

interface ChatSession {
  id: string;
  startTime: number;
  interlocutor: {
    username: string;
    rating: number;
    isAmbassador: boolean;
  };
  messages?: Message[];
  freeTimeLeft?: number; // Remaining free time in seconds
  paidTimeLeft?: number; // Remaining paid time in seconds
  hasReceivedGift?: boolean;
  saveConversation?: boolean;
  isActive?: boolean; // Track if session is currently active
}

const Stack = createStackNavigator();

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("signin");
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
  const [showTimerPopup, setShowTimerPopup] = useState(false);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [showLowTimeAlert, setShowLowTimeAlert] = useState(false);
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
  const [currentSessionData, setCurrentSessionData] = useState<SessionData | null>(null);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [isSearchingForPartner, setIsSearchingForPartner] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    username: "",
    role: "",
    credits: 25,
    isPremium: false,
    referralCount: 3,
    totalRewards: 15,
    giftableCredits: 20,
    dailyFreeTimeUsed: 0,
    paidTimeAvailable: 0,
    partnerChangeCount: 0,
    dailyResetDate: new Date().toDateString(),
    hasCompletedSetup: false,
    preservedFreeTime: undefined,
    preservedPaidTime: undefined
  });

  // Check if daily time needs to be reset
  const checkDailyReset = () => {
    const today = new Date().toDateString();
    if (userData.dailyResetDate !== today) {
      setUserData(prev => ({
        ...prev,
        dailyFreeTimeUsed: 0, // Reset daily free time
        partnerChangeCount: 0,
        dailyResetDate: today,
        preservedFreeTime: undefined, // Clear preserved free time on new day
        // Keep paidTimeAvailable and preservedPaidTime - they don't reset
      }));
      return true;
    }
    return false;
  };

  // Calculate remaining daily free time (20 minutes = 1200 seconds)
  const getRemainingFreeTime = () => {
    if (userData.isPremium) return Infinity;
    checkDailyReset();
    const dailyLimit = 20 * 60; // 20 minutes in seconds
    
    // Use preserved free time if available, otherwise calculate from daily usage
    if (userData.preservedFreeTime !== undefined) {
      return userData.preservedFreeTime;
    }
    
    return Math.max(0, dailyLimit - userData.dailyFreeTimeUsed);
  };

  // Get available paid time
  const getAvailablePaidTime = () => {
    // Use preserved paid time if available, otherwise use standard paid time
    if (userData.preservedPaidTime !== undefined) {
      return userData.preservedPaidTime;
    }
    
    return userData.paidTimeAvailable;
  };

  // Get total available time (free + paid)
  const getTotalAvailableTime = () => {
    if (userData.isPremium) return Infinity;
    return getRemainingFreeTime() + getAvailablePaidTime();
  };

  // Check if there's an active chat session
  const hasActiveSession = () => {
    return chatSession && chatSession.isActive && (chatSession.freeTimeLeft! + chatSession.paidTimeLeft!) > 0;
  };

  // Function to generate random interlocutor data
  const generateRandomInterlocutor = () => {
    const usernames = ["@Eclipse", "@Moonlight", "@Stargazer", "@Phoenix", "@Mystic", "@Aurora", "@Cosmic", "@Zen"];
    const ratings = [4.2, 4.4, 4.6, 4.8, 4.9, 4.3, 4.7, 4.5];
    const ambassadorChance = Math.random() > 0.7; // 30% chance of being an ambassador
    
    const randomIndex = Math.floor(Math.random() * usernames.length);
    
    return {
      username: usernames[randomIndex],
      rating: ratings[randomIndex],
      isAmbassador: ambassadorChance
    };
  };

  // Function to start a new chat session
  const startNewChatSession = (preserveFreeTime?: number, preservePaidTime?: number) => {
    const freeTime = preserveFreeTime !== undefined ? preserveFreeTime : getRemainingFreeTime();
    const paidTime = preservePaidTime !== undefined ? preservePaidTime : getAvailablePaidTime();
    
    const newSession: ChatSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      interlocutor: generateRandomInterlocutor(),
      messages: [],
      freeTimeLeft: freeTime,
      paidTimeLeft: paidTime,
      hasReceivedGift: false,
      saveConversation: false,
      isActive: true
    };
    setChatSession(newSession);
    
    // Clear preserved time since it's now being used in new session
    setUserData(prev => ({
      ...prev,
      preservedFreeTime: undefined,
      preservedPaidTime: undefined
    }));
  };

  // Enhanced navigation function with history tracking
  const navigateToScreen = (screen: Screen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const handleSignIn = (username: string, userProfile: any) => {
    setUserData(prev => ({ 
      ...prev, 
      ...userProfile,
      username 
    }));
    
    if (userProfile.hasCompletedSetup) {
      navigateToScreen("empty");
    } else {
      navigateToScreen("setup");
    }
  };

  const handleSetupComplete = async (role: string) => {
    try {
      // Update user profile in Firebase
      if (userData.uid) {
        const { AuthService } = await import('./services/authService');
        await AuthService.completeSetup(userData.uid, role as 'talk' | 'listen' | 'both');
      }
      
      setUserData(prev => ({ ...prev, role, hasCompletedSetup: true }));
      navigateToScreen("empty");
    } catch (error) {
      console.error('Error completing setup:', error);
      // Still navigate to prevent user from being stuck
      setUserData(prev => ({ ...prev, role, hasCompletedSetup: true }));
      navigateToScreen("empty");
    }
  };

  const handleTimerEnd = useCallback(() => {
    // Mark session as inactive when timer ends
    if (chatSession) {
      setChatSession(prev => prev ? { ...prev, isActive: false } : null);
    }
    setShowTimerPopup(true);
  }, [chatSession]);

  const handleChatEnd = useCallback((sessionData: SessionData) => {
    // Update daily free time used based on session duration
    if (!userData.isPremium && chatSession) {
      const freeTimeUsed = Math.min(sessionData.duration, chatSession.freeTimeLeft || 0);
      setUserData(prev => ({
        ...prev,
        dailyFreeTimeUsed: prev.dailyFreeTimeUsed + freeTimeUsed
      }));
    }

    // Mark session as inactive
    if (chatSession) {
      setChatSession(prev => prev ? { ...prev, isActive: false } : null);
    }

    // Check if session qualifies for rating (5+ minutes OR 10+ messages)
    const qualifiesForRating = sessionData.duration >= 300 || sessionData.messageCount >= 10;
    
    if (qualifiesForRating) {
      setCurrentSessionData(sessionData);
      setShowRatingPopup(true);
    }
  }, [userData.isPremium, chatSession]);

  // Handle close chat - preserve remaining time and navigate to empty state
  const handleCloseChat = useCallback((freeTimeLeft: number, paidTimeLeft: number) => {
    // Preserve the remaining time for the next chat session
    setUserData(prev => ({
      ...prev,
      preservedFreeTime: freeTimeLeft,
      preservedPaidTime: paidTimeLeft
    }));
    
    // Mark session as inactive and navigate to empty state
    if (chatSession) {
      setChatSession(prev => prev ? { ...prev, isActive: false } : null);
    }
    
    navigateToScreen("empty");
    
    console.log("Chat closed, time preserved:", { freeTimeLeft, paidTimeLeft });
  }, [chatSession]);

  // Handler functions for various actions
  const handlePartnerChange = () => {
    if (chatSession) {
      const duration = Math.floor((Date.now() - chatSession.startTime) / 1000);
      
      if (!userData.isPremium) {
        const freeTimeUsed = Math.min(duration, chatSession.freeTimeLeft || 0);
        const paidTimeUsed = Math.max(0, duration - freeTimeUsed);
        
        setUserData(prev => ({
          ...prev,
          dailyFreeTimeUsed: prev.dailyFreeTimeUsed + freeTimeUsed,
          paidTimeAvailable: Math.max(0, prev.paidTimeAvailable - paidTimeUsed),
          partnerChangeCount: prev.partnerChangeCount + 1
        }));
      } else {
        setUserData(prev => ({
          ...prev,
          partnerChangeCount: prev.partnerChangeCount + 1
        }));
      }
      
      // Check for interstitial ad (every 5 partner changes for freemium users)
      const newChangeCount = userData.partnerChangeCount + 1;
      if (!userData.isPremium && newChangeCount % 5 === 0) {
        setShowInterstitialAd(true);
        return; // Don't change partner immediately, wait for ad completion
      }
      
      // Mark current session as inactive
      setChatSession(prev => prev ? { ...prev, isActive: false } : null);
      
      // Go to empty state for manual partner search
      navigateToScreen("empty");
    }
  };

  const handleUserBlocked = useCallback((username: string) => {
    console.log("User blocked:", username);
    if (chatSession) {
      setChatSession(prev => prev ? { ...prev, isActive: false } : null);
    }
  }, [chatSession]);

  const handleUserReported = useCallback((username: string) => {
    console.log("User reported:", username);
    if (chatSession) {
      setChatSession(prev => prev ? { ...prev, isActive: false } : null);
    }
  }, [chatSession]);

  const handleSubmitRating = (rating: number, comment: string) => {
    console.log("Rating submitted:", { 
      rating, 
      comment, 
      interlocutor: currentSessionData?.interlocutor?.username 
    });
    
    setShowRatingPopup(false);
    setCurrentSessionData(null);
  };

  const handleExtendTime = (option: string) => {
    const costs = { "30min": 5, "1hour": 10, "24hour": 20 };
    const cost = costs[option as keyof typeof costs];
    
    if (userData.credits >= cost) {
      setUserData(prev => ({ ...prev, credits: prev.credits - cost }));
      setShowTimerPopup(false);
      
      // Add time to paid time available
      const extensionTime = option === "30min" ? 30 * 60 : option === "1hour" ? 60 * 60 : 24 * 60 * 60;
      setUserData(prev => ({
        ...prev,
        paidTimeAvailable: prev.paidTimeAvailable + extensionTime
      }));
      
      // Update current session if active and reactivate it
      if (chatSession) {
        const updatedSession = { 
          ...chatSession, 
          paidTimeLeft: (chatSession.paidTimeLeft || 0) + extensionTime,
          isActive: true
        };
        setChatSession(updatedSession);
      }
    }
  };

  const handleGoToPremium = () => {
    setShowTimerPopup(false);
    setShowLowTimeAlert(false);
    navigateToScreen("premium");
  };

  const handleUpdateUsername = (newUsername: string) => {
    setUserData(prev => ({ ...prev, username: newUsername }));
  };

  const handleBuyCredits = useCallback((option: string, creditsAmount: number) => {
    setUserData(prev => ({ ...prev, credits: prev.credits + creditsAmount }));
    console.log("Credits purchased:", { option, creditsAmount });
  }, []);

  const handleBuyTime = useCallback((option: string, creditsRequired: number, minutes: number) => {
    if (userData.credits >= creditsRequired) {
      setUserData(prev => ({ ...prev, credits: prev.credits - creditsRequired }));
      
      // Add time to paid time available
      const extensionTime = minutes * 60; // Convert minutes to seconds
      setUserData(prev => ({
        ...prev,
        paidTimeAvailable: prev.paidTimeAvailable + extensionTime
      }));
      
      // Update current session if active
      if (chatSession) {
        const updatedSession = { 
          ...chatSession, 
          paidTimeLeft: (chatSession.paidTimeLeft || 0) + extensionTime 
        };
        setChatSession(updatedSession);
      }
      
      setShowLowTimeAlert(false);
      console.log("Time purchased:", { option, creditsRequired, minutes });
    }
  }, [userData.credits, chatSession]);

  const handleUseCredits = useCallback((creditsToUse: number) => {
    if (userData.credits >= creditsToUse) {
      setUserData(prev => ({
        ...prev,
        credits: prev.credits - creditsToUse
      }));
      
      console.log("Credits consumed immediately:", { 
        creditsUsed: creditsToUse, 
        remainingCredits: userData.credits - creditsToUse 
      });
    }
  }, [userData.credits]);

  const handleSendCredits = useCallback((amount: number) => {
    setUserData(prev => ({ 
      ...prev, 
      giftableCredits: prev.giftableCredits - amount 
    }));
    console.log("Credits sent:", amount);
  }, []);

  const handleCreditDeducted = useCallback(() => {
    setUserData(prev => ({ 
      ...prev, 
      credits: Math.max(0, prev.credits - 1) 
    }));
  }, []);

  const handleUpdateSession = useCallback((session: ChatSession) => {
    setChatSession(prevSession => {
      if (!prevSession || prevSession.id !== session.id) {
        return { ...session, isActive: true };
      }
      
      const hasChanged = 
        prevSession.freeTimeLeft !== session.freeTimeLeft ||
        prevSession.paidTimeLeft !== session.paidTimeLeft ||
        prevSession.hasReceivedGift !== session.hasReceivedGift ||
        prevSession.saveConversation !== session.saveConversation ||
        (prevSession.messages?.length || 0) !== (session.messages?.length || 0);
      
      return hasChanged ? { ...session, isActive: prevSession.isActive } : prevSession;
    });
  }, []);

  const handleLowTimeAlert = useCallback((freeTimeLeft: number, paidTimeLeft: number) => {
    const totalTimeLeft = freeTimeLeft + paidTimeLeft;
    if (!userData.isPremium && totalTimeLeft <= 180 && totalTimeLeft > 0 && !showLowTimeAlert) {
      setShowLowTimeAlert(true);
    }
  }, [userData.isPremium, showLowTimeAlert]);

  const handleWatchAd = useCallback(() => {
    setUserData(prev => ({ ...prev, credits: prev.credits + 1 }));
    setShowInterstitialAd(false);
    navigateToScreen("empty");
    console.log("Ad watched, +1 credit earned, returning to empty state...");
  }, []);

  const handleConvertCredits = () => {
    const rewardsEarned = Math.floor(userData.giftableCredits / 15);
    const creditsUsed = rewardsEarned * 15;
    
    setUserData(prev => ({ 
      ...prev, 
      giftableCredits: prev.giftableCredits - creditsUsed,
      totalRewards: prev.totalRewards + rewardsEarned
    }));
    
    console.log("Credits converted:", { rewardsEarned, creditsUsed });
  };

  const handleLogout = () => {
    setUserData({
      username: "",
      role: "",
      credits: 25,
      isPremium: false,
      referralCount: 3,
      totalRewards: 15,
      giftableCredits: 20,
      dailyFreeTimeUsed: 0,
      paidTimeAvailable: 0,
      partnerChangeCount: 0,
      dailyResetDate: new Date().toDateString(),
      hasCompletedSetup: false,
      preservedFreeTime: undefined,
      preservedPaidTime: undefined
    });
    setChatSession(null);
    setPreviousScreen(null);
    setCurrentScreen("signin");
  };

  const handleUpgrade = () => {
    setUserData(prev => ({ ...prev, isPremium: true }));
  };

  const handleFindPartner = () => {
    setIsSearchingForPartner(true);
    setCurrentScreen("empty");
    
    setTimeout(() => {
      setIsSearchingForPartner(false);
      startNewChatSession(getRemainingFreeTime(), getAvailablePaidTime());
      navigateToScreen("chat");
    }, 2000);
  };

  const handleResumeChat = () => {
    if (hasActiveSession()) {
      navigateToScreen("chat");
    }
  };

  const handleChatWithAI = () => {
    const aiInterlocutor = {
      username: "@SafetalkAI",
      rating: 5.0,
      isAmbassador: true
    };
    
    const freeTime = getRemainingFreeTime();
    const paidTime = getAvailablePaidTime();
    
    const aiSession: ChatSession = {
      id: "ai-" + Date.now().toString(),
      startTime: Date.now(),
      interlocutor: aiInterlocutor,
      messages: [],
      freeTimeLeft: freeTime,
      paidTimeLeft: paidTime,
      hasReceivedGift: false,
      saveConversation: false,
      isActive: true
    };
    
    setChatSession(aiSession);
    
    setUserData(prev => ({
      ...prev,
      preservedFreeTime: undefined,
      preservedPaidTime: undefined
    }));
    
    navigateToScreen("chat");
  };

  const handleAccountBack = () => {
    if (previousScreen === "chat" && hasActiveSession()) {
      navigateToScreen("chat");
    } else {
      navigateToScreen("empty");
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0f0f23' }
          }}
          initialRouteName="SignIn"
        >
          <Stack.Screen name="Welcome">
            {() => <WelcomeScreen onContinue={() => navigateToScreen("signin")} />}
          </Stack.Screen>
          
          <Stack.Screen name="SignIn">
            {() => <SignInScreen onSignIn={handleSignIn} />}
          </Stack.Screen>
          
          <Stack.Screen name="Setup">
            {() => (
              <SetupScreen
                onBack={() => navigateToScreen("signin")}
                onComplete={handleSetupComplete}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Chat">
            {() => chatSession ? (
              <ChatScreen
                key={chatSession.id}
                username={userData.username}
                role={userData.role}
                chatSession={chatSession}
                credits={userData.credits}
                isPremium={userData.isPremium}
                giftableCredits={userData.giftableCredits}
                dailyFreeTimeRemaining={getRemainingFreeTime()}
                paidTimeAvailable={getAvailablePaidTime()}
                onBack={() => navigateToScreen("empty")}
                onCloseChat={handleCloseChat}
                onTimerEnd={handleTimerEnd}
                onShowAccount={() => navigateToScreen("account")}
                onChatEnd={handleChatEnd}
                onPartnerChange={handlePartnerChange}
                onUserBlocked={handleUserBlocked}
                onUserReported={handleUserReported}
                onBuyCredits={handleBuyCredits}
                onUseCredits={handleUseCredits}
                onSendCredits={handleSendCredits}
                onCreditDeducted={handleCreditDeducted}
                onUpdateSession={handleUpdateSession}
                onLowTimeAlert={handleLowTimeAlert}
              />
            ) : null}
          </Stack.Screen>
          
          <Stack.Screen name="Account">
            {() => (
              <AccountScreen
                username={userData.username}
                credits={userData.credits}
                isPremium={userData.isPremium}
                dailyFreeTimeRemaining={getRemainingFreeTime()}
                paidTimeAvailable={getAvailablePaidTime()}
                onBack={handleAccountBack}
                onShowReferral={() => navigateToScreen("referral")}
                onShowRewards={() => navigateToScreen("rewards")}
                onLogout={handleLogout}
                onUpdateUsername={handleUpdateUsername}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Referral">
            {() => (
              <ReferralScreen
                onBack={() => navigateToScreen("account")}
                isPremium={userData.isPremium}
                referralCount={userData.referralCount}
                totalRewards={userData.totalRewards}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Rewards">
            {() => (
              <MyRewardsScreen
                onBack={() => navigateToScreen("account")}
                giftableCredits={userData.giftableCredits}
                isPremium={userData.isPremium}
                onConvertCredits={handleConvertCredits}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Premium">
            {() => (
              <PremiumScreen
                onBack={() => navigateToScreen("account")}
                isPremium={userData.isPremium}
                onUpgrade={handleUpgrade}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Empty">
            {() => (
              <EmptyState
                onFindPartner={handleFindPartner}
                onChatWithAI={handleChatWithAI}
                onResumeChat={hasActiveSession() ? handleResumeChat : undefined}
                hasActiveSession={hasActiveSession()}
                activeSessionPartner={hasActiveSession() ? chatSession?.interlocutor.username : undefined}
                onShowAccount={() => navigateToScreen("account")}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>

        {/* Global Modals */}
        <TimerPopup
          isOpen={showTimerPopup}
          onClose={() => setShowTimerPopup(false)}
          credits={userData.credits}
          onExtendTime={handleExtendTime}
          onGoToPremium={handleGoToPremium}
        />

        <LowTimeAlert
          isOpen={showLowTimeAlert}
          onClose={() => setShowLowTimeAlert(false)}
          freeTimeLeft={chatSession?.freeTimeLeft || 0}
          paidTimeLeft={chatSession?.paidTimeLeft || 0}
          credits={userData.credits}
          onBuyTime={handleBuyTime}
          onGoToPremium={handleGoToPremium}
        />

        <InterstitialAd
          isOpen={showInterstitialAd}
          onClose={() => setShowInterstitialAd(false)}
          onWatchAd={handleWatchAd}
          partnerChangeCount={userData.partnerChangeCount}
        />

        <RatingPopup
          isOpen={showRatingPopup}
          onClose={() => {
            setShowRatingPopup(false);
            setCurrentSessionData(null);
          }}
          interlocutorName={currentSessionData?.interlocutor?.username || ""}
          onSubmitRating={handleSubmitRating}
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
});