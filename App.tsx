import { useState, useCallback } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { SignInScreen } from "./components/SignInScreen";
import { SetupScreen } from "./components/SetupScreen";
import { ChatScreen } from "./components/ChatScreen";
import { TimerPopup } from "./components/TimerPopup";
import { RatingPopup } from "./components/RatingPopup";
import { LowTimeAlert } from "./components/LowTimeAlert";
import { InterstitialAd } from "./components/InterstitialAd";
import { AccountScreen } from "./components/AccountScreen";
import { ReferralScreen } from "./components/ReferralScreen";
import { PremiumScreen } from "./components/PremiumScreen";
import { MyRewardsScreen } from "./components/MyRewardsScreen";
import { EmptyState } from "./components/EmptyState";

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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("signin"); // Changed from "login" to "signin"
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null); // Track navigation history
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
    dailyFreeTimeUsed: 0, // Track daily free time used
    paidTimeAvailable: 0, // Track paid time from credits
    partnerChangeCount: 0,
    dailyResetDate: new Date().toDateString(),
    hasCompletedSetup: false, // Track setup completion
    preservedFreeTime: undefined, // Preserve remaining free time
    preservedPaidTime: undefined // Preserve remaining paid time
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

  const handleSignIn = (username: string) => {
    setUserData(prev => ({ ...prev, username }));
    
    // Check if user has completed setup before (simulate checking existing account)
    const hasExistingAccount = Math.random() > 0.3; // 70% chance of existing account for demo
    
    if (hasExistingAccount) {
      // Existing user - go directly to empty state
      setUserData(prev => ({ ...prev, hasCompletedSetup: true, role: "both" })); // Simulate existing role
      navigateToScreen("empty");
    } else {
      // New user - go to setup
      navigateToScreen("setup");
    }
  };

  const handleSetupComplete = (role: string) => {
    setUserData(prev => ({ ...prev, role, hasCompletedSetup: true }));
    // New users complete setup and go to empty state without auto-search
    navigateToScreen("empty");
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

  const handlePartnerChange = () => {
    // End current session and show rating if it qualifies
    if (chatSession) {
      const duration = Math.floor((Date.now() - chatSession.startTime) / 1000);
      
      // Update time tracking
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
    // Mark session as inactive
    if (chatSession) {
      setChatSession(prev => prev ? { ...prev, isActive: false } : null);
    }
    // Here you would typically send the block action to your backend
  }, [chatSession]);

  const handleUserReported = useCallback((username: string) => {
    console.log("User reported:", username);
    // Mark session as inactive
    if (chatSession) {
      setChatSession(prev => prev ? { ...prev, isActive: false } : null);
    }
    // Here you would typically send the report to your backend
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

  // Updated function to handle manual credit usage - immediately deducts all credits
  const handleUseCredits = useCallback((creditsToUse: number) => {
    if (userData.credits >= creditsToUse) {
      // Immediately deduct ALL credits from user balance (as specified in requirements)
      setUserData(prev => ({
        ...prev,
        credits: prev.credits - creditsToUse  // Deduct the credits immediately
        // Note: Don't add to paidTimeAvailable here - ChatScreen handles the session time directly
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
      // Only update if the session has actually changed
      if (!prevSession || prevSession.id !== session.id) {
        return { ...session, isActive: true }; // Ensure new sessions are active
      }
      
      // Check if any relevant properties have changed
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
    // Show alert when 3 minutes (180 seconds) remaining total and user is freemium
    const totalTimeLeft = freeTimeLeft + paidTimeLeft;
    if (!userData.isPremium && totalTimeLeft <= 180 && totalTimeLeft > 0 && !showLowTimeAlert) {
      setShowLowTimeAlert(true);
    }
  }, [userData.isPremium, showLowTimeAlert]);

  const handleWatchAd = useCallback(() => {
    // Reward user with 1 credit after watching ad
    setUserData(prev => ({ ...prev, credits: prev.credits + 1 }));
    setShowInterstitialAd(false);
    
    // Go to empty state instead of auto-searching
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
    setCurrentScreen("signin"); // Changed from "login" to "signin"
  };

  const handleUpgrade = () => {
    setUserData(prev => ({ ...prev, isPremium: true }));
  };

  // Handle manual "Find a partner" - only starts search when user clicks
  const handleFindPartner = () => {
    setIsSearchingForPartner(true);
    setCurrentScreen("empty"); // Stay on empty state but show searching
    
    // Simulate finding a match after search
    setTimeout(() => {
      setIsSearchingForPartner(false);
      // Use preserved time if available, otherwise use current available time
      startNewChatSession(getRemainingFreeTime(), getAvailablePaidTime());
      navigateToScreen("chat");
    }, 2000);
  };

  // Handle "Resume Chat" - return to active session
  const handleResumeChat = () => {
    if (hasActiveSession()) {
      navigateToScreen("chat");
    }
  };

  const handleChatWithAI = () => {
    // Generate AI interlocutor
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
    
    // Clear preserved time since it's now being used
    setUserData(prev => ({
      ...prev,
      preservedFreeTime: undefined,
      preservedPaidTime: undefined
    }));
    
    navigateToScreen("chat");
  };

  // Handle AccountScreen back button with conditional logic
  const handleAccountBack = () => {
    // If user came from chat screen and has active session, return to chat
    if (previousScreen === "chat" && hasActiveSession()) {
      navigateToScreen("chat");
    } else {
      // Otherwise, return to empty state
      navigateToScreen("empty");
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen onContinue={() => navigateToScreen("signin")} />;
      
      case "signin":
        return (
          <SignInScreen
            onSignIn={handleSignIn}
          />
        );
      
      case "setup":
        return (
          <SetupScreen
            onBack={() => navigateToScreen("signin")} // Changed from login to signin
            onComplete={handleSetupComplete}
          />
        );
      
      case "chat":
        return chatSession ? (
          <ChatScreen
            key={chatSession.id} // Force re-render when session changes
            username={userData.username}
            role={userData.role}
            chatSession={chatSession}
            credits={userData.credits}
            isPremium={userData.isPremium}
            giftableCredits={userData.giftableCredits}
            dailyFreeTimeRemaining={getRemainingFreeTime()}
            paidTimeAvailable={getAvailablePaidTime()}
            onBack={() => navigateToScreen("empty")} // Go back to empty state
            onCloseChat={handleCloseChat} // Add close chat handler
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
        ) : null;
      
      case "account":
        return (
          <AccountScreen
            username={userData.username}
            credits={userData.credits}
            isPremium={userData.isPremium}
            dailyFreeTimeRemaining={getRemainingFreeTime()}
            paidTimeAvailable={getAvailablePaidTime()}
            onBack={handleAccountBack} // Use conditional back logic
            onShowReferral={() => navigateToScreen("referral")}
            onShowRewards={() => navigateToScreen("rewards")}
            onLogout={handleLogout}
            onUpdateUsername={handleUpdateUsername}
          />
        );
      
      case "referral":
        return (
          <ReferralScreen
            onBack={() => navigateToScreen("account")}
            isPremium={userData.isPremium}
            referralCount={userData.referralCount}
            totalRewards={userData.totalRewards}
          />
        );
      
      case "rewards":
        return (
          <MyRewardsScreen
            onBack={() => navigateToScreen("account")}
            giftableCredits={userData.giftableCredits}
            isPremium={userData.isPremium}
            onConvertCredits={handleConvertCredits}
          />
        );
      
      case "premium":
        return (
          <PremiumScreen
            onBack={() => navigateToScreen("account")}
            isPremium={userData.isPremium}
            onUpgrade={handleUpgrade}
          />
        );
      
      case "empty":
        return (
          <EmptyState
            onFindPartner={handleFindPartner}
            onChatWithAI={handleChatWithAI}
            onResumeChat={hasActiveSession() ? handleResumeChat : undefined}
            hasActiveSession={hasActiveSession()}
            activeSessionPartner={hasActiveSession() ? chatSession?.interlocutor.username : undefined}
            onShowAccount={() => navigateToScreen("account")} // Add account navigation
          />
        );
      
      default:
        return (
          <SignInScreen
            onSignIn={handleSignIn}
          />
        );
    }
  };

  return (
    <div className="size-full">
      {renderScreen()}
      
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
    </div>
  );
}