// import {
//   collection,
//   doc,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   onSnapshot,
//   query,
//   where,
//   orderBy,
//   limit,
//   getDocs,
//   runTransaction,
//   serverTimestamp,
//   Timestamp
// } from 'firebase/firestore';
// import { db } from '../config/firebase';
// import { UserProfile } from './authService';
// import { ChatService } from './chatService';

// export interface MatchRequest {
//   id: string;
//   userId: string;
//   userProfile: {
//     username: string;
//     role: 'talk' | 'listen' | 'both';
//     rating: number;
//     isAmbassador: boolean;
//     isPremium: boolean;
//   };
//   preferences: {
//     preferredRole: 'talk' | 'listen' | 'both' | 'any';
//     avoidUsers: string[]; // Users to avoid (blocked, previously matched)
//     maxWaitTime: number; // in milliseconds
//   };
//   status: 'waiting' | 'matched' | 'expired' | 'cancelled';
//   createdAt: Timestamp | Date;
//   matchedWith?: string;
//   matchedAt?: Timestamp | Date;
// }

// export interface MatchResult {
//   success: boolean;
//   chatId?: string;
//   partner?: {
//     id: string;
//     username: string;
//     rating: number;
//     isAmbassador: boolean;
//     isPremium: boolean;
//   };
//   error?: string;
// }

// export class MatchingService {
//   private static matchListeners: Map<string, () => void> = new Map();
//   private static matchIntervals: Map<string, NodeJS.Timeout> = new Map();
//   private static readonly MAX_WAIT_TIME = 60000; // 60 seconds
//   private static readonly MAX_SKIP_COUNT = 5; // Maximum skips before showing ad
//   private static readonly MATCH_INTERVAL_MS = 5000; 

//   // Start looking for a match
//   static async findMatch(
//     user: UserProfile,
//     avoidUsers: string[] = [],
//     preferredRole: 'talk' | 'listen' | 'both' | 'any' = 'any'
//   ): Promise<{ requestId: string; promise: Promise<MatchResult> }> {
//     try {
//       // Create match request
//       const matchRequest: Omit<MatchRequest, 'id'> = {
//         userId: user.uid,
//         userProfile: {
//           username: user.username,
//           role: user.role,
//           rating: 4.5, // Default rating
//           isAmbassador: false,
//           isPremium: user.isPremium
//         },
//         preferences: {
//           preferredRole,
//           avoidUsers: [...avoidUsers, user.uid], // Include self in avoid list
//           maxWaitTime: this.MAX_WAIT_TIME
//         },
//         status: 'waiting',
//         createdAt: new Date()
//       };

//       const requestRef = await addDoc(collection(db, 'matchmaking'), matchRequest);
//       const requestId = requestRef.id;

//       // Start matching process
//       const matchPromise = this.startMatchingProcess(requestId, user);

//       return { requestId, promise: matchPromise };
//     } catch (error: any) {
//       console.error('Error starting match search:', error);
//       throw new Error('Failed to start match search');
//     }
//   }

//   // Start the matching process
//   private static async startMatchingProcess(requestId: string, user: UserProfile): Promise<MatchResult> {
//     return new Promise((resolve) => {
//       let resolved = false;
//       let timeoutId: NodeJS.Timeout;
//       let intervalId: NodeJS.Timeout;

//       // Set up timeout
//       timeoutId = setTimeout(async () => {
//         if (resolved) return;
//         resolved = true;
        
//         try {
//           // Mark request as expired
//           await updateDoc(doc(db, 'matchmaking', requestId), {
//             status: 'expired'
//           });
          
//           // Clean up listener
//           this.cleanupMatchListener(requestId);
          
//           resolve({
//             success: false,
//             error: 'No matches found. Try again later.'
//           });
//         } catch (error) {
//           resolve({
//             success: false,
//             error: 'Matching timeout'
//           });
//         }
//         clearInterval(intervalId);
//         this.matchIntervals.delete(requestId);
//       }, this.MAX_WAIT_TIME);

//       intervalId = setInterval(() => {
//         this.attemptMatch(requestId);
//       }, this.MATCH_INTERVAL_MS);
//       this.matchIntervals.set(requestId, intervalId);

//       // Listen for match updates
//       const requestRef = doc(db, 'matchmaking', requestId);
//       const unsubscribe = onSnapshot(requestRef, async (doc) => {
//         if (resolved) return;
        
//         if (doc.exists()) {
//           const data = doc.data() as MatchRequest;
          
//           if (data.status === 'matched' && data.matchedWith) {
//             resolved = true;
//             clearTimeout(timeoutId);
//             clearInterval(intervalId);
//             this.matchIntervals.delete(requestId);
            
//             try {
//               // Get partner profile
//               const partner = await this.getPartnerProfile(data.matchedWith);
//               if (!partner) {
//                 throw new Error('Partner not found');
//               }

//               // Create chat session
//               const chatSession = await ChatService.createChatSession(user, partner, 'human');
              
//               // Clean up match requests
//               await this.cleanupMatchRequests([requestId, data.matchedWith]);
              
