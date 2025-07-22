import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useChat } from '../../context/ChatContext';
import { useUser } from '../../context/UserContext';
import { AdService } from '../../services/AdService';
import { COLORS } from '../../utils/helpers';

const MatchingScreen = ({ navigation }) => {
  const { findPartner, skipPartner, matchingSkips, currentChat, isMatching } = useChat();
  const { user } = useUser();
  const [matchingDots, setMatchingDots] = useState('');
  const [timeSearching, setTimeSearching] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animate matching dots
  useEffect(() => {
    const interval = setInterval(() => {
      setMatchingDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Track searching time
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSearching(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Pulse animation
  useEffect(() => {
    const createPulseAnimation = () => {
      return Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);
    };

    const animation = Animated.loop(createPulseAnimation());
    animation.start();

    return () => animation.stop();
  }, []);

  // Check if match is found
  useEffect(() => {
    if (currentChat) {
      navigation.replace('Chat');
    }
  }, [currentChat]);

  // Continue searching if not found immediately
  useEffect(() => {
    if (!isMatching) {
      const searchTimer = setTimeout(() => {
        continueMatching();
      }, 3000);

      return () => clearTimeout(searchTimer);
    }
  }, [isMatching]);

  const continueMatching = async () => {
    if (currentChat) return;

    const result = await findPartner();
    if (result.success && result.chat) {
      navigation.replace('Chat');
    } else if (!result.success) {
      Alert.alert('Matching Error', result.error || 'Unable to find a partner');
      navigation.goBack();
    }
  };

  const handleSkip = async () => {
    if (user?.isPremium) {
      // Premium users can skip freely
      handlePremiumSkip();
      return;
    }

    const newSkipCount = matchingSkips + 1;
    
    if (newSkipCount >= 5) {
      // Show ad for non-premium users after 5 skips
      Alert.alert(
        'Advertisement',
        'You\'ve reached the skip limit. Watch a short ad to continue matching.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Watch Ad',
            onPress: handleAdAndSkip,
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
      if (result.showAd) {
        // This shouldn't happen here but handle just in case
        handleAdAndSkip();
      } else {
        // Continue matching with new partner
        continueMatching();
      }
    } else {
      Alert.alert('Error', result.error || 'Unable to skip');
    }
  };

  const handlePremiumSkip = async () => {
    const result = await skipPartner();
    
    if (result.success) {
      continueMatching();
    } else {
      Alert.alert('Error', result.error || 'Unable to skip');
    }
  };

  const handleAdAndSkip = async () => {
    try {
      navigation.navigate('Ad', {
        onAdComplete: () => {
          navigation.goBack(); // Return to matching
          continueMatching(); // Continue with fresh matching
        },
        onAdFailed: () => {
          navigation.goBack(); // Return to empty state
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to load advertisement');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Matching',
      'Are you sure you want to stop looking for a partner?',
      [
        { text: 'Keep Searching', style: 'cancel' },
        { 
          text: 'Stop', 
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const formatSearchTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Icon name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          
          <Text style={styles.title}>Finding Partner</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Matching Animation */}
        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.matchingCircle,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Icon name="search" size={60} color={COLORS.primary} />
          </Animated.View>
          
          <Text style={styles.matchingText}>
            Searching for someone to chat with{matchingDots}
          </Text>
          
          <Text style={styles.searchTime}>
            Searching for {formatSearchTime(timeSearching)}
          </Text>
        </View>

        {/* Skip Counter */}
        <View style={styles.skipContainer}>
          <Text style={styles.skipText}>
            Skips used: {matchingSkips}/5
          </Text>
          
          {!user?.isPremium && matchingSkips >= 3 && (
            <Text style={styles.skipWarning}>
              {5 - matchingSkips} skips left before ad
            </Text>
          )}
          
          {user?.isPremium && (
            <View style={styles.premiumBadge}>
              <Icon name="star" size={16} color={COLORS.warning} />
              <Text style={styles.premiumText}>Unlimited Skips</Text>
            </View>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips while you wait</Text>
          <View style={styles.tips}>
            <Text style={styles.tip}>• Be respectful and kind to others</Text>
            <Text style={styles.tip}>• Keep conversations appropriate</Text>
            <Text style={styles.tip}>• Report inappropriate behavior</Text>
            <Text style={styles.tip}>• Have fun and make new connections!</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={isMatching}
          >
            <Icon name="skip-next" size={20} color={COLORS.primary} />
            <Text style={styles.skipButtonText}>
              {user?.isPremium ? 'Skip' : `Skip (${matchingSkips}/5)`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 32,
  },
  cancelButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  animationContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  matchingCircle: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.background,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  matchingText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  searchTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  skipContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  skipWarning: {
    fontSize: 12,
    color: COLORS.warning,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: 4,
  },
  tipsContainer: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  tips: {
    paddingLeft: 8,
  },
  tip: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
  },
  actionContainer: {
    paddingBottom: 40,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  skipButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MatchingScreen;