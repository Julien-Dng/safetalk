// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";

// interface SetupScreenProps {
//   onShowAccount: () => void;
//   onComplete: (role: string) => void;
// }

// export function SetupScreen({ onComplete, onShowAccount}: SetupScreenProps) {
//   const [selectedRole, setSelectedRole] = useState<string | null>(null);

//   const handleComplete = () => {
//     if (selectedRole) {
//       onComplete(selectedRole);
//     }
//   };

//   return (
//     <LinearGradient
//       colors={['#0f0f23', '#1a1a2e', '#16213e']}
//       style={styles.container}
//     >
//       <SafeAreaView style={styles.safeArea}>
//         <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity
//             style={styles.accountButton}
//             onPress={onShowAccount}
//           >
//             <Ionicons name="settings-outline" size={20} color="#c4b5fd" />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.content}>
//           <View style={styles.setupContainer}>
//             <Text style={styles.title}>How do you want to use SafeTalk?</Text>
//             <Text style={styles.subtitle}>You can change this later</Text>

//             <View style={styles.roleOptions}>
//               <TouchableOpacity
//                 style={[
//                   styles.roleButton,
//                   selectedRole === "talk" && styles.roleButtonSelected
//                 ]}
//                 onPress={() => setSelectedRole("talk")}
//               >
//                 <Text style={styles.roleEmoji}>💬</Text>
//                 <Text style={styles.roleTitle}>I want to talk</Text>
//                 <Text style={styles.roleDescription}>
//                   Share what's on your mind with caring listeners
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[
//                   styles.roleButton,
//                   selectedRole === "listen" && styles.roleButtonSelected
//                 ]}
//                 onPress={() => setSelectedRole("listen")}
//               >
//                 <Text style={styles.roleEmoji}>👂</Text>
//                 <Text style={styles.roleTitle}>I want to listen</Text>
//                 <Text style={styles.roleDescription}>
//                   Provide support and be there for others
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[
//                   styles.roleButton,
//                   selectedRole === "both" && styles.roleButtonSelected
//                 ]}
//                 onPress={() => setSelectedRole("both")}
//               >
//                 <Text style={styles.roleEmoji}>🤝</Text>
//                 <Text style={styles.roleTitle}>Both</Text>
//                 <Text style={styles.roleDescription}>
//                   Sometimes talk, sometimes listen
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity
//               style={[
//                 styles.continueButton,
//                 !selectedRole && styles.continueButtonDisabled
//               ]}
//               onPress={handleComplete}
//               disabled={!selectedRole}
//             >
//               <Text style={styles.continueButtonText}>Continue</Text>
//             </TouchableOpacity>
//           </View>
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
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     padding: 16,
//   },
//    accountButton: {
//     padding: 8,
//   },

//   content: {
//     flex: 1,
//     paddingHorizontal: 24,
//   },
//   setupContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     gap: 24,
//   },
//   title: {
//     color: '#ffffff',
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   subtitle: {
//     color: '#c4b5fd',
//     fontSize: 16,
//     textAlign: 'center',
//     marginTop: -8,
//   },
//   roleOptions: {
//     gap: 16,
//   },
//   roleButton: {
//     backgroundColor: 'rgba(124, 58, 237, 0.2)',
//     borderWidth: 2,
//     borderColor: 'transparent',
//     borderRadius: 16,
//     padding: 20,
//     alignItems: 'center',
//   },
//   roleButtonSelected: {
//     borderColor: '#7c3aed',
//     backgroundColor: 'rgba(124, 58, 237, 0.3)',
//   },
//   roleEmoji: {
//     fontSize: 32,
//     marginBottom: 8,
//   },
//   roleTitle: {
//     color: '#ffffff',
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   roleDescription: {
//     color: '#c4b5fd',
//     fontSize: 14,
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   continueButton: {
//     backgroundColor: '#7c3aed',
//     borderRadius: 16,
//     padding: 16,
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   continueButtonDisabled: {
//     opacity: 0.5,
//   },
//   continueButtonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });



import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, MessageCircle, Ear, Users } from 'lucide-react-native';

interface SetupScreenProps {
  onShowAccount: () => void;
  onComplete: (role: string) => void;
}

export function SetupScreen({ onShowAccount, onComplete }: SetupScreenProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleComplete = () => {
    if (selectedRole) {
      onComplete(selectedRole);
    }
  };

  const roles = [
    {
      id: "talk",
      title: "I want to talk",
      description: "Share what's on your mind with caring listeners",
      icon: MessageCircle,
      color: "#3b82f6", // blue-500
    },
    {
      id: "listen", 
      title: "I want to listen",
      description: "Provide support and be there for others",
      icon: Ear,
      color: "#10b981", // green-500
    },
    {
      id: "both",
      title: "Both",
      description: "Sometimes talk, sometimes listen",
      icon: Users,
      color: "#8b5cf6", // purple-500
    }
  ];

  return (
    <LinearGradient 
      colors={['#0f0f23', '#1a1a2e', '#16213e']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.accountButton}
            onPress={onShowAccount}
          >
            <Settings size={20} color="#c4b5fd" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              How do you want to use SafeTalk?
            </Text>
            <Text style={styles.subtitle}>
              You can change this later
            </Text>
          </View>

          {/* Role Options */}
          <View style={styles.rolesContainer}>
            {roles.map((role) => {
              const IconComponent = role.icon;
              const isSelected = selectedRole === role.id;
              
              return (
                <TouchableOpacity
                  key={role.id}
                  onPress={() => setSelectedRole(role.id)}
                  style={[
                    styles.roleButton,
                    isSelected ? styles.roleButtonSelected : styles.roleButtonDefault
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.roleContent}>
                    <View style={[styles.iconContainer, { backgroundColor: role.color }]}>
                      <IconComponent size={24} color="#ffffff" />
                    </View>
                    <View style={styles.roleTextContainer}>
                      <Text style={styles.roleTitle}>
                        {role.title}
                      </Text>
                      <Text style={styles.roleDescription}>
                        {role.description}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <View style={styles.selectedDot} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleComplete}
            disabled={!selectedRole}
            style={[
              styles.continueButton,
              !selectedRole && styles.continueButtonDisabled
            ]}
            activeOpacity={selectedRole ? 0.8 : 1}
          >
            <LinearGradient
              colors={selectedRole ? ['#a855f7', '#ec4899'] : ['#6b7280', '#6b7280']}
              style={styles.continueButtonGradient}
            >
              <Text style={[
                styles.continueButtonText,
                !selectedRole && styles.continueButtonTextDisabled
              ]}>
                Continue
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Helper Text */}
          <Text style={styles.helperText}>
            💡 You can change your preference anytime in settings
          </Text>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 16,
  },
  accountButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#c4b5fd',
    textAlign: 'center',
    lineHeight: 24,
  },
  rolesContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 32,
  },
  roleButton: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  roleButtonDefault: {
    borderColor: '#6b21a8',
    backgroundColor: 'rgba(88, 28, 135, 0.1)',
  },
  roleButtonSelected: {
    borderColor: '#a78bfa',
    backgroundColor: 'rgba(88, 28, 135, 0.3)',
  },
  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#d8b4fe',
    lineHeight: 20,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    width: 8,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  continueButton: {
    width: '100%',
    maxWidth: 400,
    height: 48,
    borderRadius: 16,
    marginBottom: 24,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  continueButtonTextDisabled: {
    color: '#9ca3af',
  },
  helperText: {
    fontSize: 14,
    color: '#a78bfa',
    textAlign: 'center',
    lineHeight: 20,
  },
});