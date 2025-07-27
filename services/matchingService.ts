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
import { PresenceService, UserPresence } from './presenceService';

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
  // ⚡ Configuration optimisée
  private static readonly MAX_WAIT_TIME = 30000; // 30 secondes (augmenté)
  private static readonly MAX_SKIP_COUNT = 5;
  private static readonly CACHE_TTL = 1000; // 1 seconde
  private static readonly INSTANT_MATCH_DELAY = 50; // 50ms
  private static readonly PRESENCE_CHECK_INTERVAL = 2000; // 2 secondes
  
  // 🧠 Cache intelligent
  private static currentRequestCache = new Map<string, MatchRequest>();
  private static compatibleMatchesCache = new Map<string, CachedMatches>();
  private static userProfileCache = new Map<string, { profile: UserProfile; timestamp: number }>();
  
  // 📡 Listeners et intervals
  private static matchListeners = new Map<string, () => void>();
  private static globalListenerActive = false;
  private static globalMatchUnsubscribe: (() => void) | null = null;
  private static cacheCleanupInterval: NodeJS.Timeout | null = null;

  // 🔥 Point d'entrée principal - Enhanced avec présence temps réel
  static async findMatch(
    user: UserProfile,
    avoidUsers: string[] = [],
    preferredRole: 'talk' | 'listen' | 'both' | 'any' = 'any'
  ): Promise<{ requestId: string; promise: Promise<MatchResult> }> {
    try {
      console.log('🔍 MatchingService: Starting enhanced match search for:', user.username);
      
      // 1. Marquer l'utilisateur comme "searching" dans la présence
      await PresenceService.updateUserStatus('searching', {
        userId: user.uid,
        username: user.username,
        role: user.role,
        isPremium: user.isPremium,
        isAmbassador: user.isAmbassador || false,
      });

      // 2. Nettoyer les anciennes requêtes du même utilisateur
      await this.cleanupUserRequests(user.uid);

      // 3. Setup listener global si pas déjà fait
      if (!this.globalListenerActive) {
        this.setupGlobalMatchListener();
        this.setupCacheCleanup();
      }

      // 4. Essayer un match instantané avec les utilisateurs en ligne
      const instantMatch = await this.tryInstantPresenceMatch(user, avoidUsers, preferredRole);
      if (instantMatch) {
        console.log('⚡ MatchingService: Instant presence match found!');
        await PresenceService.updateUserStatus('in_chat', { currentChatId: instantMatch.chatId });
        return {
          requestId: 'instant',
          promise: Promise.resolve(instantMatch)
        };
      }

      // 5. Si pas de match instantané, créer une requête normale
      const matchRequest: Omit<MatchRequest, 'id'> = {
        userId: user.uid,
        userProfile: {
          username: user.username,
          role: user.role,
          rating: 4.5,
          isAmbassador: user.isAmbassador || false,
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

      console.log('📝 MatchingService: Created fallback match request:', requestId);

      // 6. Cache la requête
      this.currentRequestCache.set(requestId, {
        id: requestId,
        ...matchRequest
      });

      // 7. Démarrer process normal avec priorité présence
      const matchPromise = this.startEnhancedMatchingProcess(requestId, user);

      return { requestId, promise: matchPromise };
    } catch (error: any) {
      console.error('❌ MatchingService: Error starting enhanced match search:', error);
      // Revenir au statut online en cas d'erreur
      await PresenceService.updateUserStatus('online');
      throw new Error('Failed to start match search');
    }
  }

  // ⚡ Tentative de match instantané avec les utilisateurs en ligne
  private static async tryInstantPresenceMatch(
    user: UserProfile,
    avoidUsers: string[] = [],
    preferredRole: 'talk' | 'listen' | 'both' | 'any' = 'any'
  ): Promise<MatchResult | null> {
    try {
      // Obtenir les utilisateurs disponibles depuis la présence temps réel
      const availableUsers = await PresenceService.getAvailableUsers(
        [...avoidUsers, user.uid], 
        preferredRole
      );

      if (availableUsers.length === 0) {
        console.log('📭 MatchingService: No users available in real-time presence');
        return null;
      }

      // Trier par priorité : Premium users first, then by search time
      const sortedUsers = availableUsers.sort((a, b) => {
        // Premium users en premier
        if (a.isPremium && !b.isPremium) return -1;
        if (!a.isPremium && b.isPremium) return 1;
        
        // Puis par temps de recherche (plus ancien = priorité)
        const timeA = a.searchingTimestamp || 0;
        const timeB = b.searchingTimestamp || 0;
        return timeA - timeB;
      });

      const partner = sortedUsers[0];
      console.log('👥 MatchingService: Found real-time partner:', partner.username);

      // 🆕 Essayer de récupérer le profil complet du partenaire depuis Firestore
      let partnerProfile = await this.getCachedPartnerProfile(partner.userId);
      
      if (!partnerProfile) {
        // 🆕 Fallback: créer un profil basique à partir des données de présence
        console.log('⚠️ MatchingService: Creating fallback profile for partner');
        partnerProfile = {
          uid: partner.userId,
          username: partner.username,
          email: undefined,
          phoneNumber: undefined,  
          role: partner.role,
          isPremium: partner.isPremium,
          isAmbassador: partner.isAmbassador,
          credits: partner.credits || 5,
          giftableCredits: 0,
          dailyFreeTimeUsed: 0,
          paidTimeAvailable: 0,
          partnerChangeCount: partner.partnerChangeCount || 0,
          dailyResetDate: new Date().toDateString(),
          hasCompletedSetup: true, // Assumé car présent dans la recherche
          referralCode: `ST${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          referredBy: undefined,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString() // ✅ Nom de champ corrigé
        } as UserProfile;
      }

      const chatSession = await ChatService.createChatSession(user, partnerProfile, 'human', false);

      // Mettre à jour le statut des deux utilisateurs
      await Promise.all([
        PresenceService.updateUserStatus('in_chat', { currentChatId: chatSession.id }),
        this.updatePartnerStatus(partner.userId, 'in_chat', chatSession.id)
      ]);

      return {
        success: true,
        chatId: chatSession.id,
        partner: {
          id: partner.userId,
          username: partner.username,
          rating: 4.5,
          isAmbassador: partner.isAmbassador,
          isPremium: partner.isPremium
        }
      };

    } catch (error) {
      console.error('❌ MatchingService: Error in instant presence match:', error);
      return null;
    }
  }

  // 🚀 Processus de matching amélioré avec présence
  private static async startEnhancedMatchingProcess(requestId: string, user: UserProfile): Promise<MatchResult> {
    return new Promise((resolve) => {
      let resolved = false;
      let timeoutId: NodeJS.Timeout;
      let presenceCheckInterval: NodeJS.Timeout;

      console.log('⏰ MatchingService: Starting enhanced matching with presence checks');

      // Vérification périodique de la présence (toutes les 2 secondes)
      presenceCheckInterval = setInterval(async () => {
        if (resolved) return;

        try {
          const instantMatch = await this.tryInstantPresenceMatch(user, [], 'any');
          if (instantMatch) {
            resolved = true;
            clearTimeout(timeoutId);
            clearInterval(presenceCheckInterval);
            
            // Nettoyer la requête Firestore
            await this.cleanupMatchRequests([requestId]);
            
            resolve(instantMatch);
          }
        } catch (error) {
          console.error('❌ MatchingService: Error in presence check:', error);
        }
      }, this.PRESENCE_CHECK_INTERVAL);

      // Timeout final
      timeoutId = setTimeout(async () => {
        if (resolved) return;
        resolved = true;
        
        clearInterval(presenceCheckInterval);
        
        console.log('⏰ MatchingService: Enhanced timeout reached');
        
        try {
          await updateDoc(doc(db, 'matchmaking', requestId), {
            status: 'expired'
          });
          
          // Revenir au statut online
          await PresenceService.updateUserStatus('online');
          
          this.cleanupMatchListener(requestId);
          
          resolve({
            success: false,
            error: 'No matches found. Try again later.'
          });
        } catch (error) {
          await PresenceService.updateUserStatus('online');
          resolve({
            success: false,
            error: 'Matching timeout'
          });
        }
      }, this.MAX_WAIT_TIME);

      // Fallback: listener Firestore normal (au cas où)
      const requestRef = doc(db, 'matchmaking', requestId);
      const unsubscribe = onSnapshot(requestRef, async (doc) => {
        if (resolved) return;
        
        if (doc.exists()) {
          const data = doc.data() as MatchRequest;
          
          if (data.status === 'matched' && data.matchedWith) {
            resolved = true;
            clearTimeout(timeoutId);
            clearInterval(presenceCheckInterval);
            
            try {
              const partner = await this.getCachedPartnerProfile(data.matchedWith);
              if (!partner) {
                throw new Error('Partner not found');
              }

              const chatSession = await ChatService.createChatSession(user, partner, 'human', false);
              await Promise.all([
                PresenceService.updateUserStatus('in_chat', { currentChatId: chatSession.id }),
                this.cleanupMatchRequests([requestId, data.matchedWith])
              ]);
              
              resolve({
                success: true,
                chatId: chatSession.id,
                partner: {
                  id: partner.uid,
                  username: partner.username,
                  rating: 4.5,
                  isAmbassador: partner.isAmbassador || false,
                  isPremium: partner.isPremium
                }
              });
            } catch (error: any) {
              await PresenceService.updateUserStatus('online');
              resolve({
                success: false,
                error: 'Failed to create chat session'
              });
            }
          }
        }
      });

      this.matchListeners.set(requestId, unsubscribe);
    });
  }

  // 🧹 Nettoyer les anciennes requêtes du même utilisateur
  private static async cleanupUserRequests(userId: string): Promise<void> {
    try {      
      const q = query(
        collection(db, 'matchmaking'),
        where('userId', '==', userId),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const deletePromises: Promise<void>[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data() as MatchRequest;
        if (['waiting', 'cancelled', 'expired'].includes(data.status)) {
          deletePromises.push(deleteDoc(doc.ref));
          this.currentRequestCache.delete(doc.id);
        }
      });
      
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
      }
    } catch (error) {
      console.error('❌ Error cleaning up user requests:', error);
    }
  }

  // ⚡ Tentative de match optimisée
  private static async attemptOptimizedMatch(requestId: string): Promise<void> {
    try {
      let currentRequest = this.currentRequestCache.get(requestId);
      
      if (!currentRequest) {
        const requestDoc = await getDoc(doc(db, 'matchmaking', requestId));
        if (!requestDoc.exists()) {
          return;
        }
        
        currentRequest = {
          id: requestDoc.id,
          ...requestDoc.data()
        } as MatchRequest;
        
        this.currentRequestCache.set(requestId, currentRequest);
      }

      if (currentRequest.status !== 'waiting') {
        return;
      }

      this.clearExpiredCache();

      const compatibleMatches = await this.findOptimizedCompatibleMatches(currentRequest);

      if (compatibleMatches.length > 0) {
        await this.createOptimizedMatch(currentRequest, compatibleMatches[0]);
      }
    } catch (error) {
      console.error('❌ Error attempting optimized match:', error);
    }
  }

  // 🎯 Recherche de matches compatibles
  private static async findOptimizedCompatibleMatches(request: MatchRequest): Promise<MatchRequest[]> {
    try {
      const cacheKey = `${request.id}-${request.userProfile.role}`;
      const cached = this.compatibleMatchesCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        const filteredMatches = cached.matches.filter(m => this.isQuickCompatible(request, m));
        return this.prioritizeMatches(filteredMatches);
      }

      const queries = this.buildOptimizedQueries(request);
      const queryPromises = queries.map(q => getDocs(q));
      const results = await Promise.all(queryPromises);
      
      const potentialMatches: MatchRequest[] = [];
      
      results.forEach(snapshot => {
        snapshot.forEach(doc => {
          const match = { id: doc.id, ...doc.data() } as MatchRequest;
          
          if (match.userId !== request.userId && 
              this.isVeryPermissiveCompatible(request, match)) {
            potentialMatches.push(match);
          }
        });
      });

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

  // 🚀 Compatibilité ultra-permissive
  private static isVeryPermissiveCompatible(request1: MatchRequest, request2: MatchRequest): boolean {
    if (request1.userId === request2.userId) {
      return false;
    }
    
    if (request2.status !== 'waiting') {
      return false;
    }
    
    if (request1.preferences.avoidUsers.includes(request2.userId)) {
      return false;
    }

    const role1 = request1.userProfile.role;
    const role2 = request2.userProfile.role;

    if (role1 === 'talk' && role2 === 'talk') {
      return false;
    }
    if (role1 === 'listen' && role2 === 'listen') {
      return false;
    }
    return true;
  }

  // 🏗️ Requêtes ultra-simplifiées
  private static buildOptimizedQueries(request: MatchRequest): Query[] {
    const queries: Query[] = [];
    const baseCollection = collection(db, 'matchmaking');
    
    queries.push(query(
      baseCollection,
      where('status', '==', 'waiting'),
      limit(50)
    ));
    
    return queries;
  }

  // ⚡ Vérification rapide de compatibilité
  private static isQuickCompatible(request1: MatchRequest, request2: MatchRequest): boolean {
    if (request1.userId === request2.userId) return false;
    
    if (request1.preferences.avoidUsers.includes(request2.userId) ||
        request2.preferences.avoidUsers.includes(request1.userId)) {
      return false;
    }

    const role1 = request1.userProfile.role;
    const role2 = request2.userProfile.role;

    if (role1 === 'talk' && role2 === 'talk') return false;
    if (role1 === 'listen' && role2 === 'listen') return false;

    if ((role1 === 'talk' && role2 === 'listen') || 
        (role1 === 'listen' && role2 === 'talk') ||
        role1 === 'both' || role2 === 'both') {
      return true;
    }

    return false;
  }

  // 🏆 Priorisation intelligente des matches
  private static prioritizeMatches(matches: MatchRequest[]): MatchRequest[] {
    return matches.sort((a, b) => {
      if (a.userProfile.isPremium && !b.userProfile.isPremium) return -1;
      if (!a.userProfile.isPremium && b.userProfile.isPremium) return 1;
      
      const timeA = (a.createdAt as any).toMillis ? (a.createdAt as any).toMillis() : new Date(a.createdAt as any).getTime();
      const timeB = (b.createdAt as any).toMillis ? (b.createdAt as any).toMillis() : new Date(b.createdAt as any).getTime();
      return timeA - timeB;
    });
  }

  // ⚡ Création de match optimisée
  private static async createOptimizedMatch(request1: MatchRequest, request2: MatchRequest): Promise<void> {
    try {
      console.log('🤝 MatchingService: Creating match between:', {
        user1: request1.userProfile.username,
        user2: request2.userProfile.username
      });

      await runTransaction(db, async (transaction) => {
        const request1Ref = doc(db, 'matchmaking', request1.id);
        const request2Ref = doc(db, 'matchmaking', request2.id);

        const [doc1, doc2] = await Promise.all([
          transaction.get(request1Ref),
          transaction.get(request2Ref)
        ]);

        if (!doc1.exists() || !doc2.exists()) {
          return;
        }
        
        const data1 = doc1.data() as MatchRequest;
        const data2 = doc2.data() as MatchRequest;
        
        if (data1.status !== 'waiting' || data2.status !== 'waiting') {
          return;
        }

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

        console.log('✅ MatchingService: Match created successfully in database');
      });

      this.currentRequestCache.delete(request1.id);
      this.currentRequestCache.delete(request2.id);
      
    } catch (error) {
      console.error('❌ MatchingService: Error creating optimized match:', error);
    }
  }

  // 🤝 Mettre à jour le statut du partenaire
  private static async updatePartnerStatus(partnerId: string, status: string, chatId?: string): Promise<void> {
    try {
      console.log(`🤝 MatchingService: Updating partner ${partnerId} status to ${status}`);
      // Note: En pratique, chaque utilisateur gère son propre statut
      // Mais on peut l'aider ici pour éviter les race conditions
    } catch (error) {
      console.error('❌ MatchingService: Error updating partner status:', error);
    }
  }

  // 📡 Listener global simplifié
  private static setupGlobalMatchListener(): void {
    try {
      const q = query(
        collection(db, 'matchmaking'),
        where('status', '==', 'waiting'),
        limit(100)
      );
      
      this.globalMatchUnsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const newRequest = { 
              id: change.doc.id, 
              ...change.doc.data() 
            } as MatchRequest;
            
            this.currentRequestCache.set(newRequest.id, newRequest);
            setTimeout(() => this.attemptOptimizedMatch(newRequest.id), 50);
          }
        });
      });
      
      this.globalListenerActive = true;
    } catch (error) {
      console.error('❌ Error setting up global listener:', error);
    }
  }

  // 🧹 Nettoyage de cache périodique
  private static setupCacheCleanup(): void {
    this.cacheCleanupInterval = setInterval(() => {
      this.clearExpiredCache();
    }, 5000);
  }

  private static clearExpiredCache(): void {
    const now = Date.now();
    
    this.compatibleMatchesCache.forEach((value, key) => {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.compatibleMatchesCache.delete(key);
      }
    });
    
    this.userProfileCache.forEach((value, key) => {
      if (now - value.timestamp > 10000) {
        this.userProfileCache.delete(key);
      }
    });
  }

  // 👤 Get partner profile avec cache (✅ VERSION CORRIGÉE)
  private static async getCachedPartnerProfile(userId: string): Promise<UserProfile | null> {
    try {
      const cached = this.userProfileCache.get(userId);
      if (cached && Date.now() - cached.timestamp < 10000) {
        return cached.profile;
      }

      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const profile: UserProfile = {
          uid: userDoc.id,
          username: data.username || 'Unknown User',
          email: data.email,
          phoneNumber: data.phoneNumber,
          role: data.role || 'both',
          isPremium: data.isPremium || false,
          isAmbassador: data.isAmbassador || false,
          credits: data.credits || 5,
          giftableCredits: data.giftableCredits || 0,
          dailyFreeTimeUsed: data.dailyFreeTimeUsed || 0,
          paidTimeAvailable: data.paidTimeAvailable || 0,
          partnerChangeCount: data.partnerChangeCount || 0,
          dailyResetDate: data.dailyResetDate || new Date().toDateString(),
          hasCompletedSetup: data.hasCompletedSetup || true,
          referralCode: data.referralCode || `ST${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          referredBy: data.referredBy,
          createdAt: data.createdAt || new Date().toISOString(),
          lastActiveAt: data.lastActiveAt || new Date().toISOString() // ✅ Nom de champ corrigé
        };
        
        this.userProfileCache.set(userId, {
          profile,
          timestamp: Date.now()
        });
        
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('❌ MatchingService: Error getting cached partner profile:', error);
      return null;
    }
  }

  // ❌ Cancel match
  static async cancelMatch(requestId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'matchmaking', requestId), {
        status: 'cancelled'
      });
      
      this.cleanupMatchListener(requestId);
      this.currentRequestCache.delete(requestId);
      
      // Revenir au statut online
      await PresenceService.updateUserStatus('online');
    } catch (error) {
      console.error('❌ Error cancelling match:', error);
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
      console.error('❌ Error skipping partner:', error);
      throw new Error('Failed to skip partner');
    }
  }

  // 🤖 AI Chat Partner
  static getAIChatPartner() {
    return {
      id: 'ai-assistant',
      username: '@SafetalkAI',
      rating: 5.0,
      isAmbassador: true,
      isPremium: true
    };
  }

  // 📊 Obtenir les statistiques de matching avec présence
  static async getEnhancedMatchStats(): Promise<{
    presenceStats: any;
    matchingStats: any;
  }> {
    try {
      const [presenceStats, matchingStats] = await Promise.all([
        PresenceService.getPresenceStats(),
        this.getMatchStats()
      ]);

      return {
        presenceStats,
        matchingStats
      };
    } catch (error) {
      console.error('❌ MatchingService: Error getting enhanced stats:', error);
      return {
        presenceStats: { totalOnline: 0, searching: 0, inChat: 0, available: 0 },
        matchingStats: { waitingCount: 0, activeMatches: 0, averageWaitTime: 0 }
      };
    }
  }

  // 📊 Stats avec cache (méthode originale)
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
      console.error('❌ Error getting match stats:', error);
      return {
        waitingCount: 0,
        activeMatches: 0,
        averageWaitTime: 0
      };
    }
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
      console.error('❌ Error cleaning up match requests:', error);
    }
  }

  private static cleanupMatchListener(requestId: string): void {
    const unsubscribe = this.matchListeners.get(requestId);
    if (unsubscribe) {
      unsubscribe();
      this.matchListeners.delete(requestId);
    }
  }

  // 🧹 Cleanup amélioré avec présence
  static cleanup(): void {
    console.log('🧹 MatchingService: Enhanced cleanup...');
    
    // Cleanup standard
    this.matchListeners.forEach(unsubscribe => unsubscribe());
    this.matchListeners.clear();
    
    if (this.globalMatchUnsubscribe) {
      this.globalMatchUnsubscribe();
      this.globalListenerActive = false;
    }
    
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
    }
    
    this.currentRequestCache.clear();
    this.compatibleMatchesCache.clear();
    this.userProfileCache.clear();
    
    // Cleanup présence
    PresenceService.endPresence();
    
    console.log('✅ MatchingService: Enhanced cleanup completed');
  }
}