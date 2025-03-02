import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Dil dosyaları
const resources = {
  tr: {
    translation: {
      // Ana Sayfa
      ramadan_welcome: 'Hayırlı Ramazanlar',
      welcome: 'Hoş Geldiniz',
      prayerTimes: 'Namaz Vakitleri',
      nextPrayer: 'Sıradaki Namaz',
      remainingTime: 'Kalan Süre',
      quickAccess: 'Hızlı Erişim',
      todayTimes: 'Bugünün Vakitleri',
      
      // Namaz Vakitleri
      fajr: 'İmsak',
      sunrise: 'Güneş',
      dhuhr: 'Öğle',
      asr: 'İkindi',
      maghrib: 'Akşam',
      isha: 'Yatsı',
      
      // Ramazan
      ramadan: 'Ramazan',
      iftar: 'İftar',
      sahur: 'Sahur',
      timeToIftar: 'İftara Kalan',
      timeToSahur: 'Sahura Kalan',
      
      // Navigasyon
      home: 'Ana Sayfa',
      prayer: 'Namaz',
      qibla: 'Kıble',
      quran: 'Kuran',
      
      // Ayarlar
      settings: 'Ayarlar',
      account: 'Hesap',
      profile: 'Profil',
      notifications: 'Bildirimler',
      prayerNotifications: 'Namaz Vakti Bildirimleri',
      ramadanNotifications: 'Ramazan Bildirimleri',
      application: 'Uygulama',
      darkMode: 'Karanlık Mod',
      language: 'Dil',
      rateApp: 'Uygulamayı Değerlendir',
      about: 'Hakkında',
      logout: 'Çıkış Yap',
      logoutConfirm: 'Çıkış yapmak istediğinizden emin misiniz?',
      cancel: 'İptal',
      
      // Giriş/Kayıt
      login: 'Giriş Yap',
      signup: 'Hesap Oluştur',
      email: 'E-posta',
      password: 'Şifre',
      forgotPassword: 'Şifremi Unuttum',
      name: 'Ad Soyad',
      confirmPassword: 'Şifre Tekrar',
    },
  },
  en: {
    translation: {
      // Home
      ramadan_welcome: 'Happy Ramadan',
      welcome: 'Welcome',
      prayerTimes: 'Prayer Times',
      nextPrayer: 'Next Prayer',
      remainingTime: 'Remaining Time',
      quickAccess: 'Quick Access',
      todayTimes: "Today's Times",
      
      // Prayer Times
      fajr: 'Fajr',
      sunrise: 'Sunrise',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
      
      // Ramadan
      ramadan: 'Ramadan',
      iftar: 'Iftar',
      sahur: 'Suhoor',
      timeToIftar: 'Time to Iftar',
      timeToSahur: 'Time to Suhoor',
      
      // Navigation
      home: 'Home',
      prayer: 'Prayer',
      qibla: 'Qibla',
      quran: 'Quran',
      
      // Settings
      settings: 'Settings',
      account: 'Account',
      profile: 'Profile',
      notifications: 'Notifications',
      prayerNotifications: 'Prayer Time Notifications',
      ramadanNotifications: 'Ramadan Notifications',
      application: 'Application',
      darkMode: 'Dark Mode',
      language: 'Language',
      rateApp: 'Rate App',
      about: 'About',
      logout: 'Logout',
      logoutConfirm: 'Are you sure you want to logout?',
      cancel: 'Cancel',
      
      // Auth
      login: 'Login',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password',
      name: 'Full Name',
      confirmPassword: 'Confirm Password',

    },
  },
  ar: {
    translation: {
      // الصفحة الرئيسية
      welcome_ramadan: 'مرحباً بكم في رمضان',
      welcome: 'مرحباً بكم',
      prayerTimes: 'أوقات الصلاة',
      nextPrayer: 'الصلاة القادمة',
      remainingTime: 'الوقت المتبقي',
      quickAccess: 'الوصول السريع',
      todayTimes: 'أوقات اليوم',
      
      // أوقات الصلاة
      fajr: 'الفجر',
      sunrise: 'الشروق',
      dhuhr: 'الظهر',
      asr: 'العصر',
      maghrib: 'المغرب',
      isha: 'العشاء',
      
      // رمضان
      ramadan: 'رمضان',
      iftar: 'الإفطار',
      sahur: 'السحور',
      timeToIftar: 'الوقت حتى الإفطار',
      timeToSahur: 'الوقت حتى السحور',
      
      // التنقل
      home: 'الرئيسية',
      prayer: 'الصلاة',
      qibla: 'القبلة',
      quran: 'القرآن',
      
      // الإعدادات
      settings: 'الإعدادات',
      account: 'الحساب',
      profile: 'الملف الشخصي',
      notifications: 'الإشعارات',
      prayerNotifications: 'إشعارات أوقات الصلاة',
      ramadanNotifications: 'إشعارات رمضان',
      application: 'التطبيق',
      darkMode: 'الوضع الداكن',
      language: 'اللغة',
      rateApp: 'تقييم التطبيق',
      about: 'حول',
      logout: 'تسجيل الخروج',
      logoutConfirm: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
      cancel: 'إلغاء',
      
      // المصادقة
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور',
      name: 'الاسم الكامل',
      confirmPassword: 'تأكيد كلمة المرور',
    },
  },
};

// i18next yapılandırması
i18next.use(initReactI18next).init({
  resources,
  lng: 'tr', // varsayılan dil
  fallbackLng: 'tr',
  interpolation: {
    escapeValue: false,
  },
});

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('tr');

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        setLanguageState(savedLanguage);
        i18next.changeLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Dil tercihi yüklenirken hata:', error);
    }
  };

  const setLanguage = async (lang: string) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguageState(lang);
      await i18next.changeLanguage(lang);
    } catch (error) {
      console.error('Dil kaydedilirken hata:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 