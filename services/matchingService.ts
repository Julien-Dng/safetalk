import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  runTransaction,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile } from './authService';
import { ChatService } from './chatService';

export interface MatchRequest {
  id: string;
  userId: string;
  userProfile: {
    username: string;
    role: 'talk' | 'listen' | 'both';
    rating: number;
    isAmbassador: boolean;
    isPremium: boolean;
  };
  preferences: {
    preferredRole: 'talk' | 'listen' | 'both' | 'any';
    avoidUsers: string[]; // Users to avoid (blocked, previously matched)
    maxWaitTime: number; // in milliseconds
  };
  status: 'waiting' | 'matched' | 'expired' | 'cancelled';
  createdAt: Timestamp | Date;
  matchedWith?: string;
  matchedAt?: Timestamp | Date;
}

export interface MatchResult {
  success: boolean;
  chatId?: string;
  partner?: {
    id: string;
    username: string;
    rating: number;
    isAmbassador: boolean;
    isPremium: boolean;
  };
  error?: string;
}

export class MatchingService {
  private static matchListeners: Map<string, () => void> = new Map();
  private static readonly MAX_WAIT_TIME = 60000; // 60 seconds
  private static readonly MAX_SKIP_COUNT = 5; // Maximum skips before showing ad

  // Start looking for a match
  static async findMatch(
    user: UserProfile,
    avoidUsers: string[] = [],
    preferredRole: 'talk' | 'listen' | 'both' | 'any' = 'any'
  ): Promise<{ requestId: string; promise: Promise<MatchResult> }> {
    try {
      // Create match request
      const matchRequest: Omit<MatchRequest, 'id'> = {
        userId: user.uid,
        userProfile: {
          username: user.username,
          role: user.role,
          rating: 4.5, // Default rating
          isAmbassador: false,
          isPremium: user.isPremium
        },
        preferences: {
          preferredRole,
          avoidUsers: [...avoidUsers, user.uid], // Include self in avoid list
          maxWaitTime: this.MAX_WAIT_TIME
        },
        status: 'waiting',
        createdAt: new Date()
      };

      const requestRef = await addDoc(collection(db, 'matchmaking'), matchRequest);
      const requestId = requestRef.id;

      // Start matching process
      const matchPromise = this.startMatchingProcess(requestId, user);

      return { requestId, promise: matchPromise };
    } catch (error: any) {
      console.error('Error starting match search:', error);
      throw new Error('Failed to start match search');
    }
  }

  // Start the matching process
  private static async startMatchingProcess(requestId: string, user: UserProfile): Promise<MatchResult> {
    return new Promise((resolve) => {
      let resolved = false;
      let timeoutId: NodeJS.Timeout;

      // Set up timeout
      timeoutId = setTimeout(async () => {
        if (resolved) return;
        resolved = true;
        
        try {
          // Mark request as expired
          await updateDoc(doc(db, 'matchmaking', requestId), {
            status: 'expired'
          });
          
          // Clean up listener
          this.cleanupMatchListener(requestId);
          
          resolve({
            success: false,
            error: 'No matches found. Try again later.'
          });
        } catch (error) {
          resolve({
            success: false,
            error: 'Matching timeout'
          });
        }
      }, this.MAX_WAIT_TIME);

      // Listen for match updates
      const requestRef = doc(db, 'matchmaking', requestId);
      const unsubscribe = onSnapshot(requestRef, async (doc) => {
        if (resolved) return;
        
        if (doc.exists()) {
          const data = doc.data() as MatchRequest;
          
          if (data.status === 'matched' && data.matchedWith) {
            resolved = true;
            clearTimeout(timeoutId);
            
            try {
              // Get partner profile
              const partner = await this.getPartnerProfile(data.matchedWith);
              if (!partner) {
                throw new Error('Partner not found');
              }

              // Create chat session
              const chatSession = await ChatService.createChatSession(user, partner, 'human');
              
              // Clean up match requests
              await this.cleanupMatchRequests([requestId, data.matchedWith]);
              
              resolve({
                success: true,
                chatId: chatSession.id,
                partner: {
                  id: partner.uid,
                  username: partner.username,
                  rating: 4.5,
                  isAmbassador: false,
                  isPremium: partner.isPremium
                }
              });
            } catch (error: any) {
              resolve({
                success: false,
                error: 'Failed to create chat session'
              });
            }
          }
        }
      });

      // Store listener for cleanup
      this.matchListeners.set(requestId, unsubscribe);

      // Try to find immediate match
      this.attemptMatch(requestId);
    });
  }

