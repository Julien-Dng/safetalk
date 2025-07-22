import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import { collections } from '../config/firebase';
import { generateMessageId } from '../utils/helpers';

export class ChatService {
  // Create new chat
  static async createChat(user1Id, user2Id) {
    try {
      const chatData = {
        participants: [user1Id, user2Id],
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastMessageAt: firestore.FieldValue.serverTimestamp(),
        isActive: true,
        messageCount: 0,
        ratingSubmitted: false,
        ratingEligible: false,
      };

      const chatRef = await firestore()
        .collection(collections.CHATS)
        .add(chatData);

      return { success: true, chatId: chatRef.id, chat: { id: chatRef.id, ...chatData } };
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  // Send message
  static async sendMessage(chatId, senderId, text) {
    try {
      const messageData = {
        _id: generateMessageId(),
        text,
        user: {
          _id: senderId,
        },
        createdAt: firestore.FieldValue.serverTimestamp(),
        chatId,
      };

      // Add message to subcollection
      await firestore()
        .collection(collections.CHATS)
        .doc(chatId)
        .collection(collections.MESSAGES)
        .add(messageData);

      // Update chat metadata
      const chatRef = firestore().collection(collections.CHATS).doc(chatId);
      const chatDoc = await chatRef.get();
      const currentCount = chatDoc.data()?.messageCount || 0;

      await chatRef.update({
        lastMessageAt: firestore.FieldValue.serverTimestamp(),
        messageCount: firestore.FieldValue.increment(1),
        ratingEligible: currentCount + 1 >= 5, // Enable rating after 5 messages
      });

      // Update sender stats
      await firestore()
        .collection(collections.USERS)
        .doc(senderId)
        .update({
          'stats.totalMessagesSent': firestore.FieldValue.increment(1),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Update receiver stats
      const receiverId = (await chatRef.get()).data().participants.find(p => p !== senderId);
      if (receiverId) {
        await firestore()
          .collection(collections.USERS)
          .doc(receiverId)
          .update({
            'stats.totalMessagesReceived': firestore.FieldValue.increment(1),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
      }

      return { success: true, message: messageData };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // End chat
  static async endChat(chatId, userId) {
    try {
      await firestore()
        .collection(collections.CHATS)
        .doc(chatId)
        .update({
          isActive: false,
          endedAt: firestore.FieldValue.serverTimestamp(),
          endedBy: userId,
        });

      // Update user stats
      await firestore()
        .collection(collections.USERS)
        .doc(userId)
        .update({
          'stats.totalChats': firestore.FieldValue.increment(1),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      return { success: true };
    } catch (error) {
      console.error('Error ending chat:', error);
      throw error;
    }
  }

  // Rate partner
  static async ratePartner(chatId, raterId, partnerId, rating, comment = '') {
    try {
      const ratingData = {
        chatId,
        raterId,
        partnerId,
        rating,
        comment,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore()
        .collection(collections.RATINGS)
        .add(ratingData);

      // Update chat as rated
      await firestore()
        .collection(collections.CHATS)
        .doc(chatId)
        .update({
          ratingSubmitted: true,
        });

      // Update partner's average rating
      const partnerRatings = await firestore()
        .collection(collections.RATINGS)
        .where('partnerId', '==', partnerId)
        .get();

      let totalRating = 0;
      partnerRatings.forEach(doc => {
        totalRating += doc.data().rating;
      });

      const averageRating = totalRating / partnerRatings.size;

      await firestore()
        .collection(collections.USERS)
        .doc(partnerId)
        .update({
          'stats.averageRating': averageRating,
          'stats.totalRatings': partnerRatings.size,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      return { success: true, averageRating };
    } catch (error) {
      console.error('Error rating partner:', error);
      throw error;
    }
  }

  // Block user
  static async blockUser(userId, blockedUserId) {
    try {
      await firestore()
        .collection(collections.USERS)
        .doc(userId)
        .update({
          blockedUsers: firestore.FieldValue.arrayUnion(blockedUserId),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      return { success: true };
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }

  // Report user
  static async reportUser(reporterId, reportedUserId, reason, description = '') {
    try {
      const reportData = {
        reporterId,
        reportedUserId,
        reason,
        description,
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore()
        .collection('reports')
        .add(reportData);

      return { success: true };
    } catch (error) {
      console.error('Error reporting user:', error);
      throw error;
    }
  }

  // Get chat history
  static async getChatHistory(userId, limit = 20) {
    try {
      const chats = await firestore()
        .collection(collections.CHATS)
        .where('participants', 'array-contains', userId)
        .orderBy('lastMessageAt', 'desc')
        .limit(limit)
        .get();

      const chatHistory = [];
      for (const doc of chats.docs) {
        const chatData = doc.data();
        
        // Get last message
        const lastMessageQuery = await firestore()
          .collection(collections.CHATS)
          .doc(doc.id)
          .collection(collections.MESSAGES)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        let lastMessage = null;
        if (!lastMessageQuery.empty) {
          lastMessage = lastMessageQuery.docs[0].data();
        }

        chatHistory.push({
          id: doc.id,
          ...chatData,
          lastMessage,
        });
      }

      return { success: true, chats: chatHistory };
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  // Check if rating is eligible
  static async checkRatingEligible(chatId) {
    try {
      const chatDoc = await firestore()
        .collection(collections.CHATS)
        .doc(chatId)
        .get();

      if (!chatDoc.exists) return false;

      const chatData = chatDoc.data();
      const messageCount = chatData.messageCount || 0;
      const chatDuration = Date.now() - (chatData.createdAt?.toDate()?.getTime() || 0);
      const fiveMinutes = 5 * 60 * 1000;

      return messageCount >= 5 || chatDuration >= fiveMinutes;
    } catch (error) {
      console.error('Error checking rating eligibility:', error);
      return false;
    }
  }

  // Set typing status
  static async setTypingStatus(chatId, userId, isTyping) {
    try {
      await firestore()
        .collection(collections.CHATS)
        .doc(chatId)
        .update({
          [`typing.${userId}`]: isTyping,
        });

      return { success: true };
    } catch (error) {
      console.error('Error setting typing status:', error);
      throw error;
    }
  }

  // Get active chat for user
  static async getActiveChat(userId) {
    try {
      const activeChats = await firestore()
        .collection(collections.CHATS)
        .where('participants', 'array-contains', userId)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (activeChats.empty) {
        return { success: true, chat: null };
      }

      const chatDoc = activeChats.docs[0];
      return { success: true, chat: { id: chatDoc.id, ...chatDoc.data() } };
    } catch (error) {
      console.error('Error getting active chat:', error);
      throw error;
    }
  }
}