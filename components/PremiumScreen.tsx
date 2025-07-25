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
  Crown,
  MessageCircle,
  Zap,
  Shield,
  Users,
  Star,
  Check,
} from 'lucide-react-native';

interface PremiumScreenProps {
  onBack: () => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

// Custom Card Component
const Card = ({ children, style }: any) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

// Custom Badge Component
const Badge = ({ children, style }: any) => (
  <View style={[styles.badge, style]}>
    {children}
  </View>
);

export function PremiumScreen({ onBack, isPremium, onUpgrade }: PremiumScreenProps) {
  const features = [
    {
      icon: MessageCircle,
      title: "Unlimited Chats",
      description: "Chat as long as you want without time limits",
      color: "#3b82f6" // blue-500
    },
    {
      icon: Zap,
      title: "No Ads",
      description: "Enjoy an uninterrupted, clean experience",
      color: "#8b5cf6" // purple-500
    },
    // {
    //   icon: Shield,
    //   title: "Message Control",
    //   description: "Choose whether to save important conversations",
    //   color: "#10b981" // green-500
    // },
    {
      icon: Users,
      title: "Priority Matching",
      description: "Get connected faster with priority queue",
      color: "#eab308" // yellow-500
    },
    // {
    //   icon: Star,
    //   title: "Exclusive Features",
    //   description: "Access to beta features and special perks",
    //   color: "#ec4899" // pink-500
    // },
    {
      icon: Crown,
      title: "Premium Badge",
      description: "Show your support with a special badge",
      color: "#6366f1" // indigo-500
    }
  ];

  const pricingPlans = [
    {
      name: "Monthly",
      price: "$9.99",
      period: "per month",
      savings: null,
      popular: false
    },
    {
      name: "Yearly",
      price: "$79.99",
      period: "per year",
      savings: "Save 33%",
      popular: true
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
        
        <Text style={styles.headerTitle}>Premium</Text>
        
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#a855f7', '#ec4899']}
            style={styles.heroIcon}
          >
            <Crown size={40} color="#ffffff" />
          </LinearGradient>
          
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Safetalk Premium</Text>
            <Text style={styles.heroSubtitle}>
              Unlock the full potential of anonymous conversations
            </Text>
          </View>
          
          {isPremium && (
            <Badge style={styles.premiumActiveBadge}>
              <Crown size={12} color="#ffffff" />
              <Text style={styles.premiumActiveText}>Premium Active</Text>
            </Badge>
          )}
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <View style={styles.featureContent}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <feature.icon size={24} color="#ffffff" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                {isPremium && (
                  <View style={styles.checkIcon}>
                    <Check size={16} color="#ffffff" />
                  </View>
                )}
              </View>
            </Card>
          ))}
        </View>

        {/* Pricing Plans */}
        {!isPremium && (
          <View style={styles.pricingSection}>
            <Text style={styles.pricingTitle}>Choose Your Plan</Text>
            <View style={styles.plansContainer}>
              {pricingPlans.map((plan, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={onUpgrade}
                >
                  <Card style={[
                    styles.planCard,
                    plan.popular ? styles.planCardPopular : styles.planCardDefault
                  ]}>
                    <View style={styles.planContent}>
                      {plan.popular && (
                        <Badge style={styles.popularBadge}>
                          <Text style={styles.popularBadgeText}>Most Popular</Text>
                        </Badge>
                      )}
                      
                      <View style={styles.planInfo}>
                        <Text style={styles.planName}>{plan.name}</Text>
                        <View style={styles.priceContainer}>
                          <Text style={styles.planPrice}>{plan.price}</Text>
                          <Text style={styles.planPeriod}>{plan.period}</Text>
                        </View>
                        {plan.savings && (
                          <Text style={styles.planSavings}>{plan.savings}</Text>
                        )}
                      </View>
                      
                      <TouchableOpacity
                        style={[
                          styles.selectButton,
                          plan.popular ? styles.selectButtonPopular : styles.selectButtonDefault
                        ]}
                        onPress={onUpgrade}
                        activeOpacity={0.8}
                      >
                        {plan.popular ? (
                          <LinearGradient
                            colors={['#a855f7', '#ec4899']}
                            style={styles.selectButtonGradient}
                          >
                            <Text style={styles.selectButtonText}>Select {plan.name}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={styles.selectButtonDefault}>
                            <Text style={styles.selectButtonText}>Select {plan.name}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Premium Stats */}
        {/* {isPremium && (
          <Card style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Premium Stats</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>∞</Text>
                <Text style={styles.statLabel}>Unlimited chats</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24/7</Text>
                <Text style={styles.statLabel}>Priority support</Text>
              </View>
            </View>
          </Card>
        )} */}

        {/* FAQ */}
        {/* <Card style={styles.faqCard}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
              <Text style={styles.faqAnswer}>
                Yes, you can cancel your subscription at any time from your account settings.
              </Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What happens to my chats?</Text>
              <Text style={styles.faqAnswer}>
                Chats remain anonymous and ephemeral. Premium just removes time limits.
              </Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Is my data safe?</Text>
              <Text style={styles.faqAnswer}>
                We prioritize privacy and security. Your conversations are encrypted and anonymous.
              </Text>
            </View>
          </View>
        </Card> */}

        {/* Manage Subscription */}
        {isPremium && (
          <View style={styles.manageSection}>
            <TouchableOpacity style={styles.manageButton} activeOpacity={0.7}>
              <Text style={styles.manageButtonText}>Manage Subscription</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} activeOpacity={0.7}>
              <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
            </TouchableOpacity>
          </View>
        )}
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
  },
  heroSubtitle: {
    color: '#c4b5fd',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  premiumActiveBadge: {
    backgroundColor: '#a855f7',
    gap: 4,
  },
  premiumActiveText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    padding: 16,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    color: '#c4b5fd',
    fontSize: 14,
    lineHeight: 20,
  },
  checkIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#10b981',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pricingSection: {
    marginBottom: 24,
  },
  pricingTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    padding: 24,
    borderWidth: 2,
  },
  planCardDefault: {
    borderColor: '#6b21a8',
    backgroundColor: 'rgba(88, 28, 135, 0.1)',
  },
  planCardPopular: {
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(88, 28, 135, 0.3)',
  },
  planContent: {
    alignItems: 'center',
    gap: 12,
  },
  popularBadge: {
    backgroundColor: '#a855f7',
  },
  popularBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  planInfo: {
    alignItems: 'center',
    gap: 4,
  },
  planName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  planPrice: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  planPeriod: {
    color: '#c4b5fd',
    fontSize: 14,
  },
  planSavings: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '500',
  },
  selectButton: {
    width: '100%',
    height: 48,
    borderRadius: 16,
  },
  selectButtonPopular: {},
  selectButtonDefault: {
    backgroundColor: '#6b21a8',
  },
  selectButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    padding: 24,
    marginBottom: 24,
  },
  statsTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#c4b5fd',
    fontSize: 14,
    textAlign: 'center',
  },
  faqCard: {
    padding: 24,
    marginBottom: 24,
  },
  faqTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  faqContainer: {
    gap: 16,
  },
  faqItem: {
    gap: 4,
  },
  faqQuestion: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  faqAnswer: {
    color: '#c4b5fd',
    fontSize: 14,
    lineHeight: 20,
  },
  manageSection: {
    gap: 12,
    marginBottom: 24,
  },
  manageButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6b21a8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#d8b4fe',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#b91c1c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: '600',
  },
});