  // Attempt to find and create a match
  private static async attemptMatch(requestId: string): Promise<void> {
    try {
      // Get the current request
      const requestDoc = await getDocs(query(
        collection(db, 'matchmaking'),
        where('__name__', '==', requestId)
      ));

      if (requestDoc.empty) return;

      const currentRequest = {
        id: requestDoc.docs[0].id,
        ...requestDoc.docs[0].data()
      } as MatchRequest;

      if (currentRequest.status !== 'waiting') return;

      // Find compatible matches
      const compatibleMatches = await this.findCompatibleMatches(currentRequest);

      if (compatibleMatches.length > 0) {
        // Select best match (for now, just pick the first one)
        const selectedMatch = compatibleMatches[0];

        // Create bidirectional match using transaction
        await runTransaction(db, async (transaction) => {
          const currentRequestRef = doc(db, 'matchmaking', currentRequest.id);
          const partnerRequestRef = doc(db, 'matchmaking', selectedMatch.id);

          // Update both requests
          transaction.update(currentRequestRef, {
            status: 'matched',
            matchedWith: selectedMatch.userId,
            matchedAt: serverTimestamp()
          });

          transaction.update(partnerRequestRef, {
            status: 'matched',
            matchedWith: currentRequest.userId,
            matchedAt: serverTimestamp()
          });
        });
      }
    } catch (error) {
      console.error('Error attempting match:', error);
    }
  }

