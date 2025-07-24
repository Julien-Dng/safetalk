// import { 
//   signInWithEmailAndPassword, 
//   createUserWithEmailAndPassword,
//   signInWithPhoneNumber,
//   RecaptchaVerifier,
//   updateProfile,
//   signOut,
//   GoogleAuthProvider,
//   signInWithCredential,
//   User
// } from 'firebase/auth';
// import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
// import { auth, db } from '../config/firebase';

// export interface UserProfile {
//   uid: string;
//   username: string;
//   email?: string;
//   phoneNumber?: string;
//   role: 'talk' | 'listen' | 'both';
//   isPremium: boolean;
//   credits: number;
//   giftableCredits: number;
//   dailyFreeTimeUsed: number;
//   paidTimeAvailable: number;
//   partnerChangeCount: number;
//   dailyResetDate: string;
//   hasCompletedSetup: boolean;
//   referralCode: string;
//   referredBy?: string;
//   createdAt: string;
//   lastActiveAt: string;
// }

// export class AuthService {
//   // Email Authentication
//   static async signInWithEmail(email: string, password: string, username?: string): Promise<{ user: User; profile: UserProfile }> {
//     try {
//       let userCredential;
//       let isNewUser = false;

//       try {
//         // Try to sign in first
//         userCredential = await signInWithEmailAndPassword(auth, email, password);
//       } catch (error: any) {
//         if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
//           // User doesn't exist, create new account
//           userCredential = await createUserWithEmailAndPassword(auth, email, password);
//           isNewUser = true;
//         } else {
//           throw error;
//         }
//       }

//       const user = userCredential.user;

//       if (isNewUser && username) {
//         // Update display name for new users
//         await updateProfile(user, { displayName: username });
//       }

//       // Get or create user profile
//       const profile = await this.getOrCreateUserProfile(user, isNewUser, {
//         username: username || user.displayName || email.split('@')[0],
//         email: user.email || undefined,
//       });

//       return { user, profile };
//     } catch (error: any) {
//       console.error('Email authentication error:', error);
//       throw new Error(error.message || 'Authentication failed');
//     }
//   }

//   // Phone Authentication
//   static async signInWithPhone(phoneNumber: string): Promise<RecaptchaVerifier> {
//     try {
//       // Create RecaptchaVerifier
//       const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
//         size: 'invisible',
//         callback: () => {
//           console.log('reCAPTCHA solved');
//         }
//       });

//       return recaptchaVerifier;
//     } catch (error: any) {
//       console.error('Phone authentication setup error:', error);
//       throw new Error('Failed to setup phone authentication');
//     }
//   }

//   static async verifyPhoneCode(verificationId: string, code: string, username: string): Promise<{ user: User; profile: UserProfile }> {
//     try {
//       const credential = GoogleAuthProvider.credential(verificationId, code);
//       const userCredential = await signInWithCredential(auth, credential);
//       const user = userCredential.user;

//       // Update display name
//       await updateProfile(user, { displayName: username });

//       // Get or create user profile
//       const profile = await this.getOrCreateUserProfile(user, true, {
//         username,
//         phoneNumber: user.phoneNumber || undefined,
//       });

//       return { user, profile };
//     } catch (error: any) {
//       console.error('Phone verification error:', error);
//       throw new Error('Invalid verification code');
//     }
//   }

//   // Google Authentication (Simulated)
//   static async signInWithGoogle(): Promise<{ user: User; profile: UserProfile }> {
//     // In a real app, this would use Google Sign-In SDK
//     // For now, we'll simulate with email authentication
//     const mockEmail = `googleuser${Date.now()}@gmail.com`;
//     const mockPassword = 'temppassword123';
//     const mockUsername = `GoogleUser${Math.floor(Math.random() * 1000)}`;

//     return await this.signInWithEmail(mockEmail, mockPassword, mockUsername);
//   }

//   // Apple Authentication (Simulated)
//   static async signInWithApple(): Promise<{ user: User; profile: UserProfile }> {
//     // In a real app, this would use Apple Sign-In SDK
//     // For now, we'll simulate with email authentication
//     const mockEmail = `appleuser${Date.now()}@icloud.com`;
//     const mockPassword = 'temppassword123';
//     const mockUsername = `AppleUser${Math.floor(Math.random() * 1000)}`;

//     return await this.signInWithEmail(mockEmail, mockPassword, mockUsername);
//   }

//   // Get or Create User Profile
//   private static async getOrCreateUserProfile(
//     user: User, 
//     isNewUser: boolean, 
//     additionalData: Partial<UserProfile> = {}
//   ): Promise<UserProfile> {
//     const userDocRef = doc(db, 'users', user.uid);

