import React, { createContext, useContext, useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';
import { collections } from '../config/firebase';
import { ChatService } from '../services/ChatService';
import { MatchmakingService } from '../services/MatchmakingService';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user: authUser } = useAuth();
  const { user: userData } = useUser();
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchingSkips, setMatchingSkips] = useState(0);
  const [chatTimer, setChatTimer] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Subscribe to current chat messages
  useEffect(() => {
    if (!currentChat) {
      setMessages([]);
      return;
    }

    const unsubscribe = firestore()
      .collection(collections.CHATS)
      .doc(currentChat.id)
      .collection(collections.MESSAGES)
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const messageList = snapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }));
        setMessages(messageList);
      });

    return unsubscribe;
  }, [currentChat]);

  // Find a partner
  const findPartner = async () => {
    if (!authUser || !userData) return { success: false };

    try {
      setIsMatching(true);
      const result = await MatchmakingService.findPartner(authUser.uid);
      
      if (result.success) {
        setCurrentChat(result.chat);
        setMatchingSkips(0);
      }
      
      return result;
    } catch (error) {
      console.error('Error finding partner:', error);
      return { success: false, error: error.message };
    } finally {
      setIsMatching(false);
    }
  };

  // Skip current partner
  const skipPartner = async () => {
    if (!authUser) return { success: false };

    try {
      const newSkipCount = matchingSkips + 1;
      setMatchingSkips(newSkipCount);
      
      // End current chat if exists
      if (currentChat) {
        await ChatService.endChat(currentChat.id, authUser.uid);
        setCurrentChat(null);
      }

      // Check if needs to show ad (after 5 skips)
      if (newSkipCount >= 5 && !userData?.isPremium) {
        return { success: true, showAd: true, skipCount: newSkipCount };
      }

      // Continue matching
      return await findPartner();
    } catch (error) {
      console.error('Error skipping partner:', error);
      return { success: false, error: error.message };
    }
  };

  // Send message
  const sendMessage = async (messageText) => {
    if (!currentChat || !authUser || !messageText.trim()) return { success: false };

    try {
      const result = await ChatService.sendMessage(currentChat.id, authUser.uid, messageText);
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  };

  // End current chat
  const endChat = async () => {
    if (!currentChat || !authUser) return { success: false };

    try {
      await ChatService.endChat(currentChat.id, authUser.uid);
      setCurrentChat(null);
      setMessages([]);
      setChatTimer(null);
      return { success: true };
    } catch (error) {
      console.error('Error ending chat:', error);
      return { success: false, error: error.message };
    }
  };

  // Rate partner
  const ratePartner = async (rating, comment = '') => {
    if (!currentChat || !authUser) return { success: false };

    try {
      const partnerId = currentChat.participants.find(p => p !== authUser.uid);
      const result = await ChatService.ratePartner(currentChat.id, authUser.uid, partnerId, rating, comment);
      return result;
    } catch (error) {
      console.error('Error rating partner:', error);
      return { success: false, error: error.message };
    }
  };

  // Block partner
  const blockPartner = async () => {
    if (!currentChat || !authUser) return { success: false };

    try {
      const partnerId = currentChat.participants.find(p => p !== authUser.uid);
      const result = await ChatService.blockUser(authUser.uid, partnerId);
      
      if (result.success) {
        await endChat();
      }
      
      return result;
    } catch (error) {
      console.error('Error blocking partner:', error);
      return { success: false, error: error.message };
    }
  };

  // Report partner
  const reportPartner = async (reason, description = '') => {
    if (!currentChat || !authUser) return { success: false };

    try {
      const partnerId = currentChat.participants.find(p => p !== authUser.uid);
      const result = await ChatService.reportUser(authUser.uid, partnerId, reason, description);
      return result;
    } catch (error) {
      console.error('Error reporting partner:', error);
      return { success: false, error: error.message };
    }
  };

  // Start chat timer
  const startChatTimer = () => {
    if (chatTimer) return;

    const timer = setInterval(() => {
      // Timer logic will be handled by the UserContext
      // This is just for UI countdown
    }, 1000);

    setChatTimer(timer);
  };

  // Stop chat timer
  const stopChatTimer = () => {
    if (chatTimer) {
      clearInterval(chatTimer);
      setChatTimer(null);
    }
  };

  // Reset skips after ad
  const resetSkips = () => {
    setMatchingSkips(0);
  };

  const value = {
    currentChat,
    messages,
    isMatching,
    matchingSkips,
    isTyping,
    findPartner,
    skipPartner,
    sendMessage,
    endChat,
    ratePartner,
    blockPartner,
    reportPartner,
    startChatTimer,
    stopChatTimer,
    resetSkips,
    setIsTyping,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};