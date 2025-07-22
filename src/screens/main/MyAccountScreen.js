import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { UserService } from '../../services/UserService';
import { COLORS, formatCredits } from '../../utils/helpers';

const MyAccountScreen = ({ navigation }) => {
  const { user: authUser, signOut } = useAuth();
  const { user, credits, dailyTimer } = useUser();
  const [userStats, setUserStats] = useState(null);
  const [referralStats, setReferralStats] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!authUser?.uid) return;

    try {
      const [stats, referrals] = await Promise.all([
        UserService.getUserStats(authUser.uid),
        UserService.getReferralStats(authUser.uid),
      ]);

      setUserStats(stats);
      setReferralStats(referrals);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const result = await signOut();
            if (!result.success) {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  const getSubscriptionStatus = () => {
    if (user?.isPremium) {
      const endDate = user.subscriptionEndDate?.toDate?.() || new Date(user.subscriptionEndDate);
      const isValid = endDate > new Date();
      
      if (isValid) {
        const days = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
        return `Premium (${days} days left)`;
      } else {
        return 'Premium Expired';
      }
    }
    return 'Free User';
  };

  const menuItems = [
    {
      icon: 'star',
      title: 'Upgrade to Premium',
      subtitle: 'Unlimited chat time + exclusive features',
      onPress: () => navigation.navigate('Premium'),
      showBadge: !user?.isPremium,
      color: COLORS.warning,
    },
    {
      icon: 'account-balance-wallet',
      title: 'Buy Credits',
      subtitle: `${formatCredits(credits?.totalCredits || 0)} credits available`,
      onPress: () => navigation.navigate('Credits'),
      color: COLORS.primary,
    },
    {
      icon: 'people',
      title: 'Referrals',
      subtitle: `${referralStats?.totalReferrals || 0} friends referred`,
      onPress: () => navigation.navigate('Referral'),
      color: COLORS.success,
    },
    {
      icon: 'settings',
      title: 'Settings',
      subtitle: 'App preferences and privacy',
      onPress: () => navigation.navigate('Settings'),
      color: COLORS.textSecondary,
    },
  ];

  const statsItems = [
    {
      label: 'Total Chats',
      value: userStats?.totalChats || 0,
      icon: 'chat',
    },
    {
      label: 'Messages Sent',
      value: userStats?.totalMessagesSent || 0,
      icon: 'send',
    },
    {
      label: 'Average Rating',
      value: userStats?.averageRating ? `${userStats.averageRating.toFixed(1)}⭐` : 'N/A',
      icon: 'star',
    },
    {
      label: 'Credits Earned',
      value: referralStats?.totalCreditsEarned || 0,
      icon: 'monetization-on',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Account</Text>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Icon name="logout" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon name="person" size={40} color={COLORS.textSecondary} />
                </View>
              )}
              
              {user?.isPremium && (
                <View style={styles.premiumBadge}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                </View>
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>
                {user?.displayName || 'SafeTalk User'}
              </Text>
              <Text style={styles.userEmail}>
                {authUser?.email || authUser?.phoneNumber || 'Anonymous'}
              </Text>
              <Text style={[
                styles.subscriptionStatus,
                { color: user?.isPremium ? COLORS.success : COLORS.textSecondary }
              ]}>
                {getSubscriptionStatus()}
              </Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {statsItems.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Icon name={stat.icon} size={20} color={COLORS.primary} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Daily Status */}
        <View style={styles.dailyStatusCard}>
          <View style={styles.dailyStatusHeader}>
            <Icon name="today" size={24} color={COLORS.primary} />
            <Text style={styles.dailyStatusTitle}>Today's Activity</Text>
          </View>
          
          <View style={styles.dailyStatusContent}>
            {user?.isPremium ? (
              <View style={styles.unlimitedStatus}>
                <Icon name="all-inclusive" size={32} color={COLORS.success} />
                <Text style={styles.unlimitedText}>Unlimited Chat Time</Text>
              </View>
            ) : (
              <>
                <View style={styles.timeStatus}>
                  <Text style={styles.timeLabel}>Time Used</Text>
                  <Text style={styles.timeValue}>
                    {Math.round((dailyTimer?.timeUsed || 0) / (1000 * 60))} / 20 minutes
                  </Text>
                </View>
                <View style={styles.creditsStatus}>
                  <Text style={styles.creditsLabel}>Available Credits</Text>
                  <Text style={styles.creditsValue}>
                    {formatCredits(credits?.totalCredits || 0)} credits
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                  <Icon name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              
              <View style={styles.menuItemRight}>
                {item.showBadge && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
                <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Referral Code */}
        <View style={styles.referralCard}>
          <View style={styles.referralHeader}>
            <Icon name="share" size={24} color={COLORS.success} />
            <Text style={styles.referralTitle}>Your Referral Code</Text>
          </View>
          <View style={styles.referralCodeContainer}>
            <Text style={styles.referralCode}>{user?.referralCode}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => {
                // Copy to clipboard functionality would go here
                Alert.alert('Copied!', 'Referral code copied to clipboard');
              }}
            >
              <Icon name="content-copy" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.referralDescription}>
            Share your code with friends and earn credits when they join!
          </Text>
        </View>

        {/* App Info */}
        <View style={styles.appInfoCard}>
          <Text style={styles.appName}>SafeTalk</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Connect safely, chat anonymously
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  signOutButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.warning,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  subscriptionStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  dailyStatusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dailyStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dailyStatusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  dailyStatusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unlimitedStatus: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  unlimitedText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
    marginTop: 8,
  },
  timeStatus: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  creditsStatus: {
    flex: 1,
    alignItems: 'center',
  },
  creditsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  creditsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newBadge: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  referralCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  referralCode: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  copyButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  referralDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  appInfoCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 32,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default MyAccountScreen;