//               resolve({
//                 success: true,
//                 chatId: chatSession.id,
//                 partner: {
//                   id: partner.uid,
//                   username: partner.username,
//                   rating: 4.5,
//                   isAmbassador: false,
//                   isPremium: partner.isPremium
//                 }
//               });
//             } catch (error: any) {
//               resolve({
//                 success: false,
//                 error: 'Failed to create chat session'
//               });
//             }
//           }
//         }
//       });

//       // Store listener for cleanup
//       this.matchListeners.set(requestId, unsubscribe);

//       // Try to find immediate match
//       this.attemptMatch(requestId);
//     });
//   }

//   // Attempt to find and create a match
//   private static async attemptMatch(requestId: string): Promise<void> {
//     try {
//       // Get the current request
//       const requestDoc = await getDocs(query(
//         collection(db, 'matchmaking'),
//         where('__name__', '==', requestId)
//       ));

//       if (requestDoc.empty) return;

//       const currentRequest = {
//         id: requestDoc.docs[0].id,
//         ...requestDoc.docs[0].data()
//       } as MatchRequest;

//       if (currentRequest.status !== 'waiting') return;

//       // Find compatible matches
//       const compatibleMatches = await this.findCompatibleMatches(currentRequest);

//       if (compatibleMatches.length > 0) {
//         // Select best match (for now, just pick the first one)
//         const selectedMatch = compatibleMatches[0];

//         // Create bidirectional match using transaction
//         await runTransaction(db, async (transaction) => {
//           const currentRequestRef = doc(db, 'matchmaking', currentRequest.id);
//           const partnerRequestRef = doc(db, 'matchmaking', selectedMatch.id);

//           // Update both requests
//           transaction.update(currentRequestRef, {
//             status: 'matched',
//             matchedWith: selectedMatch.userId,
//             matchedAt: serverTimestamp()
//           });

//           transaction.update(partnerRequestRef, {
//             status: 'matched',
//             matchedWith: currentRequest.userId,
//             matchedAt: serverTimestamp()
//           });
//         });
//       }
//     } catch (error) {
//       console.error('Error attempting match:', error);
//     }
//   }

//   // Find compatible matches
//   private static async findCompatibleMatches(request: MatchRequest): Promise<MatchRequest[]> {
//     try {
//       // Query for compatible waiting requests
//       const q = query(
//         collection(db, 'matchmaking'),
//         where('status', '==', 'waiting'),
//         where('userId', '!=', request.userId),
//         orderBy('userId'), // Required for inequality queries
//         orderBy('createdAt', 'asc'),
//         limit(10)
//       );

//       const querySnapshot = await getDocs(q);
//       const potentialMatches: MatchRequest[] = [];

//       querySnapshot.forEach((doc) => {
//         const match = {
//           id: doc.id,
//           ...doc.data()
//         } as MatchRequest;

//         // Check compatibility
//         if (this.areCompatible(request, match)) {
//           potentialMatches.push(match);
//         }
//       });

//       return potentialMatches;
//     } catch (error) {
//       console.error('Error finding compatible matches:', error);
//       return [];
//     }
//   }

//   // Check if two requests are compatible
//   private static areCompatible(request1: MatchRequest, request2: MatchRequest): boolean {
//     // Check if users are avoiding each other
//     if (request1.preferences.avoidUsers.includes(request2.userId) ||
//         request2.preferences.avoidUsers.includes(request1.userId)) {
//       return false;
//     }

//     // Check role compatibility
//     const role1 = request1.userProfile.role;
//     const role2 = request2.userProfile.role;
//     const pref1 = request1.preferences.preferredRole;
//     const pref2 = request2.preferences.preferredRole;

//     // If both want to talk or both want to listen only, they're not compatible
//     if (role1 === 'talk' && role2 === 'talk') return false;
//     if (role1 === 'listen' && role2 === 'listen') return false;

//     // Check preferred role compatibility
//     if (pref1 !== 'any' && pref2 !== 'any') {
//       // If one prefers to talk and other prefers to listen, it's perfect
//       if ((pref1 === 'talk' && pref2 === 'listen') || 
//           (pref1 === 'listen' && pref2 === 'talk')) {
//         return true;
//       }
      
//       // If both prefer the same exclusive role, not compatible
//       if (pref1 === pref2 && (pref1 === 'talk' || pref1 === 'listen')) {
//         return false;
//       }
//     }

//     return true;
//   }

//   // Get partner profile from user ID
//   private static async getPartnerProfile(userId: string): Promise<UserProfile | null> {
//     try {
//       const userDoc = await getDocs(query(
//         collection(db, 'users'),
//         where('__name__', '==', userId),
//         limit(1)
//       ));

//       if (!userDoc.empty) {
//         return {
//           uid: userDoc.docs[0].id,
//           ...userDoc.docs[0].data()
//         } as UserProfile;
//       }
//       return null;
//     } catch (error) {
//       console.error('Error getting partner profile:', error);
//       return null;
//     }
//   }

//   // Cancel match search
//   static async cancelMatch(requestId: string): Promise<void> {
//     try {
//       await updateDoc(doc(db, 'matchmaking', requestId), {
//         status: 'cancelled'
//       });
      
//       this.cleanupMatchListener(requestId);
//     } catch (error) {
//       console.error('Error cancelling match:', error);
//     }
//   }

