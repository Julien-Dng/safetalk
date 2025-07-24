import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  TimerService,
  TimerState,
} from "../services/timerService";
import { CreditService } from "../services/creditService";
import {
  ChatService,
  ChatMessage,
  ChatSession as ServiceChatSession,
} from "../services/chatService";

interface Message {
  id: string;
  text: string;
  sender: "user" | "partner" | "system";
  timestamp: Date;
}

// Cette interface <–> props que vous recevez du wrapper
export interface ChatScreenProps {
  username: string;
  role: string;
  chatSession: ServiceChatSession;
  credits: number;
  isPremium: boolean;
  giftableCredits: number;
  dailyFreeTimeRemaining: number;
  paidTimeAvailable: number;
  onBack: () => void;
  onCloseChat: (freeTimeLeft: number, paidTimeLeft: number) => void;
  onTimerEnd: () => void;
  onShowAccount: () => void;
  onChatEnd: (sessionData: any) => void;
  onPartnerChange: () => void;
  onUserBlocked: (username: string) => void;
  onUserReported: (username: string) => void;
  onBuyCredits: (option: string, credits: number) => void;
  onUseCredits: (creditsToUse: number) => void;
  onSendCredits: (amount: number) => void;
  onCreditDeducted: () => void;
  onUpdateSession: (session: ServiceChatSession) => void;
  onLowTimeAlert: (freeTimeLeft: number, paidTimeLeft: number) => void;
}

