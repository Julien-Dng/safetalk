import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Gift,
  Coins,
  Star,
  Crown,
  Palette,
  Zap,
  Trophy,
  Info,
} from 'lucide-react-native';

interface MyRewardsScreenProps {
  onBack: () => void;
  giftableCredits: number;
  isPremium: boolean;
  onConvertCredits: () => void;
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
    variant === 'outline' ? styles.badgeOutline : styles.badgeDefault,
    style
  ]}>
    {children}
  </View>
);

// Custom Progress Component
const Progress = ({ value, style }: { value: number; style?: any }) => (
  <View style={[styles.progressContainer, style]}>
    <View style={[styles.progressBar, { width: `${value}%` }]} />
  </View>
);

export function MyRewardsScreen({
  onBack,
  giftableCredits,
  isPremium,
  onConvertCredits
}: MyRewardsScreenProps) {
  const canConvert = giftableCredits >= 15;
  const rewardsAvailable = Math.floor(giftableCredits / 15);

  const availableRewards = [
    {
      id: "theme",
      name: "Cosmic Theme",
      description: "Exclusive galaxy-inspired dark theme",
      icon: Palette,
      cost: 1,
      colors: ['#a855f7', '#ec4899'] // purple to pink
    },
    {
      id: "badge",
      name: "Premium Badge",
      description: "Show your supporter status",
      icon: Crown,
      cost: 1,
      colors: ['#eab308', '#f97316'] // yellow to orange
    },
    {
      id: "boost",
      name: "Visibility Boost",
      description: "Higher priority in matching for 7 days",
      icon: Zap,
      cost: 2,
      colors: ['#3b82f6', '#06b6d4'] // blue to cyan
    },
    {
      id: "vip",
      name: "VIP Status",
      description: "Special recognition and perks for 30 days",
      icon: Trophy,
      cost: 3,
      colors: ['#8b5cf6', '#6366f1'] // purple to indigo
    }
  ];

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
        
        <Text style={styles.headerTitle}>My Rewards</Text>
        
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Credits Available to Offer */}
        <Card style={styles.section}>
          <View style={styles.sectionContent}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Gift size={20} color="#facc15" />
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Credits Available to Offer</Text>
                <Text style={styles.sectionSubtitle}>Help others continue their conversations</Text>
              </View>
            </View>

            <View style={isPremium ? styles.creditsContainerPremium : styles.creditsContainer}>
              <View style={styles.creditsDisplay}>
                {!isPremium ? (
                  <Badge style={styles.nonPremiumFeature}>
                    <Text style={styles.premiumBadgeText}>Premium Feature</Text>
                  </Badge>): (null)}
                <Text style={styles.creditsNumber}>{giftableCredits}</Text>
                <Text style={styles.creditsLabel}>Giftable credits</Text>
              </View>
              
              {isPremium ? (
                <View style={styles.premiumInfo}>
                  <View style={styles.infoRow}>
                    <Info size={16} color="#60a5fa" />
                    <Text style={styles.infoText}>
                      You can send credits to your chat partner if they're on a free plan.
                    </Text>
                  </View>
                  
                  {giftableCredits === 0 && (
                    <View style={styles.warningContainer}>
                      <Text style={styles.warningText}>
                        💡 You need giftable credits to use this feature. Earn more through referrals or purchases.
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                null
              )}
            </View>
          </View>
        </Card>
        {!isPremium ? (
        <TouchableOpacity style={styles.upgradeButton} activeOpacity={0.8}>
          <LinearGradient
            colors={['#7c3aed', '#7c3aed']}
            style={styles.upgradeButtonGradient}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </LinearGradient>
        </TouchableOpacity>
        ): ( null )}

        {/* Convert Unused Credits */}
        {/* {isPremium && (
          <Card style={styles.section}>
            <View style={styles.sectionContent}>
              <View style={styles.sectionHeader}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                  <Coins size={20} color="#a78bfa" />
                </View>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>Convert Unused Credits</Text>
                  <Text style={styles.sectionSubtitle}>Turn credits into exclusive rewards</Text>
                </View>
              </View>

              <View style={styles.convertContainer}>
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress to next reward</Text>
                    <Text style={styles.progressValue}>
                      {giftableCredits}/15 credits
                    </Text>
                  </View>
                  <Progress 
                    value={(giftableCredits % 15) / 15 * 100}
                    style={styles.progressBar}
                  />
                </View>

                <View style={styles.rewardsSection}>
                  <Text style={styles.rewardsLabel}>Available rewards</Text>
                  <Text style={styles.rewardsNumber}>{rewardsAvailable}</Text>
                  <Text style={styles.rewardsSubtext}>15 credits = 1 reward</Text>
                </View>

                <TouchableOpacity
                  onPress={onConvertCredits}
                  disabled={!canConvert}
                  style={[
                    styles.convertButton,
                    !canConvert && styles.convertButtonDisabled
                  ]}
                  activeOpacity={canConvert ? 0.8 : 1}
                >
                  <LinearGradient
                    colors={canConvert ? ['#a855f7', '#ec4899'] : ['#6b7280', '#6b7280']}
                    style={styles.convertButtonGradient}
                  >
                    {canConvert ? (
                      <View style={styles.convertButtonContent}>
                        <Star size={16} color="#ffffff" />
                        <Text style={styles.convertButtonText}>Use My Credits</Text>
                      </View>
                    ) : (
                      <Text style={styles.convertButtonText}>
                        Need {15 - (giftableCredits % 15)} more credits
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )} */}

        {/* Available Rewards Preview */}
        {isPremium && rewardsAvailable > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Available Rewards</Text>
              
              <View style={styles.rewardsGrid}>
                {availableRewards.map((reward) => {
                  const IconComponent = reward.icon;
                  const canAfford = rewardsAvailable >= reward.cost;
                  
                  return (
                    <View
                      key={reward.id}
                      style={[
                        styles.rewardItem,
                        canAfford ? styles.rewardItemAffordable : styles.rewardItemUnaffordable
                      ]}
                    >
                      <View style={styles.rewardContent}>
                        <LinearGradient
                          colors={reward.colors}
                          style={styles.rewardIcon}
                        >
                          <IconComponent size={20} color="#ffffff" />
                        </LinearGradient>
                        
                        <View style={styles.rewardInfo}>
                          <View style={styles.rewardHeader}>
                            <Text style={styles.rewardName}>{reward.name}</Text>
                            <Badge variant="outline" style={styles.rewardCostBadge}>
                              <Text style={styles.rewardCostText}>
                                {reward.cost} reward{reward.cost !== 1 ? 's' : ''}
                              </Text>
                            </Badge>
                          </View>
                          <Text style={styles.rewardDescription}>{reward.description}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </Card>
        )}

        {/* Premium Upgrade CTA for Free Users */}
        {/* {!isPremium && (
          <Card style={styles.upgradeCard}>
            <View style={styles.upgradeContent}>
              <LinearGradient
                colors={['#a855f7', '#ec4899']}
                style={styles.upgradeIcon}
              >
                <Crown size={32} color="#ffffff" />
              </LinearGradient>
              
              <View style={styles.upgradeTextSection}>
                <Text style={styles.upgradeTitle}>Unlock Rewards</Text>
                <Text style={styles.upgradeDescription}>
                  Upgrade to Premium to access giftable credits, exclusive rewards, and help other users continue their conversations.
                </Text>
              </View>
              
              <TouchableOpacity style={styles.upgradeButton} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#a855f7', '#ec4899']}
                  style={styles.upgradeButtonGradient}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Card>
        )} */}
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  spacer: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  card: {
    backgroundColor: 'rgba(88, 28, 135, 0.3)',
    borderWidth: 1,
    borderColor: '#6b21a8',
    borderRadius: 16,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionContent: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtitle: {
    color: '#d8b4fe',
    fontSize: 14,
    marginTop: 2,
  },
  creditsContainer: {
    backgroundColor: 'rgba(88, 28, 135, 0.5)',
    borderRadius: 16,
    paddingTop: 16,
  },
  creditsContainerPremium: {
    backgroundColor: 'rgba(88, 28, 135, 0.5)',
    borderRadius: 16,
    padding: 16,
  },
  creditsDisplay: {
    alignItems: 'center',
    marginBottom: 12,
  },
  creditsNumber: {
    fontSize: 32,
    color: '#facc15',
    fontWeight: '600',
    marginBottom: 4,
  },
  creditsLabel: {
     color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  premiumInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    color: '#c4b5fd',
    fontSize: 10,
    flex: 1,
    lineHeight: 20,
  },
  warningContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 8,
  },
  warningText: {
    color: '#fde68a',
    fontSize: 14,
    lineHeight: 20,
  },
  nonPremiumFeature:{
    flexDirection: 'row',
    justifyContent: 'center'
  },
  nonPremiumInfo: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 22,
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
    textAlign: 'center',
    fontWeight: '600',
  },
  upgradeText: {
    color: '#d8b4fe',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  convertContainer: {
    backgroundColor: 'rgba(88, 28, 135, 0.5)',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: '#c4b5fd',
    fontSize: 14,
  },
  progressValue: {
    color: '#c4b5fd',
    fontSize: 14,
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(88, 28, 135, 0.5)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#a855f7',
    borderRadius: 4,
  },
  rewardsSection: {
    alignItems: 'center',
    gap: 4,
  },
  rewardsLabel: {
    color: '#c4b5fd',
    fontSize: 14,
  },
  rewardsNumber: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
  },
  rewardsSubtext: {
    color: '#d8b4fe',
    fontSize: 12,
  },
  convertButton: {
    height: 48,
    borderRadius: 12,
  },
  convertButtonDisabled: {
    opacity: 0.5,
  },
  convertButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  convertButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  convertButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  rewardsGrid: {
    gap: 12,
  },
  rewardItem: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  rewardItemAffordable: {
    borderColor: '#6b21a8',
    backgroundColor: 'rgba(88, 28, 135, 0.2)',
  },
  rewardItemUnaffordable: {
    borderColor: '#6b21a8',
    backgroundColor: 'rgba(88, 28, 135, 0.1)',
    opacity: 0.6,
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rewardName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  rewardCostBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rewardCostText: {
    color: '#c4b5fd',
    fontSize: 12,
  },
  rewardDescription: {
    color: '#d8b4fe',
    fontSize: 12,
    lineHeight: 16,
  },
  upgradeCard: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderColor: '#a78bfa',
    marginBottom: 24,
  },
  upgradeContent: {
    alignItems: 'center',
    gap: 16,
  },
  upgradeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeTextSection: {
    alignItems: 'center',
    gap: 8,
  },
  upgradeTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  upgradeDescription: {
    color: '#c4b5fd',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  upgradeButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
  },
  upgradeButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});