import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import { collections } from '../config/firebase';
import { getCurrentDateString, CREDIT_PACKAGES, PREMIUM_PACKAGES } from '../utils/helpers';

export class UserService {
  // Check and reset daily timer if needed
  static async checkAndResetDailyTimer(uid, userData) {
    try {
      const today = getCurrentDateString();
      const lastResetDate = userData.lastResetDate;

      if (lastResetDate !== today) {
        // Reset daily timer for new day
        await firestore()
          .collection(collections.USERS)
          .doc(uid)
          .update({
            dailyTimeUsed: 0,
            lastResetDate: today,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });

        console.log('Daily timer reset for user:', uid);
      }
    } catch (error) {
      console.error('Error checking daily timer reset:', error);
    }
  }

  // Update daily time used
  static async updateDailyTimeUsed(uid, timeUsed) {
    try {
      await firestore()
        .collection(collections.USERS)
        .doc(uid)
        .update({
          dailyTimeUsed: timeUsed,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      return { success: true };
    } catch (error) {
      console.error('Error updating daily time:', error);
      throw error;
    }
  }

  // Use credits
  static async useCredits(uid, creditsToUse) {
    try {
      const creditRef = firestore().collection(collections.CREDITS).doc(uid);
      const creditDoc = await creditRef.get();

      if (!creditDoc.exists) {
        throw new Error('Credits not found');
      }

      const creditData = creditDoc.data();
      const availableCredits = creditData.totalCredits - (creditData.usedCredits || 0);

      if (availableCredits < creditsToUse) {
        return { success: false, error: 'Insufficient credits' };
      }

      await creditRef.update({
        usedCredits: (creditData.usedCredits || 0) + creditsToUse,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, remainingCredits: availableCredits - creditsToUse };
    } catch (error) {
      console.error('Error using credits:', error);
      throw error;
    }
  }

  // Purchase credits
  static async purchaseCredits(uid, packageType, transactionId) {
    try {
      const package = CREDIT_PACKAGES[packageType];
      if (!package) {
        throw new Error('Invalid package type');
      }

      // Call Cloud Function to process purchase
      const processPurchase = functions().httpsCallable('processCreditPurchase');
      const result = await processPurchase({
        userId: uid,
        packageType,
        transactionId,
        credits: package.credits,
        price: package.price,
      });

      if (result.data.success) {
        // Update local credits
        const creditRef = firestore().collection(collections.CREDITS).doc(uid);
        await creditRef.update({
          totalCredits: firestore.FieldValue.increment(package.credits),
          purchaseHistory: firestore.FieldValue.arrayUnion({
            transactionId,
            packageType,
            credits: package.credits,
            price: package.price,
            purchaseDate: firestore.FieldValue.serverTimestamp(),
          }),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, creditsAdded: package.credits };
      } else {
        return { success: false, error: result.data.error };
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      throw error;
    }
  }

  // Upgrade to premium
  static async upgradeToPremium(uid, subscriptionType, transactionId) {
    try {
      const package = PREMIUM_PACKAGES[subscriptionType];
      if (!package) {
        throw new Error('Invalid subscription type');
      }

      // Calculate subscription end date
      const endDate = new Date();
      switch (subscriptionType) {
        case 'MONTHLY':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'HALF_YEARLY':
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case 'YEARLY':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }

      // Call Cloud Function to process subscription
      const processSubscription = functions().httpsCallable('processSubscription');
      const result = await processSubscription({
        userId: uid,
        subscriptionType,
        transactionId,
        endDate: endDate.toISOString(),
        price: package.price,
      });

      if (result.data.success) {
        // Update user to premium
        await firestore()
          .collection(collections.USERS)
          .doc(uid)
          .update({
            isPremium: true,
            subscriptionType,
            subscriptionEndDate: endDate,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });

        // Record subscription
        await firestore()
          .collection(collections.SUBSCRIPTIONS)
          .add({
            userId: uid,
            subscriptionType,
            transactionId,
            startDate: firestore.FieldValue.serverTimestamp(),
            endDate,
            price: package.price,
            status: 'active',
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

        return { success: true, subscriptionType, endDate };
      } else {
        return { success: false, error: result.data.error };
      }
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      throw error;
    }
  }

  // Gift credits to another user
  static async giftCredits(fromUid, toUid, creditsToGift) {
    try {
      // Call Cloud Function to handle credit gifting
      const giftCredits = functions().httpsCallable('giftCredits');
      const result = await giftCredits({
        fromUserId: fromUid,
        toUserId: toUid,
        credits: creditsToGift,
      });

      return result.data;
    } catch (error) {
      console.error('Error gifting credits:', error);
      throw error;
    }
  }

  // Get user referral stats
  static async getReferralStats(uid) {
    try {
      const referrals = await firestore()
        .collection(collections.REFERRALS)
        .where('referrerId', '==', uid)
        .get();

      const stats = {
        totalReferrals: referrals.size,
        totalCreditsEarned: 0,
        referrals: [],
      };

      referrals.forEach(doc => {
        const data = doc.data();
        stats.totalCreditsEarned += data.creditsAwarded || 0;
        stats.referrals.push(data);
      });

      return stats;
    } catch (error) {
      console.error('Error getting referral stats:', error);
      throw error;
    }
  }

  // Apply referral code
  static async applyReferralCode(uid, referralCode) {
    try {
      // Call Cloud Function to process referral
      const processReferral = functions().httpsCallable('processReferral');
      const result = await processReferral({
        userId: uid,
        referralCode,
      });

      return result.data;
    } catch (error) {
      console.error('Error applying referral code:', error);
      throw error;
    }
  }

  // Update user settings
  static async updateSettings(uid, settings) {
    try {
      await firestore()
        .collection(collections.USERS)
        .doc(uid)
        .update({
          settings: {
            ...settings,
          },
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      return { success: true };
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  // Get user statistics
  static async getUserStats(uid) {
    try {
      const userDoc = await firestore()
        .collection(collections.USERS)
        .doc(uid)
        .get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      return userData.stats || {
        totalChats: 0,
        totalMessagesReceived: 0,
        totalMessagesSent: 0,
        averageRating: 0,
        totalRatings: 0,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Update user stats
  static async updateUserStats(uid, statUpdates) {
    try {
      const updateData = {};
      
      Object.keys(statUpdates).forEach(key => {
        updateData[`stats.${key}`] = firestore.FieldValue.increment(statUpdates[key]);
      });

      await firestore()
        .collection(collections.USERS)
        .doc(uid)
        .update({
          ...updateData,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      return { success: true };
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }
}