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

import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather, FontAwesome5, Entypo } from "@expo/vector-icons";

interface AccountScreenProps {
  username: string;
  credits: number;
  isPremium: boolean;
  dailyFreeTimeRemaining: number;
  paidTimeAvailable: number;
  onBack: () => void;
  onShowReferral: () => void;
  onShowRewards: () => void;
  onLogout: () => void;
  onUpdateUsername: (newUsername: string) => void;
}

const formatTime = (seconds: number) => {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function AccountScreen({
  username,
  credits,
  isPremium,
  dailyFreeTimeRemaining,
  paidTimeAvailable,
  onBack,
  onShowReferral,
  onShowRewards,
  onLogout,
  onUpdateUsername,
}: AccountScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username);

  const handleSave = () => {
    if (newUsername.trim() && newUsername !== username) {
      onUpdateUsername(newUsername.trim());
    }
    setIsEditing(false);
  };

  const safeDailyTime = Number.isFinite(dailyFreeTimeRemaining) ? dailyFreeTimeRemaining : 0;
  const safePaidTime = Number.isFinite(paidTimeAvailable) ? paidTimeAvailable : 0;
  const totalTime = safeDailyTime + safePaidTime

  const creditMinutes = credits * 6;

  return (
    <LinearGradient colors={["#0f0f23", "#1a1a2e", "#16213e"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Account</Text>
          <TouchableOpacity onPress={onLogout}>
            <Feather name="log-out" size={22} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Profile */}
          <View style={styles.section}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <FontAwesome5 name="user" size={28} color="white" />
              </View>
              <View style={styles.profileInfo}>
                {isEditing ? (
                  <View style={styles.editRow}>
                    <TextInput
                      value={newUsername}
                      onChangeText={setNewUsername}
                      style={styles.input}
                      placeholder="New username"
                      placeholderTextColor="#aaa"
                    />
                    <TouchableOpacity onPress={handleSave}>
                      <Feather name="check" size={20} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsEditing(false)}>
                      <Feather name="x" size={20} color="#aaa" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.editRow}>
                    <Text style={styles.username}>{username}</Text>
                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                      <Feather name="edit-3" size={18} color="#aaa" />
                    </TouchableOpacity>
                  </View>
                )}
                <Text style={styles.badge}>
                  {isPremium ? "👑 Premium" : null}
                </Text>
              </View>
            </View>
          </View>

          {/* Time & Credits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏳ Time & Credits</Text>
            {isPremium ? (
              <Text style={styles.unlimited}>Unlimited Chat Time</Text>
            ) : (
              <>
              <Text style={styles.timeLabel}>Free Time Today: {formatTime(safeDailyTime)}</Text>
              <Text style={styles.timeLabel}>Paid Time: {formatTime(safePaidTime)}</Text>
              <Text style={styles.timeLabel}>Total: {formatTime(totalTime)}</Text>
              </>
            )}
            <Text style={styles.creditLine}>
              💰 Credits: {credits ?? 0} ({formatTime((credits ?? 0) * 6 * 60)})
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            <TouchableOpacity style={styles.action} onPress={onShowReferral}>
              <Ionicons name="people" size={20} color="#c4b5fd" />
              <Text style={styles.actionText}>Referral Program</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={onShowRewards}>
              <Entypo name="gift" size={20} color="#c4b5fd" />
              <Text style={styles.actionText}>My Rewards</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  badge: {
    color: "#c4b5fd",
    marginTop: 4,
    fontSize: 14,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 8,
    borderRadius: 8,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  timeLabel: {
    color: "#c4b5fd",
    marginVertical: 2,
  },
  unlimited: {
    color: "#4ade80",
    fontWeight: "bold",
  },
  creditLine: {
    color: "#fde68a",
    marginTop: 8,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  actionText: {
    color: "#fff",
    fontSize: 15,
  },
});

