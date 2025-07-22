import React, { createContext, useContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { AuthService } from '../services/AuthService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Monitor authentication state
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
      setLoading(false);
    });

    return subscriber;
  }, [initializing]);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const result = await auth().signInWithCredential(googleCredential);
      await AuthService.createOrUpdateUser(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Apple
  const signInWithApple = async () => {
    try {
      setLoading(true);
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identity token returned');
      }

      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
      const result = await auth().signInWithCredential(appleCredential);
      await AuthService.createOrUpdateUser(result.user, appleAuthRequestResponse);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      const result = await auth().signInWithEmailAndPassword(email, password);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Email Sign-In Error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email, password, and username
  const signUpWithEmail = async (email, password, username) => {
    try {
      setLoading(true);
      const result = await auth().createUserWithEmailAndPassword(email, password);
      await result.user.updateProfile({ displayName: username });
      await AuthService.createOrUpdateUser(result.user, { username });
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Email Sign-Up Error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with phone number
  const signInWithPhone = async (phoneNumber) => {
    try {
      setLoading(true);
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      return { success: true, confirmation };
    } catch (error) {
      console.error('Phone Sign-In Error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Confirm phone number with verification code
  const confirmPhoneVerification = async (confirmation, code) => {
    try {
      setLoading(true);
      const result = await confirmation.confirm(code);
      await AuthService.createOrUpdateUser(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Phone Verification Error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      await auth().signOut();
      await GoogleSignin.signOut();
      return { success: true };
    } catch (error) {
      console.error('Sign-Out Error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    signInWithPhone,
    confirmPhoneVerification,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!initializing && children}
    </AuthContext.Provider>
  );
};