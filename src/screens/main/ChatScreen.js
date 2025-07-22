import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useChat } from '../../context/ChatContext';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, formatTime, isTimeCritical, isTimeInDanger } from '../../utils/helpers';
import ProgressBar from '../../components/ProgressBar';
import RatingModal from '../../components/RatingModal';
import CreditModal from '../../components/CreditModal';

const ChatScreen = ({ navigation }) => {
  const { user: authUser } = useAuth();
  const { user, dailyTimer, credits, getRemainingTime, updateDailyTimeUsed } = useUser();
  const {
    currentChat,
    messages,
    sendMessage,
    endChat,
    skipPartner,
    blockPartner,
    reportPartner,
    matchingSkips,
  } = useChat();

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [chatStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef(null);

  // Update timers
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - chatStartTime;
      setElapsedTime(elapsed);
      
      if (dailyTimer) {
        const remaining = getRemainingTime() - elapsed;
        setRemainingTime(Math.max(0, remaining));
        
        // Update daily time used
        updateDailyTimeUsed((dailyTimer.timeUsed || 0) + elapsed);
        
        // Show warnings
        if (remaining <= 0 && !user?.isPremium) {
          handleTimeExpired();
        } else if (isTimeCritical(remaining) && !showTimeWarning) {
          setShowTimeWarning(true);
          Alert.alert(
            'Time Running Out!',
            'You have less than 1 minute remaining. Consider using credits or upgrading to premium.',
            [
              { text: 'Use Credits', onPress: () => setShowCreditModal(true) },
              { text: 'Continue', style: 'cancel' },
            ]
          );
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [chatStartTime, dailyTimer, user?.isPremium]);

  // Check for rating eligibility
  useEffect(() => {
    if (currentChat && messages.length >= 5 && elapsedTime >= 5 * 60 * 1000) {
      // Enable rating after 5 messages OR 5 minutes
      if (!currentChat.ratingSubmitted) {
        setShowRatingModal(true);
      }
    }
  }, [messages.length, elapsedTime, currentChat]);

  // Redirect if no chat
  useEffect(() => {
    if (!currentChat) {
      navigation.navigate('EmptyState');
    }
  }, [currentChat]);

  const handleTimeExpired = () => {
    if (user?.isPremium) return;
    
    Alert.alert(
      'Time Expired',
      'Your daily free time has ended. Use credits or upgrade to premium to continue.',
      [
        {
          text: 'Use Credits',
          onPress: () => setShowCreditModal(true),
        },
        {
          text: 'End Chat',
          style: 'destructive',
          onPress: handleEndChat,
        },
      ]
    );
  };

  const handleSend = async (newMessages = []) => {
    if (newMessages.length === 0) return;
    
    const message = newMessages[0];
    const result = await sendMessage(message.text);
    
    if (!result.success) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleEndChat = () => {
    Alert.alert(
      'End Chat',
      'Are you sure you want to end this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Chat',
          style: 'destructive',
          onPress: async () => {
            await endChat();
            setShowRatingModal(true);
          },
        },
      ]
    );
  };

  const handleSkipPartner = () => {
    if (user?.isPremium) {
      handlePremiumSkip();
      return;
    }

    const newSkipCount = matchingSkips + 1;
    
    if (newSkipCount >= 5) {
      Alert.alert(
        'Skip Limit Reached',
        'You\'ve reached the skip limit. Watch an ad to continue or upgrade to premium.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Watch Ad',
            onPress: () => {
              navigation.navigate('Ad', {
                onAdComplete: () => continueSkipping(),
                onAdFailed: () => navigation.goBack(),
              });
            },
          },
          {
            text: 'Upgrade Premium',
            onPress: () => navigation.navigate('Account', { screen: 'Premium' }),
          },
        ]
      );
    } else {
      handleRegularSkip();
    }
  };

  const handleRegularSkip = async () => {
    const result = await skipPartner();
    if (result.success) {
      navigation.navigate('Matching');
    }
  };

  const handlePremiumSkip = async () => {
    const result = await skipPartner();
    if (result.success) {
      navigation.navigate('Matching');
    }
  };

  const continueSkipping = async () => {
    const result = await skipPartner();
    if (result.success) {
      navigation.navigate('Matching');
    }
  };

  const handleBlockPartner = () => {
    Alert.alert(
      'Block Partner',
      'Are you sure you want to block this person? You won\'t be matched with them again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            const result = await blockPartner();
            if (result.success) {
              Alert.alert('Blocked', 'This user has been blocked.');
              navigation.navigate('EmptyState');
            }
          },
        },
      ]
    );
  };

  const handleReportPartner = () => {
    Alert.alert(
      'Report Partner',
      'Why are you reporting this person?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Inappropriate Content', onPress: () => submitReport('inappropriate') },
        { text: 'Harassment', onPress: () => submitReport('harassment') },
        { text: 'Spam', onPress: () => submitReport('spam') },
        { text: 'Other', onPress: () => submitReport('other') },
      ]
    );
  };

  const submitReport = async (reason) => {
    const result = await reportPartner(reason);
    if (result.success) {
      Alert.alert('Reported', 'Thank you for your report. We\'ll review it shortly.');
      handleEndChat();
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

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: COLORS.primary,
          },
          left: {
            backgroundColor: COLORS.background,
          },
        }}
        textStyle={{
          right: {
            color: '#FFFFFF',
          },
          left: {
            color: COLORS.text,
          },
        }}
      />
    );
  };

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
      />
    );
  };

  const renderSend = (props) => {
    return (
      <Send {...props} containerStyle={styles.sendButton}>
        <Icon name="send" size={24} color={COLORS.primary} />
      </Send>
    );
  };

  if (!currentChat) {
    return null; // Will redirect via useEffect
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Anonymous Chat</Text>
          <Text style={styles.headerSubtitle}>
            {formatTime(elapsedTime)} elapsed
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSkipPartner}
          >
            <Icon name="skip-next" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Timer Bar */}
      {!user?.isPremium && (
        <View style={styles.timerContainer}>
          <View style={styles.timerHeader}>
            <Text style={styles.timerLabel}>Time Remaining</Text>
            <Text style={[styles.timerText, { color: getTimerColor() }]}>
              {formatTime(remainingTime)}
            </Text>
          </View>
          <ProgressBar
            progress={getTimerProgress()}
            color={getTimerColor()}
            height={4}
            style={styles.timerBar}
          />
        </View>
      )}

      {/* Chat */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <GiftedChat
          messages={messages}
          onSend={handleSend}
          user={{
            _id: authUser.uid,
            name: 'You',
          }}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          renderSend={renderSend}
          placeholder="Type a message..."
          alwaysShowSend
          scrollToBottom
          infiniteScroll
        />
      </KeyboardAvoidingView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleBlockPartner}
        >
          <Icon name="block" size={20} color={COLORS.danger} />
          <Text style={[styles.actionText, { color: COLORS.danger }]}>Block</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleReportPartner}
        >
          <Icon name="report" size={20} color={COLORS.warning} />
          <Text style={[styles.actionText, { color: COLORS.warning }]}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEndChat}
        >
          <Icon name="call-end" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>End Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={() => setShowRatingModal(false)}
      />

      {/* Credit Modal */}
      <CreditModal
        visible={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        onSuccess={() => setShowCreditModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  timerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timerBar: {
    width: '100%',
  },
  chatContainer: {
    flex: 1,
  },
  inputToolbar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inputPrimary: {
    alignItems: 'center',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default ChatScreen;