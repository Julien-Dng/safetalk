import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface PremiumScreenProps {
  onBack: () => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

export function PremiumScreen(props: PremiumScreenProps) {
  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        
        <View style={styles.content}>
          <Text style={styles.placeholderText}>
            Premium Screen
          </Text>
          <Text style={styles.placeholderSubtext}>
            (Will be implemented in Phase 6)
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