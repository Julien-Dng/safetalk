// src/services/presenceService.ts
import { 
  ref, 
  set, 
  onValue, 
  onDisconnect, 
  serverTimestamp,
  push,
  remove,
  query,
  orderByChild,
  equalTo,
  get
} from 'firebase/database';
import { auth, database } from '../config/firebase'; 
import { UserProfile } from './authService';

export type UserStatus = 'online' | 'searching' | 'in_chat' | 'offline';

export interface UserPresence {
  userId: string;
  username: string;
  status: UserStatus;
  role: 'talk' | 'listen' | 'both';
  isPremium: boolean;
  isAmbassador: boolean;
  lastSeen: number;
  currentChatId?: string;
  searchingTimestamp?: number;
  credits?: number;
  partnerChangeCount?: number;
}

export interface PresenceStats {
  totalOnline: number;
  searching: number;
  inChat: number;
  available: number;
}

export class PresenceService {
  private static database = database;
  private static currentUserId: string | null = null;
  private static presenceRef: any = null;
  private static connectedRef: any = null;
  private static listeners: Map<string, () => void> = new Map();

  // 🔥 Initialiser la présence pour un utilisateur (signatures multiples)
  static async initializePresence(userProfile: UserProfile): Promise<void>;
  static async initializePresence(
    userId: string, 
    username: string, 
    role: 'talk' | 'listen' | 'both',
    isPremium?: boolean,
    isAmbassador?: boolean
  ): Promise<void>;
  static async initializePresence(
    userProfileOrId: UserProfile | string,
    username?: string,
    role?: 'talk' | 'listen' | 'both',
    isPremium: boolean = false,
    isAmbassador: boolean = false
  ): Promise<void> {
    try {
      // Déterminer les paramètres selon le type d'entrée
      let userId: string;
      let userUsername: string;
      let userRole: 'talk' | 'listen' | 'both';
      let userIsPremium: boolean;
      let userIsAmbassador: boolean;
      let userCredits: number | undefined;
      let userPartnerChangeCount: number | undefined;

      if (typeof userProfileOrId === 'string') {
        // Signature originale avec paramètres séparés
        if (!username || !role) {
          throw new Error('Username and role are required when using string userId');
        }
        userId = userProfileOrId;
        userUsername = username;
        userRole = role;
        userIsPremium = isPremium;
        userIsAmbassador = isAmbassador;
      } else {
        // Nouvelle signature avec UserProfile complet
        const profile = userProfileOrId;
        userId = profile.uid;
        userUsername = profile.username;
        userRole = profile.role;
        userIsPremium = profile.isPremium;
        userIsAmbassador = profile.isAmbassador || false;
        userCredits = profile.credits;
        userPartnerChangeCount = profile.partnerChangeCount;
      }

      this.currentUserId = userId;
      console.log('🟢 PresenceService: Initializing presence for', userUsername);

      // Référence à la présence de l'utilisateur
      this.presenceRef = ref(this.database, `presence/${userId}`);
      
      // Référence pour détecter la connexion
      this.connectedRef = ref(this.database, '.info/connected');

      // Écouter les changements de connexion
      onValue(this.connectedRef, (snapshot) => {
        if (snapshot.val() === true) {
          console.log('🔗 PresenceService: Connected to Firebase Realtime Database');
          
          // Définir la présence avec toutes les données du profil
          const presenceData: UserPresence = {
            userId,
            username: userUsername,
            status: 'online',
            role: userRole,
            isPremium: userIsPremium,
            isAmbassador: userIsAmbassador,
            lastSeen: Date.now(),
            credits: userCredits,
            partnerChangeCount: userPartnerChangeCount
          };

          set(this.presenceRef, presenceData);
          console.log('✅ PresenceService: Presence data set for', userUsername);

          // Configurer la suppression automatique lors de la déconnexion
          onDisconnect(this.presenceRef).remove();
          
        } else {
          console.log('🔌 PresenceService: Disconnected from Firebase Realtime Database');
        }
      });

    } catch (error) {
      console.error('❌ PresenceService: Error initializing presence:', error);
      throw error;
    }
  }

