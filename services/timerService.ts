import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile } from './authService';

export interface TimerState {
  freeTimeLeft: number; // seconds
  paidTimeLeft: number; // seconds
  totalActivatedTime: number; // for progress calculation when credits activated
  creditsActivated: boolean;
  timerPaused: boolean;
  lastTickTime: number; // timestamp
  sessionId: string | null;
}

export class TimerService {
  private static instance: TimerService;
  private timerInterval: NodeJS.Timeout | null = null;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(state: TimerState) => void> = new Set();
  private currentState: TimerState = {
    freeTimeLeft: 0,
    paidTimeLeft: 0,
    totalActivatedTime: 0,
    creditsActivated: false,
    timerPaused: false,
    lastTickTime: Date.now(),
    sessionId: null
  };

  static getInstance(): TimerService {
    if (!TimerService.instance) {
      TimerService.instance = new TimerService();
    }
    return TimerService.instance;
  }

  // Initialize timer for user
  async initializeTimer(userProfile: UserProfile, sessionId?: string): Promise<void> {
    try {
      // Check for daily reset
      const today = new Date().toDateString();
      let freeTimeUsed = userProfile.dailyFreeTimeUsed;
      
      if (userProfile.dailyResetDate !== today) {
        freeTimeUsed = 0;
        // Update user profile with reset
        await this.updateUserProfile(userProfile.uid, {
          dailyFreeTimeUsed: 0,
          partnerChangeCount: 0,
          dailyResetDate: today
        });
      }

      // Calculate available times
      const dailyLimit = 20 * 60; // 20 minutes in seconds
      const freeTimeLeft = userProfile.isPremium ? Infinity : Math.max(0, dailyLimit - freeTimeUsed);
      const paidTimeLeft = userProfile.paidTimeAvailable;

      // Load or create timer state
      let savedState = await this.loadTimerState(userProfile.uid);

      if (savedState && sessionId && savedState.sessionId && savedState.sessionId !== sessionId) {
        // New chat session, ignore previous state
        savedState = null;
      }

      this.currentState = {
        freeTimeLeft: savedState?.freeTimeLeft ?? freeTimeLeft,
        paidTimeLeft: savedState?.paidTimeLeft ?? paidTimeLeft,
        totalActivatedTime: savedState?.totalActivatedTime ?? 0,
        creditsActivated: savedState?.creditsActivated ?? false,
        timerPaused: true, // Start paused
        lastTickTime: Date.now(),
        sessionId: sessionId || savedState?.sessionId || null
      };

      // Start auto-save
      this.stopAutoSave();
      this.startAutoSave(userProfile.uid);
      
      // Notify listeners
      this.notifyListeners();
    } catch (error) {
      console.error('Error initializing timer:', error);
    }
  }