//   // Skip current partner and find new match
//   static async skipPartner(
//     userId: string,
//     currentPartnerId: string,
//     skipCount: number
//   ): Promise<{ needsAd: boolean; requestId?: string; promise?: Promise<MatchResult> }> {
//     try {
//       // Check if user needs to watch ad
//       if (skipCount >= this.MAX_SKIP_COUNT) {
//         return { needsAd: true };
//       }

//       // Add current partner to avoid list
//       const avoidList = [currentPartnerId];
      
//       // Get user profile
//       const userDoc = await getDocs(query(
//         collection(db, 'users'),
//         where('__name__', '==', userId),
//         limit(1)
//       ));

//       if (userDoc.empty) {
//         throw new Error('User not found');
//       }

//       const userProfile = {
//         uid: userDoc.docs[0].id,
//         ...userDoc.docs[0].data()
//       } as UserProfile;

//       // Start new match search
//       const { requestId, promise } = await this.findMatch(userProfile, avoidList);
      
//       return { needsAd: false, requestId, promise };
//     } catch (error: any) {
//       console.error('Error skipping partner:', error);
//       throw new Error('Failed to skip partner');
//     }
//   }

//   // Get AI chat partner (simulated)
//   static getAIChatPartner(): {
//     id: string;
//     username: string;
//     rating: number;
//     isAmbassador: boolean;
//     isPremium: boolean;
//   } {
//     return {
//       id: 'ai-assistant',
//       username: '@SafetalkAI',
//       rating: 5.0,
//       isAmbassador: true,
//       isPremium: true
//     };
//   }

//   // Clean up match requests after successful match
//   private static async cleanupMatchRequests(requestIds: string[]): Promise<void> {
//     try {
//       const deletePromises = requestIds.map(id => 
//         deleteDoc(doc(db, 'matchmaking', id))
//       );
//       await Promise.all(deletePromises);
//     } catch (error) {
//       console.error('Error cleaning up match requests:', error);
//     }
//   }

//   // Clean up match listener
//   private static cleanupMatchListener(requestId: string): void {
//     const unsubscribe = this.matchListeners.get(requestId);
//     if (unsubscribe) {
//       unsubscribe();
//       this.matchListeners.delete(requestId);
//     }

//     const intervalId = this.matchIntervals.get(requestId);
//     if (intervalId) {
//       clearInterval(intervalId);
//       this.matchIntervals.delete(requestId);
//       this.matchIntervals.forEach(intervalId => clearInterval(intervalId));
//       this.matchIntervals.clear();
//     }
//   }

//   // Clean up all listeners
//   static cleanup(): void {
//     this.matchListeners.forEach(unsubscribe => unsubscribe());
//     this.matchListeners.clear();
//   }

//   // Get match statistics (for debugging/analytics)
//   static async getMatchStats(): Promise<{
//     waitingCount: number;
//     activeMatches: number;
//     averageWaitTime: number;
//   }> {
//     try {
//       const waitingQuery = query(
//         collection(db, 'matchmaking'),
//         where('status', '==', 'waiting')
//       );

//       const matchedQuery = query(
//         collection(db, 'matchmaking'),
//         where('status', '==', 'matched')
//       );

//       const [waitingSnapshot, matchedSnapshot] = await Promise.all([
//         getDocs(waitingQuery),
//         getDocs(matchedQuery)
//       ]);

//       // Calculate average wait time for matched requests
//       let totalWaitTime = 0;
//       let matchedCount = 0;

//       matchedSnapshot.forEach((doc) => {
//         const data = doc.data() as MatchRequest;
//         if (data.matchedAt && data.createdAt) {
//           const waitTime = (data.matchedAt as any).toMillis() - (data.createdAt as any).toMillis();
//           totalWaitTime += waitTime;
//           matchedCount++;
//         }
//       });

//       const averageWaitTime = matchedCount > 0 ? totalWaitTime / matchedCount : 0;

//       return {
//         waitingCount: waitingSnapshot.size,
//         activeMatches: matchedSnapshot.size,
//         averageWaitTime: Math.floor(averageWaitTime / 1000) // Convert to seconds
//       };
//     } catch (error) {
//       console.error('Error getting match stats:', error);
//       return {
//         waitingCount: 0,
//         activeMatches: 0,
//         averageWaitTime: 0
//       };
//     }
//   }
// }

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
  getDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
  Query
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
    avoidUsers: string[];
    maxWaitTime: number;
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

interface CachedMatches {
  matches: MatchRequest[];
  timestamp: number;
}

export class MatchingService {
  // ⚡ Configuration ultra-rapide et debugging
  private static readonly MAX_WAIT_TIME = 15000; // 15 secondes optimisé
  private static readonly MATCH_INTERVAL_MS = 300; // 300ms ultra-rapide
  private static readonly MAX_SKIP_COUNT = 5;
  private static readonly CACHE_TTL = 1000; // 1 seconde
  private static readonly INSTANT_MATCH_DELAY = 50; // 50ms
  private static readonly DEBUG_MODE = true; // 🐛 Debug activé temporairement
  
