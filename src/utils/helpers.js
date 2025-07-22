import { Dimensions, Platform } from 'react-native';

// Screen dimensions
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Generate unique referral code
export const generateReferralCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ST'; // SafeTalk prefix
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Format time in MM:SS format
export const formatTime = (milliseconds) => {
  if (!milliseconds || milliseconds <= 0) return '00:00';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Format credits display
export const formatCredits = (credits) => {
  return credits?.toString() || '0';
};

// Convert credits to time (6 minutes per credit)
export const creditsToTime = (credits) => {
  return credits * 6 * 60 * 1000; // 6 minutes in milliseconds
};

// Convert time to credits needed
export const timeToCredits = (milliseconds) => {
  return Math.ceil(milliseconds / (6 * 60 * 1000)); // Round up to nearest credit
};

// Check if time is in danger zone (less than 3 minutes)
export const isTimeInDanger = (remainingTime) => {
  return remainingTime <= 3 * 60 * 1000; // 3 minutes in milliseconds
};

// Check if time is critical (less than 1 minute)
export const isTimeCritical = (remainingTime) => {
  return remainingTime <= 1 * 60 * 1000; // 1 minute in milliseconds
};

// Get current date string (YYYY-MM-DD)
export const getCurrentDateString = () => {
  return new Date().toISOString().split('T')[0];
};

// Check if date is today
export const isToday = (dateString) => {
  return dateString === getCurrentDateString();
};

// Get time until midnight (for daily timer reset)
export const getTimeUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  
  return midnight.getTime() - now.getTime();
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  return phone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

// Generate message ID
export const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate chat ID
export const generateChatId = () => {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Platform-specific styles
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Safe area insets for different devices
export const getSafeAreaInsets = () => {
  // This would typically use a library like react-native-safe-area-context
  // For now, providing default values
  return {
    top: isIOS ? 44 : 24,
    bottom: isIOS ? 34 : 0,
    left: 0,
    right: 0,
  };
};

// Credit package configurations
export const CREDIT_PACKAGES = {
  SMALL: {
    credits: 5,
    minutes: 30,
    price: 0.99,
    currency: 'EUR',
    productId: 'safetalk_credits_small',
  },
  MEDIUM: {
    credits: 10,
    minutes: 60,
    price: 1.99,
    currency: 'EUR',
    productId: 'safetalk_credits_medium',
  },
  LARGE: {
    credits: 25,
    minutes: 150, // 24h unlimited represented as 150 minutes
    price: 3.99,
    currency: 'EUR',
    productId: 'safetalk_credits_large',
  },
};

// Premium subscription packages
export const PREMIUM_PACKAGES = {
  MONTHLY: {
    duration: '1_month',
    price: 9.99,
    currency: 'EUR',
    productId: 'safetalk_premium_monthly',
  },
  HALF_YEARLY: {
    duration: '6_months',
    price: 49.99,
    currency: 'EUR',
    productId: 'safetalk_premium_6months',
  },
  YEARLY: {
    duration: '1_year',
    price: 89.99,
    currency: 'EUR',
    productId: 'safetalk_premium_yearly',
  },
};

// Ad configuration
export const AD_CONFIG = {
  skipLimit: 5,
  adUnitId: isIOS ? 'ca-app-pub-xxxxx/yyyy1' : 'ca-app-pub-xxxxx/yyyy2',
  testAdUnitId: isIOS ? 'ca-app-pub-3940256099942544/4411468910' : 'ca-app-pub-3940256099942544/1033173712',
};

// App theme colors
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#6D6D80',
  border: '#C6C6C8',
  placeholder: '#8E8E93',
};

// Animation durations
export const ANIMATION_DURATION = {
  fast: 200,
  medium: 300,
  slow: 500,
};