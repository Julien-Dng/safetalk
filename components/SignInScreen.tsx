import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { EmailAuthModal } from "./EmailAuthModal";
import { PhoneAuthModal } from "./PhoneAuthModal";
import { AuthService } from "../services/authService";

interface SignInScreenProps {
  onSignIn: (username: string, userProfile: any) => void;
}

export function SignInScreen({ onSignIn }: SignInScreenProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleEmailAuth = async (email: string, password: string, username?: string) => {
    try {
      setLoading("email");
      const { user, profile } = await AuthService.signInWithEmail(email, password, username);
      onSignIn(profile.username, profile);
      setShowEmailModal(false);
    } catch (error: any) {
      Alert.alert("Authentication Error", error.message);
    } finally {
      setLoading(null);
    }
  };

  const handlePhoneAuth = async (phoneNumber: string, verificationCode: string, username: string) => {
    try {
      setLoading("phone");
      // In a real implementation, you would first send SMS and get verification ID
      // For now, we'll simulate the process
      const { user, profile } = await AuthService.signInWithPhone(phoneNumber);
      onSignIn(profile.username, profile);
      setShowPhoneModal(false);
    } catch (error: any) {
      Alert.alert("Authentication Error", error.message);
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading("google");
      const { user, profile } = await AuthService.signInWithGoogle();
      onSignIn(profile.username, profile);
    } catch (error: any) {
      Alert.alert("Authentication Error", error.message);
    } finally {
      setLoading(null);
    }
  };

  const handleAppleAuth = async () => {
    try {
      setLoading("apple");
      const { user, profile } = await AuthService.signInWithApple();
      onSignIn(profile.username, profile);
    } catch (error: any) {
      Alert.alert("Authentication Error", error.message);
    } finally {
      setLoading(null);
    }
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
                disabled={loading === "google"}
              >
                <View style={styles.googleIcon}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>
                  {loading === "google" ? "Signing in..." : "Continue with Google"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.signInButton, styles.appleButton]}
                onPress={handleAppleAuth}
                disabled={loading === "apple"}
              >
                <View style={styles.appleIcon}>
                  <Text style={styles.appleIconText}>🍎</Text>
                </View>
                <Text style={styles.appleButtonText}>
                  {loading === "apple" ? "Signing in..." : "Continue with Apple"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.signInButton, styles.phoneButton]}
                onPress={() => setShowPhoneModal(true)}
                disabled={!!loading}
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