  // Start timer
  startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.currentState.timerPaused = false;
    this.currentState.lastTickTime = Date.now();

    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);

    this.notifyListeners();
  }

  // Pause timer
  pauseTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.currentState.timerPaused = true;
    this.notifyListeners();
  }

  // Resume timer
  resumeTimer(): void {
    if (!this.currentState.timerPaused) return;
    this.startTimer();
  }

  // Stop timer completely
  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.stopAutoSave();

    this.currentState.timerPaused = true;
    this.currentState.sessionId = null;
    this.notifyListeners();
  }

  // Timer tick logic
  private tick(): void {
    const now = Date.now();
    const deltaSeconds = Math.floor((now - this.currentState.lastTickTime) / 1000);
    
    if (deltaSeconds < 1) return; // Prevent sub-second ticks

    this.currentState.lastTickTime = now;

    // Check if user is premium
    if (this.getTotalTimeLeft() === Infinity) {
      this.notifyListeners();
      return;
    }

    let timeToDeduct = deltaSeconds;

    if (this.currentState.creditsActivated) {
      // When credits are activated, only use paid time
      if (this.currentState.paidTimeLeft > 0) {
        const deducted = Math.min(timeToDeduct, this.currentState.paidTimeLeft);
        this.currentState.paidTimeLeft = Math.max(0, this.currentState.paidTimeLeft - deducted);
      }
    } else {
      // Normal flow: use free time first, then paid time
      if (this.currentState.freeTimeLeft > 0) {
        const deducted = Math.min(timeToDeduct, this.currentState.freeTimeLeft);
        this.currentState.freeTimeLeft = Math.max(0, this.currentState.freeTimeLeft - deducted);
        timeToDeduct -= deducted;
      }

      if (timeToDeduct > 0 && this.currentState.paidTimeLeft > 0) {
        const deducted = Math.min(timeToDeduct, this.currentState.paidTimeLeft);
        this.currentState.paidTimeLeft = Math.max(0, this.currentState.paidTimeLeft - deducted);
      }
    }

    // Check if time ran out
    if (this.getTotalTimeLeft() <= 0) {
      this.stopTimer();
      this.onTimerEnd();
    }

    this.notifyListeners();
  }

  // Use credits (activate credit time)
  useCredits(credits: number): void {
    const creditTime = credits * 6 * 60; // 1 credit = 6 minutes = 360 seconds
    const currentTotal = this.getTotalTimeLeft();
    const newTotal = currentTotal + creditTime;

    this.currentState.creditsActivated = true;
    this.currentState.totalActivatedTime = newTotal;
    this.currentState.paidTimeLeft = newTotal;
    this.currentState.freeTimeLeft = 0; // Clear free time since credits are activated

    this.notifyListeners();
  }

  // Add time from purchase
  addPaidTime(minutes: number): void {
    const timeToAdd = minutes * 60;
    this.currentState.paidTimeLeft += timeToAdd;

    // If credits were activated, update total activated time
    if (this.currentState.creditsActivated) {
      this.currentState.totalActivatedTime += timeToAdd;
    }

    this.notifyListeners();
  }

  // Get current timer state
  getTimerState(): TimerState {
    return { ...this.currentState };
  }

  // Get total time left
  getTotalTimeLeft(): number {
    if (this.currentState.creditsActivated) {
      return this.currentState.paidTimeLeft;
    }
    return this.currentState.freeTimeLeft + this.currentState.paidTimeLeft;
  }

  // Get progress percentage
  getProgressPercentage(): number {
    const totalTimeLeft = this.getTotalTimeLeft();
    
    if (totalTimeLeft === Infinity) return 100;

    let maxTime;
    if (this.currentState.creditsActivated) {
      maxTime = this.currentState.totalActivatedTime;
    } else {
      maxTime = (20 * 60) + this.currentState.paidTimeLeft; // 20 min free + paid time
    }

    return Math.max(0, (totalTimeLeft / maxTime) * 100);
  }

  // Subscribe to timer updates
  subscribe(callback: (state: TimerState) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    const state = { ...this.currentState };
    this.listeners.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in timer listener:', error);
      }
    });
  }

  // Timer end callback
  private onTimerEnd(): void {
    // This will be handled by subscribers (UI components)
    console.log('Timer ended');
  }

  // Save timer state to AsyncStorage
  private async saveTimerState(uid: string): Promise<void> {
    try {
      const stateToSave = {
        ...this.currentState,
        lastSaveTime: Date.now()
      };
      await AsyncStorage.setItem(`timer_state_${uid}`, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  }

  // Load timer state from AsyncStorage
  private async loadTimerState(uid: string): Promise<TimerState | null> {
    try {
      const savedState = await AsyncStorage.getItem(`timer_state_${uid}`);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        
        // Calculate time elapsed while app was closed
        const timeSinceLastSave = Math.floor((Date.now() - parsed.lastSaveTime) / 1000);
        
        if (timeSinceLastSave > 0 && !parsed.timerPaused && parsed.sessionId) {
          // Deduct time that passed while app was closed
          if (parsed.creditsActivated) {
            parsed.paidTimeLeft = Math.max(0, parsed.paidTimeLeft - timeSinceLastSave);
          } else {
            const freeTimeDeduction = Math.min(timeSinceLastSave, parsed.freeTimeLeft);
            parsed.freeTimeLeft = Math.max(0, parsed.freeTimeLeft - freeTimeDeduction);
            
            const remainingDeduction = timeSinceLastSave - freeTimeDeduction;
            if (remainingDeduction > 0) {
              parsed.paidTimeLeft = Math.max(0, parsed.paidTimeLeft - remainingDeduction);
            }
          }
        }

        delete parsed.lastSaveTime;
        return parsed;
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
    return null;
  }

  // Start auto-save interval
  private startAutoSave(uid: string): void {
    this.stopAutoSave();
    this.autoSaveInterval = setInterval(() => {
      this.saveTimerState(uid);
    }, 10000);
  }

    private stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  // Update user profile in Firestore
  private async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, updates);
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }

  // Format time display
  static formatTime(seconds: number): string {
    if (seconds === Infinity) return "∞";
    
    if (seconds >= 3600) { // 1 hour or more
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h${mins.toString().padStart(2, '0')}`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Clear saved state (for logout)
  static async clearTimerState(uid: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`timer_state_${uid}`);
    } catch (error) {
      console.error('Error clearing timer state:', error);
    }
  }
}