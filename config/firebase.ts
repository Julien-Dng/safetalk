import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
const { getReactNativePersistence } = require('firebase/auth');
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
// IMPORTANT: Utilisez cette syntaxe d'importation exacte pour AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID,
  // ✅ AJOUTEZ CETTE LIGNE CRITIQUE :
  databaseURL: Constants.expoConfig?.extra?.FIREBASE_DATABASE_URL,
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Auth with AsyncStorage persistence
// Utilisation exacte de la syntaxe recommandée par Firebase
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize other Firebase services
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
// ✅ LA REALTIME DATABASE UTILISERA MAINTENANT LA BONNE URL
export const realtimeDb = getDatabase(app);

// ✅ EXPORT POUR LA COMPATIBILITÉ AVEC LE PRESENCESERVICE
export const database = realtimeDb;

// 🧪 Log pour vérifier la configuration (temporaire pour debug)
console.log('🔥 Firebase Config Check:');
console.log('📡 Database URL:', firebaseConfig.databaseURL);
console.log('🌍 Project ID:', firebaseConfig.projectId);

export default app;