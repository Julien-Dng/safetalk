import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser } from '../context/UserContext';
import { COLORS, CREDIT_PACKAGES } from '../utils/helpers';

const CreditModal = ({ visible, onClose, onSuccess }) => {
  const { purchaseCredits } = useUser();
  const [selectedPackage, setSelectedPackage] = useState('SMALL');
  const [purchasing, setPurchasing] = useState(false);

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
      const result = await purchaseCredits(selectedPackage);
      
      if (result.success) {
        Alert.alert(
          'Purchase Successful!',
          `${result.creditsAdded} credits added to your account.`,
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        Alert.alert('Purchase Failed', result.error || 'Unable to complete purchase');
      }
    } catch (error) {
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
          <Text style={styles.packageCredits}>{pkg.credits} Credits</Text>
          <Text style={styles.packageMinutes}>{pkg.minutes} minutes</Text>
        </View>
        
        <View style={styles.packagePrice}>
          <Text style={styles.packagePriceText}>€{pkg.price}</Text>
        </View>
        
        <View style={styles.packageFeatures}>
          <View style={styles.feature}>
            <Icon name="access-time" size={16} color={COLORS.success} />
            <Text style={styles.featureText}>
              {pkg.minutes === 150 ? '24h unlimited' : `${pkg.minutes} minutes`}
            </Text>
          </View>
          <View style={styles.feature}>
            <Icon name="account-balance-wallet" size={16} color={COLORS.success} />
            <Text style={styles.featureText}>No expiry</Text>
          </View>
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Icon name="check-circle" size={20} color={COLORS.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>Buy Credits</Text>
            <Text style={styles.subtitle}>
              Continue your conversation with more chat time
            </Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Credit Info */}
          <View style={styles.infoCard}>
            <Icon name="info" size={24} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How Credits Work</Text>
              <Text style={styles.infoText}>
                • 1 credit = 6 minutes of chat time{'\n'}
                • Credits never expire{'\n'}
                • Use anytime to extend your conversations
              </Text>
            </View>
          </View>

          {/* Package Selection */}
          <View style={styles.packagesContainer}>
            <Text style={styles.sectionTitle}>Choose a Package</Text>
            {packages.map(renderPackage)}
          </View>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.sectionTitle}>What You Get</Text>
            <View style={styles.benefits}>
              <View style={styles.benefit}>
                <Icon name="chat" size={20} color={COLORS.success} />
                <Text style={styles.benefitText}>Extended chat time</Text>
              </View>
              <View style={styles.benefit}>
                <Icon name="security" size={20} color={COLORS.success} />
                <Text style={styles.benefitText}>Safe & anonymous</Text>
              </View>
              <View style={styles.benefit}>
                <Icon name="public" size={20} color={COLORS.success} />
                <Text style={styles.benefitText}>Global connections</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Purchase Button */}
        <View style={styles.footer}>
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
                <Icon name="payment" size={20} color="#FFFFFF" />
                <Text style={styles.purchaseButtonText}>
                  Buy for €{packages.find(p => p.key === selectedPackage)?.price}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            Secure payment • Cancel anytime • Terms apply
          </Text>
        </View>
      </View>
    </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  packagesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  packageCard: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    alignSelf: 'center',
    backgroundColor: COLORS.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  packageHeader: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  packageCredits: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  packageMinutes: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  packagePrice: {
    alignItems: 'center',
    marginBottom: 12,
  },
  packagePriceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  packageFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefits: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    marginBottom: 12,
  },
  purchaseButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default CreditModal;