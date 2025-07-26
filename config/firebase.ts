// // import { initializeApp, getApps } from 'firebase/app';
// // import { getAuth } from 'firebase/auth';
// // import { getFirestore } from 'firebase/firestore';
// // import { getFunctions } from 'firebase/functions';
// // import { getStorage } from 'firebase/storage';

// // const firebaseConfig = {
// //   apiKey: "AIzaSyBZ3ts77dXzyTjn4KmHgC8uKl1rw9J_MOk",
// //   authDomain: "safetalk-5e4e5.firebaseapp.com",
// //   projectId: "safetalk-5e4e5",
// //   storageBucket: "safetalk-5e4e5.firebasestorage.app",
// //   messagingSenderId: "439803992286",
// //   appId: "1:439803992286:android:5457b5dd6fe8a81e218a4f",
// //   // iOS app ID: "1:439803992286:ios:be5638f38730a701218a4f"
// // };

// // // Initialize Firebase
// // let app;
// // if (getApps().length === 0) {
// //   app = initializeApp(firebaseConfig);
// // } else {
// //   app = getApps()[0];
// // }

// // // Initialize Firebase services
// // export const auth = getAuth(app);
// // export const db = getFirestore(app);
// // export const functions = getFunctions(app);
// // export const storage = getStorage(app);

// // export default app;

// import { initializeApp, getApps } from 'firebase/app';
// import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getFunctions } from 'firebase/functions';
// import { getStorage } from 'firebase/storage';
// import AsyncStorage from '@react-native-async-storage/async-storage';



// const firebaseConfig = {
//   apiKey: "AIzaSyBZ3ts77dXzyTjn4KmHgC8uKl1rw9J_MOk",
//   authDomain: "safetalk-5e4e5.firebaseapp.com",
//   projectId: "safetalk-5e4e5",
//   storageBucket: "safetalk-5e4e5.firebasestorage.app",
//   messagingSenderId: "439803992286",
//   appId: "1:439803992286:android:5457b5dd6fe8a81e218a4f",
// };

// // Initialize Firebase
// let app;
// if (getApps().length === 0) {
//   app = initializeApp(firebaseConfig);
// } else {
//   app = getApps()[0];
// }

// // Initialize Firebase Auth with AsyncStorage persistence
// export const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage)
// });

// // Initialize other Firebase services
// export const db = getFirestore(app);
// export const functions = getFunctions(app);
// export const storage = getStorage(app);

// export default app;

import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
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

export default app;

