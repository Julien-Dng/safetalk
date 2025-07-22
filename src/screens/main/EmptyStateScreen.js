import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser } from '../../context/UserContext';
import { useChat } from '../../context/ChatContext';
import { COLORS, formatTime, isTimeInDanger, isTimeCritical } from '../../utils/helpers';
import ProgressBar from '../../components/ProgressBar';
import CreditModal from '../../components/CreditModal';

const EmptyStateScreen = ({ navigation }) => {
  const { user, dailyTimer, credits, getRemainingTime, hasTimeAvailable } = useUser();
  const { findPartner, isMatching } = useChat();
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  // Update remaining time every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (dailyTimer) {
        setRemainingTime(getRemainingTime());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dailyTimer, getRemainingTime]);

  // Initial remaining time
  useEffect(() => {
    if (dailyTimer) {
      setRemainingTime(getRemainingTime());
    }
  }, [dailyTimer]);

  const handleStartChat = async () => {
    if (!hasTimeAvailable()) {
      setShowCreditModal(true);
      return;
    }

    const result = await findPartner();
    
    if (result.success) {
      if (result.waiting) {
        navigation.navigate('Matching');
      } else if (result.chat) {
        navigation.navigate('Chat');
      }
    } else {
      Alert.alert('Error', result.error || 'Failed to find a partner');
    }
  };

  const getTimerColor = () => {
    if (user?.isPremium) return COLORS.success;
    if (isTimeCritical(remainingTime)) return COLORS.danger;
    if (isTimeInDanger(remainingTime)) return COLORS.warning;
    return COLORS.primary;
  };

  const getTimerProgress = () => {
    if (user?.isPremium) return 1;
    if (!dailyTimer) return 0;
    return Math.max(0, remainingTime / dailyTimer.timeLimit);
  };

  const renderTimeDisplay = () => {
    if (user?.isPremium) {
      return (
        <View style={styles.premiumBadge}>
          <Icon name="stars" size={20} color={COLORS.warning} />
          <Text style={styles.premiumText}>Unlimited Time</Text>
        </View>
      );
    }

    return (
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Time Remaining Today</Text>
        <ProgressBar
          progress={getTimerProgress()}
          color={getTimerColor()}
          backgroundColor={COLORS.background}
          height={8}
          style={styles.progressBar}
        />
        <Text style={[styles.timerText, { color: getTimerColor() }]}>
          {formatTime(remainingTime)}
        </Text>
        
        {remainingTime <= 0 && (
          <Text style={styles.timerSubtext}>
            Your free time has ended. Use credits or upgrade to continue.
          </Text>
        )}
      </View>
    );
  };

  const renderCreditsDisplay = () => {
    if (user?.isPremium) return null;

    return (
      <View style={styles.creditsContainer}>
        <Icon name="account-balance-wallet" size={24} color={COLORS.secondary} />
        <Text style={styles.creditsText}>
          {credits?.totalCredits || 0} Credits
        </Text>
        <Text style={styles.creditsSubtext}>
          ({(credits?.totalCredits || 0) * 6} minutes)
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello{user?.displayName ? `, ${user.displayName}` : ''}! 👋
          </Text>
          <Text style={styles.subtitle}>
            Ready to meet someone new?
          </Text>
        </View>

        {/* Timer Display */}
        {renderTimeDisplay()}

        {/* Credits Display */}
        {renderCreditsDisplay()}

        {/* Main Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustration}>
            <Icon name="chat-bubble-outline" size={80} color={COLORS.primary} />
          </View>
          <Text style={styles.illustrationText}>
            Start an anonymous conversation
          </Text>
          <Text style={styles.illustrationSubtext}>
            Connect with people from around the world safely and securely
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.startButton,
              (!hasTimeAvailable() && !user?.isPremium) && styles.startButtonDisabled,
              isMatching && styles.startButtonLoading,
            ]}
            onPress={handleStartChat}
            disabled={isMatching}
          >
            {isMatching ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.startButtonText}>Finding Partner...</Text>
              </>
            ) : (
              <>
                <Icon name="play-arrow" size={24} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Start Chatting</Text>
              </>
            )}
          </TouchableOpacity>

          {!hasTimeAvailable() && !user?.isPremium && (
            <TouchableOpacity
              style={styles.buyCreditsButton}
              onPress={() => setShowCreditModal(true)}
            >
              <Icon name="add-shopping-cart" size={20} color={COLORS.primary} />
              <Text style={styles.buyCreditsText}>Buy Credits</Text>
            </TouchableOpacity>
          )}

          {!user?.isPremium && (
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => navigation.navigate('Account', { screen: 'Premium' })}
            >
              <Icon name="star" size={20} color={COLORS.warning} />
              <Text style={styles.premiumButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Credit Purchase Modal */}
      <CreditModal
        visible={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        onSuccess={() => {
          setShowCreditModal(false);
          // Refresh user data is handled by context
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  timerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBar: {
    marginBottom: 12,
    width: '100%',
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timerSubtext: {
    fontSize: 12,
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 20,
  },
  premiumText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: 8,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 32,
  },
  creditsText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
    marginRight: 4,
  },
  creditsSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  illustration: {
    width: 160,
    height: 160,
    backgroundColor: COLORS.background,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  illustrationText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  illustrationSubtext: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  actionContainer: {
    paddingBottom: 40,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  startButtonLoading: {
    backgroundColor: COLORS.textSecondary,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  buyCreditsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buyCreditsText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  premiumButtonText: {
    color: COLORS.warning,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EmptyStateScreen;