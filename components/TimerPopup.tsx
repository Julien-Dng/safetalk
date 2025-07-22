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

interface TimerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  onExtendTime: (option: string) => void;
  onGoToPremium: () => void;
}

export function TimerPopup({ isOpen, onClose, credits, onExtendTime, onGoToPremium }: TimerPopupProps) {
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
            colors={['#1a1a2e', '#16213e']}
            style={styles.modal}
          >
            <Text style={styles.title}>Time's Up!</Text>
            <Text style={styles.subtitle}>Your chat session has ended</Text>
            
            <View style={styles.options}>
              <Text style={styles.optionsTitle}>Continue chatting:</Text>
              
              <TouchableOpacity
                style={styles.option}
                onPress={() => onExtendTime("30min")}
              >
                <Text style={styles.optionText}>30 min (5 credits)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.option}
                onPress={() => onExtendTime("1hour")}
              >
                <Text style={styles.optionText}>1 hour (10 credits)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.premiumOption}
                onPress={onGoToPremium}
              >
                <Text style={styles.premiumOptionText}>Go Premium - Unlimited</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
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
    minWidth: 300,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#c4b5fd',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
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
    backgroundColor: '#7c3aed',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  optionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  premiumOption: {
    backgroundColor: '#f59e0b',
    padding: 12,
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
    color: '#c4b5fd',
    fontSize: 14,
  },
});