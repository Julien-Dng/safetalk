import React, { createContext, useContext, useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from './AuthContext';
import { collections } from '../config/firebase';
import { UserService } from '../services/UserService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [credits, setCredits] = useState(null);
  const [dailyTimer, setDailyTimer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to user data changes
  useEffect(() => {
    if (!authUser) {
      setUserData(null);
      setCredits(null);
      setDailyTimer(null);
      setLoading(false);
      return;
    }

    const unsubscribeUser = firestore()
      .collection(collections.USERS)
      .doc(authUser.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setUserData(data);
          
          // Initialize daily timer if needed
          UserService.checkAndResetDailyTimer(authUser.uid, data);
          
          setDailyTimer({
            timeUsed: data.dailyTimeUsed || 0,
            timeLimit: data.dailyTimeLimit || (20 * 60 * 1000), // 20 minutes
            lastReset: data.lastResetDate,
            isPremium: data.isPremium || false,
          });
        }
      });

    const unsubscribeCredits = firestore()
      .collection(collections.CREDITS)
      .doc(authUser.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setCredits(doc.data());
        }
      });

    setLoading(false);

    return () => {
      unsubscribeUser();
      unsubscribeCredits();
    };
  }, [authUser]);

  // Update daily time used
  const updateDailyTimeUsed = async (timeUsed) => {
    if (!authUser || !userData) return;

    try {
      await UserService.updateDailyTimeUsed(authUser.uid, timeUsed);
    } catch (error) {
      console.error('Error updating daily time:', error);
    }
  };

  // Use credits
  const useCredits = async (creditsToUse) => {
    if (!authUser || !credits) return { success: false };

    try {
      const result = await UserService.useCredits(authUser.uid, creditsToUse);
      return result;
    } catch (error) {
      console.error('Error using credits:', error);
      return { success: false, error: error.message };
    }
  };

  // Purchase credits
  const purchaseCredits = async (packageType, transactionId) => {
    if (!authUser) return { success: false };

    try {
      const result = await UserService.purchaseCredits(authUser.uid, packageType, transactionId);
      return result;
    } catch (error) {
      console.error('Error purchasing credits:', error);
      return { success: false, error: error.message };
    }
  };

  // Upgrade to premium
  const upgradeToPremium = async (subscriptionType, transactionId) => {
    if (!authUser) return { success: false };

    try {
      const result = await UserService.upgradeToPremium(authUser.uid, subscriptionType, transactionId);
      return result;
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      return { success: false, error: error.message };
    }
  };

  // Calculate remaining time
  const getRemainingTime = () => {
    if (!dailyTimer) return 0;
    
    if (dailyTimer.isPremium) {
      return Infinity; // Unlimited for premium users
    }

    const remainingTime = dailyTimer.timeLimit - dailyTimer.timeUsed;
    return Math.max(0, remainingTime);
  };

  // Check if user has time available (including credits)
  const hasTimeAvailable = () => {
    if (!userData || !credits || !dailyTimer) return false;

    if (dailyTimer.isPremium) return true;

    const remainingFreeTime = getRemainingTime();
    const creditTime = credits.totalCredits * 6 * 60 * 1000; // 6 minutes per credit in ms

    return remainingFreeTime > 0 || creditTime > 0;
  };

  const value = {
    user: userData,
    credits,
    dailyTimer,
    loading,
    updateDailyTimeUsed,
    useCredits,
    purchaseCredits,
    upgradeToPremium,
    getRemainingTime,
    hasTimeAvailable,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};