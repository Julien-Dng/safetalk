import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
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
import { interlocuteurs } from '../interlocuteurs';

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
  isSearching: boolean;
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
    user2: UserProfile | null, // null for AI chat or during search
    sessionType: 'human' | 'ai' = 'human',
    isSearching = false
  ): Promise<ChatSession> {
    try {
      const isAIChat = sessionType === 'ai';

      let participants: string[] = [user1.uid];
      let participantUsernames: string[] = [user1.username];
      let participantProfiles: ChatSession['participantProfiles'] = {
        [user1.uid]: {
          username: user1.username,
          isAmbassador: user1.isAmbassador || false,
          rating: 4.5,
          isPremium: user1.isPremium,
        },
      };

      // Setup participants according to session type
      if (!isSearching) {
        if (isAIChat) {
          participantUsernames.push('@SafetalkAI');
          // AI doesn't have an entry in participantProfiles as it's not a real user
        } else if (user2) {
          participants.push(user2.uid);
          participantUsernames.push(user2.username);
          participantProfiles[user2.uid] = {
            username: user2.username,
            isAmbassador: user2.isAmbassador || false,
            rating: 4.5,
            isPremium: user2.isPremium,
          };
        }
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
        isSearching,
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

      // Send appropriate welcome message
      const welcomeMessage = this.getWelcomeMessage(user1.role, isAIChat, isSearching);
      await this.sendMessage(chatRef.id, 'system', 'SafeTalk', welcomeMessage, 'system');

      return {
        id: chatRef.id,
        ...chatData,
        createdAt: new Date(),
        lastMessageAt: new Date()
      } as ChatSession;
    } catch (error) {
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

      // Simulate responses only for actual user messages (not system messages)
      if (type === 'text' && senderId !== 'system') {
        const session = await this.getSessionById(chatId);
        
        if (session?.isAIChat && !session.isSearching) {
          // AI response only if it's an AI chat and not searching
          this.scheduleAIResponse(chatId, text);
        } else if (!session?.isSearching && !session?.isAIChat) {
          // Human response only if it's a human chat and not searching
          this.scheduleHumanResponse(chatId);
        }
        // If isSearching is true, no automated responses
      }

      return {
        id: messageRef.id,
        ...messageData,
        timestamp: new Date()
      } as ChatMessage;
    } catch (error) {
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
    } catch (error) {
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

  static async getSessionById(chatId: string): Promise<ChatSession | null> {
    const ref = doc(db, "chats", chatId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return {
      id: snap.id,
      ...(snap.data() as Omit<ChatSession, "id">),
    };
  }

  // Update chat session - enhanced to handle search state changes
  static async updateChatSession(
    chatId: string,
    data: Partial<ChatSession>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'chats', chatId), data as any);
      
      // If stopping search and found a partner, send new welcome message
      if (data.isSearching === false && data.participantUsernames) {
        const session = await this.getSessionById(chatId);
        if (session && !session.isAIChat && session.participants.length > 1) {
          // Get the role of the first user
          const firstUserId = session.participants[0];
          const firstUserProfile = session.participantProfiles[firstUserId];
          
          if (firstUserProfile) {
            const welcomeMessage = this.getWelcomeMessage('both', false, false);
            await this.sendMessage(session.id, 'system', 'SafeTalk', welcomeMessage, 'system');
          }
        }
      }
    } catch (error) {
      console.error('Error updating chat session:', error);
    }
  }

  // Schedule AI response with search state verification
  private static scheduleAIResponse(chatId: string, userMessage: string): void {
    setTimeout(async () => {
      try {
        // Check that the session is not in search mode
        const session = await this.getSessionById(chatId);
        if (session?.isSearching) {
          return; // Don't respond if still searching
        }

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

  private static scheduleHumanResponse(chatId: string): void {
    setTimeout(async () => {
      try {
        // Check that the session is not in search mode
        const session = await this.getSessionById(chatId);
        if (session?.isSearching) {
          return; // Don't respond if still searching
        }

        const humanResponses = [
          'Hi there! How are you doing?',
          "That's interesting, tell me more!",
          'I appreciate you sharing that.',
          "I'm here to listen if you want to talk.",
          'Sounds good to me.',
          'Thanks for telling me!',
          'I understand how you feel.',
          'That must be tough to deal with.',
          'How has your day been so far?'
        ];

        const randomUser = interlocuteurs[Math.floor(Math.random() * interlocuteurs.length)];
        const response = humanResponses[Math.floor(Math.random() * humanResponses.length)];
        await this.sendMessage(chatId, randomUser.uid, randomUser.username, response, 'text');
      } catch (error) {
        console.error('Error sending human response:', error);
      }
    }, 2000 + Math.random() * 3000);
  }

  // Get welcome message with search state consideration
  private static getWelcomeMessage(role: string, isAIChat: boolean, isSearching: boolean): string {
    // If searching for a partner
    if (isSearching) {
      return "Finding a partner...";
    }

    // If it's an AI chat
    if (isAIChat) {
      return "Hello! I'm your AI companion. I'm here to listen and support you. Feel free to share anything on your mind.";
    }

    // Human chat messages based on role
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