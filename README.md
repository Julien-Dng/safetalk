# SafeTalk - Anonymous Chat App

A React Native mobile application for safe, anonymous conversations with people worldwide.

## Features

### 🔐 Authentication
- **Multiple Sign-In Options**: Google, Apple, Email/Password, Phone number
- **No Guest Mode**: Authentication required for all features
- **Secure User Management**: Firebase Authentication integration

### ⏱️ Daily Session Management
- **20 Minutes Free**: Daily free chat time for all users
- **Smart Timer**: Pauses during partner search, credit purchase, account navigation
- **Session Persistence**: Timer state maintained across app sessions
- **Daily Reset**: Timer resets every 24 hours

### 💰 Credit System
- **1 Credit = 6 Minutes**: Flexible chat time extension
- **Never Expire**: Credits remain available indefinitely
- **Easy Purchase**: In-app purchases for credit packages
- **Premium Bypass**: Premium users don't consume credits

### 🎯 Partner Matching
- **Anonymous Matching**: Safe, random partner pairing
- **Skip Protection**: 5 skips maximum before mandatory ad
- **Anti-Repeat**: Prevention of repeat matches
- **Premium Perks**: Unlimited skips for premium users

### 💬 Real-Time Chat
- **Live Messaging**: Instant message delivery with Firestore
- **Session Resumption**: Auto-resume interrupted chats
- **Rating System**: Rate partners after 5 minutes or 5 messages
- **Safety Features**: Block and report functionality

### ⭐ Premium Features
- **Unlimited Time**: No daily time restrictions
- **Skip Freely**: No ad requirements for partner changes
- **Credit Gifting**: Share credits with chat partners
- **Premium Badge**: Special status indicator
- **Priority Support**: Enhanced customer service

### 📱 Advertisement System
- **Fair Usage**: Ads shown after 5 partner skips
- **Non-Intrusive**: Timer pauses during ad playback
- **Premium Exempt**: No ads for premium subscribers
- **Revenue Support**: Helps keep app free for everyone

### 🎁 Referral System
- **Unique Codes**: Personal referral codes for all users
- **Mutual Rewards**: Both referrer and referee earn credits
- **Easy Sharing**: Built-in sharing functionality
- **Unlimited Invites**: No limits on referrals

## Technical Architecture

### Frontend (React Native + Expo)
- **React Navigation**: Seamless screen transitions
- **Context API**: Global state management
- **Firebase SDK**: Real-time data synchronization
- **Gifted Chat**: Advanced messaging interface
- **React Native Paper**: Material Design components

### Backend (Firebase)
- **Firestore**: Real-time NoSQL database
- **Authentication**: Secure user management
- **Cloud Functions**: Server-side business logic
- **Cloud Storage**: File and media handling
- **Security Rules**: Data access protection

### Key Services
- **AuthService**: User authentication and profile management
- **UserService**: Timer, credits, and premium features
- **ChatService**: Real-time messaging and history
- **MatchmakingService**: Partner finding algorithm
- **AdService**: Advertisement display and tracking
- **PurchaseService**: In-app purchase handling

## Security & Privacy

### Data Protection
- **Firestore Rules**: Comprehensive access control
- **Anonymous Chats**: No personal data in conversations
- **Secure Purchases**: Verified in-app purchase processing
- **Privacy First**: Minimal data collection approach

### Content Moderation
- **User Reporting**: Easy reporting of inappropriate behavior
- **Blocking System**: Prevent unwanted interactions
- **Rating System**: Community-driven quality control
- **Administrative Tools**: Backend moderation capabilities

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- Expo CLI
- Firebase Project
- iOS/Android development environment

### Configuration
1. **Firebase Setup**:
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase in project
   firebase init
   ```

2. **Environment Configuration**:
   - Place `google-services.json` in `/firebase/android/`
   - Place `GoogleService-Info.plist` in `/firebase/ios/`
   - Update Firebase config in `/src/config/firebase.js`

3. **Install Dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Start Development Server**:
   ```bash
   npm start
   # or
   yarn start
   ```

## Deployment

### Cloud Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

### Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Mobile App
```bash
# Build for production
expo build:android
expo build:ios
```

## Project Structure
```
safetalk/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/            # React Context providers
│   ├── navigation/         # App navigation structure
│   ├── screens/           # App screens
│   │   ├── auth/          # Authentication screens
│   │   └── main/          # Main app screens
│   ├── services/          # Business logic services
│   └── utils/             # Helper functions
├── functions/             # Firebase Cloud Functions
├── firebase/             # Firebase configuration files
└── firestore.rules       # Firestore security rules
```

## Key Features Implementation

### Timer System
- Real-time countdown with React hooks
- Background state preservation
- Cloud Functions for daily reset
- Premium user bypass logic

### Credit Management
- Secure purchase verification
- Cloud Functions for credit operations
- Real-time balance updates
- Gift credit functionality

### Chat System
- Firestore real-time listeners
- Message encryption options
- Typing indicators
- Message history management

### Matching Algorithm
- Random partner selection
- Blocked user filtering
- Recent partner avoidance
- Geographic considerations (future)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@safetalk.app or join our community forums.

---

**SafeTalk** - Connect Safely, Chat Anonymously 🌍💬