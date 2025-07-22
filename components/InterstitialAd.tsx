import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface InterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchAd: () => void;
  partnerChangeCount: number;
}

export function InterstitialAd({ isOpen, onClose, onWatchAd, partnerChangeCount }: InterstitialAdProps) {
  const [countdown, setCountdown] = useState(5);
  const [isWatching, setIsWatching] = useState(false);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setCountdown(5);
    setIsWatching(false);
    setCanClose(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isWatching || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [isWatching, countdown]);

  const handleWatchAd = () => {
    setIsWatching(true);
  };

  const handleComplete = () => {
    onWatchAd();
    setIsWatching(false);
    setCanClose(false);
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={canClose ? onClose : undefined}
    >
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {!isWatching ? (
            // Ad Prompt
            <View style={styles.promptContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="tv-outline" size={48} color="#7c3aed" />
              </View>
              
              <Text style={styles.title}>Watch a short ad</Text>
              <Text style={styles.subtitle}>
                You've skipped {partnerChangeCount} partners. Watch a quick ad to continue finding matches.
              </Text>
              
              <View style={styles.benefits}>
                <Text style={styles.benefitItem}>• Support SafeTalk community</Text>
                <Text style={styles.benefitItem}>• Earn 1 free credit</Text>
                <Text style={styles.benefitItem}>• Continue unlimited matching</Text>
              </View>

              <TouchableOpacity
                style={styles.watchButton}
                onPress={handleWatchAd}
              >
                <Text style={styles.watchButtonText}>Watch Ad (30 seconds)</Text>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                This helps keep SafeTalk free for everyone
              </Text>
            </View>
          ) : (
            // Ad Simulation
            <View style={styles.adContainer}>
              <View style={styles.adHeader}>
                <Text style={styles.adLabel}>Advertisement</Text>
                {canClose ? (
                  <TouchableOpacity onPress={handleComplete} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color="#ffffff" />
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.countdown}>{countdown}s</Text>
                )}
              </View>

              <View style={styles.mockAd}>
                <Ionicons name="play-circle-outline" size={64} color="#7c3aed" />
                <Text style={styles.mockAdTitle}>Demo Advertisement</Text>
                <Text style={styles.mockAdSubtitle}>
                  This is a simulated ad experience
                </Text>
                
                {countdown > 0 && !canClose && (
                  <Text style={styles.adCountdown}>
                    Ad ends in {countdown} seconds...
                  </Text>
                )}

                {canClose && (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={handleComplete}
                  >
                    <Text style={styles.completeButtonText}>
                      Claim 1 Credit & Continue
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
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
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
    lineHeight: 24,
  },
  benefits: {
    gap: 8,
  },
  benefitItem: {
    color: '#a78bfa',
    fontSize: 14,
    textAlign: 'center',
  },
  watchButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  watchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    color: '#7c3aed',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  adContainer: {
    flex: 1,
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  adLabel: {
    color: '#c4b5fd',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  countdown: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  mockAd: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  mockAdTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mockAdSubtitle: {
    color: '#c4b5fd',
    fontSize: 14,
    textAlign: 'center',
  },
  adCountdown: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
  },
  completeButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 16,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});