//     if (isNewUser) {
//       // Create new user profile
//       const newProfile: UserProfile = {
//         uid: user.uid,
//         username: additionalData.username || user.displayName || 'User' + Math.floor(Math.random() * 1000),
//         email: additionalData.email || user.email || undefined,
//         phoneNumber: additionalData.phoneNumber || user.phoneNumber || undefined,
//         role: 'both', // Default role
//         isPremium: false,
//         credits: 25, // Starting credits
//         giftableCredits: 0,
//         dailyFreeTimeUsed: 0,
//         paidTimeAvailable: 0,
//         partnerChangeCount: 0,
//         dailyResetDate: new Date().toDateString(),
//         hasCompletedSetup: false,
//         referralCode: this.generateReferralCode(),
//         createdAt: new Date().toISOString(),
//         lastActiveAt: new Date().toISOString(),
//         ...additionalData
//       };

//       await setDoc(userDocRef, newProfile);
//       return newProfile;
//     } else {
//       // Get existing user profile
//       const userDoc = await getDoc(userDocRef);
//       if (userDoc.exists()) {
//         const profile = userDoc.data() as UserProfile;
        
//         // Update last active time
//         await updateDoc(userDocRef, {
//           lastActiveAt: new Date().toISOString()
//         });

//         return { ...profile, lastActiveAt: new Date().toISOString() };
//       } else {
//         // Profile doesn't exist, create it
//         return await this.getOrCreateUserProfile(user, true, additionalData);
//       }
//     }
//   }

//   // Update User Profile
//   static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
//     try {
//       const userDocRef = doc(db, 'users', uid);
//       await updateDoc(userDocRef, {
//         ...updates,
//         lastActiveAt: new Date().toISOString()
//       });
//     } catch (error: any) {
//       console.error('Update profile error:', error);
//       throw new Error('Failed to update profile');
//     }
//   }

//   // Complete Setup
//   static async completeSetup(uid: string, role: 'talk' | 'listen' | 'both'): Promise<void> {
//     await this.updateUserProfile(uid, {
//       role,
//       hasCompletedSetup: true
//     });
//   }

//   // Sign Out
//   static async signOut(): Promise<void> {
//     try {
//       await signOut(auth);
//     } catch (error: any) {
//       console.error('Sign out error:', error);
//       throw new Error('Failed to sign out');
//     }
//   }

//   // Generate Referral Code
//   private static generateReferralCode(): string {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let code = 'ST'; // SafeTalk prefix
//     for (let i = 0; i < 6; i++) {
//       code += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return code;
//   }

//   // Check Daily Reset
//   static checkDailyReset(profile: UserProfile): Partial<UserProfile> {
//     const today = new Date().toDateString();
//     if (profile.dailyResetDate !== today) {
//       return {
//         dailyFreeTimeUsed: 0,
//         partnerChangeCount: 0,
//         dailyResetDate: today
//       };
//     }
//     return {};
//   }
// }


import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserProfile {
  uid: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  role: 'talk' | 'listen' | 'both';
  isPremium: boolean;
  credits: number;
  giftableCredits: number;
  dailyFreeTimeUsed: number;
  paidTimeAvailable: number;
  partnerChangeCount: number;
  dailyResetDate: string;
  hasCompletedSetup: boolean;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  lastActiveAt: string;
}

