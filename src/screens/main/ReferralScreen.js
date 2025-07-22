import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  TextInput,
  SafeAreaView,
  Clipboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser } from '../../context/UserContext';
import { UserService } from '../../services/UserService';
import { COLORS, formatCredits } from '../../utils/helpers';

const ReferralScreen = ({ navigation }) => {
  const { user } = useUser();
  const [referralStats, setReferralStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyingCode, setApplyingCode] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState('');

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    if (!user?.uid) return;

    try {
      const stats = await UserService.getReferralStats(user.uid);
      setReferralStats(stats);
    } catch (error) {
      console.error('Error loading referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareReferralCode = async () => {
    const referralCode = user?.referralCode;
    if (!referralCode) return;

    const message = `Join me on SafeTalk and chat anonymously with people worldwide! Use my referral code "${referralCode}" and we both get bonus credits. Download now: https://safetalk.app`;

    try {
      await Share.share({
        message,
        title: 'Join SafeTalk',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyCode = async () => {
    const referralCode = user?.referralCode;
    if (!referralCode) return;

    try {
      await Clipboard.setString(referralCode);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const handleApplyReferralCode = async () => {
    if (!referralCodeInput.trim()) {
      Alert.alert('Invalid Code', 'Please enter a referral code');
      return;
    }

    if (referralCodeInput.toUpperCase() === user?.referralCode) {
      Alert.alert('Invalid Code', 'You cannot use your own referral code');
      return;
    }

    setApplyingCode(true);

    try {
      const result = await UserService.applyReferralCode(user?.uid, referralCodeInput.toUpperCase());
      
      if (result.success) {
        Alert.alert(
          'Success! 🎉',
          `You've earned ${result.creditsEarned} bonus credits! The person who referred you also earned credits.`,
          [{ text: 'Awesome!', onPress: () => setReferralCodeInput('') }]
        );
        loadReferralStats();
      } else {
        Alert.alert('Invalid Code', result.error || 'This referral code is not valid');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to apply referral code');
    } finally {
      setApplyingCode(false);
    }
  };

  const renderReferral = (referral, index) => {
    const date = referral.createdAt?.toDate?.() || new Date(referral.createdAt);
    
    return (
      <View key={index} style={styles.referralItem}>
        <View style={styles.referralIcon}>
          <Icon name="person" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.referralContent}>
          <Text style={styles.referralTitle}>Friend Joined</Text>
          <Text style={styles.referralDate}>
            {date.toLocaleDateString()}
          </Text>
          <Text style={styles.referralStatus}>
            {referral.status === 'completed' ? 'Credits earned' : 'Pending'}
          </Text>
        </View>
        <Text style={styles.referralCredits}>
          +{formatCredits(referral.creditsAwarded || 0)}
        </Text>
      </View>
    );
  };

  const benefits = [
    {
      icon: 'people',
      title: 'Invite Friends',
      description: 'Share your unique referral code with friends',
    },
    {
      icon: 'card-giftcard',
      title: 'Both Get Credits',
      description: 'You and your friend both earn bonus credits',
    },
    {
      icon: 'all-inclusive',
      title: 'Unlimited Referrals',
      description: 'No limit on how many friends you can invite',
    },
    {
      icon: 'trending-up',
      title: 'Earn More',
      description: 'The more friends you invite, the more you earn',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referral Program</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Icon name="stars" size={32} color={COLORS.warning} />
            <Text style={styles.statsTitle}>Your Referral Stats</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {referralStats?.totalReferrals || 0}
              </Text>
              <Text style={styles.statLabel}>Friends Invited</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatCredits(referralStats?.totalCreditsEarned || 0)}
              </Text>
              <Text style={styles.statLabel}>Credits Earned</Text>
            </View>
          </View>
        </View>

        {/* Your Referral Code */}
        <View style={styles.referralCard}>
          <View style={styles.referralCodeHeader}>
            <Icon name="share" size={24} color={COLORS.primary} />
            <Text style={styles.referralCodeTitle}>Your Referral Code</Text>
          </View>
          
          <View style={styles.referralCodeContainer}>
            <Text style={styles.referralCode}>{user?.referralCode}</Text>
            <View style={styles.referralCodeActions}>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyCode}
              >
                <Icon name="content-copy" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareReferralCode}
              >
                <Icon name="share" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.referralCodeDescription}>
            Share this code with friends and you both get bonus credits when they join SafeTalk!
          </Text>
        </View>

        {/* Apply Referral Code */}
        <View style={styles.applyCard}>
          <View style={styles.applyHeader}>
            <Icon name="redeem" size={24} color={COLORS.success} />
            <Text style={styles.applyTitle}>Have a Referral Code?</Text>
          </View>
          
          <Text style={styles.applyDescription}>
            Enter a friend's referral code to earn bonus credits
          </Text>
          
          <View style={styles.applyInputContainer}>
            <TextInput
              style={styles.applyInput}
              value={referralCodeInput}
              onChangeText={setReferralCodeInput}
              placeholder="Enter referral code"
              placeholderTextColor={COLORS.placeholder}
              autoCapitalize="characters"
              maxLength={8}
            />
            <TouchableOpacity
              style={[
                styles.applyButton,
                (!referralCodeInput.trim() || applyingCode) && styles.applyButtonDisabled,
              ]}
              onPress={handleApplyReferralCode}
              disabled={!referralCodeInput.trim() || applyingCode}
            >
              <Text style={styles.applyButtonText}>
                {applyingCode ? 'Applying...' : 'Apply'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>How It Works</Text>
          <View style={styles.benefits}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitNumber}>
                  <Text style={styles.benefitNumberText}>{index + 1}</Text>
                </View>
                <View style={[styles.benefitIcon, { backgroundColor: `${COLORS.primary}15` }]}>
                  <Icon name={benefit.icon} size={24} color={COLORS.primary} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>{benefit.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Referral History */}
        {referralStats && referralStats.referrals.length > 0 && (
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Referral History</Text>
            <View style={styles.historyContainer}>
              {referralStats.referrals.slice(0, 5).map(renderReferral)}
              
              {referralStats.referrals.length > 5 && (
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All Referrals</Text>
                  <Icon name="chevron-right" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Terms */}
        <View style={styles.termsCard}>
          <Text style={styles.termsTitle}>Referral Terms</Text>
          <Text style={styles.termsText}>
            • Both you and your friend earn credits when they join using your code{'\n'}
            • Credits are awarded after your friend completes their first chat{'\n'}
            • Each referral code can only be used once{'\n'}
            • You cannot use your own referral code{'\n'}
            • SafeTalk reserves the right to modify these terms
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  referralCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  referralCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  referralCodeTitle: {
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  referralCodeActions: {
    flexDirection: 'row',
  },
  copyButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginRight: 8,
  },
  shareButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 22,
  },
  referralCodeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  applyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  applyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  applyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  applyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  applyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applyInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  applyButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  applyButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  howItWorksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  benefits: {},
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  benefitNumber: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  historyContainer: {},
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  referralIcon: {
    width: 44,
    height: 44,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  referralContent: {
    flex: 1,
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  referralDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  referralStatus: {
    fontSize: 12,
    color: COLORS.success,
  },
  referralCredits: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
    marginRight: 4,
  },
  termsCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default ReferralScreen;