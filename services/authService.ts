import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
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
  // Email Authentication
  static async signInWithEmail(email: string, password: string, username?: string): Promise<{ user: User; profile: UserProfile }> {
    try {
      let userCredential;
      let isNewUser = false;

      try {
        // Try to sign in first
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          // User doesn't exist, create new account
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          isNewUser = true;
        } else {
          throw error;
        }
      }

      const user = userCredential.user;

      if (isNewUser && username) {
        // Update display name for new users
        await updateProfile(user, { displayName: username });
      }

      // Get or create user profile
      const profile = await this.getOrCreateUserProfile(user, isNewUser, {
        username: username || user.displayName || email.split('@')[0],
        email: user.email || undefined,
      });

      return { user, profile };
    } catch (error: any) {
      console.error('Email authentication error:', error);
      throw new Error(error.message || 'Authentication failed');
    }
  }

  // Phone Authentication
  static async signInWithPhone(phoneNumber: string): Promise<RecaptchaVerifier> {
    try {
      // Create RecaptchaVerifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        }
      });

      return recaptchaVerifier;
    } catch (error: any) {
      console.error('Phone authentication setup error:', error);
      throw new Error('Failed to setup phone authentication');
    }
  }

  static async verifyPhoneCode(verificationId: string, code: string, username: string): Promise<{ user: User; profile: UserProfile }> {
    try {
      const credential = GoogleAuthProvider.credential(verificationId, code);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: username });

      // Get or create user profile
      const profile = await this.getOrCreateUserProfile(user, true, {
        username,
        phoneNumber: user.phoneNumber || undefined,
      });

      return { user, profile };
    } catch (error: any) {
      console.error('Phone verification error:', error);
      throw new Error('Invalid verification code');
    }
  }

  // Google Authentication (Simulated)
  static async signInWithGoogle(): Promise<{ user: User; profile: UserProfile }> {
    // In a real app, this would use Google Sign-In SDK
    // For now, we'll simulate with email authentication
    const mockEmail = `googleuser${Date.now()}@gmail.com`;
    const mockPassword = 'temppassword123';
    const mockUsername = `GoogleUser${Math.floor(Math.random() * 1000)}`;

    return await this.signInWithEmail(mockEmail, mockPassword, mockUsername);
  }

  // Apple Authentication (Simulated)
  static async signInWithApple(): Promise<{ user: User; profile: UserProfile }> {
    // In a real app, this would use Apple Sign-In SDK
    // For now, we'll simulate with email authentication
    const mockEmail = `appleuser${Date.now()}@icloud.com`;
    const mockPassword = 'temppassword123';
    const mockUsername = `AppleUser${Math.floor(Math.random() * 1000)}`;

    return await this.signInWithEmail(mockEmail, mockPassword, mockUsername);
  }

  // Get or Create User Profile
  private static async getOrCreateUserProfile(
    user: User, 
    isNewUser: boolean, 
    additionalData: Partial<UserProfile> = {}
  ): Promise<UserProfile> {
    const userDocRef = doc(db, 'users', user.uid);

    if (isNewUser) {
      // Create new user profile
      const newProfile: UserProfile = {
        uid: user.uid,
        username: additionalData.username || user.displayName || 'User' + Math.floor(Math.random() * 1000),
        email: additionalData.email || user.email || undefined,
        phoneNumber: additionalData.phoneNumber || user.phoneNumber || undefined,
        role: 'both', // Default role
        isPremium: false,
        credits: 25, // Starting credits
        giftableCredits: 0,
        dailyFreeTimeUsed: 0,
        paidTimeAvailable: 0,
        partnerChangeCount: 0,
        dailyResetDate: new Date().toDateString(),
        hasCompletedSetup: false,
        referralCode: this.generateReferralCode(),
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        ...additionalData
      };

      await setDoc(userDocRef, newProfile);
      return newProfile;
    } else {
      // Get existing user profile
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        
        // Update last active time
        await updateDoc(userDocRef, {
          lastActiveAt: new Date().toISOString()
        });

        return { ...profile, lastActiveAt: new Date().toISOString() };
      } else {
        // Profile doesn't exist, create it
        return await this.getOrCreateUserProfile(user, true, additionalData);
      }
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
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
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
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  // Generate Referral Code
  private static generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'ST'; // SafeTalk prefix
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