import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, isValidPhoneNumber, formatPhoneNumber } from '../../utils/helpers';

const PhoneLoginScreen = ({ navigation }) => {
  const { signInWithPhone, loading } = useAuth();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [error, setError] = useState('');

  const handlePhoneChange = (text) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    setPhoneNumber(cleaned);
    
    // Format for display
    if (cleaned.length <= 10) {
      setFormattedPhone(formatPhoneNumber(cleaned));
    }
    
    // Clear error
    if (error) setError('');
  };

  const handleSendVerification = async () => {
    // Validate phone number
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    
    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }
    
    if (!isValidPhoneNumber(fullPhoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    const result = await signInWithPhone(fullPhoneNumber);
    
    if (result.success) {
      // Navigate to verification screen with confirmation object
      navigation.navigate('PhoneVerification', {
        confirmation: result.confirmation,
        phoneNumber: fullPhoneNumber,
        formattedPhone: formattedPhone,
      });
    } else {
      Alert.alert('Verification Failed', result.error);
    }
  };

  const countryOptions = [
    { code: '+1', country: 'US', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+49', country: 'DE', flag: '🇩🇪' },
    { code: '+33', country: 'FR', flag: '🇫🇷' },
    { code: '+34', country: 'ES', flag: '🇪🇸' },
    { code: '+39', country: 'IT', flag: '🇮🇹' },
    { code: '+91', country: 'IN', flag: '🇮🇳' },
    { code: '+86', country: 'CN', flag: '🇨🇳' },
    { code: '+81', country: 'JP', flag: '🇯🇵' },
    { code: '+82', country: 'KR', flag: '🇰🇷' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Phone Verification</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to receive a verification code
          </Text>
        </View>

        {/* Phone Input */}
        <View style={styles.form}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          
          <View style={styles.phoneContainer}>
            {/* Country Code Picker */}
            <TouchableOpacity
              style={styles.countryPicker}
              onPress={() => {
                // For simplicity, cycling through first few options
                // In a production app, you'd show a proper picker
                const currentIndex = countryOptions.findIndex(opt => opt.code === countryCode);
                const nextIndex = (currentIndex + 1) % countryOptions.length;
                setCountryCode(countryOptions[nextIndex].code);
              }}
            >
              <Text style={styles.countryFlag}>
                {countryOptions.find(opt => opt.code === countryCode)?.flag || '🌍'}
              </Text>
              <Text style={styles.countryCode}>{countryCode}</Text>
              <Icon name="arrow-drop-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* Phone Number Input */}
            <TextInput
              style={[styles.phoneInput, error && styles.inputError]}
              value={formattedPhone}
              onChangeText={handlePhoneChange}
              placeholder="(555) 123-4567"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="phone-pad"
              maxLength={14} // Formatted length
            />
          </View>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Text style={styles.infoText}>
            We'll send you a verification code via SMS. Message and data rates may apply.
          </Text>

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!phoneNumber || loading) && styles.continueButtonDisabled
            ]}
            onPress={handleSendVerification}
            disabled={!phoneNumber || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Send Code</Text>
                <Icon name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Alternative Options */}
        <View style={styles.alternatives}>
          <Text style={styles.alternativeText}>Or continue with</Text>
          
          <View style={styles.alternativeButtons}>
            <TouchableOpacity
              style={styles.alternativeButton}
              onPress={() => navigation.navigate('Login', { method: 'email' })}
            >
              <Icon name="email" size={20} color={COLORS.primary} />
              <Text style={styles.alternativeButtonText}>Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.alternativeButton}
              onPress={() => navigation.navigate('Login', { method: 'google' })}
            >
              <Icon name="google" size={20} color="#4285F4" />
              <Text style={styles.alternativeButtonText}>Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  form: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 12,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 100,
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 32,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  alternatives: {
    alignItems: 'center',
  },
  alternativeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  alternativeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  alternativeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 8,
  },
});

export default PhoneLoginScreen;