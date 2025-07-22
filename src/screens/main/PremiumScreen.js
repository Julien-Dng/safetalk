import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser } from '../../context/UserContext';
import { PurchaseService } from '../../services/PurchaseService';
import { COLORS, PREMIUM_PACKAGES } from '../../utils/helpers';

const PremiumScreen = ({ navigation }) => {
  const { user, upgradeToPremium } = useUser();
  const [selectedPlan, setSelectedPlan] = useState('YEARLY');
  const [purchasing, setPurchasing] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const result = await PurchaseService.getProducts();
      if (result.success) {
        setProducts(result.products);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const plans = [
    {
      key: 'MONTHLY',
      ...PREMIUM_PACKAGES.MONTHLY,
      title: '1 Month',
      badge: null,
      savings: null,
    },
    {
      key: 'HALF_YEARLY',
      ...PREMIUM_PACKAGES.HALF_YEARLY,
      title: '6 Months',
      badge: 'POPULAR',
      savings: '17% OFF',
    },
    {
      key: 'YEARLY',
      ...PREMIUM_PACKAGES.YEARLY,
      title: '1 Year',
      badge: 'BEST VALUE',
      savings: '25% OFF',
    },
  ];

  const features = [
    {
      icon: 'all-inclusive',
      title: 'Unlimited Chat Time',
      description: 'Chat as long as you want, every day',
      color: COLORS.success,
    },
    {
      icon: 'skip-next',
      title: 'Unlimited Partner Skips',
      description: 'Skip partners without watching ads',
      color: COLORS.primary,
    },
    {
      icon: 'card-giftcard',
      title: 'Gift Credits',
      description: 'Share credits with your chat partners',
      color: COLORS.warning,
    },
    {
      icon: 'star',
      title: 'Premium Badge',
      description: 'Show your premium status to others',
      color: COLORS.secondary,
    },
    {
      icon: 'priority-high',
      title: 'Priority Matching',
      description: 'Get matched faster with other users',
      color: COLORS.danger,
    },
    {
      icon: 'support-agent',
      title: 'Premium Support',
      description: 'Get priority customer support',
      color: COLORS.textSecondary,
    },
  ];

  const handleUpgrade = async () => {
    if (purchasing) return;

    setPurchasing(true);

    try {
      const result = await PurchaseService.purchaseSubscription(user?.uid, selectedPlan);
      
      if (result.success) {
        Alert.alert(
          'Welcome to Premium! 🎉',
          'Your premium subscription is now active. Enjoy unlimited chat time and exclusive features!',
          [{ text: 'Awesome!', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Purchase Failed', result.error || 'Unable to complete purchase');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const result = await PurchaseService.restorePurchases(user?.uid);
      
      if (result.success && result.restoredPurchases.length > 0) {
        Alert.alert(
          'Purchases Restored',
          `${result.restoredPurchases.length} purchase(s) restored successfully.`
        );
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases to restore.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases');
    }
  };

  const renderPlan = (plan) => {
    const isSelected = selectedPlan === plan.key;
    const monthlyPrice = plan.key === 'MONTHLY' ? plan.price : plan.price / (plan.key === 'YEARLY' ? 12 : 6);
    
    return (
      <TouchableOpacity
        key={plan.key}
        style={[
          styles.planCard,
          isSelected && styles.planCardSelected,
        ]}
        onPress={() => setSelectedPlan(plan.key)}
      >
        {plan.badge && (
          <View style={[
            styles.planBadge,
            { backgroundColor: plan.key === 'YEARLY' ? COLORS.success : COLORS.warning }
          ]}>
            <Text style={styles.planBadgeText}>{plan.badge}</Text>
          </View>
        )}
        
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          {plan.savings && (
            <Text style={styles.planSavings}>{plan.savings}</Text>
          )}
        </View>
        
        <View style={styles.planPricing}>
          <Text style={styles.planPrice}>€{plan.price}</Text>
          <Text style={styles.planPeriod}>
            €{monthlyPrice.toFixed(2)}/month
          </Text>
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Icon name="check-circle" size={24} color={COLORS.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFeature = (feature, index) => (
    <View key={index} style={styles.featureItem}>
      <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
        <Icon name={feature.icon} size={24} color={feature.color} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );

  if (user?.isPremium) {
    const endDate = user.subscriptionEndDate?.toDate?.() || new Date(user.subscriptionEndDate);
    const isValid = endDate > new Date();
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium Status</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.premiumStatusCard}>
            <Icon name="stars" size={80} color={COLORS.warning} />
            <Text style={styles.premiumStatusTitle}>You're Premium! 🎉</Text>
            <Text style={styles.premiumStatusSubtitle}>
              {isValid 
                ? `Premium until ${endDate.toLocaleDateString()}`
                : 'Your premium subscription has expired'
              }
            </Text>
            
            <View style={styles.premiumFeatures}>
              {features.slice(0, 3).map((feature, index) => (
                <View key={index} style={styles.activePremiumFeature}>
                  <Icon name="check-circle" size={20} color={COLORS.success} />
                  <Text style={styles.activePremiumFeatureText}>{feature.title}</Text>
                </View>
              ))}
            </View>

            {!isValid && (
              <TouchableOpacity
                style={styles.renewButton}
                onPress={() => setSelectedPlan('YEARLY')}
              >
                <Text style={styles.renewButtonText}>Renew Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade to Premium</Text>
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchases}
        >
          <Text style={styles.restoreButtonText}>Restore</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Icon name="star" size={60} color={COLORS.warning} />
          </View>
          <Text style={styles.heroTitle}>Unlock Premium Features</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited chat time, skip ads, and enjoy exclusive features
          </Text>
        </View>

        {/* Plan Selection */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <View style={styles.plansContainer}>
            {plans.map(renderPlan)}
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          <View style={styles.featuresContainer}>
            {features.map(renderFeature)}
          </View>
        </View>

        {/* Upgrade Button */}
        <View style={styles.upgradeSection}>
          <TouchableOpacity
            style={[
              styles.upgradeButton,
              purchasing && styles.upgradeButtonDisabled,
            ]}
            onPress={handleUpgrade}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="star" size={24} color="#FFFFFF" />
                <Text style={styles.upgradeButtonText}>
                  Upgrade for €{plans.find(p => p.key === selectedPlan)?.price}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.upgradeDisclaimer}>
            Cancel anytime • Secure payment • Terms apply
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
  restoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  heroIcon: {
    width: 120,
    height: 120,
    backgroundColor: '#FFF8E1',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  plansSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F8FF',
  },
  planBadge: {
    position: 'absolute',
    top: -8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  planHeader: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  planSavings: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  planPricing: {
    alignItems: 'center',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  upgradeSection: {
    paddingBottom: 32,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeButtonDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  upgradeDisclaimer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  premiumStatusCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  premiumStatusTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.warning,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  premiumStatusSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  premiumFeatures: {
    alignItems: 'center',
  },
  activePremiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activePremiumFeatureText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 8,
  },
  renewButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  renewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PremiumScreen;