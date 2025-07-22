import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  limit,
  getDocs,
  runTransaction,
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile } from './authService';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  text: string;
  timestamp: Timestamp | Date;
  type: 'text' | 'system' | 'gift_notification';
  isRead: boolean;
}

export interface ChatSession {
  id: string;
  participants: string[];
  participantUsernames: string[];
  participantProfiles: {
    [userId: string]: {
      username: string;
      isAmbassador: boolean;
      rating: number;
      isPremium: boolean;
    }
  };
  createdAt: Timestamp | Date;
  lastMessageAt: Timestamp | Date;
  lastMessage?: string;
  status: 'active' | 'ended' | 'abandoned';
  sessionType: 'human' | 'ai';
  isAIChat: boolean;
  metadata: {
    startTime: number;
    endTime?: number;
    duration?: number; // in seconds
    messageCount: number;
    hasBeenRated: boolean;
    ratingData?: {
      rating: number;
      comment?: string;
      ratedBy: string;
      ratedAt: string;
    };
    saveConversation?: boolean;
    giftsSent?: number;
    giftsReceived?: number;
  };
}

export interface ChatPartner {
  id: string;
  username: string;
  rating: number;
  isAmbassador: boolean;
  isPremium: boolean;
}

export class ChatService {
  private static messageListeners: Map<string, () => void> = new Map();
  private static sessionListeners: Map<string, () => void> = new Map();

  // Create a new chat session
  static async createChatSession(
    user1: UserProfile,
    user2: UserProfile | null, // null for AI chat
    sessionType: 'human' | 'ai' = 'human'
  ): Promise<ChatSession> {
    try {
      const isAIChat = sessionType === 'ai' || !user2;
      
      let participants: string[];
      let participantUsernames: string[];
      let participantProfiles: ChatSession['participantProfiles'];

      if (isAIChat) {
        participants = [user1.uid];
        participantUsernames = [user1.username, '@SafetalkAI'];
        participantProfiles = {
          [user1.uid]: {
            username: user1.username,
            isAmbassador: false,
            rating: 0,
            isPremium: user1.isPremium
          }
        };
      } else {
        participants = [user1.uid, user2!.uid];
        participantUsernames = [user1.username, user2!.username];
        participantProfiles = {
          [user1.uid]: {
            username: user1.username,
            isAmbassador: false,
            rating: 0,
            isPremium: user1.isPremium
          },
          [user2!.uid]: {
            username: user2!.username,
            isAmbassador: false,
            rating: 0,
            isPremium: user2!.isPremium
          }
        };
      }

      const chatData = {
        participants,
        participantUsernames,
        participantProfiles,
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        status: 'active',
        sessionType,
        isAIChat,
        metadata: {
          startTime: Date.now(),
          messageCount: 0,
          hasBeenRated: false,
          saveConversation: false,
          giftsSent: 0,
          giftsReceived: 0
        }
      };

      const chatRef = await addDoc(collection(db, 'chats'), chatData);

      // Send welcome message
      const welcomeMessage = this.getWelcomeMessage(user1.role, isAIChat);
      await this.sendMessage(chatRef.id, 'system', 'SafeTalk', welcomeMessage, 'system');

      return {
        id: chatRef.id,
        ...chatData,
        createdAt: new Date(),
        lastMessageAt: new Date()
      } as ChatSession;
    } catch (error: any) {
      console.error('Error creating chat session:', error);
      throw new Error('Failed to create chat session');
    }
  }

  // Send a message
  static async sendMessage(
    chatId: string,
    senderId: string,
    senderUsername: string,
    text: string,
    type: 'text' | 'system' | 'gift_notification' = 'text'
  ): Promise<ChatMessage> {
    try {
      const messageData = {
        chatId,
        senderId,
        senderUsername,
        text,
        timestamp: serverTimestamp(),
        type,
        isRead: false
      };

      const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

      // Update chat session
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessageAt: serverTimestamp(),
        lastMessage: type === 'text' ? text : `[${type}]`,
        'metadata.messageCount': increment(1)
      });

      // Simulate AI response for AI chats
      if (type === 'text' && senderId !== 'system') {
        this.scheduleAIResponse(chatId, text);
      }

