import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, ActionSheetIOS, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Moon, Settings, ChevronRight, Star, Info, Globe } from 'lucide-react-native';
import { useTheme } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';
import { useTranslation } from 'react-i18next';
import CustomAlert from './components/CustomAlert';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', buttons: [] });

  const showAlert = (title, message, buttons) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

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
      showAlert(
        t('language'),
        t('selectLanguage'),
        [
          { text: 'Türkçe', onPress: () => setLanguage('tr') },
          { text: 'English', onPress: () => setLanguage('en') },
          { text: 'العربية', onPress: () => setLanguage('ar') },
          { text: t('cancel'), onPress: hideAlert, style: 'cancel' },
        ]
      );
    }
  };

  // SettingItem bileşenini tanımlıyoruz
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
            onPress={() => showAlert(t('rateApp'), 'App Store/Play Store', [
              { text: t('ok'), onPress: hideAlert }
            ])}
          />
          <SettingItem
            icon={<Info size={20} color={theme.primary} />}
            title={t('about')}
            onPress={() => showAlert(t('about'), 'Version: 1.0.0', [
              { text: t('ok'), onPress: hideAlert }
            ])}
          />
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
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
});