import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
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
  onResumeChat?: () => void;
  hasActiveSession?: boolean;
  activeSessionPartner?: string;
  onShowAccount: () => void;
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
  onResumeChat,
  hasActiveSession = false,
  activeSessionPartner,
  onShowAccount
}: EmptyStateProps) {
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
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.accountButton}
            onPress={onShowAccount}
            activeOpacity={0.7}
          >
            <Settings size={20} color="#c4b5fd" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.mainContent}>
            {/* Illustration */}
            <View style={styles.illustrationSection}>
              <View style={styles.illustrationIcon}>
                <Users size={40} color="#7c3aed" />
              </View>
              <Text style={styles.mainTitle}>
                {hasActiveSession ? "Ready to chat?" : "No one is available right now"}
              </Text>
              <Text style={styles.mainSubtitle}>
                {hasActiveSession 
                  ? "You can resume your conversation or find a new chat partner."
                  : "Don't worry, people join Safetalk throughout the day. You can try again in a few minutes."
                }
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsSection}>
              {/* Resume Chat Button - Only show if there's an active session */}
              {hasActiveSession && onResumeChat && (
                <TouchableOpacity
                  style={styles.resumeButton}
                  onPress={onResumeChat}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#6366f1', '#8b5cf6', '#a855f7']}
                    style={styles.resumeButtonGradient}
                  >
                    <View style={styles.resumeButtonContent}>
                      <MessageCircle size={16} color="#ffffff" />
                      <Text style={styles.resumeButtonText}>Resume Chat</Text>
                      {activeSessionPartner && (
                        <Text style={styles.resumeButtonPartner}>
                          with {activeSessionPartner}
                        </Text>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Find a partner Button */}
              <TouchableOpacity
                style={styles.findPartnerButton}
                onPress={onFindPartner}
                activeOpacity={0.8}
              >
                <View style={styles.findPartnerButtonContent}>
                  <Search size={16} color="#ffffff" />
                  <Text style={styles.findPartnerButtonText}>Find a partner</Text>
                </View>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Chat with AI Button */}
              <TouchableOpacity
                style={styles.aiButton}
                onPress={onChatWithAI}
                activeOpacity={0.8}
              >
                <View style={styles.aiButtonContent}>
                  <Bot size={16} color="#c4b5fd" />
                  <Text style={styles.aiButtonText}>Chat with AI Assistant</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Active Session Info - Only show if there's an active session */}
            {hasActiveSession && activeSessionPartner && (
              <Card style={styles.activeSessionCard}>
                <View style={styles.activeSessionContent}>
                  <View style={styles.activeSessionIcon}>
                    <User size={16} color="#ffffff" />
                  </View>
                  <View style={styles.activeSessionInfo}>
                    <Text style={styles.activeSessionTitle}>Active conversation</Text>
                    <Text style={styles.activeSessionPartner}>{activeSessionPartner}</Text>
                  </View>
                  <View style={styles.activeSessionIndicator} />
                </View>
              </Card>
            )}

            {/* Tips */}
            <Card style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <Clock size={16} color="#c4b5fd" />
                <Text style={styles.tipsTitle}>Best times to connect</Text>
              </View>
              <View style={styles.tipsContent}>
                <View style={styles.tipRow}>
                  <Text style={styles.tipLabel}>Peak hours:</Text>
                  <Text style={styles.tipValue}>7-10 PM</Text>
                </View>
                <View style={styles.tipRow}>
                  <Text style={styles.tipLabel}>Weekends:</Text>
                  <Text style={styles.tipValue}>Most active</Text>
                </View>
                <View style={styles.tipRow}>
                  <Text style={styles.tipLabel}>Time zones:</Text>
                  <Text style={styles.tipValue}>Global users</Text>
                </View>
              </View>
            </Card>

            {/* Community Stats */}
            <View style={styles.statsCard}>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>2.1K</Text>
                  <Text style={styles.statLabel}>Active today</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>156</Text>
                  <Text style={styles.statLabel}>Online now</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>45K</Text>
                  <Text style={styles.statLabel}>Total chats</Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>New to Safetalk? Check out our</Text>
              <TouchableOpacity style={styles.footerLink}>
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
  resumeButton: {
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
  },
  resumeButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  resumeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resumeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  resumeButtonPartner: {
    color: '#c4b5fd',
    fontSize: 12,
  },
  findPartnerButton: {
    height: 48,
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
});