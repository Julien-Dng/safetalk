import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Placeholder props interface (will be expanded in Phase 4)
interface ChatScreenProps {
  username: string;
  role: string;
  chatSession: any;
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
  onUpdateSession: (session: any) => void;
  onLowTimeAlert: (freeTimeLeft: number, paidTimeLeft: number) => void;
}

export function ChatScreen(props: ChatScreenProps) {
  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        
        <View style={styles.content}>
          <Text style={styles.placeholderText}>
            Chat Screen
          </Text>
          <Text style={styles.placeholderSubtext}>
            (Will be implemented in Phase 4)
          </Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholderSubtext: {
    color: '#c4b5fd',
    fontSize: 16,
    marginTop: 8,
  },
});