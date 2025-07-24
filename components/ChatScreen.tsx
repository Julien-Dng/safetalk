// src/components/ChatScreen.tsx
import React, { useState, useEffect } from "react";
import { Text } from "react-native";
import { useRoute } from "@react-navigation/native";
import ChatScreenWithProps from "./ChatScreenWithProps";
import { ChatService, ChatSession } from "../services/chatService";
import { auth } from "../config/firebase";
import { AuthService, UserProfile } from "../services/authService";

export default function ChatScreen() {
  const { params } = useRoute<any>();
  const { sessionId } = params;

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

  return (
    <ChatScreenWithProps
      uid={user.uid}
      chatSession={session}
      username={user.username}
      role={user.role}
      credits={user.credits}
      isPremium={user.isPremium}
      giftableCredits={user.giftableCredits}
      dailyFreeTimeRemaining={user.dailyFreeTimeUsed}
      paidTimeAvailable={user.paidTimeAvailable}
      onBack={() => {}}
      onCloseChat={() => {}}
      onTimerEnd={() => {}}
      onShowAccount={() => {}}
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
