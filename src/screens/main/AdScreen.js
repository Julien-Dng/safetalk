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
import { AdService } from '../../services/AdService';
import { useUser } from '../../context/UserContext';
import { useChat } from '../../context/ChatContext';
import { COLORS } from '../../utils/helpers';

const AdScreen = ({ navigation, route }) => {
  const { onAdComplete, onAdFailed } = route.params || {};
  const { user } = useUser();
  const { resetSkips } = useChat();
  const [adState, setAdState] = useState('loading'); // loading, ready, playing, completed, failed
  const [countdown, setCountdown] = useState(5);
  const [adProgress, setAdProgress] = useState(0);

  useEffect(() => {
    loadAd();
  }, []);

  useEffect(() => {
    if (adState === 'ready' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setAdState('playing');
            playAd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [adState, countdown]);

  const loadAd = async () => {
    try {
      setAdState('loading');
      
      // Initialize ad service if not already done
      await AdService.initialize();
      
      // Simulate ad loading time
      setTimeout(() => {
        setAdState('ready');
      }, 2000);
      
    } catch (error) {
      console.error('Error loading ad:', error);
      setAdState('failed');
    }
  };

  const playAd = async () => {
    try {
      setAdState('playing');
      
      // Simulate ad progress
      const progressTimer = setInterval(() => {
        setAdProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            handleAdCompleted();
            return 100;
          }
          return prev + 2; // 50 steps = ~25 seconds
        });
      }, 500);

      // Show actual ad (this would be replaced with real ad implementation)
      const result = await AdService.showSkipAd(user?.uid);
      
      if (result.success) {
        // Ad completed successfully
        clearInterval(progressTimer);
        setAdProgress(100);
        handleAdCompleted();
      } else {
        clearInterval(progressTimer);
        handleAdFailed();
      }
      
    } catch (error) {
      console.error('Error playing ad:', error);
      handleAdFailed();
    }
  };

  const handleAdCompleted = () => {
    setAdState('completed');
    
    // Reset skip counter
    resetSkips();
    
    // Show success message briefly before returning
    setTimeout(() => {
      onAdComplete?.();
      navigation.goBack();
    }, 2000);
  };

  const handleAdFailed = () => {
    setAdState('failed');
    Alert.alert(
      'Ad Failed',
      'Unable to load the advertisement. Please try again.',
      [
        {
          text: 'Try Again',
          onPress: loadAd,
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            onAdFailed?.();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleSkipAd = () => {
    if (adProgress < 80) {
      Alert.alert('Please Wait', 'You can skip this ad in a few more seconds.');
      return;
    }

    Alert.alert(
      'Skip Ad?',
      'Are you sure you want to skip this ad? You\'ll still get the benefits.',
      [
        { text: 'Keep Watching', style: 'cancel' },
        { 
          text: 'Skip', 
          onPress: handleAdCompleted,
        },
      ]
    );
  };

  const renderLoadingState = () => (
    <View style={styles.centerContent}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading advertisement...</Text>
      <Text style={styles.loadingSubtext}>
        This helps keep SafeTalk free for everyone
      </Text>
    </View>
  );

  const renderReadyState = () => (
    <View style={styles.centerContent}>
      <View style={styles.readyIcon}>
        <Icon name="play-circle-filled" size={80} color={COLORS.primary} />
      </View>
      <Text style={styles.readyText}>Ad will start in</Text>
      <Text style={styles.countdownText}>{countdown}</Text>
      <Text style={styles.readySubtext}>
        Watch this short ad to continue matching
      </Text>
    </View>
  );

  const renderPlayingState = () => (
    <View style={styles.adContainer}>
      {/* Ad placeholder - in real implementation, this would be the actual ad */}
      <View style={styles.adPlaceholder}>
        <Icon name="play-circle-filled" size={100} color="#FFFFFF" />
        <Text style={styles.adText}>Advertisement Playing</Text>
        <Text style={styles.adSubtext}>Thank you for watching</Text>
      </View>
      
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${adProgress}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{Math.round(adProgress)}%</Text>
      </View>
      
      {/* Skip button (appears after 80% progress) */}
      {adProgress >= 80 && (
        <TouchableOpacity
          style={styles.skipAdButton}
          onPress={handleSkipAd}
        >
          <Text style={styles.skipAdText}>Skip Ad</Text>
          <Icon name="skip-next" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCompletedState = () => (
    <View style={styles.centerContent}>
      <View style={styles.successIcon}>
        <Icon name="check-circle" size={80} color={COLORS.success} />
      </View>
      <Text style={styles.successText}>Thank you!</Text>
      <Text style={styles.successSubtext}>
        Your skip counter has been reset. Continue matching!
      </Text>
    </View>
  );

  const renderFailedState = () => (
    <View style={styles.centerContent}>
      <View style={styles.errorIcon}>
        <Icon name="error" size={80} color={COLORS.danger} />
      </View>
      <Text style={styles.errorText}>Ad Failed to Load</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadAd}>
        <Icon name="refresh" size={20} color="#FFFFFF" />
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            onAdFailed?.();
            navigation.goBack();
          }}
          disabled={adState === 'playing'}
        >
          <Icon name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Advertisement</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {adState === 'loading' && renderLoadingState()}
        {adState === 'ready' && renderReadyState()}
        {adState === 'playing' && renderPlayingState()}
        {adState === 'completed' && renderCompletedState()}
        {adState === 'failed' && renderFailedState()}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Ads help us keep SafeTalk free for everyone
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
  },
  readyIcon: {
    marginBottom: 24,
  },
  readyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  readySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  adContainer: {
    alignItems: 'center',
  },
  adPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  adText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  adSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  skipAdButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  skipAdText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  successIcon: {
    marginBottom: 24,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 16,
  },
  successSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.danger,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});

export default AdScreen;