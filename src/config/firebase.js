import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

let firebaseApp = null;

export const initializeFirebase = () => {
  try {
    if (!firebase.apps.length) {
      firebaseApp = firebase.app();
    } else {
      firebaseApp = firebase.app();
    }

    // Configure Google Sign-In with the correct web client ID
    GoogleSignin.configure({
      webClientId: '439803992286-t0tv25oh59dumc53bhi3i5vm871doh20.apps.googleusercontent.com',
      offlineAccess: true,
    });

    console.log('Firebase initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

export const getFirebaseApp = () => {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
};

// Firebase services
export const firebaseAuth = auth;
export const firebaseFirestore = firestore;
export const firebaseFunctions = functions;

// Firestore collections
export const collections = {
  USERS: 'users',
  CHATS: 'chats',
  MESSAGES: 'messages',
  CREDITS: 'credits',
  RATINGS: 'ratings',
  AMBASSADORS: 'ambassadors',
  REFERRALS: 'referrals',
  CREDIT_GIFTS: 'credit_gifts',
  MATCHMAKING: 'matchmaking',
  SESSIONS: 'sessions',
  SUBSCRIPTIONS: 'subscriptions',
  ADS_TRACKING: 'ads_tracking'
};

export default firebaseApp;