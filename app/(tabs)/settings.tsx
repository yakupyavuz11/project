import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  ActionSheetIOS,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  Moon,
  Settings,
  LogOut,
  ChevronRight,
  User,
  Info,
  Mail,
  Star,
  Globe
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [notifications, setNotifications] = React.useState(true);

  const handleLanguageChange = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Türkçe', 'English', 'العربية', t('cancel')],
          cancelButtonIndex: 3,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) setLanguage('tr');
          else if (buttonIndex === 1) setLanguage('en');
          else if (buttonIndex === 2) setLanguage('ar');
        }
      );
    } else {
      Alert.alert(
        t('language'),
        t('selectLanguage'),
        [
          { text: 'Türkçe', onPress: () => setLanguage('tr') },
          { text: 'English', onPress: () => setLanguage('en') },
          { text: 'العربية', onPress: () => setLanguage('ar') },
          { text: t('cancel'), style: 'cancel' },
        ]
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel'
        },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: () => router.replace('/login')
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, value, onPress, isSwitch = false }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { backgroundColor: theme.card.background, borderBottomColor: theme.border },
      ]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={styles.settingLeft}>
        {icon}
        <Text style={[styles.settingTitle, { color: theme.text.primary }]}>
          {title}
        </Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: theme.text.tertiary, true: theme.primary }}
          thumbColor={value ? theme.background : theme.text.secondary}
        />
      ) : (
        <ChevronRight size={20} color={theme.text.secondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Settings size={24} color={theme.primary} />
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            {t('settings')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
            {t('account')}
          </Text>
          <SettingItem
            icon={<User size={20} color={theme.primary} />}
            title={t('profile')}
            onPress={() => Alert.alert(t('profile'), t('profileSettings'))}
          />
          <SettingItem
            icon={<Mail size={20} color={theme.primary} />}
            title={t('email')}
            onPress={() => Alert.alert(t('email'), t('changeEmail'))}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
            {t('notifications')}
          </Text>
          <SettingItem
            icon={<Bell size={20} color={theme.primary} />}
            title={t('prayerNotifications')}
            value={notifications}
            onPress={() => setNotifications(!notifications)}
            isSwitch
          />
          <SettingItem
            icon={<Moon size={20} color={theme.primary} />}
            title={t('ramadanNotifications')}
            value={notifications}
            onPress={() => setNotifications(!notifications)}
            isSwitch
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
            {t('application')}
          </Text>
          <SettingItem
            icon={<Moon size={20} color={theme.primary} />}
            title={t('darkMode')}
            value={isDark}
            onPress={toggleTheme}
            isSwitch
          />
          <SettingItem
            icon={<Globe size={20} color={theme.primary} />}
            title={t('language')}
            onPress={handleLanguageChange}
          />
          <SettingItem
            icon={<Star size={20} color={theme.primary} />}
            title={t('rateApp')}
            onPress={() => Alert.alert(t('rateApp'), 'App Store/Play Store')}
          />
          <SettingItem
            icon={<Info size={20} color={theme.primary} />}
            title={t('about')}
            onPress={() => Alert.alert(t('about'), 'Version: 1.0.0')}
          />
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { borderTopColor: theme.border }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={theme.error} />
          <Text style={[styles.logoutText, { color: theme.error }]}>
            {t('logout')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
    borderTopWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
}); 