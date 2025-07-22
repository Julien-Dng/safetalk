const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// Process credit purchase
exports.processCreditPurchase = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, packageType, transactionId, credits, price } = data;

  try {
    // Verify purchase with payment provider (Apple/Google)
    // This would include receipt verification in a production app
    
    // Record the purchase
    await db.collection('credit_purchases').add({
      userId,
      packageType,
      transactionId,
      credits,
      price,
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error processing credit purchase:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process purchase');
  }
});

// Process subscription
exports.processSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, subscriptionType, transactionId, endDate, price } = data;

  try {
    // Verify subscription with payment provider
    // This would include receipt verification in a production app
    
    // Record the subscription
    await db.collection('subscription_purchases').add({
      userId,
      subscriptionType,
      transactionId,
      endDate,
      price,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error processing subscription:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process subscription');
  }
});

// Gift credits to another user
exports.giftCredits = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { fromUserId, toUserId, credits } = data;

  try {
    // Check if sender is premium
    const fromUser = await db.collection('users').doc(fromUserId).get();
    if (!fromUser.exists || !fromUser.data().isPremium) {
      throw new functions.https.HttpsError('permission-denied', 'Only premium users can gift credits');
    }

    // Check if sender has enough credits
    const fromCredits = await db.collection('credits').doc(fromUserId).get();
    const availableCredits = (fromCredits.data()?.totalCredits || 0) - (fromCredits.data()?.usedCredits || 0);
    
    if (availableCredits < credits) {
      throw new functions.https.HttpsError('failed-precondition', 'Insufficient credits');
    }

    // Use batch to ensure atomicity
    const batch = db.batch();

    // Deduct credits from sender
    const fromCreditsRef = db.collection('credits').doc(fromUserId);
    batch.update(fromCreditsRef, {
      usedCredits: admin.firestore.FieldValue.increment(credits),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Add credits to receiver
    const toCreditsRef = db.collection('credits').doc(toUserId);
    batch.set(toCreditsRef, {
      totalCredits: admin.firestore.FieldValue.increment(credits),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Record the gift
    const giftRef = db.collection('credit_gifts').doc();
    batch.set(giftRef, {
      from: fromUserId,
      to: toUserId,
      credits,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Error gifting credits:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to gift credits');
  }
});

// Process referral
exports.processReferral = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, referralCode } = data;

  try {
    // Find referrer by code
    const referrerQuery = await db.collection('users')
      .where('referralCode', '==', referralCode)
      .limit(1)
      .get();

    if (referrerQuery.empty) {
      return { success: false, error: 'Invalid referral code' };
    }

    const referrerDoc = referrerQuery.docs[0];
    const referrerId = referrerDoc.id;

    // Check if user already used a referral
    const existingReferral = await db.collection('referrals')
      .where('referredUserId', '==', userId)
      .limit(1)
      .get();

    if (!existingReferral.empty) {
      return { success: false, error: 'You have already used a referral code' };
    }

    // Check if user is trying to refer themselves
    if (referrerId === userId) {
      return { success: false, error: 'You cannot use your own referral code' };
    }

    const creditsAwarded = 10; // Both users get 10 credits

    // Use batch for atomicity
    const batch = db.batch();

    // Add credits to both users
    const referrerCreditsRef = db.collection('credits').doc(referrerId);
    batch.set(referrerCreditsRef, {
      totalCredits: admin.firestore.FieldValue.increment(creditsAwarded),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    const referredCreditsRef = db.collection('credits').doc(userId);
    batch.set(referredCreditsRef, {
      totalCredits: admin.firestore.FieldValue.increment(creditsAwarded),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Record the referral
    const referralRef = db.collection('referrals').doc();
    batch.set(referralRef, {
      referrerId,
      referredUserId: userId,
      referralCode,
      creditsAwarded,
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return { success: true, creditsEarned: creditsAwarded };
  } catch (error) {
    console.error('Error processing referral:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process referral');
  }
});

// Verify purchase (for security)
exports.verifyPurchase = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, purchase, productType } = data;

  try {
    // In a production app, this would verify the purchase receipt
    // with Apple App Store or Google Play Store
    
    // For now, we'll assume verification is successful
    // Real implementation would use:
    // - Apple's verifyReceipt API for iOS purchases
    // - Google Play Developer API for Android purchases
    
    console.log('Verifying purchase:', {
      userId,
      productId: purchase.productId,
      transactionId: purchase.transactionId,
      productType,
    });

    return { success: true };
  } catch (error) {
    console.error('Error verifying purchase:', error);
    return { success: false, error: 'Purchase verification failed' };
  }
});

// Daily timer reset (scheduled function)
exports.resetDailyTimers = functions.pubsub.schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Running daily timer reset...');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Get all users who need timer reset
    const usersToReset = await db.collection('users')
      .where('lastResetDate', '<', today)
      .get();

    const batch = db.batch();
    let updateCount = 0;

    usersToReset.forEach((userDoc) => {
      batch.update(userDoc.ref, {
        dailyTimeUsed: 0,
        lastResetDate: today,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      updateCount++;
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`Reset daily timers for ${updateCount} users`);
    } else {
      console.log('No users needed timer reset');
    }

    return null;
  });

// Clean up expired chats
exports.cleanupExpiredChats = functions.pubsub.schedule('0 2 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Cleaning up expired chats...');
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get inactive chats older than 1 week
    const expiredChats = await db.collection('chats')
      .where('isActive', '==', false)
      .where('endedAt', '<', oneWeekAgo)
      .limit(100)
      .get();

    const batch = db.batch();
    let deleteCount = 0;

    for (const chatDoc of expiredChats.docs) {
      // Delete messages subcollection
      const messages = await chatDoc.ref.collection('messages').get();
      messages.docs.forEach((msgDoc) => {
        batch.delete(msgDoc.ref);
      });
      
      // Delete chat document
      batch.delete(chatDoc.ref);
      deleteCount++;
    }

    if (deleteCount > 0) {
      await batch.commit();
      console.log(`Cleaned up ${deleteCount} expired chats`);
    } else {
      console.log('No expired chats to clean up');
    }

    return null;
  });

// Update user stats when chat ends
exports.updateUserStatsOnChatEnd = functions.firestore
  .document('chats/{chatId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();

    // Check if chat just ended
    if (before.isActive && !after.isActive) {
      const participants = after.participants;
      const batch = db.batch();

      // Update stats for both participants
      participants.forEach((userId) => {
        const userRef = db.collection('users').doc(userId);
        batch.update(userRef, {
          'stats.totalChats': admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
    }

    return null;
  });

// Send notification when user receives credit gift
exports.notifyOnCreditGift = functions.firestore
  .document('credit_gifts/{giftId}')
  .onCreate(async (snap, context) => {
    const gift = snap.data();
    const { to: recipientId, from: senderId, credits } = gift;

    try {
      // Get recipient's FCM token (if notifications are enabled)
      const recipientDoc = await db.collection('users').doc(recipientId).get();
      const recipientData = recipientDoc.data();

      if (recipientData?.fcmToken && recipientData?.settings?.notifications) {
        // Send push notification
        const message = {
          token: recipientData.fcmToken,
          notification: {
            title: '🎁 You received credits!',
            body: `Someone gifted you ${credits} credits for more chat time!`,
          },
          data: {
            type: 'credit_gift',
            credits: credits.toString(),
          },
        };

        await admin.messaging().send(message);
        console.log('Credit gift notification sent to:', recipientId);
      }
    } catch (error) {
      console.error('Error sending credit gift notification:', error);
    }

    return null;
  });