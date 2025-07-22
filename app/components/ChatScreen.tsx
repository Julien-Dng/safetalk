import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { X, Send, RefreshCw, User, Settings, Star, Shield, MoreVertical, Coins, Save, Crown } from "lucide-react";
import { ModerationModal } from "./ModerationModal";
import { ModerationConfirmation } from "./ModerationConfirmation";
import { BuyCreditsModal } from "./BuyCreditsModal";
import { SendCreditsModal } from "./SendCreditsModal";
import { GiftCreditsAlert } from "./GiftCreditsAlert";
import { GiftConfirmation } from "./GiftConfirmation";
import { LowTimeAlert } from "./LowTimeAlert";
import { useState, useRef, useEffect, useCallback } from "react";

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
}

interface ChatScreenProps {
  username: string;
  role: string;
  chatSession: ChatSession;
  credits: number;
  isPremium: boolean;
  giftableCredits: number;
  dailyFreeTimeRemaining: number;
  paidTimeAvailable: number;
  onBack: () => void;
  onCloseChat: (freeTimeLeft: number, paidTimeLeft: number) => void; // New prop for close chat
  onTimerEnd: () => void;
  onShowAccount: () => void;
  onChatEnd: (sessionData: { duration: number; messageCount: number; interlocutor: ChatSession['interlocutor'] }) => void;
  onPartnerChange: () => void;
  onUserBlocked: (username: string) => void;
  onUserReported: (username: string) => void;
  onBuyCredits: (option: string, credits: number) => void;
  onUseCredits: (creditsToUse: number) => void;
  onSendCredits: (amount: number) => void;
  onCreditDeducted: () => void;
  onUpdateSession: (session: ChatSession) => void;
  onLowTimeAlert: (freeTimeLeft: number, paidTimeLeft: number) => void;
}