  // Find compatible matches
  private static async findCompatibleMatches(request: MatchRequest): Promise<MatchRequest[]> {
    try {
      // Query for compatible waiting requests
      const q = query(
        collection(db, 'matchmaking'),
        where('status', '==', 'waiting'),
        where('userId', '!=', request.userId),
        orderBy('userId'), // Required for inequality queries
        orderBy('createdAt', 'asc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const potentialMatches: MatchRequest[] = [];

      querySnapshot.forEach((doc) => {
        const match = {
          id: doc.id,
          ...doc.data()
        } as MatchRequest;

        // Check compatibility
        if (this.areCompatible(request, match)) {
          potentialMatches.push(match);
        }
      });

      return potentialMatches;
    } catch (error) {
      console.error('Error finding compatible matches:', error);
      return [];
    }
  }

  // Check if two requests are compatible
  private static areCompatible(request1: MatchRequest, request2: MatchRequest): boolean {
    // Check if users are avoiding each other
    if (request1.preferences.avoidUsers.includes(request2.userId) ||
        request2.preferences.avoidUsers.includes(request1.userId)) {
      return false;
    }

    // Check role compatibility
    const role1 = request1.userProfile.role;
    const role2 = request2.userProfile.role;
    const pref1 = request1.preferences.preferredRole;
    const pref2 = request2.preferences.preferredRole;

    // If both want to talk or both want to listen only, they're not compatible
    if (role1 === 'talk' && role2 === 'talk') return false;
    if (role1 === 'listen' && role2 === 'listen') return false;

    // Check preferred role compatibility
    if (pref1 !== 'any' && pref2 !== 'any') {
      // If one prefers to talk and other prefers to listen, it's perfect
      if ((pref1 === 'talk' && pref2 === 'listen') || 
          (pref1 === 'listen' && pref2 === 'talk')) {
        return true;
      }
      
      // If both prefer the same exclusive role, not compatible
      if (pref1 === pref2 && (pref1 === 'talk' || pref1 === 'listen')) {
        return false;
      }
    }

    return true;
  }

  // Get partner profile from user ID
  private static async getPartnerProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDocs(query(
        collection(db, 'users'),
        where('__name__', '==', userId),
        limit(1)
      ));

      if (!userDoc.empty) {
        return {
          uid: userDoc.docs[0].id,
          ...userDoc.docs[0].data()
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting partner profile:', error);
      return null;
    }
  }

  // Cancel match search
  static async cancelMatch(requestId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'matchmaking', requestId), {
        status: 'cancelled'
      });
      
      this.cleanupMatchListener(requestId);
    } catch (error) {
      console.error('Error cancelling match:', error);
    }
  }

  // Skip current partner and find new match
  static async skipPartner(
    userId: string,
    currentPartnerId: string,
    skipCount: number
  ): Promise<{ needsAd: boolean; requestId?: string; promise?: Promise<MatchResult> }> {
    try {
      // Check if user needs to watch ad
      if (skipCount >= this.MAX_SKIP_COUNT) {
        return { needsAd: true };
      }

      // Add current partner to avoid list
      const avoidList = [currentPartnerId];
      
      // Get user profile
      const userDoc = await getDocs(query(
        collection(db, 'users'),
        where('__name__', '==', userId),
        limit(1)
      ));

      if (userDoc.empty) {
        throw new Error('User not found');
      }

      const userProfile = {
        uid: userDoc.docs[0].id,
        ...userDoc.docs[0].data()
      } as UserProfile;

      // Start new match search
      const { requestId, promise } = await this.findMatch(userProfile, avoidList);
      
      return { needsAd: false, requestId, promise };
    } catch (error: any) {
      console.error('Error skipping partner:', error);
      throw new Error('Failed to skip partner');
    }
  }

  // Get AI chat partner (simulated)
  static getAIChatPartner(): {
    id: string;
    username: string;
    rating: number;
    isAmbassador: boolean;
    isPremium: boolean;
  } {
    return {
      id: 'ai-assistant',
      username: '@SafetalkAI',
      rating: 5.0,
      isAmbassador: true,
      isPremium: true
    };
  }

  // Clean up match requests after successful match
  private static async cleanupMatchRequests(requestIds: string[]): Promise<void> {
    try {
      const deletePromises = requestIds.map(id => 
        deleteDoc(doc(db, 'matchmaking', id))
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error cleaning up match requests:', error);
    }
  }

  // Clean up match listener
  private static cleanupMatchListener(requestId: string): void {
    const unsubscribe = this.matchListeners.get(requestId);
    if (unsubscribe) {
      unsubscribe();
      this.matchListeners.delete(requestId);
    }
  }

  // Clean up all listeners
  static cleanup(): void {
    this.matchListeners.forEach(unsubscribe => unsubscribe());
    this.matchListeners.clear();
  }

  // Get match statistics (for debugging/analytics)
  static async getMatchStats(): Promise<{
    waitingCount: number;
    activeMatches: number;
    averageWaitTime: number;
  }> {
    try {
      const waitingQuery = query(
        collection(db, 'matchmaking'),
        where('status', '==', 'waiting')
      );

      const matchedQuery = query(
        collection(db, 'matchmaking'),
        where('status', '==', 'matched')
      );

      const [waitingSnapshot, matchedSnapshot] = await Promise.all([
        getDocs(waitingQuery),
        getDocs(matchedQuery)
      ]);

      // Calculate average wait time for matched requests
      let totalWaitTime = 0;
      let matchedCount = 0;

      matchedSnapshot.forEach((doc) => {
        const data = doc.data() as MatchRequest;
        if (data.matchedAt && data.createdAt) {
          const waitTime = (data.matchedAt as any).toMillis() - (data.createdAt as any).toMillis();
          totalWaitTime += waitTime;
          matchedCount++;
        }
      });

      const averageWaitTime = matchedCount > 0 ? totalWaitTime / matchedCount : 0;

      return {
        waitingCount: waitingSnapshot.size,
        activeMatches: matchedSnapshot.size,
        averageWaitTime: Math.floor(averageWaitTime / 1000) // Convert to seconds
      };
    } catch (error) {
      console.error('Error getting match stats:', error);
      return {
        waitingCount: 0,
        activeMatches: 0,
        averageWaitTime: 0
      };
    }
  }
}