  // 🧠 Cache intelligent
  private static currentRequestCache = new Map<string, MatchRequest>();
  private static compatibleMatchesCache = new Map<string, CachedMatches>();
  private static userProfileCache = new Map<string, { profile: UserProfile; timestamp: number }>();
  
  // 📡 Listeners et intervals
  private static matchListeners = new Map<string, () => void>();
  private static matchIntervals = new Map<string, NodeJS.Timeout>();
  private static globalListenerActive = false;
  private static globalMatchUnsubscribe: (() => void) | null = null;
  private static cacheCleanupInterval: NodeJS.Timeout | null = null;

  // 🚀 Point d'entrée principal - Avec nettoyage des anciennes requêtes
  static async findMatch(
    user: UserProfile,
    avoidUsers: string[] = [],
    preferredRole: 'talk' | 'listen' | 'both' | 'any' = 'any'
  ): Promise<{ requestId: string; promise: Promise<MatchResult> }> {
    try {
      if (this.DEBUG_MODE) {
        console.log('🔍 Finding partner...', { 
          userId: user.uid, 
          role: user.role, 
          avoidUsers: avoidUsers.length 
        });
      }

      // 1. NETTOYER LES ANCIENNES REQUÊTES DU MÊME UTILISATEUR
      await this.cleanupUserRequests(user.uid);

      // 2. Setup listener global si pas déjà fait
      if (!this.globalListenerActive) {
        if (this.DEBUG_MODE) console.log('📡 Setting up global listener...');
        this.setupGlobalMatchListener();
        this.setupCacheCleanup();
      }

      // 3. Vérifier s'il y a déjà des utilisateurs en attente
      const existingMatches = await this.getWaitingUsers();
      if (this.DEBUG_MODE) {
        console.log(`👥 Found ${existingMatches.length} users waiting (after cleanup)`);
      }

      // 4. Créer match request
      const matchRequest: Omit<MatchRequest, 'id'> = {
        userId: user.uid,
        userProfile: {
          username: user.username,
          role: user.role,
          rating: 4.5,
          isAmbassador: false,
          isPremium: user.isPremium
        },
        preferences: {
          preferredRole,
          avoidUsers: [...avoidUsers, user.uid],
          maxWaitTime: this.MAX_WAIT_TIME
        },
        status: 'waiting',
        createdAt: new Date()
      };

      const requestRef = await addDoc(collection(db, 'matchmaking'), matchRequest);
      const requestId = requestRef.id;

      if (this.DEBUG_MODE) {
        console.log('✅ Match request created:', requestId);
      }

      // 5. Cache la requête
      this.currentRequestCache.set(requestId, {
        id: requestId,
        ...matchRequest
      });

      // 6. Essayer match instantané avec utilisateurs existants
      setTimeout(() => this.tryInstantMatch(requestId), this.INSTANT_MATCH_DELAY);

      // 7. Démarrer process normal
      const matchPromise = this.startOptimizedMatchingProcess(requestId, user);

      return { requestId, promise: matchPromise };
    } catch (error: any) {
      console.error('❌ Error starting match search:', error);
      throw new Error('Failed to start match search');
    }
  }

