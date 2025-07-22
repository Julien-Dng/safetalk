import React, { useState } from 'react';
import './App.css';

const SafeTalkPreview = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState(null);

  const WelcomeScreen = () => (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center mb-8">
          <span className="text-white text-2xl font-bold">SafeTalk</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          Connect Safely, Chat Anonymously
        </h1>
        <p className="text-gray-600 text-center mb-12 max-w-sm">
          Meet new people from around the world in a safe and secure environment.
          Start with 20 minutes of free chat every day!
        </p>
        
        <div className="w-full max-w-sm space-y-4">
          <button 
            onClick={() => setCurrentScreen('main')}
            className="w-full bg-blue-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:bg-blue-600 transition"
          >
            <span>🔍</span>
            <span>Continue with Google</span>
          </button>
          
          <button 
            onClick={() => setCurrentScreen('main')}
            className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:bg-gray-800 transition"
          >
            <span>🍎</span>
            <span>Continue with Apple</span>
          </button>
          
          <button 
            onClick={() => setCurrentScreen('main')}
            className="w-full bg-green-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:bg-green-600 transition"
          >
            <span>📱</span>
            <span>Continue with Phone</span>
          </button>
          
          <button 
            onClick={() => setCurrentScreen('main')}
            className="w-full bg-purple-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:bg-purple-600 transition"
          >
            <span>✉️</span>
            <span>Continue with Email</span>
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-8 text-center max-w-sm">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );

  const MainScreen = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">SafeTalk</h1>
          <button 
            onClick={() => setCurrentScreen('account')}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            👤
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hello! 👋</h2>
          <p className="text-gray-600">Ready to meet someone new?</p>
        </div>

        {/* Timer Display */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">Time Remaining Today</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-3xl font-bold text-blue-500">15:32</p>
          </div>
        </div>

        {/* Credits Display */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl py-3 px-6 shadow-sm flex items-center space-x-3">
            <span>💳</span>
            <span className="font-semibold">5 Credits</span>
            <span className="text-sm text-gray-500">(30 minutes)</span>
          </div>
        </div>

        {/* Main Illustration */}
        <div className="text-center mb-8">
          <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">💬</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Start an anonymous conversation
          </h3>
          <p className="text-gray-600">
            Connect with people from around the world safely and securely
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button 
            onClick={() => setCurrentScreen('matching')}
            className="w-full bg-blue-500 text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-3 hover:bg-blue-600 transition shadow-lg"
          >
            <span>▶️</span>
            <span>Start Chatting</span>
          </button>
          
          <button 
            onClick={() => setCurrentScreen('credits')}
            className="w-full bg-white border-2 border-blue-500 text-blue-500 py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:bg-blue-50 transition"
          >
            <span>🛒</span>
            <span>Buy Credits</span>
          </button>
          
          <button 
            onClick={() => setCurrentScreen('premium')}
            className="w-full bg-yellow-50 border-2 border-yellow-400 text-yellow-600 py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:bg-yellow-100 transition"
          >
            <span>⭐</span>
            <span>Upgrade to Premium</span>
          </button>
        </div>
      </div>
    </div>
  );

  const MatchingScreen = () => (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex justify-between items-center p-4">
        <button 
          onClick={() => setCurrentScreen('main')}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
        >
          ❌
        </button>
        <h1 className="text-xl font-bold">Finding Partner</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <div className="w-36 h-36 bg-blue-100 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <span className="text-4xl">🔍</span>
        </div>
        <h2 className="text-2xl font-semibold mb-4">Searching for someone to chat with...</h2>
        <p className="text-gray-600 mb-8">Searching for 0:23</p>
        
        <div className="bg-gray-100 rounded-xl p-4 mb-8 w-full max-w-sm text-center">
          <p className="text-sm font-medium mb-1">Skips used: 2/5</p>
          <p className="text-xs text-gray-500">3 skips left before ad</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 w-full max-w-sm">
          <h3 className="font-semibold mb-3">💡 Tips while you wait</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Be respectful and kind to others</li>
            <li>• Keep conversations appropriate</li>
            <li>• Report inappropriate behavior</li>
            <li>• Have fun and make new connections!</li>
          </ul>
        </div>

        <button 
          onClick={() => setCurrentScreen('chat')}
          className="mt-8 bg-white border-2 border-blue-500 text-blue-500 py-3 px-8 rounded-xl font-semibold flex items-center space-x-2 hover:bg-blue-50 transition"
        >
          <span>⏭️</span>
          <span>Skip (2/5)</span>
        </button>
      </div>
    </div>
  );

  const ChatScreen = () => (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <button 
          onClick={() => setCurrentScreen('main')}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
        >
          ⬅️
        </button>
        <div className="text-center">
          <h2 className="font-semibold">Anonymous Chat</h2>
          <p className="text-sm text-gray-500">5:42 elapsed</p>
        </div>
        <button 
          onClick={() => setCurrentScreen('matching')}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
        >
          ⏭️
        </button>
      </div>

      {/* Timer Bar */}
      <div className="bg-gray-50 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Time Remaining</span>
          <span className="text-sm font-semibold text-blue-500">9:18</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-blue-500 h-1 rounded-full" style={{ width: '60%' }}></div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 bg-gray-50">
        <div className="flex justify-start">
          <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 max-w-xs">
            <p>Hey there! How's your day going? 😊</p>
            <span className="text-xs text-gray-500">12:34</span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <div className="bg-blue-500 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-xs">
            <p>Hi! It's been great, thanks for asking! How about yours?</p>
            <span className="text-xs text-blue-200">12:35</span>
          </div>
        </div>
        
        <div className="flex justify-start">
          <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 max-w-xs">
            <p>Pretty good! I love this app, it's so cool to meet random people 🌍</p>
            <span className="text-xs text-gray-500">12:36</span>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border rounded-full px-4 py-3 focus:outline-none focus:border-blue-500"
            defaultValue=""
          />
          <button className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition">
            ➤
          </button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bg-gray-50 border-t px-4 py-3 flex justify-around">
        <button className="flex flex-col items-center space-y-1 text-red-500">
          <span>🚫</span>
          <span className="text-xs">Block</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-yellow-500">
          <span>⚠️</span>
          <span className="text-xs">Report</span>
        </button>
        <button 
          onClick={() => setCurrentScreen('main')}
          className="flex flex-col items-center space-y-1 text-gray-500"
        >
          <span>📞</span>
          <span className="text-xs">End Chat</span>
        </button>
      </div>
    </div>
  );

  const AccountScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => setCurrentScreen('main')}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            ⬅️
          </button>
          <h1 className="text-xl font-bold">My Account</h1>
          <button className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500">
            🚪
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl">👤</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">SafeTalk User</h2>
              <p className="text-gray-600">user@example.com</p>
              <p className="text-blue-500 text-sm">🆓 Free User</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">24</p>
              <p className="text-sm text-gray-500">Total Chats</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">127</p>
              <p className="text-sm text-gray-500">Messages Sent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">4.8⭐</p>
              <p className="text-sm text-gray-500">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">15</p>
              <p className="text-sm text-gray-500">Credits Earned</p>
            </div>
          </div>
        </div>

        {/* Daily Status */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">📅</span>
            <h3 className="text-lg font-semibold">Today's Activity</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Time Used</p>
              <p className="font-semibold">5 / 20 minutes</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Available Credits</p>
              <p className="font-semibold text-blue-500">5 credits</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button 
            onClick={() => setCurrentScreen('premium')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition border-b"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-4">⭐</span>
              <div className="text-left">
                <p className="font-semibold">Upgrade to Premium</p>
                <p className="text-sm text-gray-500">Unlimited chat time + exclusive features</p>
              </div>
            </div>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">NEW</span>
          </button>
          
          <button 
            onClick={() => setCurrentScreen('credits')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition border-b"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-4">💳</span>
              <div className="text-left">
                <p className="font-semibold">Buy Credits</p>
                <p className="text-sm text-gray-500">5 credits available</p>
              </div>
            </div>
            <span>➤</span>
          </button>
          
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition border-b">
            <div className="flex items-center">
              <span className="text-2xl mr-4">👥</span>
              <div className="text-left">
                <p className="font-semibold">Referrals</p>
                <p className="text-sm text-gray-500">2 friends referred</p>
              </div>
            </div>
            <span>➤</span>
          </button>
          
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition">
            <div className="flex items-center">
              <span className="text-2xl mr-4">⚙️</span>
              <div className="text-left">
                <p className="font-semibold">Settings</p>
                <p className="text-sm text-gray-500">App preferences and privacy</p>
              </div>
            </div>
            <span>➤</span>
          </button>
        </div>

        {/* Referral Code */}
        <div className="bg-white rounded-2xl p-6 mt-6 shadow-sm">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🎁</span>
            <h3 className="text-lg font-semibold">Your Referral Code</h3>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-500">ST7X9K2M</span>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">
              Copy
            </button>
          </div>
          <p className="text-sm text-gray-500 text-center mt-3">
            Share your code with friends and earn credits when they join!
          </p>
        </div>
      </div>
    </div>
  );

  const PremiumScreen = () => (
    <div className="min-h-screen bg-white">
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => setCurrentScreen('account')}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            ⬅️
          </button>
          <h1 className="text-xl font-bold">Upgrade to Premium</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">⭐</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Unlock Premium Features</h2>
          <p className="text-gray-600">
            Get unlimited chat time, skip ads, and enjoy exclusive features
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="border-2 border-gray-200 rounded-xl p-4 text-center">
            <p className="font-semibold mb-2">1 Month</p>
            <p className="text-2xl font-bold text-blue-500">€9.99</p>
          </div>
          
          <div className="border-2 border-yellow-400 bg-yellow-50 rounded-xl p-4 text-center relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-white text-xs px-3 py-1 rounded-full font-bold">
              POPULAR
            </div>
            <p className="font-semibold mb-2 mt-2">6 Months</p>
            <p className="text-2xl font-bold text-blue-500">€49.99</p>
            <p className="text-xs text-green-600 font-semibold">17% OFF</p>
          </div>
          
          <div className="border-2 border-green-400 bg-green-50 rounded-xl p-4 text-center relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-400 text-white text-xs px-3 py-1 rounded-full font-bold">
              BEST VALUE
            </div>
            <p className="font-semibold mb-2 mt-2">1 Year</p>
            <p className="text-2xl font-bold text-blue-500">€89.99</p>
            <p className="text-xs text-green-600 font-semibold">25% OFF</p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Premium Features</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-green-500 text-xl mr-3">✓</span>
              <div>
                <p className="font-semibold">Unlimited Chat Time</p>
                <p className="text-sm text-gray-500">Chat as long as you want, every day</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-green-500 text-xl mr-3">✓</span>
              <div>
                <p className="font-semibold">Unlimited Partner Skips</p>
                <p className="text-sm text-gray-500">Skip partners without watching ads</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-green-500 text-xl mr-3">✓</span>
              <div>
                <p className="font-semibold">Gift Credits</p>
                <p className="text-sm text-gray-500">Share credits with your chat partners</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-green-500 text-xl mr-3">✓</span>
              <div>
                <p className="font-semibold">Premium Badge</p>
                <p className="text-sm text-gray-500">Show your premium status to others</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Button */}
        <button className="w-full bg-blue-500 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-blue-600 transition shadow-lg">
          Upgrade for €49.99
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Cancel anytime • Secure payment • Terms apply
        </p>
      </div>
    </div>
  );

  const CreditsScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => setCurrentScreen('account')}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            ⬅️
          </button>
          <h1 className="text-xl font-bold">Buy Credits</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6">
        {/* Current Balance */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-3xl mr-3">💳</span>
            <h2 className="text-xl font-semibold">Current Balance</h2>
          </div>
          <p className="text-4xl font-bold text-blue-500 mb-2">5 Credits</p>
          <p className="text-gray-500">≈ 30 minutes of chat time</p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 flex items-start">
          <span className="text-blue-500 text-xl mr-3">ℹ️</span>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">How Credits Work</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 1 credit = 6 minutes of chat time</li>
              <li>• Credits never expire</li>
              <li>• Use anytime to extend conversations</li>
              <li>• Premium users don't use credits</li>
            </ul>
          </div>
        </div>

        {/* Packages */}
        <h3 className="text-xl font-semibold mb-4">Choose a Package</h3>
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-500 mb-1">5</p>
            <p className="text-xs text-gray-500 mb-3">Credits</p>
            <p className="text-sm font-medium mb-2">30 minutes</p>
            <p className="text-lg font-bold">€0.99</p>
          </div>
          
          <div className="bg-white border-2 border-yellow-400 rounded-xl p-4 text-center relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full font-bold">
              POPULAR
            </div>
            <p className="text-2xl font-bold text-blue-500 mb-1 mt-2">10</p>
            <p className="text-xs text-gray-500 mb-3">Credits</p>
            <p className="text-sm font-medium mb-2">1 hour</p>
            <p className="text-lg font-bold">€1.99</p>
          </div>
          
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-500 mb-1">25</p>
            <p className="text-xs text-gray-500 mb-3">Credits</p>
            <p className="text-sm font-medium mb-2">24h unlimited</p>
            <p className="text-lg font-bold">€3.99</p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Why Buy Credits?</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-green-500 text-xl mr-3">✓</span>
              <span>Extend your daily chat time</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 text-xl mr-3">✓</span>
              <span>Continue interesting conversations</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 text-xl mr-3">✓</span>
              <span>Meet more people every day</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 text-xl mr-3">✓</span>
              <span>Safe and secure payment</span>
            </div>
          </div>
        </div>

        {/* Purchase Button */}
        <button className="w-full bg-blue-500 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-blue-600 transition shadow-lg">
          Buy 10 Credits - €1.99
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment • Credits never expire • Terms apply
        </p>
      </div>
    </div>
  );

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'welcome': return <WelcomeScreen />;
      case 'main': return <MainScreen />;
      case 'matching': return <MatchingScreen />;
      case 'chat': return <ChatScreen />;
      case 'account': return <AccountScreen />;
      case 'premium': return <PremiumScreen />;
      case 'credits': return <CreditsScreen />;
      default: return <WelcomeScreen />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen">
      {renderCurrentScreen()}
    </div>
  );
};

export default SafeTalkPreview;