export default function ChatScreenWithProps({
  username,
  role,
  chatSession,
  credits,
  isPremium,
  giftableCredits,
  dailyFreeTimeRemaining,
  paidTimeAvailable,
  onBack,
  onCloseChat,
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
  onLowTimeAlert,
}: ChatScreenProps) {
    const partnerId = chatSession.participants.find((id) => id !== username);

  // 2) Resolve their profile (or fall back to the AI)
  const interlocutor = partnerId
    ? chatSession.participantProfiles[partnerId]
    : {
        username: "@SafetalkAI",
        isAmbassador: false,
        rating: 0,
        isPremium: false,
      };
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [creditsActivated, setCreditsActivated] = useState(false);
  const [isChangingPartner, setIsChangingPartner] = useState(false);
  const [loading, setLoading] = useState(false);
  

  const messagesEndRef = useRef<ScrollView>(null);
  const timerService = useRef(TimerService.getInstance());
  const chatMessageUnsubscribe = useRef<(() => void) | null>(null);

  useEffect(() => {
    initializeChat();
    return () => cleanup();
  }, [chatSession.id]);

  const initializeChat = async () => {
    try {
      // Timer
      await timerService.current.initializeTimer(
        {
          uid: "current-user",
          isPremium,
          dailyFreeTimeUsed:
            1200 - dailyFreeTimeRemaining,
          paidTimeAvailable,
          dailyResetDate: new Date().toDateString(),
        } as any,
        chatSession.id
      );
      const unSubTimer =
        timerService.current.subscribe((state) => {
          setTimerState(state);
          const total =
            state.freeTimeLeft +
            state.paidTimeLeft;
          if (
            total <= 180 &&
            total > 0 &&
            !isPremium
          ) {
            onLowTimeAlert(
              state.freeTimeLeft,
              state.paidTimeLeft
            );
          }
          if (total <= 0 && !isPremium) {
            onTimerEnd();
          }
        });
      timerService.current.startTimer();

      // Messages
      const unSubMsgs = ChatService.subscribeToMessages(
        chatSession.id,
        (chatMessages: ChatMessage[]) => {
          setMessages(
            chatMessages.map((msg) => ({
              id: msg.id,
              text: msg.text,
              sender:
                msg.senderId === "current-user"
                  ? "user"
                  : msg.senderId === "system"
                  ? "system"
                  : "partner",
              timestamp:
                msg.timestamp instanceof Date
                  ? msg.timestamp
                  : new Date(),
            }))
          );
        }
      );
      chatMessageUnsubscribe.current = unSubMsgs;

      // Premier message système
      if (messages.length === 0) {
        const welcome = getWelcomeMessage();
        await ChatService.sendMessage(
          chatSession.id,
          "system",
          "SafeTalk",
          welcome,
          "system"
        );
      }
    } catch (err) {
      console.error("Init chat error:", err);
    }
  };

  const cleanup = () => {
    timerService.current.stopTimer();
    chatMessageUnsubscribe.current?.();
    ChatService.unsubscribeFromChat(chatSession.id);
  };

  const getWelcomeMessage = () => {
    if (
      chatSession.participantUsernames.includes(
        "@SafetalkAI"
      )
    ) {
      return `Hello! I'm your AI companion…`;
    }
    switch (role) {
      case "talk":
        return "You have been connected …";
      case "listen":
        return "You have been connected …";
      default:
        return "You have been connected …";
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || loading) return;
    setLoading(true);
    try {
      await ChatService.sendMessage(
        chatSession.id,
        "current-user",
        username,
        inputText.trim(),
        "text"
      );
      setInputText("");
    } catch {
      Alert.alert("Error", "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseChat = () => {
    const free = timerState?.freeTimeLeft ?? 0;
    const paid = timerState?.paidTimeLeft ?? 0;
    onCloseChat(free, paid);
  };

  // Handle change partner
  const handleChangePartner = () => {
    setIsChangingPartner(true);
    // End current chat session
    ChatService.endChatSession(
       chatSession.id,
       Math.floor((Date.now() - chatSession.metadata.startTime) / 1000),
      messages.filter(m => m.sender !== 'system').length
    );
    onPartnerChange();
  };

  // Use credits
  const handleUseCredits = async () => {
    if (credits > 0 && timerService.current) {
      try {
        // Deduct credits from user account
        const success = await CreditService.deductCredits(
          'current-user',
          credits,
          `Used ${credits} credits for chat time`
        );

        if (success) {
          // Activate credits in timer service
          timerService.current.useCredits(credits);
          setCreditsActivated(true);
          onUseCredits(credits);
        } else {
          Alert.alert('Error', 'Insufficient credits');
        }
      } catch (error) {
        console.error('Error using credits:', error);
        Alert.alert('Error', 'Failed to use credits');
      }
    }
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    if (seconds === Infinity || isPremium) return "∞";
    
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h${mins.toString().padStart(2, '0')}`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate timer values
  const totalTimeLeft = timerState ? 
    (creditsActivated ? timerState.paidTimeLeft : timerState.freeTimeLeft + timerState.paidTimeLeft) : 0;
  const progressPercentage = timerState ? timerService.current.getProgressPercentage() : 0;
  const timerColor = totalTimeLeft <= 60 ? '#ef4444' : totalTimeLeft <= 180 ? '#f59e0b' : '#7c3aed';
  const shouldPulse = totalTimeLeft <= 60;

  // Scroll to bottom when messages update
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        
        {/* Header */}
        <View style={styles.header}>
          {/* Close Chat Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseChat}
            disabled={isChangingPartner}
          >
            <Ionicons name="close" size={20} color="#c4b5fd" />
          </TouchableOpacity>
          
          {/* Partner Info */}
          <View style={styles.partnerInfo}>
            <Text style={styles.partnerName}>
              {interlocutor.username}
            </Text>
            {interlocutor.isAmbassador && (
              <View style={styles.ambassadorBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#ffffff" />
                <Text style={styles.ambassadorText}>
                  {interlocutor.username === "@SafetalkAI" ? "AI" : "Ambassador"}
                </Text>
              </View>
            )}
          </View>
          
          {/* Menu Button */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onShowAccount}
            disabled={isChangingPartner}
          >
            <Ionicons name="settings-outline" size={20} color="#c4b5fd" />
          </TouchableOpacity>
        </View>

        {/* Timer Section - Only show for freemium users */}
        {!isPremium && timerState && (
          <View style={styles.timerSection}>
            <View style={styles.timerHeader}>
              <Text style={styles.timerLabel}>Time Remaining</Text>
              <Text style={styles.timerValue}>
                {formatTime(totalTimeLeft)}
              </Text>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill,
                    { 
                      width: `${progressPercentage}%`,
                      backgroundColor: timerColor,
                      opacity: shouldPulse ? 0.8 : 1
                    }
                  ]}
                />
              </View>
            </View>

            {/* Credit Controls */}
            {!creditsActivated && credits > 0 && (
              <TouchableOpacity
                style={styles.useCreditsButton}
                onPress={handleUseCredits}
              >
                <Ionicons name="diamond-outline" size={16} color="#22c55e" />
                <Text style={styles.useCreditsText}>
                  Use Credits: {credits} (≈ {formatTime(credits * 6 * 60)})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Messages */}
        <View style={styles.messagesContainer}>
          <ScrollView
            ref={messagesEndRef}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.sender === "user" 
                    ? styles.messageContainerUser
                    : message.sender === "system"
                    ? styles.messageContainerSystem
                    : styles.messageContainerPartner
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    message.sender === "user"
                      ? styles.messageBubbleUser
                      : message.sender === "system"
                      ? styles.messageBubbleSystem
                      : styles.messageBubblePartner
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.sender === "user"
                        ? styles.messageTextUser
                        : message.sender === "system"
                        ? styles.messageTextSystem
                        : styles.messageTextPartner
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {/* Change Partner Button - Only for human chats */}
          {interlocutor.username !== "@SafetalkAI" && (
            <TouchableOpacity
              style={styles.changePartnerButton}
              onPress={handleChangePartner}
              disabled={isChangingPartner}
            >
              <Ionicons 
                name="refresh-outline" 
                size={16} 
                color="#c4b5fd" 
              />
              <Text style={styles.changePartnerText}>
                {isChangingPartner ? "Finding Partner..." : "Change Partner"}
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Message Input */}
          <View style={styles.messageInput}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={
                isChangingPartner
                  ? "Finding new partner..."
                  : "Type your message..."
              }
              placeholderTextColor="#7c3aed"
              multiline
              maxLength={500}
              editable={!isChangingPartner && !loading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || loading || isChangingPartner) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || loading || isChangingPartner}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color="#ffffff" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: '#4c1d95',
  },
  closeButton: {
    padding: 8,
  },
  partnerInfo: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  partnerName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  ambassadorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(124, 58, 237, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ambassadorText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  menuButton: {
    padding: 8,
  },
  timerSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: '#4c1d95',
    gap: 12,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerLabel: {
    color: '#a78bfa',
    fontSize: 14,
  },
  timerValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  useCreditsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  useCreditsText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  messageContainer: {
    marginVertical: 2,
  },
  messageContainerUser: {
    alignItems: 'flex-end',
  },
  messageContainerSystem: {
    alignItems: 'center',
  },
  messageContainerPartner: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  messageBubbleUser: {
    backgroundColor: '#7c3aed',
  },
  messageBubbleSystem: {
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    maxWidth: '90%',
  },
  messageBubblePartner: {
    backgroundColor: 'rgba(124, 58, 237, 0.5)',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#ffffff',
  },
  messageTextSystem: {
    color: '#c4b5fd',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  messageTextPartner: {
    color: '#ffffff',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderTopWidth: 1,
    borderTopColor: '#4c1d95',
    gap: 12,
  },
  changePartnerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#4c1d95',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  changePartnerText: {
    color: '#c4b5fd',
    fontSize: 14,
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    borderWidth: 1,
    borderColor: '#4c1d95',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});