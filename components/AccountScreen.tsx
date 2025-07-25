// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";

// interface AccountScreenProps {
//   username: string;
//   credits: number;
//   isPremium: boolean;
//   dailyFreeTimeRemaining: number;
//   paidTimeAvailable: number;
//   onBack: () => void;
//   onShowReferral: () => void;
//   onShowRewards: () => void;
//   onLogout: () => void;
//   onUpdateUsername: (newUsername: string) => void;
// }

// export function AccountScreen(props: AccountScreenProps) {
//   return (
//     <LinearGradient
//       colors={['#0f0f23', '#1a1a2e', '#16213e']}
//       style={styles.container}
//     >
//       <SafeAreaView style={styles.safeArea}>
//         <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        
//         <View style={styles.content}>
//           <Text style={styles.placeholderText}>
//             Account Screen
//           </Text>
//           <Text style={styles.placeholderSubtext}>
//             (Will be implemented in Phase 6)
//           </Text>
//         </View>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   safeArea: {
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   placeholderText: {
//     color: '#ffffff',
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   placeholderSubtext: {
//     color: '#c4b5fd',
//     fontSize: 16,
//     marginTop: 8,
//   },
// });





// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   SafeAreaView,
//   StatusBar,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   ScrollView,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons, Feather, FontAwesome5, Entypo } from "@expo/vector-icons";

// interface AccountScreenProps {
//   username: string;
//   credits: number;
//   isPremium: boolean;
//   dailyFreeTimeRemaining: number;
//   paidTimeAvailable: number;
//   onBack: () => void;
//   onShowReferral: () => void;
//   onShowRewards: () => void;
//   onLogout: () => void;
//   onUpdateUsername: (newUsername: string) => void;
// }

// const formatTime = (seconds: number) => {
//   if (seconds >= 3600) {
//     const hours = Math.floor(seconds / 3600);
//     const mins = Math.floor((seconds % 3600) / 60);
//     return `${hours}h${mins.toString().padStart(2, '0')}`;
//   }
//   const mins = Math.floor(seconds / 60);
//   const secs = seconds % 60;
//   return `${mins}:${secs.toString().padStart(2, '0')}`;
// };

// export function AccountScreen({
//   username,
//   credits,
//   isPremium,
//   dailyFreeTimeRemaining,
//   paidTimeAvailable,
//   onBack,
//   onShowReferral,
//   onShowRewards,
//   onLogout,
//   onUpdateUsername,
// }: AccountScreenProps) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [newUsername, setNewUsername] = useState(username);

//   const handleSave = () => {
//     if (newUsername.trim() && newUsername !== username) {
//       onUpdateUsername(newUsername.trim());
//     }
//     setIsEditing(false);
//   };

//   const safeDailyTime = Number.isFinite(dailyFreeTimeRemaining) ? dailyFreeTimeRemaining : 0;
//   const safePaidTime = Number.isFinite(paidTimeAvailable) ? paidTimeAvailable : 0;
//   const totalTime = safeDailyTime + safePaidTime

//   const creditMinutes = credits * 6;

//   return (
//     <LinearGradient colors={["#0f0f23", "#1a1a2e", "#16213e"]} style={styles.container}>
//       <SafeAreaView style={styles.safeArea}>
//         <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={onBack}>
//             <Ionicons name="arrow-back" size={24} color="white" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>My Account</Text>
//           <TouchableOpacity onPress={onLogout}>
//             <Feather name="log-out" size={22} color="white" />
//           </TouchableOpacity>
//         </View>

//         <ScrollView contentContainerStyle={styles.content}>
//           {/* Profile */}
//           <View style={styles.section}>
//             <View style={styles.profileRow}>
//               <View style={styles.avatar}>
//                 <FontAwesome5 name="user" size={28} color="white" />
//               </View>
//               <View style={styles.profileInfo}>
//                 {isEditing ? (
//                   <View style={styles.editRow}>
//                     <TextInput
//                       value={newUsername}
//                       onChangeText={setNewUsername}
//                       style={styles.input}
//                       placeholder="New username"
//                       placeholderTextColor="#aaa"
//                     />
//                     <TouchableOpacity onPress={handleSave}>
//                       <Feather name="check" size={20} color="green" />
//                     </TouchableOpacity>
//                     <TouchableOpacity onPress={() => setIsEditing(false)}>
//                       <Feather name="x" size={20} color="#aaa" />
//                     </TouchableOpacity>
//                   </View>
//                 ) : (
//                   <View style={styles.editRow}>
//                     <Text style={styles.username}>{username}</Text>
//                     <TouchableOpacity onPress={() => setIsEditing(true)}>
//                       <Feather name="edit-3" size={18} color="#aaa" />
//                     </TouchableOpacity>
//                   </View>
//                 )}
//                 <Text style={styles.badge}>
//                   {isPremium ? "👑 Premium" : null}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* Time & Credits */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>⏳ Time & Credits</Text>
//             {isPremium ? (
//               <Text style={styles.unlimited}>Unlimited Chat Time</Text>
//             ) : (
//               <>
//               <Text style={styles.timeLabel}>Free Time Today: {formatTime(safeDailyTime)}</Text>
//               <Text style={styles.timeLabel}>Paid Time: {formatTime(safePaidTime)}</Text>
//               <Text style={styles.timeLabel}>Total: {formatTime(totalTime)}</Text>
//               </>
//             )}
//             <Text style={styles.creditLine}>
//               💰 Credits: {credits ?? 0} ({formatTime((credits ?? 0) * 6 * 60)})
//             </Text>
//           </View>

//           {/* Quick Actions */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
//             <TouchableOpacity style={styles.action} onPress={onShowReferral}>
//               <Ionicons name="people" size={20} color="#c4b5fd" />
//               <Text style={styles.actionText}>Referral Program</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.action} onPress={onShowRewards}>
//               <Entypo name="gift" size={20} color="#c4b5fd" />
//               <Text style={styles.actionText}>My Rewards</Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     padding: 16,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   headerTitle: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "600",
//   },
//   content: {
//     padding: 20,
//     gap: 24,
//   },
//   section: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 16,
//   },
//   profileRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   avatar: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: "#7c3aed",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   profileInfo: {
//     flex: 1,
//   },
//   username: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "600",
//   },
//   badge: {
//     color: "#c4b5fd",
//     marginTop: 4,
//     fontSize: 14,
//   },
//   editRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   input: {
//     flex: 1,
//     color: "#fff",
//     backgroundColor: "rgba(255,255,255,0.1)",
//     padding: 8,
//     borderRadius: 8,
//   },
//   sectionTitle: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 8,
//   },
//   timeLabel: {
//     color: "#c4b5fd",
//     marginVertical: 2,
//   },
//   unlimited: {
//     color: "#4ade80",
//     fontWeight: "bold",
//   },
//   creditLine: {
//     color: "#fde68a",
//     marginTop: 8,
//   },
//   action: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginTop: 12,
//   },
//   actionText: {
//     color: "#fff",
//     fontSize: 15,
//   },
// });



import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  ArrowLeft,
  User,
  Settings,
  Gift,
  Crown,
  LogOut,
  Coins,
  Users,
  Edit3,
  Check,
  X,
  Clock,
  Zap,
} from 'lucide-react-native';

interface AccountScreenProps {
  username: string;
  credits: number;
  isPremium: boolean;
  dailyFreeTimeRemaining: number;
  paidTimeAvailable: number;
  onBack: () => void;
  onShowReferral: () => void;
  onShowRewards: () => void;
  onPremium: () => void;
  onLogout: () => void;
  onUpdateUsername: (newUsername: string) => void;
}

// Enhanced time formatting function
const formatTime = (seconds: number) => {
  if (seconds >= 3600) { // 1 hour or more
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const Badge = ({ children, variant = 'default', style }: any) => (
  <View style={[
    styles.badge,
    variant === 'outline' ? styles.badgeOutline : styles.badgeDefault,
    style
  ]}>
    {children}
  </View>
);

export function AccountScreen({
  username,
  credits,
  isPremium,
  dailyFreeTimeRemaining,
  paidTimeAvailable,
  onBack,
  onShowReferral,
  onShowRewards,
  onPremium,
  onLogout,
  onUpdateUsername
}: AccountScreenProps) {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(username);

  const handleSaveUsername = () => {
    if (newUsername.trim() && newUsername !== username) {
      onUpdateUsername(newUsername.trim());
    }
    setIsEditingUsername(false);
  };

  const handleCancelEdit = () => {
    setNewUsername(username);
    setIsEditingUsername(false);
  };

  // Intégration de votre logique métier sécurisée
  const safeDailyTime = Number.isFinite(dailyFreeTimeRemaining) ? dailyFreeTimeRemaining : 0;
  const safePaidTime = Number.isFinite(paidTimeAvailable) ? paidTimeAvailable : 0;
  const totalTimeAvailable = safeDailyTime + safePaidTime;

  const creditMinutes = credits * 6; // 1 credit = 6 minutes

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0b2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onBack}
        >
          <ArrowLeft size={16} color="#c4b5fd" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>My Account</Text>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onLogout}
        >
          <LogOut size={16} color="#c4b5fd" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileContainer}>
            <View style={styles.avatar}>
              <User size={32} color="#ffffff" />
            </View>
            <View style={styles.profileInfo}>
              {isEditingUsername ? (
                <View style={styles.usernameEditContainer}>
                  <TextInput
                    value={newUsername}
                    onChangeText={setNewUsername}
                    style={styles.usernameInput}
                    placeholder="Enter username"
                    placeholderTextColor="#a78bfa"
                  />
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveUsername}
                  >
                    <Check size={16} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelEdit}
                  >
                    <X size={16} color="#c4b5fd" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.usernameContainer}>
                  <Text style={styles.username}>{username}</Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditingUsername(true)}
                  >
                    <Edit3 size={16} color="#a78bfa" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.badgeContainer}>
                {isPremium ? (
                  <Badge>
                    <Crown size={12} color="#ffffff" />
                    <Text style={styles.premiumBadgeText}>Premium</Text>
                  </Badge>
                ) : (
                  null
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Time & Credits Balance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#60a5fa" />
            <Text style={styles.sectionTitle}>Time & Credits</Text>
          </View>
          
          <View style={styles.timeSection}>
            {isPremium ? (
             null
            ) : (
              <View style={styles.timeBreakdown}>
                {/* Today's Free Time */}
                <View style={styles.freeTimeContainer}>
                  <View style={styles.timeHeader}>
                    <View style={styles.timeHeaderLeft}>
                      <Clock size={16} color="#60a5fa" />
                      <Text style={styles.timeLabel}>Today's Free Time</Text>
                    </View>
                    <Text style={styles.timeValue}>{formatTime(safeDailyTime)}</Text>
                  </View>
                  <Text style={styles.timeSubtext}>Resets daily • Used automatically first</Text>
                </View>
                
                {/* Paid Time Available */}
                <View style={styles.paidTimeContainer}>
                  <View style={styles.timeHeader}>
                    <View style={styles.timeHeaderLeft}>
                      <Zap size={16} color="#4ade80" />
                      <Text style={styles.paidTimeLabel}>Paid Time Available</Text>
                    </View>
                    <Text style={styles.paidTimeValue}>{formatTime(safePaidTime)}</Text>
                  </View>
                  <Text style={styles.paidTimeSubtext}>From credits • Click "Use my credits" to add more</Text>
                </View>
                
                {/* Total Available */}
                <View style={styles.totalTimeContainer}>
                  <View style={styles.timeHeader}>
                    <Text style={styles.totalLabel}>Total Available</Text>
                    <Text style={styles.totalValue}>{formatTime(totalTimeAvailable)}</Text>
                  </View>
                </View>
              </View>
            )}
            
            {/* Credits */}
            <View style={styles.creditsContainer}>
              <View style={styles.timeHeader}>
                <View style={styles.timeHeaderLeft}>
                  <Coins size={16} color="#facc15" />
                  <Text style={styles.creditsLabel}>Credits</Text>
                </View>
                <Text style={styles.creditsValue}>{credits ?? 0}</Text>
              </View>
              <Text style={styles.creditsSubtext}>
                = {formatTime((credits ?? 0) * 6 * 60)} potential chat time
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onShowReferral}
          >
            <View style={styles.actionIcon}>
              <Users size={20} color="#60a5fa" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Referral Program</Text>
              <Text style={styles.actionSubtitle}>Invite friends & earn rewards</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onShowRewards}
          >
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
              <Gift size={20} color="#4ade80" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My Rewards</Text>
              <Text style={styles.actionSubtitle}>Manage your giftable credits</Text>
            </View>
          </TouchableOpacity>

          {!isPremium && (
            <TouchableOpacity 
              style={styles.premiumButton}
              onPress={onPremium}>
              <View style={styles.premiumIcon}>
                <Crown size={20} color="#ffffff" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                <Text style={styles.premiumSubtitle}>Unlimited chats & exclusive features</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Settings Section */}
          <View style={styles.settingsContainer}>  
            <View>
              <Text style={styles.settingLabel}>App Version</Text>
              <Text style={styles.settingValue}>Safetalk v1.0.0</Text>
            </View>
          </View>
          

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogout}
        >
          <LogOut size={16} color="#f87171" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0b2e',
  },
  header: {
    backgroundColor: 'rgba(88, 28, 135, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: '#6b21a8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  headerButtonText: {
    color: '#c4b5fd',
    marginLeft: 8,
    fontSize: 14,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  section: {
    backgroundColor: 'rgba(88, 28, 135, 0.2)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: '#a855f7',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  usernameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameInput: {
    flex: 1,
    backgroundColor: 'rgba(88, 28, 135, 0.3)',
    borderWidth: 1,
    borderColor: '#6b21a8',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#16a34a',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#6b21a8',
    padding: 8,
    borderRadius: 6,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  badgeContainer: {
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeDefault: {
    backgroundColor: '#a855f7',
  },
  badgeOutline: {
    borderWidth: 1,
    borderColor: '#6b21a8',
    backgroundColor: 'transparent',
  },
  premiumBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  freemiumBadgeText: {
    color: '#c4b5fd',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    marginBottom: 6,
  },
  timeSection: {
    gap: 16,
  },
  unlimitedContainer: {
    backgroundColor: 'rgba(88, 28, 135, 0.3)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  unlimitedSymbol: {
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 4,
  },
  unlimitedText: {
    color: '#c4b5fd',
    fontSize: 14,
  },
  unlimitedSubtext: {
    color: '#a78bfa',
    fontSize: 12,
    marginTop: 4,
  },
  timeBreakdown: {
    gap: 12,
  },
  freeTimeContainer: {
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  paidTimeContainer: {
    backgroundColor: 'rgba(20, 83, 45, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(22, 101, 52, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  totalTimeContainer: {
    backgroundColor: 'rgba(88, 28, 135, 0.3)',
    borderRadius: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#6b21a8',
  },
  creditsContainer: {
    backgroundColor: 'rgba(133, 77, 14, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(146, 64, 14, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    color: '#93c5fd',
    fontSize: 14,
    marginLeft: 8,
  },
  timeValue: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
  },
  timeSubtext: {
    color: '#bfdbfe',
    fontSize: 12,
  },
  paidTimeLabel: {
    color: '#86efac',
    fontSize: 14,
    marginLeft: 8,
  },
  paidTimeValue: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: '600',
  },
  paidTimeSubtext: {
    color: '#bbf7d0',
    fontSize: 12,
  },
  totalLabel: {
    color: '#c4b5fd',
    fontSize: 14,
  },
  totalValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  creditsLabel: {
    color: '#fde047',
    fontSize: 14,
    marginLeft: 8,
  },
  creditsValue: {
    color: '#facc15',
    fontSize: 18,
    fontWeight: '600',
  },
  creditsSubtext: {
    color: '#fef3c7',
    fontSize: 12,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6b21a8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionSubtitle: {
    color: '#c4b5fd',
    fontSize: 14,
    marginTop: 2,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
  //  backgroundColor: '#a855f7',
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  premiumIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  premiumSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#6b21a8',
    marginBottom: 16,
  },

  settingsContainer: {
    backgroundColor: 'rgba(88, 28, 135, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  settingLabel: {
    color: '#ffffff',
    fontSize: 14,
  },
  settingValue: {
    color: '#a78bfa',
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderColor: '#b91c1c',
    borderRadius: 12,
    padding: 10,
    marginBottom: 30,
  },
  logoutText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
});