  // 🧹 Nettoyer les anciennes requêtes du même utilisateur (requête simple)
  private static async cleanupUserRequests(userId: string): Promise<void> {
    try {
      if (this.DEBUG_MODE) console.log(`🧹 Cleaning up old requests for user: ${userId}`);
      
      // Requête simple pour éviter les index composites
      const q = query(
        collection(db, 'matchmaking'),
        where('userId', '==', userId),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const deletePromises: Promise<void>[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data() as MatchRequest;
        // Supprimer seulement les requêtes waiting, cancelled, expired
        if (['waiting', 'cancelled', 'expired'].includes(data.status)) {
          deletePromises.push(deleteDoc(doc.ref));
          this.currentRequestCache.delete(doc.id);
        }
      });
      
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        if (this.DEBUG_MODE) console.log(`🗑️ Deleted ${deletePromises.length} old requests`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up user requests:', error);
      // Si le nettoyage échoue, on continue quand même
    }
  }

  // 👥 Récupérer les utilisateurs en attente (pour debugging)
  private static async getWaitingUsers(): Promise<MatchRequest[]> {
    try {
      const q = query(
        collection(db, 'matchmaking'),
        where('status', '==', 'waiting'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      const waitingUsers: MatchRequest[] = [];
      
      snapshot.forEach(doc => {
        waitingUsers.push({
          id: doc.id,
          ...doc.data()
        } as MatchRequest);
      });
      
      return waitingUsers;
    } catch (error) {
      console.error('Error getting waiting users:', error);
      return [];
    }
  }
  private static async startOptimizedMatchingProcess(requestId: string, user: UserProfile): Promise<MatchResult> {
    return new Promise((resolve) => {
      let resolved = false;
      let timeoutId: NodeJS.Timeout;
      let intervalId: NodeJS.Timeout;

      // Timeout optimisé
      timeoutId = setTimeout(async () => {
        if (resolved) return;
        resolved = true;
        
        try {
          await updateDoc(doc(db, 'matchmaking', requestId), {
            status: 'expired'
          });
          
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
        
        clearInterval(intervalId);
        this.matchIntervals.delete(requestId);
      }, this.MAX_WAIT_TIME);

      // Interval optimisé avec cache
      intervalId = setInterval(() => {
        this.attemptOptimizedMatch(requestId);
      }, this.MATCH_INTERVAL_MS);
      
      this.matchIntervals.set(requestId, intervalId);

      // Listener pour match updates
      const requestRef = doc(db, 'matchmaking', requestId);
      const unsubscribe = onSnapshot(requestRef, async (doc) => {
        if (resolved) return;
        
        if (doc.exists()) {
          const data = doc.data() as MatchRequest;
          
          if (data.status === 'matched' && data.matchedWith) {
            resolved = true;
            clearTimeout(timeoutId);
            clearInterval(intervalId);
            this.matchIntervals.delete(requestId);
            
            try {
              const partner = await this.getCachedPartnerProfile(data.matchedWith);
              if (!partner) {
                throw new Error('Partner not found');
              }

              const chatSession = await ChatService.createChatSession(user, partner, 'human');
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

      this.matchListeners.set(requestId, unsubscribe);
      
      // Premier essai immédiat
      this.attemptOptimizedMatch(requestId);
    });
  }

  // 🚀 Matching instantané sans utilisateurs de test (pour éviter les erreurs de permissions)
  private static async tryInstantMatch(requestId: string): Promise<void> {
    try {
      if (this.DEBUG_MODE) console.log('⚡ Trying instant match...');
      
      const currentRequest = this.currentRequestCache.get(requestId);
      if (!currentRequest) return;

      const compatibleMatches = await this.findOptimizedCompatibleMatches(currentRequest);
      
      if (compatibleMatches.length > 0) {
        if (this.DEBUG_MODE) console.log('🎯 Instant match found!');
        await this.createOptimizedMatch(currentRequest, compatibleMatches[0]);
      } else if (this.DEBUG_MODE) {
        console.log('⏳ No instant match, will try periodically...');
        
        // Désactivé temporairement les utilisateurs de test pour éviter les erreurs de permissions
        // En mode debug, afficher qu'on cherche des vrais utilisateurs
        setTimeout(() => {
          const stillWaiting = this.currentRequestCache.get(requestId);
          if (stillWaiting && stillWaiting.status === 'waiting') {
            console.log('🔍 Still searching for real users...');
          }
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Error in instant match:', error);
    }
  }

  // ⚡ Tentative de match optimisée avec debugging complet
  private static async attemptOptimizedMatch(requestId: string): Promise<void> {
    try {
      if (this.DEBUG_MODE) {
        console.log(`🎯 Attempting match for ${requestId}...`);
      }

      // Vérifier le cache d'abord
      let currentRequest = this.currentRequestCache.get(requestId);
      
      if (!currentRequest) {
        if (this.DEBUG_MODE) console.log('📥 Fetching request from DB...');
        const requestDoc = await getDoc(doc(db, 'matchmaking', requestId));
        if (!requestDoc.exists()) {
          if (this.DEBUG_MODE) console.log('❌ Request not found in DB');
          return;
        }
        
        currentRequest = {
          id: requestDoc.id,
          ...requestDoc.data()
        } as MatchRequest;
        
        this.currentRequestCache.set(requestId, currentRequest);
      }

      if (currentRequest.status !== 'waiting') {
        if (this.DEBUG_MODE) console.log(`⏸️ Request status: ${currentRequest.status}`);
        return;
      }

      // Clear expired cache
      this.clearExpiredCache();

      // Chercher matches compatibles
      const compatibleMatches = await this.findOptimizedCompatibleMatches(currentRequest);

      if (this.DEBUG_MODE) {
        console.log(`🔍 Found ${compatibleMatches.length} compatible matches`);
        if (compatibleMatches.length > 0) {
          console.log('🎯 Best match:', {
            id: compatibleMatches[0].id,
            username: compatibleMatches[0].userProfile.username,
            role: compatibleMatches[0].userProfile.role
          });
        }
      }

      if (compatibleMatches.length > 0) {
        if (this.DEBUG_MODE) console.log('🚀 Creating match...');
        await this.createOptimizedMatch(currentRequest, compatibleMatches[0]);
      }
    } catch (error) {
      console.error('❌ Error attempting optimized match:', error);
    }
  }

  // 🎯 Recherche de matches avec debugging complet
  private static async findOptimizedCompatibleMatches(request: MatchRequest): Promise<MatchRequest[]> {
    try {
      if (this.DEBUG_MODE) {
        console.log('🔍 Searching compatible matches for:', {
          id: request.id,
          role: request.userProfile.role,
          avoidUsers: request.preferences.avoidUsers.length
        });
      }

      // Vérifier le cache d'abord
      const cacheKey = `${request.id}-${request.userProfile.role}`;
      const cached = this.compatibleMatchesCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        if (this.DEBUG_MODE) console.log('💾 Using cached matches');
        const filteredMatches = cached.matches.filter(m => this.isQuickCompatible(request, m));
        return this.prioritizeMatches(filteredMatches);
      }

      // Requête simple sans index composites
      const queries = this.buildOptimizedQueries(request);
      
      if (this.DEBUG_MODE) console.log(`📝 Executing ${queries.length} queries...`);

      // Paralléliser toutes les requêtes
      const queryPromises = queries.map(q => getDocs(q));
      const results = await Promise.all(queryPromises);
      
      const allMatches: MatchRequest[] = [];
      const potentialMatches: MatchRequest[] = [];
      
      results.forEach(snapshot => {
        snapshot.forEach(doc => {
          const match = { id: doc.id, ...doc.data() } as MatchRequest;
          allMatches.push(match);
          
          // Filtrage en mémoire très permissif pour debugging
          if (match.userId !== request.userId && 
              this.isVeryPermissiveCompatible(request, match)) {
            potentialMatches.push(match);
          }
        });
      });

      if (this.DEBUG_MODE) {
        console.log(`📊 Match analysis:`, {
          totalFound: allMatches.length,
          afterFiltering: potentialMatches.length,
          currentUserId: request.userId
        });
        
        if (allMatches.length > 0 && potentialMatches.length === 0) {
          console.log('🔍 All matches details:');
          allMatches.forEach(match => {
            console.log({
              id: match.id,
              userId: match.userId,
              role: match.userProfile.role,
              status: match.status,
              isCurrentUser: match.userId === request.userId,
              isInAvoidList: request.preferences.avoidUsers.includes(match.userId)
            });
          });
        }
      }

      // Cache le résultat
      this.compatibleMatchesCache.set(cacheKey, {
        matches: potentialMatches,
        timestamp: Date.now()
      });
      
      return this.prioritizeMatches(potentialMatches);
    } catch (error) {
      console.error('❌ Error finding optimized matches:', error);
      return [];
    }
  }

  // 🚀 Compatibilité ultra-permissive MAIS excluant strictement le même userId
  private static isVeryPermissiveCompatible(request1: MatchRequest, request2: MatchRequest): boolean {
    // Check STRICT pour éviter soi-même
    if (request1.userId === request2.userId) {
      if (this.DEBUG_MODE) console.log('❌ Same userId - BLOCKED');
      return false;
    }
    
    // Check status
    if (request2.status !== 'waiting') {
      if (this.DEBUG_MODE) console.log('❌ Not waiting status:', request2.status);
      return false;
    }
    
    // Check avoid list
    if (request1.preferences.avoidUsers.includes(request2.userId)) {
      if (this.DEBUG_MODE) console.log('❌ In avoid list');
      return false;
    }

    // Compatibilité de rôle ultra-permissive
    const role1 = request1.userProfile.role;
    const role2 = request2.userProfile.role;

    // Pour le debugging, on accepte presque tout sauf talk+talk et listen+listen
    if (role1 === 'talk' && role2 === 'talk') {
      if (this.DEBUG_MODE) console.log('❌ Both want to talk');
      return false;
    }
    if (role1 === 'listen' && role2 === 'listen') {
      if (this.DEBUG_MODE) console.log('❌ Both want to listen');
      return false;
    }

    if (this.DEBUG_MODE) console.log('✅ Compatible match found!');
    return true;
  }

  // 🏗️ Requêtes ultra-simplifiées (AUCUN index composite requis)
  private static buildOptimizedQueries(request: MatchRequest): Query[] {
    const queries: Query[] = [];
    const baseCollection = collection(db, 'matchmaking');
    
    // Requête ULTRA-simple : seulement un where, pas d'orderBy
    queries.push(query(
      baseCollection,
      where('status', '==', 'waiting'),
      limit(50) // Limite plus élevée, on trie en mémoire
    ));
    
    return queries;
  }

  // ⚡ Vérification rapide de compatibilité (optimisée)
  private static isQuickCompatible(request1: MatchRequest, request2: MatchRequest): boolean {
    // Check rapide pour éviter soi-même
    if (request1.userId === request2.userId) return false;
    
    // Check avoid list
    if (request1.preferences.avoidUsers.includes(request2.userId) ||
        request2.preferences.avoidUsers.includes(request1.userId)) {
      return false;
    }

    // Check role compatibility (optimisé)
    const role1 = request1.userProfile.role;
    const role2 = request2.userProfile.role;

    // Incompatibilités rapides
    if (role1 === 'talk' && role2 === 'talk') return false;
    if (role1 === 'listen' && role2 === 'listen') return false;

    // Compatibilités parfaites
    if ((role1 === 'talk' && role2 === 'listen') || 
        (role1 === 'listen' && role2 === 'talk') ||
        role1 === 'both' || role2 === 'both') {
      return true;
    }

    return false;
  }

  // 🏆 Priorisation intelligente des matches (avec tri par temps)
  private static prioritizeMatches(matches: MatchRequest[]): MatchRequest[] {
    return matches.sort((a, b) => {
      // 1. Premium users en premier
      if (a.userProfile.isPremium && !b.userProfile.isPremium) return -1;
      if (!a.userProfile.isPremium && b.userProfile.isPremium) return 1;
      
      // 2. Tri par temps de création (plus ancien = priorité)
      const timeA = (a.createdAt as any).toMillis ? (a.createdAt as any).toMillis() : new Date(a.createdAt).getTime();
      const timeB = (b.createdAt as any).toMillis ? (b.createdAt as any).toMillis() : new Date(b.createdAt).getTime();
      return timeA - timeB; // Plus ancien en premier
      
      // 3. Rating plus élevé (si on veut l'ajouter plus tard)
      // return b.userProfile.rating - a.userProfile.rating;
    });
  }

  // ⚡ Création de match optimisée avec debugging
  private static async createOptimizedMatch(request1: MatchRequest, request2: MatchRequest): Promise<void> {
    try {
      if (this.DEBUG_MODE) {
        console.log('🚀 Creating match between:', {
          user1: { id: request1.id, username: request1.userProfile.username, role: request1.userProfile.role },
          user2: { id: request2.id, username: request2.userProfile.username, role: request2.userProfile.role }
        });
      }

      await runTransaction(db, async (transaction) => {
        const request1Ref = doc(db, 'matchmaking', request1.id);
        const request2Ref = doc(db, 'matchmaking', request2.id);

        // Vérifier que les deux sont toujours disponibles
        const [doc1, doc2] = await Promise.all([
          transaction.get(request1Ref),
          transaction.get(request2Ref)
        ]);

        if (!doc1.exists() || !doc2.exists()) {
          if (this.DEBUG_MODE) console.log('❌ One or both requests no longer exist');
          return;
        }
        
        const data1 = doc1.data() as MatchRequest;
        const data2 = doc2.data() as MatchRequest;
        
        if (data1.status !== 'waiting' || data2.status !== 'waiting') {
          if (this.DEBUG_MODE) console.log('❌ One or both requests no longer waiting', {
            status1: data1.status,
            status2: data2.status
          });
          return;
        }

        // Update both requests atomically
        transaction.update(request1Ref, {
          status: 'matched',
          matchedWith: request2.userId,
          matchedAt: serverTimestamp()
        });

        transaction.update(request2Ref, {
          status: 'matched',
          matchedWith: request1.userId,
          matchedAt: serverTimestamp()
        });

        if (this.DEBUG_MODE) console.log('✅ Match created successfully!');
      });

      // Clear from cache
      this.currentRequestCache.delete(request1.id);
      this.currentRequestCache.delete(request2.id);
      
    } catch (error) {
      console.error('❌ Error creating optimized match:', error);
    }
  }

  // 🤖 Créer un utilisateur de test automatique si pas de matches
  private static async createTestUserIfNeeded(originalRequest: MatchRequest): Promise<MatchRequest | null> {
    if (!this.DEBUG_MODE) return null;

    try {
      // Créer un utilisateur de test avec un rôle compatible
      const testRole = originalRequest.userProfile.role === 'talk' ? 'listen' : 
                     originalRequest.userProfile.role === 'listen' ? 'talk' : 'both';

      const testRequest: Omit<MatchRequest, 'id'> = {
        userId: `test-user-${Date.now()}`,
        userProfile: {
          username: `TestUser${Math.floor(Math.random() * 1000)}`,
          role: testRole,
          rating: 4.0,
          isAmbassador: false,
          isPremium: false
        },
        preferences: {
          preferredRole: 'any',
          avoidUsers: [],
          maxWaitTime: this.MAX_WAIT_TIME
        },
        status: 'waiting',
        createdAt: new Date()
      };

      const testRef = await addDoc(collection(db, 'matchmaking'), testRequest);
      
      const testMatchRequest = {
        id: testRef.id,
        ...testRequest
      };

      console.log('🤖 Created test user for matching:', {
        id: testMatchRequest.id,
        username: testMatchRequest.userProfile.username,
        role: testMatchRequest.userProfile.role
      });

      return testMatchRequest;
    } catch (error) {
      console.error('❌ Error creating test user:', error);
      return null;
    }
  }

  // 📡 Listener global ultra-simplifié (AUCUN index requis)
  private static setupGlobalMatchListener(): void {
    try {
      // Requête ULTRA-simple : seulement un where, pas d'orderBy
      const q = query(
        collection(db, 'matchmaking'),
        where('status', '==', 'waiting'),
        limit(100) // On trie en mémoire
      );
      
      this.globalMatchUnsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const newRequest = { 
              id: change.doc.id, 
              ...change.doc.data() 
            } as MatchRequest;
            
            // Cache la nouvelle requête
            this.currentRequestCache.set(newRequest.id, newRequest);
            
            // Essai de match instantané
            setTimeout(() => this.tryInstantMatch(newRequest.id), 50);
          }
        });
      });
      
      this.globalListenerActive = true;
    } catch (error) {
      console.error('Error setting up global listener:', error);
    }
  }

  // 🧹 Nettoyer les anciens utilisateurs de test
  private static async cleanupTestUsers(): Promise<void> {
    if (!this.DEBUG_MODE) return;
    
    try {
      const q = query(
        collection(db, 'matchmaking'),
        where('status', 'in', ['waiting', 'cancelled', 'expired']),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const deletePromises: Promise<void>[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data() as MatchRequest;
        if (data.userId.startsWith('test-user-')) {
          const createdTime = (data.createdAt as any).toMillis ? 
            (data.createdAt as any).toMillis() : 
            new Date(data.createdAt).getTime();
          
          // Supprimer les utilisateurs de test de plus de 5 minutes
          if (Date.now() - createdTime > 300000) {
            deletePromises.push(deleteDoc(doc.ref));
          }
        }
      });
      
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        console.log(`🧹 Cleaned up ${deletePromises.length} test users`);
      }
    } catch (error) {
      console.error('Error cleaning up test users:', error);
    }
  }
  // 🧹 Nettoyage de cache périodique (sans utilisateurs de test)
  private static setupCacheCleanup(): void {
    this.cacheCleanupInterval = setInterval(() => {
      this.clearExpiredCache();
      // Supprimé le nettoyage des utilisateurs de test
    }, 5000); // Nettoyer toutes les 5 secondes
  }

  private static clearExpiredCache(): void {
    const now = Date.now();
    
    // Clear compatibility cache
    this.compatibleMatchesCache.forEach((value, key) => {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.compatibleMatchesCache.delete(key);
      }
    });
    
    // Clear user profile cache
    this.userProfileCache.forEach((value, key) => {
      if (now - value.timestamp > 10000) { // 10 secondes pour les profils
        this.userProfileCache.delete(key);
      }
    });
  }

  // 👤 Get partner profile avec cache
  private static async getCachedPartnerProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Check cache first
      const cached = this.userProfileCache.get(userId);
      if (cached && Date.now() - cached.timestamp < 10000) {
        return cached.profile;
      }

      // Fetch from database
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const profile = {
          uid: userDoc.id,
          ...userDoc.data()
        } as UserProfile;
        
        // Cache the result
        this.userProfileCache.set(userId, {
          profile,
          timestamp: Date.now()
        });
        
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached partner profile:', error);
      return null;
    }
  }

  // ❌ Cancel match (inchangé)
  static async cancelMatch(requestId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'matchmaking', requestId), {
        status: 'cancelled'
      });
      
      this.cleanupMatchListener(requestId);
      this.currentRequestCache.delete(requestId);
    } catch (error) {
      console.error('Error cancelling match:', error);
    }
  }

  // ⏭️ Skip partner optimisé
  static async skipPartner(
    userId: string,
    currentPartnerId: string,
    skipCount: number
  ): Promise<{ needsAd: boolean; requestId?: string; promise?: Promise<MatchResult> }> {
    try {
      if (skipCount >= this.MAX_SKIP_COUNT) {
        return { needsAd: true };
      }

      const avoidList = [currentPartnerId];
      
      // Check cache first
      let userProfile = this.userProfileCache.get(userId)?.profile;
      
      if (!userProfile) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
          throw new Error('User not found');
        }
        
        userProfile = {
          uid: userDoc.id,
          ...userDoc.data()
        } as UserProfile;
        
        this.userProfileCache.set(userId, {
          profile: userProfile,
          timestamp: Date.now()
        });
      }

      const { requestId, promise } = await this.findMatch(userProfile, avoidList);
      
      return { needsAd: false, requestId, promise };
    } catch (error: any) {
      console.error('Error skipping partner:', error);
      throw new Error('Failed to skip partner');
    }
  }

  // 🤖 AI Chat Partner (inchangé)
  static getAIChatPartner() {
    return {
      id: 'ai-assistant',
      username: '@SafetalkAI',
      rating: 5.0,
      isAmbassador: true,
      isPremium: true
    };
  }

  // 🧹 Cleanup functions
  private static async cleanupMatchRequests(requestIds: string[]): Promise<void> {
    try {
      const deletePromises = requestIds.map(id => {
        this.currentRequestCache.delete(id);
        return deleteDoc(doc(db, 'matchmaking', id));
      });
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error cleaning up match requests:', error);
    }
  }

  private static cleanupMatchListener(requestId: string): void {
    const unsubscribe = this.matchListeners.get(requestId);
    if (unsubscribe) {
      unsubscribe();
      this.matchListeners.delete(requestId);
    }

    const intervalId = this.matchIntervals.get(requestId);
    if (intervalId) {
      clearInterval(intervalId);
      this.matchIntervals.delete(requestId);
    }
  }

  static cleanup(): void {
    // Cleanup listeners
    this.matchListeners.forEach(unsubscribe => unsubscribe());
    this.matchListeners.clear();
    
    // Cleanup intervals
    this.matchIntervals.forEach(intervalId => clearInterval(intervalId));
    this.matchIntervals.clear();
    
    // Cleanup global listener
    if (this.globalMatchUnsubscribe) {
      this.globalMatchUnsubscribe();
      this.globalListenerActive = false;
    }
    
    // Cleanup cache interval
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
    }
    
    // Clear caches
    this.currentRequestCache.clear();
    this.compatibleMatchesCache.clear();
    this.userProfileCache.clear();
  }

  // 📊 Stats avec cache
  static async getMatchStats(): Promise<{
    waitingCount: number;
    activeMatches: number;
    averageWaitTime: number;
  }> {
    try {
      const [waitingSnapshot, matchedSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'matchmaking'), where('status', '==', 'waiting'))),
        getDocs(query(collection(db, 'matchmaking'), where('status', '==', 'matched')))
      ]);

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
        averageWaitTime: Math.floor(averageWaitTime / 1000)
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