      return {
        id: messageRef.id,
        ...messageData,
        timestamp: new Date()
      } as ChatMessage;
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  // Listen to messages in a chat
  static subscribeToMessages(
    chatId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          messages.push({
            id: doc.id,
            ...doc.data()
          } as ChatMessage);
        });
        callback(messages);
      });

      // Store unsubscribe function
      this.messageListeners.set(chatId, unsubscribe);
      return unsubscribe;
    } catch (error: any) {
      console.error('Error subscribing to messages:', error);
      return () => {}; // Return empty function as fallback
    }
  }

  // Listen to chat session updates
  static subscribeToSession(
    chatId: string,
    callback: (session: ChatSession) => void
  ): () => void {
    try {
      const sessionRef = doc(db, 'chats', chatId);

      const unsubscribe = onSnapshot(sessionRef, (doc) => {
        if (doc.exists()) {
          callback({
            id: doc.id,
            ...doc.data()
          } as ChatSession);
        }
      });

      this.sessionListeners.set(chatId, unsubscribe);
      return unsubscribe;
    } catch (error: any) {
      console.error('Error subscribing to session:', error);
      return () => {};
    }
  }

  // End a chat session
  static async endChatSession(
    chatId: string,
    duration: number,
    messageCount: number
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'chats', chatId), {
        status: 'ended',
        'metadata.endTime': Date.now(),
        'metadata.duration': duration,
        'metadata.messageCount': messageCount
      });
    } catch (error: any) {
      console.error('Error ending chat session:', error);
      throw new Error('Failed to end chat session');
    }
  }

  // Submit rating for chat session
  static async submitRating(
    chatId: string,
    rating: number,
    comment: string,
    ratedBy: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'chats', chatId), {
        'metadata.hasBeenRated': true,
        'metadata.ratingData': {
          rating,
          comment,
          ratedBy,
          ratedAt: new Date().toISOString()
        }
      });

      // Store rating in ratings collection for analytics
      await addDoc(collection(db, 'ratings'), {
        chatId,
        rating,
        comment,
        ratedBy,
        timestamp: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      throw new Error('Failed to submit rating');
    }
  }

  // Block a user
  static async blockUser(blockerId: string, blockedId: string, reason?: string): Promise<void> {
    try {
      await addDoc(collection(db, 'moderation'), {
        type: 'block',
        reporterId: blockerId,
        reportedUserId: blockedId,
        reason: reason || 'User blocked',
        timestamp: serverTimestamp(),
        status: 'active'
      });
    } catch (error: any) {
      console.error('Error blocking user:', error);
      throw new Error('Failed to block user');
    }
  }

  // Report a user
  static async reportUser(reporterId: string, reportedId: string, reason: string): Promise<void> {
    try {
      await addDoc(collection(db, 'moderation'), {
        type: 'report',
        reporterId,
        reportedUserId: reportedId,
        reason,
        timestamp: serverTimestamp(),
        status: 'pending'
      });
    } catch (error: any) {
      console.error('Error reporting user:', error);
      throw new Error('Failed to report user');
    }
  }

  // Get user's active chat sessions
  static async getUserActiveSessions(userId: string): Promise<ChatSession[]> {
    try {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId),
        where('status', '==', 'active'),
        orderBy('lastMessageAt', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const sessions: ChatSession[] = [];
      
      querySnapshot.forEach((doc) => {
        sessions.push({
          id: doc.id,
          ...doc.data()
        } as ChatSession);
      });

      return sessions;
    } catch (error: any) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  // Schedule AI response (simulated)
  private static scheduleAIResponse(chatId: string, userMessage: string): void {
    setTimeout(async () => {
      try {
        const aiResponses = [
          "I hear you. That sounds like a challenging situation. How are you feeling about it right now?",
          "Thank you for sharing that with me. Your feelings are completely valid.",
          "That must be really difficult to deal with. You're being very brave by talking about it.",
          "I appreciate you trusting me with this. What do you think would help you feel better?",
          "It sounds like you're going through a lot. Remember that it's okay to feel overwhelmed sometimes.",
          "Your experience is important and valid. How long have you been feeling this way?",
          "I'm here to support you through this. What's the most challenging part for you right now?",
          "That sounds really tough. Have you been able to talk to anyone else about this?",
          "I can understand why that would be difficult. What helps you cope when things get overwhelming?"
        ];

        const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        await this.sendMessage(chatId, 'ai', '@SafetalkAI', response, 'text');
      } catch (error) {
        console.error('Error sending AI response:', error);
      }
    }, 2000 + Math.random() * 3000); // 2-5 second delay
  }

  // Get welcome message based on user role
  private static getWelcomeMessage(role: string, isAIChat: boolean): string {
    if (isAIChat) {
      return "Hello! I'm your AI companion. I'm here to listen and support you. Feel free to share anything on your mind.";
    }

    switch (role) {
      case 'talk':
        return "You have been connected to someone who wants to listen. Feel free to share what's on your mind.";
      case 'listen':
        return "You have been connected to someone who wants to talk. Be a good listener and show empathy.";
      case 'both':
      default:
        return "You have been connected to a chat partner. Feel free to talk or listen as the conversation flows.";
    }
  }

  // Clean up listeners
  static cleanup(): void {
    this.messageListeners.forEach(unsubscribe => unsubscribe());
    this.sessionListeners.forEach(unsubscribe => unsubscribe());
    this.messageListeners.clear();
    this.sessionListeners.clear();
  }

  // Unsubscribe from specific chat
  static unsubscribeFromChat(chatId: string): void {
    const messageUnsubscribe = this.messageListeners.get(chatId);
    const sessionUnsubscribe = this.sessionListeners.get(chatId);
    
    if (messageUnsubscribe) {
      messageUnsubscribe();
      this.messageListeners.delete(chatId);
    }
    
    if (sessionUnsubscribe) {
      sessionUnsubscribe();
      this.sessionListeners.delete(chatId);
    }
  }
}

