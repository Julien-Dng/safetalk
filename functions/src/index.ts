import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const onMatchRequestWrite = functions.firestore
  .document('matchmaking/{matchId}')
  .onWrite(async (change, context) => {
    const after = change.after.exists ? change.after.data() as any : null;
    if (!after || after.status !== 'waiting') {
      return null;
    }

    const userId = after.userId;
    const querySnapshot = await db
      .collection('matchmaking')
      .where('status', '==', 'waiting')
      .where('userId', '!=', userId)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    const partnerDoc = querySnapshot.docs[0];

    await db.runTransaction(async (transaction) => {
      const currentSnap = await transaction.get(change.after.ref);
      const partnerSnap = await transaction.get(partnerDoc.ref);

      if (!currentSnap.exists || !partnerSnap.exists) {
        return;
      }
      const currentData = currentSnap.data() as any;
      const partnerData = partnerSnap.data() as any;
      if (currentData.status !== 'waiting' || partnerData.status !== 'waiting') {
        return;
      }
      transaction.update(change.after.ref, {
        status: 'matched',
        matchedWith: partnerData.userId,
        matchedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      transaction.update(partnerDoc.ref, {
        status: 'matched',
        matchedWith: userId,
        matchedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    return null;
  });