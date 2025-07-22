import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { EmailAuthModal } from "./EmailAuthModal";
import { PhoneAuthModal } from "./PhoneAuthModal";

interface SignInScreenProps {
  onSignIn: (username: string) => void;
}

export function SignInScreen({ onSignIn }: SignInScreenProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const handleEmailAuth = (emailUsername: string) => {
    onSignIn(emailUsername);
  };

  const handlePhoneAuth = (phoneUsername: string) => {
    onSignIn(phoneUsername);
  };

  const handleGoogleAuth = () => {
    // Simulate Google authentication
    const randomUsername = "GoogleUser" + Math.floor(Math.random() * 1000);
    onSignIn(randomUsername);
  };

  const handleAppleAuth = () => {
    // Simulate Apple authentication  
    const randomUsername = "AppleUser" + Math.floor(Math.random() * 1000);
    onSignIn(randomUsername);
  };

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sign In</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.formContainer}>
            {/* Welcome Message */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome back</Text>
              <Text style={styles.welcomeSubtitle}>
                Choose how you'd like to sign in
              </Text>
            </View>

            {/* Sign In Options */}
            <View style={styles.signInOptions}>
              <TouchableOpacity
                style={[styles.signInButton, styles.googleButton]}
                onPress={handleGoogleAuth}
              >
                <View style={styles.googleIcon}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.signInButton, styles.appleButton]}
                onPress={handleAppleAuth}
              >
                <View style={styles.appleIcon}>
                  <Text style={styles.appleIconText}>🍎</Text>
                </View>
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.signInButton, styles.phoneButton]}
                onPress={() => setShowPhoneModal(true)}
              >
                <Ionicons name="phone-portrait-outline" size={20} color="#ffffff" />
                <Text style={styles.phoneButtonText}>Continue with Phone</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.signInButton, styles.emailButton]}
                onPress={() => setShowEmailModal(true)}
              >
                <Ionicons name="mail-outline" size={20} color="#ffffff" />
                <Text style={styles.emailButtonText}>Continue with Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Email Authentication Modal */}
        <EmailAuthModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onSuccess={handleEmailAuth}
        />

        {/* Phone Authentication Modal */}
        <PhoneAuthModal
          isOpen={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          onSuccess={handlePhoneAuth}
        />
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  formContainer: {
    maxWidth: 320,
    alignSelf: 'center',
    width: '100%',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: '#c4b5fd',
    fontSize: 14,
    textAlign: 'center',
  },
  signInOptions: {
    gap: 12,
  },
  signInButton: {
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  googleButton: {
    backgroundColor: '#ffffff',
  },
  googleIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  googleButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '500',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  appleIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleIconText: {
    fontSize: 12,
  },
  appleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  phoneButton: {
    backgroundColor: '#7c3aed',
  },
  phoneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  emailButton: {
    backgroundColor: '#2563eb',
  },
  emailButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});