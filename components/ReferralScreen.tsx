import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Clipboard,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Share2,
  Users,
  Gift,
  Star,
  Crown,
  Copy,
} from 'lucide-react-native';

interface ReferralScreenProps {
  onBack: () => void;
  isPremium: boolean;
  referralCount: number;
  totalRewards: number;
}

// Custom Card Component
const Card = ({ children, style }: any) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

// Custom Badge Component
const Badge = ({ children, variant = 'default', style }: any) => (
  <View style={[
    styles.badge,
    variant === 'secondary' ? styles.badgeSecondary : styles.badgeDefault,
    style
  ]}>
    {children}
  </View>
);

export function ReferralScreen({ 
  onBack, 
  isPremium, 
  referralCount, 
  totalRewards 
}: ReferralScreenProps) {
  const referralCode = "SAFE2024XYZ";
  const recentRewards = [
    { id: 1, type: "credits", amount: 5, date: "2 hours ago", from: "Anonymous456" },
    { id: 2, type: "credits", amount: 5, date: "1 day ago", from: "Anonymous123" },
    { id: 3, type: "premium", amount: 1, date: "3 days ago", from: "Anonymous789" },
  ];

  const handleShare = async () => {
    const shareUrl = `https://safetalk.app/invite/${referralCode}`;
    try {
      await Share.share({
        message: `Join me on Safetalk - anonymous, safe conversations: ${shareUrl}`,
        url: shareUrl,
        title: 'Join Safetalk',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const copyReferralCode = () => {
    Clipboard.setString(referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0b2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <ArrowLeft size={16} color="#c4b5fd" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Referral Program</Text>
        
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: '#3b82f6' }]}>
                <Users size={16} color="#ffffff" />
              </View>
              <Text style={styles.statNumber}>{referralCount}</Text>
              <Text style={styles.statLabel}>Referrals</Text>
            </View>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: '#10b981' }]}>
                <Gift size={16} color="#ffffff" />
              </View>
              <Text style={styles.statNumber}>{totalRewards}</Text>
              <Text style={styles.statLabel}>Total Rewards</Text>
            </View>
          </Card>
        </View>

        {/* Referral Code */}
        <Card style={styles.section}>
          <View style={styles.referralCodeContainer}>
            <LinearGradient
              colors={['#a855f7', '#ec4899']}
              style={styles.shareIcon}
            >
              <Share2 size={32} color="#ffffff" />
            </LinearGradient>
            
            <View style={styles.codeSection}>
              <Text style={styles.codeTitle}>Your Referral Code</Text>
              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>{referralCode}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={copyReferralCode}
                  activeOpacity={0.7}
                >
                  <Copy size={16} color="#c4b5fd" />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <View style={styles.shareButtonContent}>
                <Share2 size={16} color="#ffffff" />
                <Text style={styles.shareButtonText}>Share with Friends</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Card>

        {/* How it Works */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>How it Works</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: '#3b82f6' }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Share your referral code</Text>
                <Text style={styles.stepDescription}>Send to friends who want to join Safetalk</Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: '#8b5cf6' }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>They sign up using your code</Text>
                <Text style={styles.stepDescription}>Both of you get rewards when they join</Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: '#10b981' }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Earn credits & perks</Text>
                <Text style={styles.stepDescription}>Get rewards for every successful referral</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Rewards Breakdown */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Rewards per Referral</Text>
          <View style={styles.rewardsContainer}>
            <View style={styles.rewardItem}>
              <View style={styles.rewardLeft}>
                <View style={[styles.rewardIcon, { backgroundColor: '#3b82f6' }]}>
                  <Gift size={16} color="#ffffff" />
                </View>
                <Text style={styles.rewardTitle}>Free Users</Text>
              </View>
              <Badge variant="secondary">
                <Text style={styles.badgeText}>5 credits</Text>
              </Badge>
            </View>
            
            {isPremium && (
              <>
                <View style={styles.rewardItem}>
                  <View style={styles.rewardLeft}>
                    <View style={[styles.rewardIcon, { backgroundColor: '#8b5cf6' }]}>
                      <Crown size={16} color="#ffffff" />
                    </View>
                    <Text style={styles.rewardTitle}>Premium Users</Text>
                  </View>
                  <Badge>
                    <Text style={styles.premiumBadgeText}>+1 day premium</Text>
                  </Badge>
                </View>
                
                <View style={styles.rewardItem}>
                  <View style={styles.rewardLeft}>
                    <View style={[styles.rewardIcon, { backgroundColor: '#eab308' }]}>
                      <Star size={16} color="#ffffff" />
                    </View>
                    <Text style={styles.rewardTitle}>Premium Bonus</Text>
                  </View>
                  <Badge variant="secondary">
                    <Text style={styles.badgeText}>1 credit/day</Text>
                  </Badge>
                </View>
              </>
            )}
          </View>
        </Card>

        {/* Recent Rewards */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Rewards</Text>
          <View style={styles.recentRewardsContainer}>
            {recentRewards.map((reward) => (
              <View key={reward.id} style={styles.recentRewardItem}>
                <View style={styles.recentRewardLeft}>
                  <View style={[
                    styles.recentRewardIcon,
                    { backgroundColor: reward.type === 'credits' ? '#3b82f6' : '#8b5cf6' }
                  ]}>
                    {reward.type === 'credits' ? (
                      <Gift size={16} color="#ffffff" />
                    ) : (
                      <Crown size={16} color="#ffffff" />
                    )}
                  </View>
                  <View style={styles.recentRewardContent}>
                    <Text style={styles.recentRewardTitle}>
                      {reward.type === 'credits' ? `${reward.amount} credits` : `${reward.amount} day premium`}
                    </Text>
                    <Text style={styles.recentRewardSubtitle}>
                      from {reward.from} • {reward.date}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Card>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  spacer: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(88, 28, 135, 0.2)',
    borderWidth: 1,
    borderColor: '#6b21a8',
    borderRadius: 16,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statContent: {
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#c4b5fd',
    fontSize: 14,
  },
  referralCodeContainer: {
    alignItems: 'center',
    gap: 16,
  },
  shareIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeSection: {
    alignItems: 'center',
    gap: 8,
  },
  codeTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  codeContainer: {
    backgroundColor: 'rgba(88, 28, 135, 0.5)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 200,
  },
  codeText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  copyButton: {
    padding: 8,
  },
  shareButton: {
    backgroundColor: '#6b21a8',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
  },
  shareButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  stepsContainer: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  stepDescription: {
    color: '#c4b5fd',
    fontSize: 14,
    lineHeight: 20,
  },
  rewardsContainer: {
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardTitle: {
    color: '#ffffff',
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeDefault: {
    backgroundColor: '#a855f7',
  },
  badgeSecondary: {
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    borderWidth: 1,
    borderColor: '#9ca3af',
  },
  badgeText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
  premiumBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  recentRewardsContainer: {
    gap: 12,
  },
  recentRewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentRewardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentRewardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentRewardContent: {
    flex: 1,
  },
  recentRewardTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  recentRewardSubtitle: {
    color: '#c4b5fd',
    fontSize: 12,
    marginTop: 2,
  },
});