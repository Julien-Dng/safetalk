import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  Bot,
  Search,
  Clock,
  MessageCircle,
  User,
  Settings,
  ArrowLeft,
} from 'lucide-react-native';

interface EmptyStateProps {
  onBack: () => void;
  onFindPartner: () => void;
  onChatWithAI: () => void;
  onShowAccount: () => void;
  isSearchingPartner: boolean; // 🆕 Prop pour l'état de recherche
}

// Custom Card Component
const Card = ({ children, style }: any) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

export function EmptyState({
  onBack,
  onFindPartner,
  onChatWithAI,
  onShowAccount,
  isSearchingPartner
}: EmptyStateProps) {
  // Animation pour le clignotement
  const blinkAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSearchingPartner) {
      // Démarrer l'animation de clignotement
      const blink = () => {
        Animated.sequence([
          Animated.timing(blinkAnimation, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Répéter l'animation si on est toujours en recherche
          if (isSearchingPartner) {
            blink();
          }
        });
      };
      blink();
    } else {
      // Arrêter l'animation et remettre l'opacité à 1
      blinkAnimation.setValue(1);
    }
  }, [isSearchingPartner, blinkAnimation]);

  return (
    <LinearGradient 
      colors={['#0f0f23', '#1a1a2e', '#16213e']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        
        {/* Header with Back and Account Buttons */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, isSearchingPartner && styles.buttonDisabled]}
            onPress={onBack}
            activeOpacity={0.7}
            disabled={isSearchingPartner}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.accountButton, isSearchingPartner && styles.buttonDisabled]}
            onPress={onShowAccount}
            activeOpacity={0.7}
            disabled={isSearchingPartner}
          >
            <Settings size={20} color="#c4b5fd" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.mainContent}>
            {/* Illustration */}
            <View style={[styles.illustrationSection, isSearchingPartner && styles.sectionFaded]}>
              <View style={styles.illustrationIcon}>
                <Users size={40} color="#7c3aed" />
              </View>
              <Text style={styles.mainTitle}>
                {isSearchingPartner ? "Searching for a partner..." : "No one is available right now"}
              </Text>
              <Text style={styles.mainSubtitle}>
                {isSearchingPartner 
                  ? "We're looking for someone who wants to chat with you. This usually takes a few seconds."
                  : "Don't worry, people join Safetalk throughout the day. You can try again in a few minutes."
                }
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsSection}>
              {/* Find a partner Button */}
              <Animated.View style={{ opacity: isSearchingPartner ? blinkAnimation : 1 }}>
                <TouchableOpacity
                  style={[
                    styles.findPartnerButton,
                    isSearchingPartner && styles.findPartnerButtonSearching
                  ]}
                  onPress={onFindPartner}
                  activeOpacity={0.8}
                  disabled={isSearchingPartner}
                >
                  <View style={styles.findPartnerButtonContent}>
                    {isSearchingPartner ? (
                      <Search size={16} color="#ffffff" />
                    ) : (
                      <Search size={16} color="#ffffff" />
                    )}
                    <Text style={styles.findPartnerButtonText}>
                      {isSearchingPartner ? "Finding a partner..." : "Find a partner"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Divider */}
              <View style={[styles.divider, isSearchingPartner && styles.sectionFaded]}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Chat with AI Button */}
              <TouchableOpacity
                style={[
                  styles.aiButton,
                  isSearchingPartner && styles.buttonDisabled
                ]}
                onPress={onChatWithAI}
                activeOpacity={0.8}
                disabled={isSearchingPartner}
              >
                <View style={styles.aiButtonContent}>
                  <Bot size={16} color="#c4b5fd" />
                  <Text style={styles.aiButtonText}>Chat with AI Assistant</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={[styles.footer, isSearchingPartner && styles.sectionFaded]}>
              <Text style={styles.footerText}>New to Safetalk? Check out our</Text>
              <TouchableOpacity 
                style={styles.footerLink}
                disabled={isSearchingPartner}
              >
                <Text style={styles.footerLinkText}>Community Guidelines</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  accountButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  illustrationSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  illustrationIcon: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainSubtitle: {
    color: '#c4b5fd',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  actionsSection: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 24,
    gap: 16,
  },
  findPartnerButton: {
    height: 48,
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findPartnerButtonSearching: {
    backgroundColor: '#f59e0b', // Orange pendant la recherche
  },
  findPartnerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  findPartnerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#4c1d95',
  },
  dividerText: {
    color: '#7c3aed',
    fontSize: 14,
  },
  aiButton: {
    height: 48,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4c1d95',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiButtonText: {
    color: '#c4b5fd',
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    borderWidth: 1,
    borderColor: '#4c1d95',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 320,
    marginBottom: 16,
  },
  activeSessionCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    borderColor: '#4c1d95',
  },
  activeSessionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeSessionIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSessionInfo: {
    flex: 1,
  },
  activeSessionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  activeSessionPartner: {
    color: '#c4b5fd',
    fontSize: 12,
    marginTop: 2,
  },
  activeSessionIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  tipsCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderColor: '#4c1d95',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    color: '#c4b5fd',
    fontSize: 16,
    fontWeight: '500',
  },
  tipsContent: {
    gap: 8,
  },
  tipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipLabel: {
    color: '#a78bfa',
    fontSize: 14,
  },
  tipValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 320,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#c4b5fd',
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: '#7c3aed',
    fontSize: 14,
    textAlign: 'center',
  },
  footerLink: {
    padding: 0,
  },
  footerLinkText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  // 🆕 Nouveaux styles pour la logique de recherche
  buttonDisabled: {
    opacity: 0.5,
  },
  sectionFaded: {
    opacity: 0.5,
  },
});