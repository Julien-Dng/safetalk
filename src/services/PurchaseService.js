import * as InAppPurchases from 'expo-in-app-purchases';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import { collections } from '../config/firebase';
import { CREDIT_PACKAGES, PREMIUM_PACKAGES } from '../utils/helpers';

export class PurchaseService {
  static isInitialized = false;

  // Initialize in-app purchases
  static async initialize() {
    try {
      if (this.isInitialized) return;

      await InAppPurchases.connectAsync();
      this.isInitialized = true;

      // Set up purchase listener
      InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          results.forEach((purchase) => {
            if (!purchase.acknowledged) {
              this.processPurchase(purchase);
            }
          });
        } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
          console.log('User canceled purchase');
        } else if (responseCode === InAppPurchases.IAPResponseCode.DEFERRED) {
          console.log('Purchase deferred');
        } else {
          console.warn(`Purchase failed with error: ${errorCode}`);
        }
      });

      console.log('In-App Purchases initialized');
    } catch (error) {
      console.error('Error initializing In-App Purchases:', error);
      throw error;
    }
  }

  // Get available products
  static async getProducts() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const productIds = [
        ...Object.values(CREDIT_PACKAGES).map(p => p.productId),
        ...Object.values(PREMIUM_PACKAGES).map(p => p.productId),
      ];

      const { responseCode, results } = await InAppPurchases.getProductsAsync(productIds);

      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        return { success: true, products: results };
      } else {
        return { success: false, error: 'Failed to get products' };
      }
    } catch (error) {
      console.error('Error getting products:', error);
      return { success: false, error: error.message };
    }
  }

  // Purchase credits
  static async purchaseCredits(userId, packageType) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const package = CREDIT_PACKAGES[packageType];
      if (!package) {
        throw new Error('Invalid package type');
      }

      const { responseCode, results, errorCode } = await InAppPurchases.purchaseItemAsync(
        package.productId
      );

      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        const purchase = results[0];
        return await this.processCreditPurchase(userId, purchase, packageType);
      } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
        return { success: false, error: 'Purchase canceled by user' };
      } else {
        return { success: false, error: `Purchase failed: ${errorCode}` };
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      return { success: false, error: error.message };
    }
  }

  // Purchase premium subscription
  static async purchaseSubscription(userId, subscriptionType) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const package = PREMIUM_PACKAGES[subscriptionType];
      if (!package) {
        throw new Error('Invalid subscription type');
      }

      const { responseCode, results, errorCode } = await InAppPurchases.purchaseItemAsync(
        package.productId
      );

      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        const purchase = results[0];
        return await this.processSubscriptionPurchase(userId, purchase, subscriptionType);
      } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
        return { success: false, error: 'Purchase canceled by user' };
      } else {
        return { success: false, error: `Purchase failed: ${errorCode}` };
      }
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      return { success: false, error: error.message };
    }
  }

  // Process credit purchase
  static async processCreditPurchase(userId, purchase, packageType) {
    try {
      const package = CREDIT_PACKAGES[packageType];
      
      // Verify purchase with backend
      const verifyPurchase = functions().httpsCallable('verifyPurchase');
      const verificationResult = await verifyPurchase({
        userId,
        purchase,
        packageType,
        productType: 'credits',
      });

      if (verificationResult.data.success) {
        // Update user credits
        const creditRef = firestore().collection(collections.CREDITS).doc(userId);
        await creditRef.update({
          totalCredits: firestore.FieldValue.increment(package.credits),
          purchaseHistory: firestore.FieldValue.arrayUnion({
            transactionId: purchase.transactionId,
            packageType,
            credits: package.credits,
            price: package.price,
            purchaseDate: firestore.FieldValue.serverTimestamp(),
            platform: purchase.platform,
          }),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

        // Acknowledge purchase
        await InAppPurchases.finishTransactionAsync(purchase, true);

        return { 
          success: true, 
          creditsAdded: package.credits,
          transactionId: purchase.transactionId 
        };
      } else {
        // Purchase verification failed
        await InAppPurchases.finishTransactionAsync(purchase, false);
        return { success: false, error: 'Purchase verification failed' };
      }
    } catch (error) {
      console.error('Error processing credit purchase:', error);
      return { success: false, error: error.message };
    }
  }

  // Process subscription purchase
  static async processSubscriptionPurchase(userId, purchase, subscriptionType) {
    try {
      const package = PREMIUM_PACKAGES[subscriptionType];
      
      // Verify purchase with backend
      const verifyPurchase = functions().httpsCallable('verifyPurchase');
      const verificationResult = await verifyPurchase({
        userId,
        purchase,
        subscriptionType,
        productType: 'subscription',
      });

      if (verificationResult.data.success) {
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

        // Update user to premium
        await firestore()
          .collection(collections.USERS)
          .doc(userId)
          .update({
            isPremium: true,
            subscriptionType,
            subscriptionEndDate: endDate,
            subscriptionTransactionId: purchase.transactionId,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });

        // Record subscription
        await firestore()
          .collection(collections.SUBSCRIPTIONS)
          .add({
            userId,
            subscriptionType,
            transactionId: purchase.transactionId,
            startDate: firestore.FieldValue.serverTimestamp(),
            endDate,
            price: package.price,
            status: 'active',
            platform: purchase.platform,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

        // Acknowledge purchase
        await InAppPurchases.finishTransactionAsync(purchase, true);

        return { 
          success: true, 
          subscriptionType,
          endDate,
          transactionId: purchase.transactionId 
        };
      } else {
        // Purchase verification failed
        await InAppPurchases.finishTransactionAsync(purchase, false);
        return { success: false, error: 'Purchase verification failed' };
      }
    } catch (error) {
      console.error('Error processing subscription purchase:', error);
      return { success: false, error: error.message };
    }
  }

  // Process any purchase (called by purchase listener)
  static async processPurchase(purchase) {
    try {
      console.log('Processing purchase:', purchase.productId);
      
      // Determine product type and process accordingly
      const creditPackage = Object.values(CREDIT_PACKAGES).find(p => p.productId === purchase.productId);
      const subscriptionPackage = Object.values(PREMIUM_PACKAGES).find(p => p.productId === purchase.productId);

      if (creditPackage) {
        const packageType = Object.keys(CREDIT_PACKAGES).find(key => 
          CREDIT_PACKAGES[key].productId === purchase.productId
        );
        // Note: userId should be retrieved from current auth context
        // For now, this is a placeholder - in real implementation, 
        // you'd get this from your auth context or store it when starting purchase
        console.log('Credit purchase detected:', packageType);
      } else if (subscriptionPackage) {
        const subscriptionType = Object.keys(PREMIUM_PACKAGES).find(key => 
          PREMIUM_PACKAGES[key].productId === purchase.productId
        );
        console.log('Subscription purchase detected:', subscriptionType);
      }

      // Acknowledge the purchase
      await InAppPurchases.finishTransactionAsync(purchase, true);
    } catch (error) {
      console.error('Error processing purchase:', error);
      await InAppPurchases.finishTransactionAsync(purchase, false);
    }
  }

  // Restore purchases
  static async restorePurchases(userId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();

      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        const restoredPurchases = [];
        
        for (const purchase of results) {
          // Process each restored purchase
          const subscriptionPackage = Object.values(PREMIUM_PACKAGES).find(p => 
            p.productId === purchase.productId
          );
          
          if (subscriptionPackage) {
            const subscriptionType = Object.keys(PREMIUM_PACKAGES).find(key => 
              PREMIUM_PACKAGES[key].productId === purchase.productId
            );
            
            // Restore subscription if still valid
            const result = await this.processSubscriptionPurchase(userId, purchase, subscriptionType);
            if (result.success) {
              restoredPurchases.push({
                type: 'subscription',
                subscriptionType,
                ...result,
              });
            }
          }
        }

        return { success: true, restoredPurchases };
      } else {
        return { success: false, error: 'Failed to restore purchases' };
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return { success: false, error: error.message };
    }
  }

  // Get purchase history
  static async getPurchaseHistory(userId) {
    try {
      const creditsDoc = await firestore()
        .collection(collections.CREDITS)
        .doc(userId)
        .get();

      const subscriptions = await firestore()
        .collection(collections.SUBSCRIPTIONS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      const history = {
        credits: [],
        subscriptions: [],
      };

      if (creditsDoc.exists) {
        history.credits = creditsDoc.data().purchaseHistory || [];
      }

      subscriptions.forEach(doc => {
        history.subscriptions.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return { success: true, history };
    } catch (error) {
      console.error('Error getting purchase history:', error);
      return { success: false, error: error.message };
    }
  }

  // Disconnect when app is closed
  static async disconnect() {
    try {
      if (this.isInitialized) {
        await InAppPurchases.disconnectAsync();
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Error disconnecting In-App Purchases:', error);
    }
  }
}