  // 🔄 Mettre à jour le statut utilisateur
  static async updateUserStatus(status: UserStatus, additionalData?: Partial<UserPresence>): Promise<void> {
    if (!this.currentUserId || !this.presenceRef) {
      console.warn('⚠️ PresenceService: No active presence session');
      return;
    }

    try {
      const updateData = {
        status,
        lastSeen: Date.now(),
        ...additionalData
      };

      if (status === 'searching') {
        updateData.searchingTimestamp = Date.now();
        console.log('🔍 PresenceService: User started searching');
      }

      // Mise à jour partielle pour préserver les autres données
      const currentData = await get(this.presenceRef);
      if (currentData.exists()) {
        const mergedData = { ...currentData.val(), ...updateData };
        await set(this.presenceRef, mergedData);
      } else {
        await set(this.presenceRef, updateData);
      }

      console.log(`🔄 PresenceService: Status updated to ${status} for user ${this.currentUserId}`);
    } catch (error) {
      console.error('❌ PresenceService: Error updating status:', error);
    }
  }

  // 🔍 Obtenir les utilisateurs disponibles pour le matchmaking
  static async getAvailableUsers(
    excludeUserIds: string[] = [],
    preferredRole?: 'talk' | 'listen' | 'both' | 'any'
  ): Promise<UserPresence[]> {
    try {
      console.log('🔍 PresenceService: Looking for available users, excluding:', excludeUserIds);
      
      const presenceRef = ref(this.database, 'presence');
      const searchingQuery = query(presenceRef, orderByChild('status'), equalTo('searching'));
      
      const snapshot = await get(searchingQuery);
      const availableUsers: UserPresence[] = [];

      if (snapshot.exists()) {
        console.log('📊 PresenceService: Found users with "searching" status');
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val() as UserPresence;
          
          console.log(`👤 Checking user: ${userData.username} (${userData.userId}) - Role: ${userData.role}`);
          
          // Filtrer les utilisateurs exclus
          if (excludeUserIds.includes(userData.userId)) {
            console.log(`❌ Excluding user ${userData.username} (in exclude list)`);
            return;
          }

          // Vérifier que l'utilisateur cherche depuis moins de 5 minutes
          const searchTime = userData.searchingTimestamp || 0;
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
          
          if (searchTime > fiveMinutesAgo) {
            console.log(`✅ Adding user ${userData.username} to available list`);
            availableUsers.push(userData);
          } else {
            console.log(`❌ User ${userData.username} search time too old`);
          }
        });
      } else {
        console.log('📭 PresenceService: No users with "searching" status found');
      }

      // Filtrer par compatibilité de rôle si spécifié
      if (preferredRole && preferredRole !== 'any') {
        const compatibleUsers = availableUsers.filter(user => {
          const compatible = this.isRoleCompatible(preferredRole, user.role);
          console.log(`🤝 Role compatibility ${preferredRole} + ${user.role} = ${compatible}`);
          return compatible;
        });
        console.log(`🔍 PresenceService: ${compatibleUsers.length}/${availableUsers.length} users are role-compatible`);
        return compatibleUsers;
      }

