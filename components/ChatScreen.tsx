// src/components/ChatScreen.tsx
import React, { useState, useEffect } from "react";
import { Text } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import ChatScreenWithProps from "./ChatScreenWithProps";
import { ChatService, ChatSession } from "../services/chatService";
import { auth } from "../config/firebase";
import { AuthService, UserProfile } from "../services/authService";

const DAILY_FREE_LIMIT_SEC = 20 * 60;

interface ChatScreenProps {
  onCloseChat: (freeTimeLeft: number, paidTimeLeft: number) => void;
}

export default function ChatScreen({ onCloseChat }: ChatScreenProps) {
  const { params } = useRoute<any>();
  const { sessionId, chatType } = params || {};
  const navigation = useNavigation<any>();

  const [session, setSession] = useState<ChatSession | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to user profile and session
  useEffect(() => {
    let unSub: (() => void) | undefined;
    (async () => {
      try {
        if (auth.currentUser) {
          unSub = AuthService.subscribeToUserProfile(auth.currentUser.uid, setUser);
        }

        if (sessionId) {
          console.log('📱 ChatScreen: Loading session:', sessionId);
          const s = await ChatService.getSessionById(sessionId);
          if (s) {
            setSession(s);
            console.log('✅ ChatScreen: Session loaded:', {
              id: s.id,
              isAIChat: s.isAIChat,
              participants: s.participantUsernames
            });
          } else {
            console.error('❌ ChatScreen: Session not found:', sessionId);
          }
        }
      } catch (error) {
        console.error('❌ ChatScreen: Error loading session:', error);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      if (unSub) unSub();
    };
  }, [sessionId]);

  // Loading state
  if (loading || !session || !user) {
    return (
      <Text style={{ color: "white", padding: 20, textAlign: "center" }}>
        Loading chat...
      </Text>
    );
  }

  const freeTimeRemaining =
    user.isPremium
      ? Infinity
      : Math.max(0, DAILY_FREE_LIMIT_SEC - user.dailyFreeTimeUsed);

  return (
    <ChatScreenWithProps
      uid={user.uid}
      chatSession={session}
      username={user.username}
      role={user.role}
      credits={user.credits}
      isPremium={user.isPremium}
      isAmbassador={user.isAmbassador}
      giftableCredits={user.giftableCredits}
      dailyFreeTimeRemaining={freeTimeRemaining}
      paidTimeAvailable={user.paidTimeAvailable}
      isSearching={false} // Plus de logique de recherche ici
      onBack={() => {}}
      onCloseChat={onCloseChat}
      onTimerEnd={() => {}}
      onShowAccount={() => navigation.navigate('Account')}
      onChatEnd={() => {}}
      onPartnerChange={() => {
        // Pour changer de partenaire, on retourne à l'écran principal
        // et l'utilisateur peut relancer une recherche
        navigation.navigate('Empty');
      }}
      onUserBlocked={() => {}}
      onUserReported={() => {}}
      onBuyCredits={() => {}}
      onUseCredits={() => {}}
      onSendCredits={() => {}}
      onCreditDeducted={() => {}}
      onUpdateSession={() => {}}
      onLowTimeAlert={() => {}}
    />
  );
}