export class AuthService {
  // Email Sign In - UNIQUEMENT pour la connexion
  static async signInWithEmail(email: string, password: string): Promise<{ user: User; profile: UserProfile }> {
    try {
      console.log('🔄 Tentative de connexion pour:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Connexion réussie pour:', user.uid);

      // Récupérer le profil utilisateur existant
      const profile = await this.getUserProfile(user.uid);
      if (!profile) {
        throw new Error('Profil utilisateur non trouvé. Veuillez créer un compte.');
      }

      // Mettre à jour la dernière activité
      await this.updateLastActive(user.uid);

      return { user, profile };
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error.code, error.message);
      
      // Messages d'erreur plus clairs
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('Aucun compte trouvé avec cet email. Créez un compte d\'abord.');
        case 'auth/wrong-password':
          throw new Error('Mot de passe incorrect.');
        case 'auth/invalid-email':
          throw new Error('Format d\'email invalide.');
        case 'auth/invalid-credential':
          throw new Error('Email ou mot de passe incorrect.');
        case 'auth/too-many-requests':
          throw new Error('Trop de tentatives. Réessayez plus tard.');
        case 'auth/user-disabled':
          throw new Error('Ce compte a été désactivé.');
        default:
          throw new Error(error.message || 'Erreur de connexion');
      }
    }
  }

  // Email Registration - UNIQUEMENT pour créer un compte
  static async createAccountWithEmail(email: string, password: string, username: string): Promise<{ user: User; profile: UserProfile }> {
    try {
      console.log('🔄 Création de compte pour:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Compte créé pour:', user.uid);

      // Mettre à jour le nom d'affichage
      await updateProfile(user, { displayName: username });

      // Créer le profil utilisateur
      const profile = await this.createUserProfile(user, {
        username,
        email: user.email || undefined,
      });

      return { user, profile };
    } catch (error: any) {
      console.error('❌ Erreur de création de compte:', error.code, error.message);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('Un compte existe déjà avec cet email. Connectez-vous.');
        case 'auth/weak-password':
          throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
        case 'auth/invalid-email':
          throw new Error('Format d\'email invalide.');
        case 'auth/operation-not-allowed':
          throw new Error('La création de compte par email n\'est pas activée.');
        default:
          throw new Error(error.message || 'Erreur lors de la création du compte');
      }
    }
  }

  // Récupérer le profil utilisateur
   static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      console.log('🔍 Recherche du profil pour:', uid);
      
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.log('✅ Profil trouvé');
        return userDoc.data() as UserProfile;
      }
      
      console.log('❌ Profil non trouvé');
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du profil:', error);
      return null;
    }
  }

  static subscribeToUserProfile(
    uid: string,
    callback: (profile: UserProfile | null) => void
  ): () => void {
    const userRef = doc(db, 'users', uid);
    const unsubscribe = onSnapshot(userRef, snap => {
      callback(snap.exists() ? (snap.data() as UserProfile) : null);
    });
    return unsubscribe;
  }


  // Créer un nouveau profil utilisateur
  private static async createUserProfile(
    user: User, 
    additionalData: Partial<UserProfile> = {}
  ): Promise<UserProfile> {
    console.log('🔄 Création du profil pour:', user.uid);
    
    const userDocRef = doc(db, 'users', user.uid);

    // Préparer les données en évitant les valeurs undefined
    const profileData: any = {
      uid: user.uid,
      username: additionalData.username || user.displayName || 'User' + Math.floor(Math.random() * 1000),
      role: 'both',
      isPremium: false,
      credits: 5,
      giftableCredits: 0,
      dailyFreeTimeUsed: 0,
      paidTimeAvailable: 0,
      partnerChangeCount: 0,
      dailyResetDate: new Date().toDateString(),
      hasCompletedSetup: false,
      referralCode: this.generateReferralCode(),
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    // Ajouter email seulement s'il existe
    if (additionalData.email || user.email) {
      profileData.email = additionalData.email || user.email;
    }

    // Ajouter phoneNumber seulement s'il existe
    if (additionalData.phoneNumber || user.phoneNumber) {
      profileData.phoneNumber = additionalData.phoneNumber || user.phoneNumber;
    }

    // Ajouter referredBy seulement s'il existe
    if (additionalData.referredBy) {
      profileData.referredBy = additionalData.referredBy;
    }

    console.log('📝 Données du profil à sauvegarder:', Object.keys(profileData));

    await setDoc(userDocRef, profileData);
    console.log('✅ Profil créé avec succès');
    
    // Retourner le profil avec toutes les propriétés (même optionnelles)
    const newProfile: UserProfile = {
      ...profileData,
      email: profileData.email,
      phoneNumber: profileData.phoneNumber,
      referredBy: profileData.referredBy,
    };
    
    return newProfile;
  }

  // Mettre à jour la dernière activité
  private static async updateLastActive(uid: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        lastActiveAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('⚠️ Erreur lors de la mise à jour de l\'activité:', error);
    }
  }

  // Update User Profile
  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        ...updates,
        lastActiveAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Erreur de mise à jour du profil:', error);
      throw new Error('Échec de la mise à jour du profil');
    }
  }

  // Complete Setup
  static async completeSetup(uid: string, role: 'talk' | 'listen' | 'both'): Promise<void> {
    await this.updateUserProfile(uid, {
      role,
      hasCompletedSetup: true
    });
  }

  // Sign Out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
      console.log('✅ Déconnexion réussie');
    } catch (error: any) {
      console.error('❌ Erreur de déconnexion:', error);
      throw new Error('Échec de la déconnexion');
    }
  }

  // Generate Referral Code
  private static generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'ST';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Check Daily Reset
  static checkDailyReset(profile: UserProfile): Partial<UserProfile> {
    const today = new Date().toDateString();
    if (profile.dailyResetDate !== today) {
      return {
        dailyFreeTimeUsed: 0,
        partnerChangeCount: 0,
        dailyResetDate: today
      };
    }
    return {};
  }
}
