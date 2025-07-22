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
import { COLORS, CREDIT_PACKAGES, formatCredits } from '../../utils/helpers';

const CreditsScreen = ({ navigation }) => {
  const { user, credits, purchaseCredits } = useUser();
  const [selectedPackage, setSelectedPackage] = useState('MEDIUM');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPurchaseHistory();
  }, []);

  const loadPurchaseHistory = async () => {
    if (!user?.uid) return;

    try {
      const result = await PurchaseService.getPurchaseHistory(user.uid);
      if (result.success) {
        setPurchaseHistory(result.history.credits);
      }
    } catch (error) {
      console.error('Error loading purchase history:', error);
    } finally {
      setLoading(false);
    }
  };

  const packages = [
    {
      key: 'SMALL',
      ...CREDIT_PACKAGES.SMALL,
      popular: false,
    },
    {
      key: 'MEDIUM',
      ...CREDIT_PACKAGES.MEDIUM,
      popular: true,
    },
    {
      key: 'LARGE',
      ...CREDIT_PACKAGES.LARGE,
      popular: false,
    },
  ];

  const handlePurchase = async () => {
    if (purchasing) return;

    setPurchasing(true);

    try {
      const result = await PurchaseService.purchaseCredits(user?.uid, selectedPackage);
      
      if (result.success) {
        Alert.alert(
          'Purchase Successful! 🎉',
          `${result.creditsAdded} credits added to your account.`,
          [{ text: 'Great!', onPress: () => loadPurchaseHistory() }]
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

  const renderPackage = (pkg) => {
    const isSelected = selectedPackage === pkg.key;
    
    return (
      <TouchableOpacity
        key={pkg.key}
        style={[
          styles.packageCard,
          isSelected && styles.packageCardSelected,
          pkg.popular && styles.packageCardPopular,
        ]}
        onPress={() => setSelectedPackage(pkg.key)}
      >
        {pkg.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>POPULAR</Text>
          </View>
        )}
        
        <View style={styles.packageHeader}>
          <Text style={styles.packageCredits}>{pkg.credits}</Text>
          <Text style={styles.packageCreditsLabel}>Credits</Text>
        </View>
        
        <View style={styles.packageDetails}>
          <Text style={styles.packageMinutes}>{pkg.minutes} minutes</Text>
          <Text style={styles.packageValue}>
            {(pkg.price / pkg.credits).toFixed(2)}€ per credit
          </Text>
        </View>
        
        <View style={styles.packagePrice}>
          <Text style={styles.packagePriceText}>€{pkg.price}</Text>
        </View>
        
        {pkg.key === 'LARGE' && (
          <View style={styles.specialOffer}>
            <Text style={styles.specialOfferText}>24h Unlimited</Text>
          </View>
        )}
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Icon name="check-circle" size={20} color={COLORS.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHistoryItem = (item, index) => {
    const date = item.purchaseDate?.toDate?.() || new Date(item.purchaseDate);
    
    return (
      <View key={index} style={styles.historyItem}>
        <View style={styles.historyItemLeft}>
          <View style={styles.historyIcon}>
            <Icon name="add" size={20} color={COLORS.success} />
          </View>
          <View style={styles.historyContent}>
            <Text style={styles.historyTitle}>
              +{item.credits} Credits
            </Text>
            <Text style={styles.historyDate}>
              {date.toLocaleDateString()} • €{item.price}
            </Text>
            <Text style={styles.historyType}>
              {item.packageType?.toLowerCase() || 'Credit Purchase'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.historyAmount}>
          +{formatCredits(item.credits)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buy Credits</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Balance */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Icon name="account-balance-wallet" size={32} color={COLORS.primary} />
            <Text style={styles.balanceTitle}>Current Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>
            {formatCredits(credits?.totalCredits || 0)} Credits
          </Text>
          <Text style={styles.balanceMinutes}>
            ≈ {(credits?.totalCredits || 0) * 6} minutes of chat time
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="info" size={24} color={COLORS.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How Credits Work</Text>
            <Text style={styles.infoText}>
              • 1 credit = 6 minutes of chat time{'\n'}
              • Credits never expire{'\n'}
              • Use anytime to extend conversations{'\n'}
              • Premium users don't use credits
            </Text>
          </View>
        </View>

        {/* Package Selection */}
        <View style={styles.packagesSection}>
          <Text style={styles.sectionTitle}>Choose a Package</Text>
          <View style={styles.packagesContainer}>
            {packages.map(renderPackage)}
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Why Buy Credits?</Text>
          <View style={styles.benefits}>
            <View style={styles.benefit}>
              <Icon name="schedule" size={20} color={COLORS.success} />
              <Text style={styles.benefitText}>Extend your daily chat time</Text>
            </View>
            <View style={styles.benefit}>
              <Icon name="chat" size={20} color={COLORS.success} />
              <Text style={styles.benefitText}>Continue interesting conversations</Text>
            </View>
            <View style={styles.benefit}>
              <Icon name="people" size={20} color={COLORS.success} />
              <Text style={styles.benefitText}>Meet more people every day</Text>
            </View>
            <View style={styles.benefit}>
              <Icon name="security" size={20} color={COLORS.success} />
              <Text style={styles.benefitText}>Safe and secure payment</Text>
            </View>
          </View>
        </View>

        {/* Purchase History */}
        {purchaseHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Purchase History</Text>
            <View style={styles.historyContainer}>
              {purchaseHistory.slice(0, 5).map(renderHistoryItem)}
              
              {purchaseHistory.length > 5 && (
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All Purchases</Text>
                  <Icon name="chevron-right" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Purchase Button */}
        <View style={styles.purchaseSection}>
          <TouchableOpacity
            style={[
              styles.purchaseButton,
              purchasing && styles.purchaseButtonDisabled,
            ]}
            onPress={handlePurchase}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="payment" size={24} color="#FFFFFF" />
                <Text style={styles.purchaseButtonText}>
                  Buy {packages.find(p => p.key === selectedPackage)?.credits} Credits - €{packages.find(p => p.key === selectedPackage)?.price}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.purchaseDisclaimer}>
            Secure payment • Credits never expire • Terms apply
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
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  balanceMinutes: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  packagesSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  packagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  packageCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    position: 'relative',
  },
  packageCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F8FF',
  },
  packageCardPopular: {
    borderColor: COLORS.warning,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: COLORS.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  packageHeader: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  packageCredits: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  packageCreditsLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  packageDetails: {
    alignItems: 'center',
    marginBottom: 12,
  },
  packageMinutes: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  packageValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  packagePrice: {
    alignItems: 'center',
  },
  packagePriceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  specialOffer: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  specialOfferText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  benefits: {},
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
    flex: 1,
  },
  historySection: {
    marginTop: 24,
  },
  historyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  historyType: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  historyAmount: {
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
  purchaseSection: {
    paddingTop: 24,
    paddingBottom: 32,
  },
  purchaseButton: {
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
  purchaseButtonDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  purchaseDisclaimer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default CreditsScreen;