import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

interface LowTimeAlertProps {
  isOpen: boolean;
  onClose: () => void;
  freeTimeLeft: number;
  paidTimeLeft: number;
  credits: number;
  onBuyTime: (option: string, creditsRequired: number, minutes: number) => void;
  onGoToPremium: () => void;
}

export function LowTimeAlert({ 
  isOpen, 
  onClose, 
  freeTimeLeft, 
  paidTimeLeft, 
  credits, 
  onBuyTime, 
  onGoToPremium 
}: LowTimeAlertProps) {
  const totalTimeLeft = freeTimeLeft + paidTimeLeft;
  const minutesLeft = Math.floor(totalTimeLeft / 60);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView style={styles.backdrop} intensity={20} tint="dark">
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#dc2626', '#ef4444']}
            style={styles.modal}
          >
            <Text style={styles.title}>⏰ Low Time Warning</Text>
            <Text style={styles.subtitle}>
              Only {minutesLeft} minutes left in your chat session
            </Text>
            
            <View style={styles.options}>
              <Text style={styles.optionsTitle}>Extend your time:</Text>
              
              <TouchableOpacity
                style={[styles.option, credits < 5 && styles.optionDisabled]}
                onPress={() => onBuyTime("30min", 5, 30)}
                disabled={credits < 5}
              >
                <Text style={styles.optionText}>+30 min (5 credits)</Text>
                <Text style={styles.optionSubtext}>€0.99</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.option, credits < 10 && styles.optionDisabled]}
                onPress={() => onBuyTime("1hour", 10, 60)}
                disabled={credits < 10}
              >
                <Text style={styles.optionText}>+1 hour (10 credits)</Text>
                <Text style={styles.optionSubtext}>€1.99</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.premiumOption}
                onPress={onGoToPremium}
              >
                <Text style={styles.premiumOptionText}>Get Premium - Unlimited Daily Time</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Continue with current time</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modal: {
    padding: 24,
    alignItems: 'center',
    minWidth: 320,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.9,
  },
  options: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  optionsTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  option: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtext: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.8,
  },
  premiumOption: {
    backgroundColor: '#f59e0b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumOptionText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 12,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.7,
  },
});