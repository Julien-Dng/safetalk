import { AdMobRewarded, AdMobInterstitial, TestIds } from 'expo-ads-admob';
import firestore from '@react-native-firebase/firestore';
import { collections } from '../config/firebase';
import { AD_CONFIG } from '../utils/helpers';

export class AdService {
  static interstitialAd = null;
  static rewardedAd = null;

  // Initialize ads
  static async initialize() {
    try {
      // Initialize interstitial ad for partner skips
      this.interstitialAd = AdMobInterstitial.setAdUnitID(
        __DEV__ ? AD_CONFIG.testAdUnitId : AD_CONFIG.adUnitId
      );

      // Initialize rewarded ad (for future features)
      this.rewardedAd = AdMobRewarded.setAdUnitID(
        __DEV__ ? TestIds.REWARDED : AD_CONFIG.adUnitId
      );

      console.log('Ads initialized successfully');
    } catch (error) {
      console.error('Error initializing ads:', error);
    }
  }

  // Show interstitial ad after partner skips
  static async showSkipAd(userId) {
    try {
      // Check skip count
      const skipCount = await this.getSkipCount(userId);
      
      if (skipCount < AD_CONFIG.skipLimit) {
        return { success: true, showAd: false, skipCount };
      }

      // Load and show ad
      await AdMobInterstitial.requestAdAsync();
      await AdMobInterstitial.showAdAsync();

      // Reset skip count after ad
      await this.resetSkipCount(userId);
      
      // Track ad view
      await this.trackAdView(userId, 'skip_interstitial');

      return { success: true, showAd: true, skipCount: 0 };
    } catch (error) {
      console.error('Error showing skip ad:', error);
      
      // If ad fails, still reset skip count to prevent user from being stuck
      await this.resetSkipCount(userId);
      
      return { success: false, error: error.message, skipCount: 0 };
    }
  }

  // Show rewarded ad (for future credit rewards)
  static async showRewardedAd(userId) {
    try {
      await AdMobRewarded.requestAdAsync();
      await AdMobRewarded.showAdAsync();

      // Track rewarded ad view
      await this.trackAdView(userId, 'rewarded');

      return { success: true, rewarded: true };
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      return { success: false, error: error.message, rewarded: false };
    }
  }

  // Get current skip count for user
  static async getSkipCount(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const adTrackingDoc = await firestore()
        .collection(collections.ADS_TRACKING)
        .doc(`${userId}_${today}`)
        .get();

      if (adTrackingDoc.exists) {
        return adTrackingDoc.data().skipCount || 0;
      }

      return 0;
    } catch (error) {
      console.error('Error getting skip count:', error);
      return 0;
    }
  }

  // Increment skip count
  static async incrementSkipCount(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const docId = `${userId}_${today}`;

      await firestore()
        .collection(collections.ADS_TRACKING)
        .doc(docId)
        .set({
          userId,
          date: today,
          skipCount: firestore.FieldValue.increment(1),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

      const updatedDoc = await firestore()
        .collection(collections.ADS_TRACKING)
        .doc(docId)
        .get();

      return updatedDoc.data()?.skipCount || 1;
    } catch (error) {
      console.error('Error incrementing skip count:', error);
      return 0;
    }
  }

  // Reset skip count after ad
  static async resetSkipCount(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const docId = `${userId}_${today}`;

      await firestore()
        .collection(collections.ADS_TRACKING)
        .doc(docId)
        .update({
          skipCount: 0,
          lastAdShown: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      return { success: true };
    } catch (error) {
      console.error('Error resetting skip count:', error);
      return { success: false };
    }
  }

  // Track ad views for analytics
  static async trackAdView(userId, adType) {
    try {
      await firestore()
        .collection('ad_analytics')
        .add({
          userId,
          adType,
          viewedAt: firestore.FieldValue.serverTimestamp(),
          platform: Platform.OS,
        });

      console.log('Ad view tracked:', adType);
    } catch (error) {
      console.error('Error tracking ad view:', error);
    }
  }

  // Check if user should see ad
  static async shouldShowAd(userId, skipCount) {
    try {
      // Check if user is premium
      const userDoc = await firestore()
        .collection(collections.USERS)
        .doc(userId)
        .get();

      if (userDoc.exists && userDoc.data().isPremium) {
        return false; // Premium users don't see ads
      }

      return skipCount >= AD_CONFIG.skipLimit;
    } catch (error) {
      console.error('Error checking if should show ad:', error);
      return false;
    }
  }

  // Get ad statistics
  static async getAdStats(userId) {
    try {
      const adViews = await firestore()
        .collection('ad_analytics')
        .where('userId', '==', userId)
        .get();

      const stats = {
        totalAdsViewed: adViews.size,
        adTypes: {},
      };

      adViews.forEach(doc => {
        const data = doc.data();
        const adType = data.adType;
        stats.adTypes[adType] = (stats.adTypes[adType] || 0) + 1;
      });

      return { success: true, stats };
    } catch (error) {
      console.error('Error getting ad stats:', error);
      return { success: false, stats: null };
    }
  }

  // Handle ad events
  static setupAdEventListeners() {
    // Interstitial ad events
    AdMobInterstitial.addEventListener('adLoaded', () => {
      console.log('Interstitial ad loaded');
    });

    AdMobInterstitial.addEventListener('adFailedToLoad', (error) => {
      console.error('Interstitial ad failed to load:', error);
    });

    AdMobInterstitial.addEventListener('adOpened', () => {
      console.log('Interstitial ad opened');
    });

    AdMobInterstitial.addEventListener('adClosed', () => {
      console.log('Interstitial ad closed');
    });

    // Rewarded ad events
    AdMobRewarded.addEventListener('rewardedVideoUserEarnedReward', (reward) => {
      console.log('User earned reward:', reward);
    });

    AdMobRewarded.addEventListener('rewardedVideoDidLoad', () => {
      console.log('Rewarded video loaded');
    });

    AdMobRewarded.addEventListener('rewardedVideoDidFailToLoad', (error) => {
      console.error('Rewarded video failed to load:', error);
    });
  }

  // Cleanup ad listeners
  static removeAdEventListeners() {
    AdMobInterstitial.removeAllListeners();
    AdMobRewarded.removeAllListeners();
  }
}