      console.log(`🔍 PresenceService: Found ${availableUsers.length} total available users`);
      return availableUsers;
    } catch (error) {
      console.error('❌ PresenceService: Error getting available users:', error);
      return [];
    }
  }

  // 📊 Obtenir les statistiques de présence
  static async getPresenceStats(): Promise<PresenceStats> {
    try {
      const presenceRef = ref(this.database, 'presence');
      const snapshot = await get(presenceRef);
      
      const stats: PresenceStats = {
        totalOnline: 0,
        searching: 0,
        inChat: 0,
        available: 0
      };

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val() as UserPresence;
          const now = Date.now();
          
          // Considérer comme online si vu dans les 2 dernières minutes
          if (now - userData.lastSeen < 2 * 60 * 1000) {
            stats.totalOnline++;
            
            switch (userData.status) {
              case 'searching':
                stats.searching++;
                break;
              case 'in_chat':
                stats.inChat++;
                break;
              case 'online':
                stats.available++;
                break;
            }
          }
        });
      }

      console.log('📊 PresenceService: Current stats:', stats);
      return stats;
    } catch (error) {
      console.error('❌ PresenceService: Error getting stats:', error);
      return { totalOnline: 0, searching: 0, inChat: 0, available: 0 };
    }
  }

  // 👂 Écouter les changements de présence
  static subscribeToPresenceUpdates(
    callback: (users: UserPresence[]) => void
  ): () => void {
    try {
      const presenceRef = ref(this.database, 'presence');
      
      const unsubscribe = onValue(presenceRef, (snapshot) => {
        const users: UserPresence[] = [];
        
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            users.push(childSnapshot.val() as UserPresence);
          });
        }
        
        console.log('📡 PresenceService: Presence update received, total users:', users.length);
        callback(users);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ PresenceService: Error subscribing to presence:', error);
      return () => {};
    }
  }

  // 🧹 Nettoyer les anciennes présences
  static async cleanupOldPresences(): Promise<void> {
    try {
      const presenceRef = ref(this.database, 'presence');
      const snapshot = await get(presenceRef);
      
      if (snapshot.exists()) {
        const now = Date.now();
        const fifteenMinutesAgo = now - (15 * 60 * 1000);
        let cleanedCount = 0;
        
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val() as UserPresence;
          
          // Supprimer les présences de plus de 15 minutes
          if (userData.lastSeen < fifteenMinutesAgo) {
            remove(childSnapshot.ref);
            cleanedCount++;
          }
        });
        
        if (cleanedCount > 0) {
          console.log(`🧹 PresenceService: Cleaned up ${cleanedCount} old presences`);
        }
      }
    } catch (error) {
      console.error('❌ PresenceService: Error cleaning up old presences:', error);
    }
  }

  // 🔒 Terminer la session de présence
  static async endPresence(): Promise<void> {
    try {
      if (this.presenceRef) {
        await remove(this.presenceRef);
        console.log('🔴 PresenceService: Presence ended for user', this.currentUserId);
      }
      
      // Nettoyer les listeners
      this.listeners.forEach(unsubscribe => unsubscribe());
      this.listeners.clear();
      
      this.currentUserId = null;
      this.presenceRef = null;
      this.connectedRef = null;
    } catch (error) {
      console.error('❌ PresenceService: Error ending presence:', error);
    }
  }

  // 🆕 Méthode utilitaire pour synchroniser avec UserProfile
  static async syncWithUserProfile(userProfile: UserProfile): Promise<void> {
    if (!this.currentUserId || this.currentUserId !== userProfile.uid) {
      console.warn('⚠️ PresenceService: No active session or user mismatch');
      return;
    }

    try {
      await this.updateUserStatus('online', {
        username: userProfile.username,
        role: userProfile.role,
        isPremium: userProfile.isPremium,
        isAmbassador: userProfile.isAmbassador || false,
        credits: userProfile.credits,
        partnerChangeCount: userProfile.partnerChangeCount
      });
      console.log('🔄 PresenceService: Synced with UserProfile');
    } catch (error) {
      console.error('❌ PresenceService: Error syncing with UserProfile:', error);
    }
  }

  // 🧪 Debug: Obtenir toutes les présences
  static async getAllPresences(): Promise<UserPresence[]> {
    try {
      const presenceRef = ref(this.database, 'presence');
      const snapshot = await get(presenceRef);
      const presences: UserPresence[] = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          presences.push(childSnapshot.val() as UserPresence);
        });
      }
      
      console.log(`🧪 PresenceService: Retrieved ${presences.length} total presences`);
      return presences;
    } catch (error) {
      console.error('❌ PresenceService: Error getting all presences:', error);
      return [];
    }
  }

  // 🤝 Vérifier la compatibilité des rôles (méthode privée)
  private static isRoleCompatible(role1: string, role2: string): boolean {
    // talk + listen = parfait
    if ((role1 === 'talk' && role2 === 'listen') || (role1 === 'listen' && role2 === 'talk')) {
      return true;
    }
    
    // both avec n'importe quoi = compatible
    if (role1 === 'both' || role2 === 'both') {
      return true;
    }
    
    // Éviter talk + talk ou listen + listen
    if ((role1 === 'talk' && role2 === 'talk') || (role1 === 'listen' && role2 === 'listen')) {
      return false;
    }
    
    return true;
  }

  // 🧪 MÉTHODES DE DEBUG AJOUTÉES

  // 🧪 Méthode de debug pour voir l'état de la présence en temps réel
  static async debugPresenceState(): Promise<void> {
    try {
      console.log('🔍 DEBUG: Checking comprehensive presence state...');
      
      // Test de connexion
      const connectedRef = ref(this.database, '.info/connected');
      const connectedSnapshot = await get(connectedRef);
      console.log('🔗 DEBUG: Database connected:', connectedSnapshot.val());
      
      // Test de l'URL de la database
      console.log('🌐 DEBUG: Database URL:', this.database.app.options.databaseURL);
      
      // Récupérer toutes les présences
      const presenceRef = ref(this.database, 'presence');
      const snapshot = await get(presenceRef);
      
      if (snapshot.exists()) {
        console.log('📊 DEBUG: Users currently in presence database:');
        let searchingCount = 0;
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val() as UserPresence;
          const lastSeenMin = Math.floor((Date.now() - userData.lastSeen) / 60000);
          console.log(`👤 ${userData.username} (${userData.userId}):`);
          console.log(`   Status: ${userData.status}`);
          console.log(`   Role: ${userData.role}`);
          console.log(`   Last seen: ${lastSeenMin} minutes ago`);
          console.log(`   Premium: ${userData.isPremium}`);
          console.log(`   Ambassador: ${userData.isAmbassador}`);
          
          if (userData.status === 'searching') {
            searchingCount++;
            const searchingMin = userData.searchingTimestamp ? 
              Math.floor((Date.now() - userData.searchingTimestamp) / 60000) : 'unknown';
            console.log(`   🔍 Searching for: ${searchingMin} minutes`);
          }
        });
        console.log(`📊 DEBUG: Total searching users: ${searchingCount}`);
      } else {
        console.log('❌ DEBUG: No users found in presence database');
        console.log('🔍 DEBUG: Checking if database path exists...');
        
        // Tester d'écrire quelque chose pour voir si on a les permissions
        const testRef = ref(this.database, 'debug_test');
        try {
          await set(testRef, { test: true, timestamp: Date.now() });
          console.log('✅ DEBUG: Write test successful');
          await remove(testRef);
          console.log('✅ DEBUG: Remove test successful');
        } catch (writeError) {
          console.error('❌ DEBUG: Write test failed:', writeError);
        }
      }
      
    } catch (error) {
      console.error('❌ DEBUG: Error checking presence state:', error);
    }
  }

  // 🧪 Test de la compatibilité entre deux rôles
  static debugRoleCompatibility(role1: string, role2: string): boolean {
    const compatible = this.isRoleCompatible(role1, role2);
    console.log(`🤝 DEBUG: Role compatibility "${role1}" + "${role2}" = ${compatible ? '✅ COMPATIBLE' : '❌ NOT COMPATIBLE'}`);
    return compatible;
  }

  // 🧪 Simuler un utilisateur pour les tests
  static async debugCreateMockUser(username: string, role: 'talk' | 'listen' | 'both'): Promise<void> {
    try {
      const mockUserId = 'mock_' + Math.random().toString(36).substring(7);
      const mockRef = ref(this.database, `presence/${mockUserId}`);
      
      const mockData: UserPresence = {
        userId: mockUserId,
        username,
        status: 'searching',
        role,
        isPremium: false,
        isAmbassador: false,
        lastSeen: Date.now(),
        searchingTimestamp: Date.now()
      };
      
      await set(mockRef, mockData);
      console.log(`🧪 DEBUG: Created mock user "${username}" with role "${role}"`);
      
      // Auto-suppression après 1 minute
      setTimeout(async () => {
        await remove(mockRef);
        console.log(`🧹 DEBUG: Removed mock user "${username}"`);
      }, 60000);
      
    } catch (error) {
      console.error('❌ DEBUG: Error creating mock user:', error);
    }
  }
}