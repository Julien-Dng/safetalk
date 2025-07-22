import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBZ3ts77dXzyTjn4KmHgC8uKl1rw9J_MOk",
  authDomain: "safetalk-5e4e5.firebaseapp.com",
  projectId: "safetalk-5e4e5",
  storageBucket: "safetalk-5e4e5.firebasestorage.app",
  messagingSenderId: "439803992286",
  appId: "1:439803992286:android:5457b5dd6fe8a81e218a4f",
  // iOS app ID: "1:439803992286:ios:be5638f38730a701218a4f"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

export default app;