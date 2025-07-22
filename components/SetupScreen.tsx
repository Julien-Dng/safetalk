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

interface SetupScreenProps {
  onBack: () => void;
  onComplete: (role: string) => void;
}

export function SetupScreen({ onBack, onComplete }: SetupScreenProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleComplete = () => {
    if (selectedRole) {
      onComplete(selectedRole);
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
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Setup Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.setupContainer}>
            <Text style={styles.title}>How do you want to use SafeTalk?</Text>
            <Text style={styles.subtitle}>You can change this later</Text>

            <View style={styles.roleOptions}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === "talk" && styles.roleButtonSelected
                ]}
                onPress={() => setSelectedRole("talk")}
              >
                <Text style={styles.roleEmoji}>💬</Text>
                <Text style={styles.roleTitle}>I want to talk</Text>
                <Text style={styles.roleDescription}>
                  Share what's on your mind with caring listeners
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === "listen" && styles.roleButtonSelected
                ]}
                onPress={() => setSelectedRole("listen")}
              >
                <Text style={styles.roleEmoji}>👂</Text>
                <Text style={styles.roleTitle}>I want to listen</Text>
                <Text style={styles.roleDescription}>
                  Provide support and be there for others
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === "both" && styles.roleButtonSelected
                ]}
                onPress={() => setSelectedRole("both")}
              >
                <Text style={styles.roleEmoji}>🤝</Text>
                <Text style={styles.roleTitle}>Both</Text>
                <Text style={styles.roleDescription}>
                  Sometimes talk, sometimes listen
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.continueButton,
                !selectedRole && styles.continueButtonDisabled
              ]}
              onPress={handleComplete}
              disabled={!selectedRole}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
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
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#c4b5fd',
    fontSize: 16,
    textAlign: 'center',
    marginTop: -8,
  },
  roleOptions: {
    gap: 16,
  },
  roleButton: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  roleButtonSelected: {
    borderColor: '#7c3aed',
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
  },
  roleEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  roleTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleDescription: {
    color: '#c4b5fd',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});