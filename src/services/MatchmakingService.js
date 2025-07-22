import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import { collections } from '../config/firebase';
import { ChatService } from './ChatService';

export class MatchmakingService {
  // Find a partner for the user
  static async findPartner(userId) {
    try {
      // First check if user already has an active chat
      const activeChat = await ChatService.getActiveChat(userId);
      if (activeChat.success && activeChat.chat) {
        return { success: true, chat: activeChat.chat, type: 'existing' };
      }

      // Get user data to check blocked users
      const userDoc = await firestore()
        .collection(collections.USERS)
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const blockedUsers = userData.blockedUsers || [];
      const recentPartners = await this.getRecentPartners(userId);
      const excludeUsers = [...blockedUsers, ...recentPartners, userId];

      // Add user to matchmaking queue
      await firestore()
        .collection(collections.MATCHMAKING)
        .doc(userId)
        .set({
          userId,
          status: 'waiting',
          joinedAt: firestore.FieldValue.serverTimestamp(),
          excludeUsers,
        });

      // Try to find a match
      const matchResult = await this.findMatch(userId, excludeUsers);
      
      if (matchResult.success && matchResult.partnerId) {
        // Create chat with matched partner
        const chatResult = await ChatService.createChat(userId, matchResult.partnerId);
        
        if (chatResult.success) {
          // Remove both users from matchmaking queue
          await this.removeFromQueue(userId);
          await this.removeFromQueue(matchResult.partnerId);

          // Record the match
          await this.recordMatch(userId, matchResult.partnerId);

          return { success: true, chat: chatResult.chat, type: 'new', partnerId: matchResult.partnerId };
        }
      }

      // If no immediate match, wait in queue
      return { success: true, waiting: true };
    } catch (error) {
      console.error('Error finding partner:', error);
      await this.removeFromQueue(userId); // Clean up on error
      throw error;
    }
  }

  // Find match from waiting queue
  static async findMatch(userId, excludeUsers = []) {
    try {
      const waitingUsers = await firestore()
        .collection(collections.MATCHMAKING)
        .where('status', '==', 'waiting')
        .where('userId', 'not-in', excludeUsers.length > 0 ? excludeUsers.slice(0, 10) : [userId])
        .orderBy('joinedAt', 'asc')
        .limit(10)
        .get();

      for (const doc of waitingUsers.docs) {
        const waitingUser = doc.data();
        
        // Skip if this is the same user or excluded
        if (waitingUser.userId === userId || excludeUsers.includes(waitingUser.userId)) {
          continue;
        }

        // Check if the waiting user also excludes current user
        const waitingUserExcludes = waitingUser.excludeUsers || [];
        if (waitingUserExcludes.includes(userId)) {
          continue;
        }

        // Found a match!
        return { success: true, partnerId: waitingUser.userId };
      }

      return { success: true, partnerId: null };
    } catch (error) {
      console.error('Error finding match:', error);
      throw error;
    }
  }

  // Get recent partners to avoid repeat matches
  static async getRecentPartners(userId, daysBack = 1) {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - daysBack);

      const recentChats = await firestore()
        .collection(collections.CHATS)
        .where('participants', 'array-contains', userId)
        .where('createdAt', '>', oneDayAgo)
        .get();

      const recentPartners = [];
      recentChats.forEach(doc => {
        const chatData = doc.data();
        const partnerId = chatData.participants.find(p => p !== userId);
        if (partnerId && !recentPartners.includes(partnerId)) {
          recentPartners.push(partnerId);
        }
      });

      return recentPartners;
    } catch (error) {
      console.error('Error getting recent partners:', error);
      return [];
    }
  }

  // Remove user from matchmaking queue
  static async removeFromQueue(userId) {
    try {
      await firestore()
        .collection(collections.MATCHMAKING)
        .doc(userId)
        .delete();
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  }

  // Record match for analytics
  static async recordMatch(user1Id, user2Id) {
    try {
      await firestore()
        .collection('matches')
        .add({
          participants: [user1Id, user2Id],
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error recording match:', error);
    }
  }

  // Cancel matchmaking
  static async cancelMatching(userId) {
    try {
      await this.removeFromQueue(userId);
      return { success: true };
    } catch (error) {
      console.error('Error canceling matching:', error);
      throw error;
    }
  }

  // Get matchmaking status
  static async getMatchmakingStatus(userId) {
    try {
      const matchmakingDoc = await firestore()
        .collection(collections.MATCHMAKING)
        .doc(userId)
        .get();

      if (matchmakingDoc.exists) {
        return { success: true, status: 'waiting', data: matchmakingDoc.data() };
      } else {
        return { success: true, status: 'idle', data: null };
      }
    } catch (error) {
      console.error('Error getting matchmaking status:', error);
      throw error;
    }
  }

  // Advanced matching with preferences (for future enhancement)
  static async findPartnerWithPreferences(userId, preferences = {}) {
    try {
      // This could include language preferences, age ranges, etc.
      // For now, we'll use the basic matching algorithm
      return await this.findPartner(userId);
    } catch (error) {
      console.error('Error finding partner with preferences:', error);
      throw error;
    }
  }

  // Get matching statistics
  static async getMatchingStats(userId) {
    try {
      const userMatches = await firestore()
        .collection('matches')
        .where('participants', 'array-contains', userId)
        .get();

      const stats = {
        totalMatches: userMatches.size,
        todayMatches: 0,
        averageWaitTime: 0,
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      userMatches.forEach(doc => {
        const matchData = doc.data();
        const matchDate = matchData.createdAt?.toDate();
        
        if (matchDate && matchDate >= today) {
          stats.todayMatches++;
        }
      });

      return { success: true, stats };
    } catch (error) {
      console.error('Error getting matching stats:', error);
      throw error;
    }
  }
}