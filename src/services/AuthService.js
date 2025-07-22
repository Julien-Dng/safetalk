import firestore from '@react-native-firebase/firestore';
import { collections } from '../config/firebase';
import { generateReferralCode } from '../utils/helpers';

export class AuthService {
  // Create or update user in Firestore
  static async createOrUpdateUser(user, additionalData = {}) {
    try {
      const userRef = firestore().collection(collections.USERS).doc(user.uid);
      const userDoc = await userRef.get();

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || additionalData.username,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        lastLogin: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      if (!userDoc.exists) {
        // New user - set default values
        const newUserData = {
          ...userData,
          createdAt: firestore.FieldValue.serverTimestamp(),
          isPremium: false,
          subscriptionType: null,
          subscriptionEndDate: null,
          dailyTimeUsed: 0,
          dailyTimeLimit: 20 * 60 * 1000, // 20 minutes in milliseconds
          lastResetDate: new Date().toISOString().split('T')[0], // Today's date
          totalCredits: 0,
          referralCode: generateReferralCode(),
          referredBy: null,
          isBlocked: false,
          settings: {
            notifications: true,
            soundEnabled: true,
            theme: 'light',
          },
          stats: {
            totalChats: 0,
            totalMessagesReceived: 0,
            totalMessagesSent: 0,
            averageRating: 0,
            totalRatings: 0,
          },
          ...additionalData,
        };

        await userRef.set(newUserData);

        // Initialize user credits
        await firestore()
          .collection(collections.CREDITS)
          .doc(user.uid)
          .set({
            userId: user.uid,
            totalCredits: 0,
            usedCredits: 0,
            purchaseHistory: [],
            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });

        console.log('New user created:', user.uid);
      } else {
        // Existing user - update login info
        await userRef.update(userData);
        console.log('User updated:', user.uid);
      }

      return await userRef.get();
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }

  // Get user data
  static async getUserData(uid) {
    try {
      const userDoc = await firestore()
        .collection(collections.USERS)
        .doc(uid)
        .get();

      if (userDoc.exists) {
        return userDoc.data();
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  // Update user data
  static async updateUserData(uid, data) {
    try {
      await firestore()
        .collection(collections.USERS)
        .doc(uid)
        .update({
          ...data,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  // Check if email exists
  static async checkEmailExists(email) {
    try {
      const users = await firestore()
        .collection(collections.USERS)
        .where('email', '==', email)
        .get();

      return !users.empty;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }
}