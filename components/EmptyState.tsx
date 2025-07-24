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
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  onBack: () => void;
  onFindPartner: () => void;
  onChatWithAI: () => void;
  onResumeChat?: () => void;
  hasActiveSession?: boolean;
  activeSessionPartner?: string;
  onShowAccount: () => void;
}

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
        
        {/* Header with Account Access Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.accountButton}
            onPress={onShowAccount}
          >
            <Ionicons name="settings-outline" size={20} color="#c4b5fd" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.contentContainer}>
            {/* Illustration */}
            <View style={styles.illustrationSection}>
              <View style={styles.iconContainer}>
                <Ionicons name="people-outline" size={40} color="#7c3aed" />
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
            <View style={styles.actions}>
              {/* Resume Chat Button - Only show if there's an active session */}
              {hasActiveSession && onResumeChat && (
                <TouchableOpacity
                  onPress={onResumeChat}
                  style={[styles.actionButton, styles.resumeButton]}
                >
                  <LinearGradient
                    colors={['#6366f1', '#8b5cf6', '#a855f7']}
                    style={styles.gradientButton}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color="#ffffff" />
                    <Text style={styles.resumeButtonText}>Resume Chat</Text>
                    {activeSessionPartner && (
                      <Text style={styles.partnerText}>
                        with {activeSessionPartner}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Find a partner Button */}
              <TouchableOpacity
                onPress={onFindPartner}
                style={[styles.actionButton, styles.findPartnerButton]}
              >
                <Ionicons name="search-outline" size={16} color="#ffffff" />
                <Text style={styles.findPartnerButtonText}>Find a partner</Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                onPress={onChatWithAI}
                style={[styles.actionButton, styles.aiButton]}
              >
               {/* <Ionicons name="robot-outline" size={16} color="#c4b5fd" /> */}
                <Text style={styles.aiButtonText}>Chat with AI Assistant</Text>
              </TouchableOpacity>
            </View>

            {/* Active Session Info - Only show if there's an active session */}
            {hasActiveSession && activeSessionPartner && (
              <View style={styles.activeSessionCard}>
                <View style={styles.activeSessionContent}>
                  <View style={styles.avatarContainer}>
                    <Ionicons name="person-outline" size={16} color="#ffffff" />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTitle}>Active conversation</Text>
                    <Text style={styles.sessionPartner}>{activeSessionPartner}</Text>
                  </View>
                  <View style={styles.statusIndicator} />
                </View>
              </View>
            )}

            {/* Tips */}
            <View style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <Ionicons name="time-outline" size={16} color="#c4b5fd" />
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
            </View>

            {/* Community Stats */}
            <View style={styles.statsCard}>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>2.1K</Text>
                  <Text style={styles.statLabel}>Active today</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>156</Text>
                  <Text style={styles.statLabel}>Online now</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>45K</Text>
                  <Text style={styles.statLabel}>Total chats</Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>New to Safetalk? Check out our</Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Community Guidelines</Text>
              </TouchableOpacity>
            </View>
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
  accountButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 320,
  },
  illustrationSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
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
  },
  actions: {
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  resumeButton: {
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderRadius: 16,
  },
  resumeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  partnerText: {
    color: '#c4b5fd',
    fontSize: 12,
  },
  findPartnerButton: {
    backgroundColor: '#7c3aed',
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
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4c1d95',
  },
  aiButtonText: {
    color: '#c4b5fd',
    fontSize: 16,
    fontWeight: '500',
  },
  activeSessionCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    borderWidth: 1,
    borderColor: '#4c1d95',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  activeSessionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  sessionPartner: {
    color: '#c4b5fd',
    fontSize: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#22c55e',
    borderRadius: 4,
    opacity: 1,
  },
  tipsCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderWidth: 1,
    borderColor: '#4c1d95',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#c4b5fd',
    fontSize: 12,
  },
  footer: {
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: '#7c3aed',
    fontSize: 14,
  },
  footerLink: {
    color: '#a78bfa',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});