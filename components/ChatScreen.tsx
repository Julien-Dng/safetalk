// src/components/ChatScreen.tsx
import React, { useState, useEffect } from "react";
import { Text } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import ChatScreenWithProps from "./ChatScreenWithProps";
import { ChatService, ChatSession } from "../services/chatService";
import { auth } from "../config/firebase";
import { AuthService, UserProfile } from "../services/authService";
import { MatchingService } from "../services/matchingService";
import { interlocuteurs } from "../interlocuteurs";

const DAILY_FREE_LIMIT_SEC = 20 * 60;

interface ChatScreenProps {
  onCloseChat: (freeTimeLeft: number, paidTimeLeft: number) => void;
}

export default function ChatScreen({ onCloseChat }: ChatScreenProps) {
  const { params } = useRoute<any>();
  const { sessionId, searching } = params || {};
  const navigation = useNavigation<any>();

  const [session, setSession] = useState<ChatSession | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState<boolean>(!!searching);

  useEffect(() => {
    let unSub: (() => void) | undefined;
    (async () => {
      try {
        if (sessionId) {
          const s = await ChatService.getSessionById(sessionId);
          setSession(s);
          if (s && s.participants.length <= 1) {
            setIsSearching(true);
          }
        }
        if (auth.currentUser) {
          unSub = AuthService.subscribeToUserProfile(
            auth.currentUser.uid,
            setUser,
          );
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      if (unSub) unSub();
    };
  }, [sessionId]);

  // create placeholder session if searching with no session
  useEffect(() => {
    if (!loading && isSearching && !session && user) {
      (async () => {
        setLoading(true);
        try {
          const placeholder = await ChatService.createChatSession(
            user,
            null,
            "human",
            true,
          );
          setSession(placeholder);
          navigation.replace("Chat", {
            sessionId: placeholder.id,
            searching: true,
          });
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [loading, isSearching, session, user]);

  useEffect(() => {
    if (!loading && session && user) {
      const hasPartner = session.participants.length > 1;
      const isAI = session.participantUsernames.includes("@SafetalkAI");
      const isActive = session.status === "active";

      if (!isAI && (!hasPartner || !isActive)) {
        setIsSearching(true);
        (async () => {
          setLoading(true);
          try {
            const { promise } = await MatchingService.findMatch(user);
            const result = await promise;
            if (result.success && result.chatId) {
              const newSession = await ChatService.getSessionById(
                result.chatId,
              );
              setSession(newSession);
              setIsSearching(false);
              navigation.replace("Chat", { sessionId: newSession!.id });
              return;
            }
          } catch (error) {
            console.error("Failed to find partner:", error);
          }
          const randomUser =
            interlocuteurs[Math.floor(Math.random() * interlocuteurs.length)];
          const mockSession = await ChatService.createChatSession(
            user,
            randomUser,
            "human",
          );
          setSession(mockSession);
          setIsSearching(false);
          navigation.replace("Chat", { sessionId: mockSession.id });
        })();
      }
    }
  }, [loading, session, user]);

  if (loading || !session || !user) {
    return <Text style={{ color: "white", padding: 20 }}>Loading…</Text>;
  }

  const freeTimeRemaining = user.isPremium
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
      isSearching={isSearching}
      onBack={() => {}}
      onCloseChat={onCloseChat}
      onTimerEnd={() => {}}
      onShowAccount={() => navigation.navigate("Account")}
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
