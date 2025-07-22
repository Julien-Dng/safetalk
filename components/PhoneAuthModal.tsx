import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (username: string) => void;
}

export function PhoneAuthModal({ isOpen, onClose, onSuccess }: PhoneAuthModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [username, setUsername] = useState("");
  const [step, setStep] = useState<"phone" | "verify" | "username">("phone");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phoneNumber) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    setLoading(true);
    
    // Simulate sending SMS delay
    setTimeout(() => {
      setLoading(false);
      setStep("verify");
      Alert.alert("Code Sent", "A verification code has been sent to your phone");
    }, 1500);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    setLoading(true);
    
    // Simulate verification delay
    setTimeout(() => {
      setLoading(false);
      if (verificationCode === "123456") {
        setStep("username");
      } else {
        Alert.alert("Invalid Code", "Please check the code and try again");
      }
    }, 1000);
  };

  const handleSetUsername = async () => {
    if (!username) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      onSuccess(username);
      onClose();
      // Reset form
      setPhoneNumber("");
      setVerificationCode("");
      setUsername("");
      setStep("phone");
    }, 1000);
  };

  const resetFlow = () => {
    setStep("phone");
    setPhoneNumber("");
    setVerificationCode("");
    setUsername("");
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sign In with Phone</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            {step === "phone" && (
              <View style={styles.form}>
                <Text style={styles.stepTitle}>Enter your phone number</Text>
                <Text style={styles.stepSubtitle}>
                  We'll send you a verification code
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="+1 (555) 123-4567"
                    placeholderTextColor="#7c3aed"
                    keyboardType="phone-pad"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                  onPress={handleSendCode}
                  disabled={loading}
                >
                  <Text style={styles.actionButtonText}>
                    {loading ? "Sending..." : "Send Code"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {step === "verify" && (
              <View style={styles.form}>
                <Text style={styles.stepTitle}>Enter verification code</Text>
                <Text style={styles.stepSubtitle}>
                  Sent to {phoneNumber}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Verification Code</Text>
                  <TextInput
                    style={styles.input}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="123456"
                    placeholderTextColor="#7c3aed"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                  onPress={handleVerifyCode}
                  disabled={loading}
                >
                  <Text style={styles.actionButtonText}>
                    {loading ? "Verifying..." : "Verify Code"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={resetFlow} style={styles.backButton}>
                  <Text style={styles.backButtonText}>Use different number</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === "username" && (
              <View style={styles.form}>
                <Text style={styles.stepTitle}>Choose your username</Text>
                <Text style={styles.stepSubtitle}>
                  This is how others will see you
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter your username"
                    placeholderTextColor="#7c3aed"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                  onPress={handleSetUsername}
                  disabled={loading}
                >
                  <Text style={styles.actionButtonText}>
                    {loading ? "Creating Account..." : "Complete Setup"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4c1d95',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  form: {
    gap: 24,
  },
  stepTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepSubtitle: {
    color: '#c4b5fd',
    fontSize: 14,
    textAlign: 'center',
    marginTop: -8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#c4b5fd',
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    borderWidth: 1,
    borderColor: '#4c1d95',
    borderRadius: 16,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    padding: 16,
  },
  backButtonText: {
    color: '#a78bfa',
    fontSize: 14,
  },
});