// Enhanced time formatting function
const formatTime = (seconds: number) => {
  if (seconds >= 3600) { // 1 hour or more
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function ChatScreen({ 
  username, 
  role, 
  chatSession,
  credits,
  isPremium,
  giftableCredits,
  dailyFreeTimeRemaining,
  paidTimeAvailable,
  onBack, 
  onCloseChat, // New prop
  onTimerEnd, 
  onShowAccount, 
  onChatEnd, 
  onPartnerChange,
  onUserBlocked,
  onUserReported,
  onBuyCredits,
  onUseCredits,
  onSendCredits,
  onCreditDeducted,
  onUpdateSession,
  onLowTimeAlert
}: ChatScreenProps) {
  // Initialize messages from session or with welcome message
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!chatSession) return [];
    if (chatSession.messages && chatSession.messages.length > 0) {
      return chatSession.messages;
    }
    return [
      {
        id: "welcome-" + chatSession.id,
        text: chatSession.interlocutor.username === "@SafetalkAI" 
          ? "Hello! I'm your AI companion. I'm here to listen and support you. Feel free to share anything on your mind."
          : role === "talk" 
            ? "You have been connected to someone who wants to listen. Feel free to share what's on your mind."
            : role === "listen"
              ? "You have been connected to someone who wants to talk. Be a good listener and show empathy."
              : "You have been connected to a chat partner. Feel free to talk or listen as the conversation flows.",
        sender: "system",
        timestamp: new Date()
      }
    ];
  });
  
  const [inputText, setInputText] = useState("");
  const [freeTimeLeft, setFreeTimeLeft] = useState(() => chatSession?.freeTimeLeft || dailyFreeTimeRemaining);
  const [paidTimeLeft, setPaidTimeLeft] = useState(() => chatSession?.paidTimeLeft || paidTimeAvailable);
  const [creditsActivated, setCreditsActivated] = useState(false); // Track if credits have been activated
  const [totalActivatedTime, setTotalActivatedTime] = useState(0); // Track total time after credit activation
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChangingPartner, setIsChangingPartner] = useState(false);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [showModerationConfirmation, setShowModerationConfirmation] = useState(false);
  const [moderationType, setModerationType] = useState<"block" | "report" | null>(null);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [showSendCreditsModal, setShowSendCreditsModal] = useState(false);
  const [showGiftCreditsAlert, setShowGiftCreditsAlert] = useState(false);
  const [showGiftConfirmation, setShowGiftConfirmation] = useState(false);
  const [showLowTimeAlert, setShowLowTimeAlert] = useState(false);
  const [giftConfirmationData, setGiftConfirmationData] = useState({ credits: 0, fromPartner: false });
  const [hasReceivedGift, setHasReceivedGift] = useState(chatSession?.hasReceivedGift || false);
  const [saveConversation, setSaveConversation] = useState(chatSession?.saveConversation || false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timeExtension, setTimeExtension] = useState<{ amount: number; show: boolean }>({ amount: 0, show: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionUpdateTimeoutRef = useRef<NodeJS.Timeout>();
  const lowTimeAlertShownRef = useRef(false);

  // Safety check
  if (!chatSession) {
    return <div className="min-h-screen dark gradient-secondary flex items-center justify-center text-white">Loading...</div>;
  }

  // Calculate unified time values
  const totalTimeLeft = creditsActivated ? paidTimeLeft : (freeTimeLeft + paidTimeLeft);
  const availableCreditsTime = credits * 6 * 60; // 1 credit = 6 minutes = 360 seconds
  
  // Calculate available credits in live countdown format when credits are activated
  const creditsBeingUsedNow = creditsActivated ? Math.ceil(paidTimeLeft / (6 * 60)) : credits;

  // Get timer bar color and animation based on time remaining
  const getTimerColorAndStyle = () => {
    if (totalTimeLeft <= 60) {
      return {
        color: "bg-red-500",
        shouldPulse: true
      };
    }
    if (totalTimeLeft <= 180) {
      return {
        color: "bg-red-500",
        shouldPulse: false
      };
    }
    return {
      color: "bg-purple-500",
      shouldPulse: false
    };
  };

  const { color: timerColor, shouldPulse } = getTimerColorAndStyle();

  // Calculate progress percentage for the unified timer bar
  const maxTime = creditsActivated ? totalActivatedTime : (20 * 60 + availableCreditsTime); // 20 min free + credits OR total activated time
  const progressPercentage = isPremium ? 100 : Math.max(0, (totalTimeLeft / maxTime) * 100);

  // Memoize the handleChatEnd function
  const handleChatEnd = useCallback(() => {
    const duration = Math.floor((Date.now() - chatSession.startTime) / 1000);
    const messageCount = messages.filter(m => m.sender !== "system").length;
    
    onChatEnd({
      duration,
      messageCount,
      interlocutor: chatSession.interlocutor
    });
  }, [chatSession.startTime, chatSession.interlocutor, messages, onChatEnd]);

  const handleTimerEnd = useCallback(() => {
    handleChatEnd();
    onTimerEnd();
  }, [handleChatEnd, onTimerEnd]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save session state when messages or settings change (throttled)
  useEffect(() => {
    // Clear existing timeout
    if (sessionUpdateTimeoutRef.current) {
      clearTimeout(sessionUpdateTimeoutRef.current);
    }
    
    // Debounce session updates to prevent excessive calls
    sessionUpdateTimeoutRef.current = setTimeout(() => {
      const updatedSession: ChatSession = {
        ...chatSession,
        messages,
        freeTimeLeft,
        paidTimeLeft,
        hasReceivedGift,
        saveConversation
      };
      onUpdateSession(updatedSession);
    }, 100); // 100ms debounce
    
    return () => {
      if (sessionUpdateTimeoutRef.current) {
        clearTimeout(sessionUpdateTimeoutRef.current);
      }
    };
  }, [chatSession, messages, freeTimeLeft, paidTimeLeft, hasReceivedGift, saveConversation, onUpdateSession]);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (sessionUpdateTimeoutRef.current) {
        clearTimeout(sessionUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Handle low time alert (3 minutes = 180 seconds)
  useEffect(() => {
    if (!isPremium && totalTimeLeft <= 180 && totalTimeLeft > 0 && !lowTimeAlertShownRef.current && !timerPaused) {
      lowTimeAlertShownRef.current = true;
      setShowLowTimeAlert(true);
    }
    
    // Reset the alert flag when time increases (after purchase/use credits)
    if (totalTimeLeft > 180) {
      lowTimeAlertShownRef.current = false;
    }
  }, [totalTimeLeft, isPremium, timerPaused]);

  // Show time extension animation
  useEffect(() => {
    if (timeExtension.show) {
      const timer = setTimeout(() => {
        setTimeExtension({ amount: 0, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [timeExtension.show]);

  // Check if partner needs gift (for premium users)
  useEffect(() => {
    if (isPremium && !hasReceivedGift && giftableCredits > 0 && !timerPaused) {
      // Simulate partner being low on credits (in real app, this would come from backend)
      const shouldShowGiftAlert = totalTimeLeft < 300 && Math.random() > 0.7; // 30% chance when < 5 minutes
      if (shouldShowGiftAlert) {
        setShowGiftCreditsAlert(true);
      }
    }
  }, [totalTimeLeft, isPremium, hasReceivedGift, giftableCredits, timerPaused]);

  // Timer logic - when credits are activated, only use paid time
  useEffect(() => {
    if (timerPaused || isPremium) return; // Don't run timer when paused or premium

    const timer = setInterval(() => {
      if (creditsActivated) {
        // When credits are activated, only use paid time
        if (paidTimeLeft > 0) {
          setPaidTimeLeft(prev => {
            const newTime = Math.max(0, prev - 1);
            if (newTime === 0) {
              setTimeout(() => {
                handleTimerEnd();
              }, 0);
            }
            return newTime;
          });
        } else {
          setTimeout(() => {
            handleTimerEnd();
          }, 0);
        }
      } else {
        // Normal flow: use free time first, then paid time
        if (freeTimeLeft > 0) {
          setFreeTimeLeft(prev => {
            const newTime = Math.max(0, prev - 1);
            if (newTime === 0 && paidTimeLeft === 0) {
              setTimeout(() => {
                handleTimerEnd();
              }, 0);
            }
            return newTime;
          });
        } else if (paidTimeLeft > 0) {
          setPaidTimeLeft(prev => {
            const newTime = Math.max(0, prev - 1);
            if (newTime === 0) {
              setTimeout(() => {
                handleTimerEnd();
              }, 0);
            }
            return newTime;
          });
        } else {
          setTimeout(() => {
            handleTimerEnd();
          }, 0);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [handleTimerEnd, timerPaused, isPremium, freeTimeLeft, paidTimeLeft, creditsActivated]);

  const handleSendMessage = () => {
    if (inputText.trim() && !isProcessing && !isChangingPartner && !isDisconnected) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: "user",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputText("");

      // Simulate partner response
      setTimeout(() => {
        const isAI = chatSession.interlocutor.username === "@SafetalkAI";
        
        const humanResponses = [
          "I understand how you feel.",
          "That sounds really difficult.",
          "Thank you for sharing that with me.",
          "I'm here to listen.",
          "How did that make you feel?",
          "That must have been tough.",
          "I appreciate you opening up about this."
        ];

        const aiResponses = [
          "I hear you. That sounds like a challenging situation. How are you feeling about it right now?",
          "Thank you for sharing that with me. Your feelings are completely valid.",
          "That must be really difficult to deal with. You're being very brave by talking about it.",
          "I appreciate you trusting me with this. What do you think would help you feel better?",
          "It sounds like you're going through a lot. Remember that it's okay to feel overwhelmed sometimes.",
          "Your experience is important and valid. How long have you been feeling this way?",
          "I'm here to support you through this. What's the most challenging part for you right now?"
        ];
        
        const responses = isAI ? aiResponses : humanResponses;
        const partnerMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: "partner",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, partnerMessage]);
      }, isAI ? 2000 : (1000 + Math.random() * 2000));
    }
  };

  const handleChangePartner = () => {
    if (isChangingPartner || isDisconnected) return;
    
    setIsChangingPartner(true);
    setTimerPaused(true); // Pause timer during partner change
    handleChatEnd();
    
    const systemMessage: Message = {
      id: Date.now().toString(),
      text: "Finding a new partner for you...",
      sender: "system",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
    
    setTimeout(() => {
      setTimerPaused(false); // Resume timer when new partner is found
      onPartnerChange();
    }, 2000);
  };

  const handleBlockUser = () => {
    setIsDisconnected(true);
    setModerationType("block");
    handleChatEnd();
    
    const systemMessage: Message = {
      id: Date.now().toString(),
      text: "You have been disconnected from this chat.",
      sender: "system",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
    onUserBlocked(chatSession.interlocutor.username);
    setShowModerationConfirmation(true);
  };

  const handleReportUser = () => {
    setIsDisconnected(true);
    setModerationType("report");
    handleChatEnd();
    
    const systemMessage: Message = {
      id: Date.now().toString(),
      text: "You have been disconnected from this chat.",
      sender: "system",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
    onUserReported(chatSession.interlocutor.username);
    setShowModerationConfirmation(true);
  };

  const handleGiftCredits = (amount: number) => {
    setHasReceivedGift(true);
    onSendCredits(amount);
    
    // Show confirmation to gifter
    setGiftConfirmationData({ credits: amount, fromPartner: false });
    setShowGiftConfirmation(true);
    
    // In a real app, this would also show confirmation to the recipient
    // For demo, we'll show it after a delay
    setTimeout(() => {
      setGiftConfirmationData({ credits: amount, fromPartner: true });
      setShowGiftConfirmation(true);
    }, 3000);
  };

  const handleSaveToggle = (checked: boolean) => {
    setSaveConversation(checked);
  };

  const handleBack = () => {
    if (!isChangingPartner) {
      handleChatEnd();
      onBack();
    }
  };

  // Handle close chat - preserve remaining time and navigate to empty state
  const handleCloseChat = () => {
    if (!isChangingPartner) {
      // Call the close chat handler with current remaining time
      onCloseChat(freeTimeLeft, paidTimeLeft);
    }
  };

  // Handle "Use Credits" button click - adds credit time to existing time and restarts from full
  const handleUseCredits = () => {
    if (credits > 0) {
      const currentTotalTime = freeTimeLeft + paidTimeLeft; // Current remaining time
      const creditTime = credits * 6 * 60; // Convert all credits to seconds
      const newTotalTime = currentTotalTime + creditTime; // Add credit time to existing time
      
      // Set activated state and store total time for progress calculation
      setCreditsActivated(true);
      setTotalActivatedTime(newTotalTime);
      
      // Set all time as paid time (since credits are now active)
      setPaidTimeLeft(newTotalTime);
      setFreeTimeLeft(0); // Clear free time since credits are activated
      
      // Show time extension animation
      setTimeExtension({ 
        amount: Math.floor(creditTime / 60), // Show added minutes
        show: true
      });
      
      // Notify parent to deduct credits from user balance immediately
      onUseCredits(credits);
      
      console.log("Credits activated - added to existing time:", { 
        currentTime: currentTotalTime, 
        creditTime, 
        newTotalTime,
        credits 
      });
    }
  };

  // Handle buy credits completion - reset to show "Use Credits" button again
  const handleBuyCreditsComplete = (option: string, creditsAmount: number) => {
    // Reset credits activated state to show "Use Credits" button again
    setCreditsActivated(false);
    setTotalActivatedTime(0);
    
    // Call parent handler
    onBuyCredits(option, creditsAmount);
    
    console.log("Credits purchased, UI reset to initial state");
  };

  const handleGoToPremium = () => {
    onShowAccount();
    // Navigation to premium will be handled by parent component
  };

  return (
    <div className="min-h-screen dark gradient-secondary flex flex-col">
      {/* Header */}
      <div className="bg-purple-900/20 border-b border-purple-800">
        <div className="flex items-center justify-between p-4">
          {/* Close Chat Button (X) in top-left corner */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseChat}
            disabled={isChangingPartner}
            className="text-purple-200 hover:text-white hover:bg-purple-900/20 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </Button>
          
          {/* Interlocutor Info */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4 text-purple-400" />
              <span className="text-white text-sm">{chatSession.interlocutor.username}</span>
              {chatSession.interlocutor.isAmbassador && (
                <Badge className="bg-gradient-accent text-white px-1.5 py-0.5 text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  {chatSession.interlocutor.username === "@SafetalkAI" ? "AI" : "Ambassador"}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1 bg-purple-900/30 rounded-full px-2 py-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-purple-200 text-xs">{chatSession.interlocutor.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Moderation Menu - Only show for non-AI users */}
            {chatSession.interlocutor.username !== "@SafetalkAI" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModerationModal(true)}
                disabled={isChangingPartner || isDisconnected}
                className="text-purple-200 hover:text-white hover:bg-purple-900/20 disabled:opacity-50"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowAccount}
              disabled={isChangingPartner}
              className="text-purple-200 hover:text-white hover:bg-purple-900/20 disabled:opacity-50"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Timer Section - Only show for freemium users */}
        {!isPremium && (
          <div className="px-4 pb-4 space-y-3">
            {/* Timer Label and Time Display */}
            <div className="flex items-center justify-between">
              <span className="text-purple-300 text-sm">Time Remaining</span>
              <div className="flex items-center space-x-2">
                <span className="text-white">{formatTime(totalTimeLeft)}</span>
                {timerPaused && <span className="text-yellow-400 text-xs">⏸️</span>}
                {timeExtension.show && (
                  <span className="text-green-400 text-xs animate-pulse">
                    +{timeExtension.amount} min
                  </span>
                )}
                {/* Buy Credits Button (Top Right) */}
                <Button
                  onClick={() => setShowBuyCreditsModal(true)}
                  variant="outline"
                  size="sm"
                  className="border-purple-600 text-purple-200 hover:bg-purple-900/30 h-7 px-3 text-xs rounded-full ml-2"
                >
                  Buy Credits
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative">
              <Progress 
                value={progressPercentage} 
                className="h-3 bg-purple-900/50"
              />
              <div 
                className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-300 ${timerColor} ${shouldPulse ? 'animate-pulse' : ''}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            {/* Credit Controls */}
            <div className="space-y-2">
              {/* Use Credits Button or Credits Label */}
              {creditsActivated ? (
                // Show credits being used (after clicking "Use Credits")
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-purple-200 text-sm">
                    Credits: {creditsBeingUsedNow} (≈ {formatTime(creditsBeingUsedNow * 6 * 60)})
                  </span>
                </div>
              ) : (
                // Show "Use Credits" button (initial state)
                credits > 0 && (
                  <Button
                    onClick={handleUseCredits}
                    variant="ghost"
                    size="sm"
                    className="text-green-300 hover:text-green-200 hover:bg-green-900/20 p-0 h-auto justify-start"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Use Credits: {credits} (≈ {formatTime(availableCreditsTime)})
                  </Button>
                )
              )}
              
              {/* Go Premium Button */}
              <Button
                onClick={handleGoToPremium}
                variant="outline"
                size="sm"
                className="w-full border-yellow-600 text-yellow-300 hover:bg-yellow-900/20 h-8"
              >
                <Crown className="w-4 h-4 mr-2" />
                Go Premium – Unlimited Daily Time
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Premium Save Option */}
      {isPremium && (
        <div className="bg-purple-900/10 border-b border-purple-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Save className="w-4 h-4 text-purple-400" />
              <span className="text-purple-200 text-sm">Save this conversation</span>
            </div>
            <Switch
              checked={saveConversation}
              onCheckedChange={handleSaveToggle}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
          <p className="text-purple-400 text-xs mt-1">
            {saveConversation 
              ? "Messages will be saved even after switching partners" 
              : "Messages will be cleared when you change partners"
            }
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : 
              message.sender === "system" ? "justify-center" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                message.sender === "user"
                  ? "bg-purple-600 text-white"
                  : message.sender === "system"
                  ? "bg-purple-900/30 text-purple-200 text-center text-sm"
                  : "bg-purple-900/50 text-purple-100"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-purple-900/20 border-t border-purple-800 p-4">
        {/* Change Partner Button - Only for non-AI chats and when not disconnected */}
        {chatSession.interlocutor.username !== "@SafetalkAI" && !isDisconnected && (
          <div className="flex items-center space-x-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleChangePartner}
              disabled={isProcessing || isChangingPartner || isDisconnected}
              className="border-purple-700 text-purple-200 hover:bg-purple-900/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isChangingPartner ? 'animate-spin' : ''}`} />
              {isChangingPartner ? "Finding Partner..." : "Change Partner"}
            </Button>
          </div>
        )}
        
        {/* Message Input with Mobile-Friendly Send Button */}
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isDisconnected
                  ? "Chat disconnected..."
                  : isChangingPartner 
                    ? "Finding new partner..." 
                    : isProcessing 
                      ? "Processing..." 
                      : "Type your message..."
              }
              disabled={isProcessing || isChangingPartner || isDisconnected}
              className="bg-purple-900/30 border-purple-800 text-white placeholder-purple-400 rounded-2xl h-12 disabled:opacity-50"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
          </div>
          
          {/* WhatsApp-style Circular Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isProcessing || isChangingPartner || isDisconnected}
            className="w-12 h-12 rounded-full bg-gradient-accent hover:opacity-90 disabled:opacity-50 flex-shrink-0 shadow-lg"
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Low Time Alert - 3 minute warning */}
      <LowTimeAlert
        isOpen={showLowTimeAlert}
        onClose={() => setShowLowTimeAlert(false)}
        freeTimeLeft={freeTimeLeft}
        paidTimeLeft={paidTimeLeft}
        credits={credits}
        onBuyTime={() => {
          setShowBuyCreditsModal(true);
        }}
        onUseCredits={handleUseCredits}
        onGoToPremium={handleGoToPremium}
      />

      {/* Moderation Modal */}
      <ModerationModal
        isOpen={showModerationModal}
        onClose={() => setShowModerationModal(false)}
        interlocutorName={chatSession.interlocutor.username}
        onBlock={handleBlockUser}
        onReport={handleReportUser}
      />

      {/* Moderation Confirmation */}
      <ModerationConfirmation
        isOpen={showModerationConfirmation}
        onClose={() => setShowModerationConfirmation(false)}
        type={moderationType}
      />

      {/* Buy Credits Modal */}
      <BuyCreditsModal
        isOpen={showBuyCreditsModal}
        onClose={() => setShowBuyCreditsModal(false)}
        currentCredits={credits}
        onPurchase={handleBuyCreditsComplete}
      />

      {/* Send Credits Modal */}
      <SendCreditsModal
        isOpen={showSendCreditsModal}
        onClose={() => setShowSendCreditsModal(false)}
        giftableCredits={giftableCredits}
        partnerName={chatSession.interlocutor.username}
        onSendCredits={handleGiftCredits}
      />

      {/* Gift Credits Alert */}
      <GiftCreditsAlert
        isOpen={showGiftCreditsAlert}
        onClose={() => setShowGiftCreditsAlert(false)}
        partnerName={chatSession.interlocutor.username}
        giftableCredits={giftableCredits}
        onGift={() => setShowSendCreditsModal(true)}
      />

      {/* Gift Confirmation */}
      <GiftConfirmation
        isOpen={showGiftConfirmation}
        onClose={() => setShowGiftConfirmation(false)}
        credits={giftConfirmationData.credits}
        fromPartner={giftConfirmationData.fromPartner}
      />
    </div>
  );
}