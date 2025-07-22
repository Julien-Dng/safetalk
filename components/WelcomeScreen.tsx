import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        
        <View style={styles.content}>
          <View style={styles.brandSection}>
            <Text style={styles.brandName}>SafeTalk</Text>
            <Text style={styles.brandTagline}>Anonymous. Safe. Supportive.</Text>
          </View>

          <View style={styles.features}>
            <Text style={styles.featureText}>🌟 Connect with caring listeners</Text>
            <Text style={styles.featureText}>🔐 Complete anonymity guaranteed</Text>
            <Text style={styles.featureText}>💬 Safe space for sharing</Text>
            <Text style={styles.featureText}>🎯 Real human connections</Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={onContinue}
          >
            <Text style={styles.continueButtonText}>Get Started</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 48,
  },
  brandSection: {
    alignItems: 'center',
    gap: 12,
  },
  brandName: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  brandTagline: {
    color: '#c4b5fd',
    fontSize: 16,
    textAlign: 'center',
  },
  features: {
    gap: 16,
  },
  featureText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});