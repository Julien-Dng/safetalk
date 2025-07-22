import { doc, updateDoc, increment, runTransaction, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile } from './authService';

export interface CreditPurchaseOption {
  id: string;
  name: string;
  minutes: number;
  credits: number;
  price: string;
  priceValue: number; // in euros
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'gift_sent' | 'gift_received' | 'referral_bonus' | 'ad_reward' | 'used';
  amount: number;
  description: string;
  timestamp: string;
  relatedUserId?: string; // for gifts and referrals
  sessionId?: string; // for usage tracking
}

export class CreditService {
  // Available purchase options
  static readonly PURCHASE_OPTIONS: CreditPurchaseOption[] = [
    {
      id: '30min',
      name: '30 minutes',
      minutes: 30,
      credits: 5,
      price: '€0.99',
      priceValue: 0.99
    },
    {
      id: '1hour',
      name: '1 hour',
      minutes: 60,
      credits: 10,
      price: '€1.99',
      priceValue: 1.99
    },
    {
      id: '24hour',
      name: '24 hours unlimited',
      minutes: 1440, // 24 hours
      credits: 240, // 24 hours worth of credits
      price: '€3.99',
      priceValue: 3.99
    }
  ];

  // Purchase credits (mock payment)
  static async purchaseCredits(
    userId: string,
    optionId: string,
    paymentMethod: 'mock' | 'google_play' | 'app_store' = 'mock'
  ): Promise<{ success: boolean; credits: number; transaction: CreditTransaction }> {
    const option = this.PURCHASE_OPTIONS.find(opt => opt.id === optionId);
    if (!option) {
      throw new Error('Invalid purchase option');
    }

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create transaction record
      const transaction: Omit<CreditTransaction, 'id'> = {
        userId,
        type: 'purchase',
        amount: option.credits,
        description: `Purchased ${option.name} for ${option.price}`,
        timestamp: new Date().toISOString()
      };

      const transactionRef = await addDoc(collection(db, 'credit_transactions'), transaction);
      const fullTransaction: CreditTransaction = {
        ...transaction,
        id: transactionRef.id
      };

      // Update user credits
      await this.addCredits(userId, option.credits);

      return {
        success: true,
        credits: option.credits,
        transaction: fullTransaction
      };
    } catch (error: any) {
      console.error('Credit purchase error:', error);
      throw new Error('Purchase failed: ' + error.message);
    }
  }

  // Add credits to user account
  static async addCredits(userId: string, amount: number, description?: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        credits: increment(amount),
        lastActiveAt: new Date().toISOString()
      });

      // Record transaction if description provided
      if (description) {
        await addDoc(collection(db, 'credit_transactions'), {
          userId,
          type: 'gift_received',
          amount,
          description,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      console.error('Error adding credits:', error);
      throw new Error('Failed to add credits');
    }
  }

  // Deduct credits from user account
  static async deductCredits(userId: string, amount: number, description?: string): Promise<boolean> {
    try {
      const userDocRef = doc(db, 'users', userId);
      
      // Use transaction to ensure atomic operation
      const success = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          throw new Error('User not found');
        }

        const currentCredits = userDoc.data().credits || 0;
        if (currentCredits < amount) {
          return false; // Insufficient credits
        }

        // Deduct credits
        transaction.update(userDocRef, {
          credits: currentCredits - amount,
          lastActiveAt: new Date().toISOString()
        });

        return true;
      });

      // Record transaction if successful and description provided
      if (success && description) {
        await addDoc(collection(db, 'credit_transactions'), {
          userId,
          type: 'used',
          amount: -amount,
          description,
          timestamp: new Date().toISOString()
        });
      }

      return success;
    } catch (error: any) {
      console.error('Error deducting credits:', error);
      throw new Error('Failed to deduct credits');
    }
  }

  // Gift credits to another user
  static async giftCredits(
    fromUserId: string,
    toUserId: string,
    amount: number,
    message?: string
  ): Promise<{ success: boolean; transaction: CreditTransaction }> {
    try {
      // Use transaction to ensure atomic operation
      const result = await runTransaction(db, async (transaction) => {
        const fromUserRef = doc(db, 'users', fromUserId);
        const toUserRef = doc(db, 'users', toUserId);

        const fromUserDoc = await transaction.get(fromUserRef);
        const toUserDoc = await transaction.get(toUserRef);

        if (!fromUserDoc.exists() || !toUserDoc.exists()) {
          throw new Error('User not found');
        }

        const fromUserData = fromUserDoc.data() as UserProfile;
        const toUserData = toUserDoc.data() as UserProfile;

        // Check if sender is premium
        if (!fromUserData.isPremium) {
          throw new Error('Only premium users can gift credits');
        }

        // Check if sender has enough giftable credits
        if ((fromUserData.giftableCredits || 0) < amount) {
          throw new Error('Insufficient giftable credits');
        }

        // Update both users
        transaction.update(fromUserRef, {
          giftableCredits: (fromUserData.giftableCredits || 0) - amount,
          lastActiveAt: new Date().toISOString()
        });

        transaction.update(toUserRef, {
          credits: (toUserData.credits || 0) + amount,
          lastActiveAt: new Date().toISOString()
        });

        return { fromUserData, toUserData };
      });

      // Create gift record
      const giftRecord = await addDoc(collection(db, 'credit_gifts'), {
        from: fromUserId,
        to: toUserId,
        amount,
        message: message || '',
        timestamp: new Date().toISOString(),
        status: 'completed'
      });

      // Create transaction records
      const senderTransaction: Omit<CreditTransaction, 'id'> = {
        userId: fromUserId,
        type: 'gift_sent',
        amount: -amount,
        description: `Gifted ${amount} credits to ${result.toUserData.username}`,
        timestamp: new Date().toISOString(),
        relatedUserId: toUserId
      };

      const receiverTransaction: Omit<CreditTransaction, 'id'> = {
        userId: toUserId,
        type: 'gift_received',
        amount,
        description: `Received ${amount} credits from ${result.fromUserData.username}`,
        timestamp: new Date().toISOString(),
        relatedUserId: fromUserId
      };

      const [senderTxRef, receiverTxRef] = await Promise.all([
        addDoc(collection(db, 'credit_transactions'), senderTransaction),
        addDoc(collection(db, 'credit_transactions'), receiverTransaction)
      ]);

      return {
        success: true,
        transaction: {
          ...senderTransaction,
          id: senderTxRef.id
        }
      };
    } catch (error: any) {
      console.error('Gift credits error:', error);
      throw new Error('Failed to gift credits: ' + error.message);
    }
  }

  // Award ad watching bonus
  static async awardAdBonus(userId: string): Promise<void> {
    try {
      await this.addCredits(userId, 1, 'Ad watching bonus');
    } catch (error: any) {
      console.error('Ad bonus error:', error);
      throw new Error('Failed to award ad bonus');
    }
  }

  // Award referral bonus
  static async awardReferralBonus(referrerUserId: string, newUserId: string): Promise<void> {
    try {
      const bonusAmount = 10; // 10 credits for successful referral

      await Promise.all([
        this.addCredits(referrerUserId, bonusAmount, 'Referral bonus'),
        this.addCredits(newUserId, 5, 'Welcome bonus for being referred')
      ]);

      // Record referral transaction
      await addDoc(collection(db, 'referrals'), {
        referrerId: referrerUserId,
        referredId: newUserId,
        bonusAwarded: bonusAmount,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });
    } catch (error: any) {
      console.error('Referral bonus error:', error);
      throw new Error('Failed to award referral bonus');
    }
  }

  // Convert credits to paid time (1 credit = 6 minutes)
  static creditsToMinutes(credits: number): number {
    return credits * 6;
  }

  // Convert minutes to credits
  static minutesToCredits(minutes: number): number {
    return Math.ceil(minutes / 6);
  }

  // Get credit value in time format
  static getCreditsTimeDisplay(credits: number): string {
    const totalMinutes = this.creditsToMinutes(credits);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Calculate credits needed for time purchase
  static calculateCreditsNeeded(option: CreditPurchaseOption): number {
    return option.credits;
  }

  // Mock payment validation (in real app, this would validate with payment providers)
  static async validatePayment(
    transactionId: string,
    paymentMethod: 'google_play' | 'app_store'
  ): Promise<boolean> {
    // Mock validation - always return true
    // In real implementation, verify with Google Play or App Store
    return true;
  }

  // Get purchase history for user
  static async getPurchaseHistory(userId: string): Promise<CreditTransaction[]> {
    try {
      // In a real app, you would query the credit_transactions collection
      // For now, return empty array as this is a read operation
      return [];
    } catch (error: any) {
      console.error('Error fetching purchase history:', error);
      return [];
    }
  }
}