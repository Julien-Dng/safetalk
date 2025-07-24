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
  const { sessionId } = params;
  const navigation = useNavigation<any>();

  const [session, setSession] = useState(null as any);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await ChatService.getSessionById(sessionId);
        setSession(s);
        if (auth.currentUser) {
          const p = await AuthService.getUserProfile(
            auth.currentUser.uid
          );
          setUser(p);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (loading || !session || !user) {
    return (
      <Text style={{ color: "white", padding: 20 }}>
        Loading…
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
      giftableCredits={user.giftableCredits}
      dailyFreeTimeRemaining={freeTimeRemaining}
      paidTimeAvailable={user.paidTimeAvailable}
      onBack={() => {}}
      onCloseChat={onCloseChat}
      onTimerEnd={() => {}}
      onShowAccount={() => navigation.navigate('Account')}
      onChatEnd={() => {}}
      onPartnerChange={() => {}}
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
