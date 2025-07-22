import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { UserService } from '../../services/UserService';
import { COLORS } from '../../utils/helpers';

const SettingsScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [settings, setSettings] = useState({
    notifications: true,
    soundEnabled: true,
    theme: 'light',
    dataCollection: false,
    marketingEmails: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.settings) {
      setSettings(prev => ({
        ...prev,
        ...user.settings,
      }));
    }
  }, [user]);

  const handleSettingChange = async (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));

    setSaving(true);
    try {
      await UserService.updateSettings(user?.uid, {
        ...settings,
        [key]: value,
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      // Revert change on error
      setSettings(prev => ({
        ...prev,
        [key]: !value,
      }));
      Alert.alert('Error', 'Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data including chat history, credits, and referrals.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Final Confirmation',
      'This will permanently delete your SafeTalk account. Type "DELETE" to confirm.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I Understand',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call a Cloud Function to delete the account
            Alert.alert(
              'Account Deletion',
              'Your account deletion request has been received. Your account will be permanently deleted within 24 hours.',
              [{ text: 'OK', onPress: () => signOut() }]
            );
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Notifications',
      items: [
        {
          key: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive notifications for new matches and messages',
          type: 'switch',
          value: settings.notifications,
        },
        {
          key: 'soundEnabled',
          title: 'Sound Effects',
          subtitle: 'Play sounds for app interactions',
          type: 'switch',
          value: settings.soundEnabled,
        },
      ],
    },
    {
      title: 'Privacy & Data',
      items: [
        {
          key: 'dataCollection',
          title: 'Analytics Data',
          subtitle: 'Help improve SafeTalk by sharing anonymous usage data',
          type: 'switch',
          value: settings.dataCollection,
        },
        {
          key: 'marketingEmails',
          title: 'Marketing Emails',
          subtitle: 'Receive updates about new features and promotions',
          type: 'switch',
          value: settings.marketingEmails,
        },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        {
          key: 'help',
          title: 'Help & Support',
          subtitle: 'Get help with SafeTalk',
          type: 'link',
          icon: 'help',
          onPress: () => {
            Alert.alert(
              'Help & Support',
              'For support, please email us at support@safetalk.app or visit our FAQ section.',
              [{ text: 'OK' }]
            );
          },
        },
        {
          key: 'privacy',
          title: 'Privacy Policy',
          subtitle: 'Learn how we protect your privacy',
          type: 'link',
          icon: 'privacy-tip',
          onPress: () => {
            Alert.alert('Privacy Policy', 'Privacy policy would open in browser in production app.');
          },
        },
        {
          key: 'terms',
          title: 'Terms of Service',
          subtitle: 'Read our terms and conditions',
          type: 'link',
          icon: 'description',
          onPress: () => {
            Alert.alert('Terms of Service', 'Terms of service would open in browser in production app.');
          },
        },
        {
          key: 'about',
          title: 'About SafeTalk',
          subtitle: 'Version 1.0.0 • Learn more about our mission',
          type: 'link',
          icon: 'info',
          onPress: () => {
            Alert.alert(
              'About SafeTalk',
              'SafeTalk is a platform for safe, anonymous conversations with people around the world. Our mission is to connect people while protecting their privacy and safety.',
              [{ text: 'OK' }]
            );
          },
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          key: 'signout',
          title: 'Sign Out',
          subtitle: 'Sign out of your SafeTalk account',
          type: 'link',
          icon: 'logout',
          color: COLORS.textSecondary,
          onPress: () => {
            Alert.alert(
              'Sign Out',
              'Are you sure you want to sign out?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: () => signOut(),
                },
              ]
            );
          },
        },
        {
          key: 'delete',
          title: 'Delete Account',
          subtitle: 'Permanently delete your account and all data',
          type: 'link',
          icon: 'delete-forever',
          color: COLORS.danger,
          onPress: handleDeleteAccount,
        },
      ],
    },
  ];

  const renderSwitchItem = (item) => (
    <View key={item.key} style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
      </View>
      <Switch
        value={item.value}
        onValueChange={(value) => handleSettingChange(item.key, value)}
        disabled={saving}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  const renderLinkItem = (item) => (
    <TouchableOpacity
      key={item.key}
      style={styles.settingItem}
      onPress={item.onPress}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingTitleContainer}>
          {item.icon && (
            <Icon
              name={item.icon}
              size={20}
              color={item.color || COLORS.textSecondary}
              style={styles.settingIcon}
            />
          )}
          <Text style={[styles.settingTitle, item.color && { color: item.color }]}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  const renderSection = (section, index) => (
    <View key={index} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map((item) => 
          item.type === 'switch' ? renderSwitchItem(item) : renderLinkItem(item)
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userInfoCard}>
          <View style={styles.userAvatar}>
            <Icon name="person" size={32} color={COLORS.textSecondary} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {user?.displayName || 'SafeTalk User'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || user?.phoneNumber || 'Anonymous User'}
            </Text>
            <Text style={styles.userStatus}>
              {user?.isPremium ? '⭐ Premium Member' : '🆓 Free User'}
            </Text>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map(renderSection)}

        {/* App Version */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>SafeTalk Version 1.0.0</Text>
          <Text style={styles.versionSubtext}>Built with ❤️ for safe conversations</Text>
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
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  userAvatar: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.background,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default SettingsScreen;