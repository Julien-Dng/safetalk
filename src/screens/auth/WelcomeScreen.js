import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../utils/helpers';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Logo and Title */}
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>SafeTalk</Text>
        </View>
        <Text style={styles.subtitle}>Connect Safely, Chat Anonymously</Text>
        <Text style={styles.description}>
          Meet new people from around the world in a safe and secure environment.
          Start with 20 minutes of free chat every day!
        </Text>
      </View>

      {/* Authentication Buttons */}
      <View style={styles.authContainer}>
        <TouchableOpacity
          style={[styles.authButton, styles.googleButton]}
          onPress={() => navigation.navigate('Login', { method: 'google' })}
        >
          <Icon name="google" size={24} color="#FFFFFF" />
          <Text style={styles.authButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.authButton, styles.appleButton]}
          onPress={() => navigation.navigate('Login', { method: 'apple' })}
        >
          <Icon name="apple" size={24} color="#FFFFFF" />
          <Text style={styles.authButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.authButton, styles.phoneButton]}
          onPress={() => navigation.navigate('PhoneLogin')}
        >
          <Icon name="phone" size={24} color="#FFFFFF" />
          <Text style={styles.authButtonText}>Continue with Phone</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.authButton, styles.emailButton]}
          onPress={() => navigation.navigate('Login', { method: 'email' })}
        >
          <Icon name="email" size={24} color="#FFFFFF" />
          <Text style={styles.authButtonText}>Continue with Email</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Link */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* Terms and Privacy */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  logoContainer: {
    backgroundColor: COLORS.primary,
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  authContainer: {
    marginBottom: 24,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  phoneButton: {
    backgroundColor: COLORS.success,
  },
  emailButton: {
    backgroundColor: COLORS.secondary,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signupText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  signupLink: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  termsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default WelcomeScreen;