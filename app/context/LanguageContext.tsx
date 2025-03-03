import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Dil dosyaları
const resources = {
  tr: {
    translation: {
      very_soon:'Çok Yakında',
      //qibla
      qibla_compass: 'Kıble Pusulası',
      qibla_text: 'Kıble',
      high_accuracy: 'Pusula Hassasiyeti Yüksek',
      low_accuracy: 'Pusula Hassasiyeti Düşük',
      unreliable: 'Pusula Kalibre Edilmeli',
      calculating_qibla: 'Kıble yönü hesaplanıyor...',
      qibla_hint:
        'Hassas ölçüm için telefonunuzu düz tutun ve sekiz şeklinde hareket ettirin',

      //diğer
      loading: 'Yükleniyor...',
      try_again: 'Tekrar Dene',
      times_not_found: 'Vakitler alınamadı',
      location_permission_required: 'Konum izni gerekli',
      getting_location: 'Konum alınıyor...',
      unknown: 'Bilinmiyor',
      iftar_time_arrived: 'İftar vakti geldi!',
      sahur_time_over: 'Sahur vakti bitti',
      hours: 'saat',
      hours_plural: 'saat',
      minutes: 'dakika',
      minutes_plural: 'dakika',
      iftarCountdown: 'İftara {{hours}} ve {{minutes}} kaldı',
      sahurCountdown: 'Sahura {{hours}} ve {{minutes}} kaldı',
      iftarNow: 'İftar vakti geldi!',
      error: 'Hesaplanamadı',
      // Home
      ramadan_welcome: 'Hayırlı Ramazanlar',
      welcome: 'Hoş Geldiniz',
      prayerTimes: 'Namaz Vakitleri',
      nextPrayer: 'Sıradaki Namaz',
      remainingTime: 'Kalan Süre',
      quickAccess: 'Hızlı Erişim',
      todayTimes: 'Bugünün Vakitleri',
      // Prayer Times
      fajr: 'İmsak',
      sunrise: 'Güneş',
      dhuhr: 'Öğle',
      asr: 'İkindi',
      maghrib: 'Akşam',
      isha: 'Yatsı',
      // Ramadan
      ramadan: 'Ramazan',
      iftar: 'İftar',
      sahur: 'Sahur',
      timeToIftar: 'İftara Kalan',
      timeToSahur: 'Sahura Kalan',
      // Navigation
      home: 'Ana Sayfa',
      prayer: 'Namaz',
      qibla: 'Kıble',
      quran: 'Kuran',
      // Settings
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
    },
  },
  en: {
    translation: {
     very_soon: 'Very soon',
      //qibla
    
      qibla_compass: 'Qibla Compass',
      qibla_text: 'Qibla',
      high_accuracy: 'High Compass Accuracy',
      low_accuracy: 'Low Compass Accuracy',
      unreliable: 'Compass Needs Calibration',
      calculating_qibla: 'Calculating Qibla Direction...',
      qibla_hint:
        'For accurate measurement, hold your phone steady and move it in an eight shape.',

      //diğer
      loading: 'Loading',
      try_again: 'Try Again',
      times_not_found: 'Times not found',
      location_permission_required: 'Location permission required',
      getting_location: 'Getting location...',
      unknown: 'Unknown',
      iftar_time_arrived: 'Iftar time has arrived!',
      sahur_time_over: 'Sahur time is over',
      hours: 'hour',
      hours_plural: 'hours',
      minutes: 'minute',
      minutes_plural: 'minutes',
      iftarCountdown: 'Iftar in {{hours}} and {{minutes}}',
      sahurCountdown: 'Sahur in {{hours}} and {{minutes}}',
      iftarNow: 'Iftar time has arrived!',
      error: 'Could not calculate',
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
    },
  },
  ar: {
    translation: {
      very_soon: "قريباً",
      //kıble
      qibla_compass: 'بوصلة القبلة',
      qibla_text: 'القبلة',
      high_accuracy: 'دقة بوصلة عالية',
      low_accuracy: 'دقة بوصلة منخفضة',
      unreliable: 'البوصلة بحاجة إلى معايرة',
      calculating_qibla: 'يتم حساب اتجاه القبلة...',
      qibla_hint:
        'للحصول على قياس دقيق، امسك هاتفك بثبات وحركه على شكل رقم ثمانية.',

      //diğer
      loading: 'جار التحميل',
      try_again: 'حاول مرة أخرى',
      times_not_found: 'لم يتم العثور على الأوقات',
      location_permission_required: 'مطلوب إذن الموقع',
      getting_location: 'جاري الحصول على الموقع...',
      unknown: 'غير معروف',
      iftar_time_arrived: 'حان وقت الإفطار!',
      sahur_time_over: 'انتهى وقت السحور',
      hours: '{{count}} ساعة',
      hours_plural: '{{count}} ساعات',
      minutes: '{{count}} دقيقة',
      minutes_plural: '{{count}} دقائق',
      iftarCountdown: 'متبقي {{hours}} و{{minutes}} للإفطار',
      sahurCountdown: 'متبقي {{hours}} و{{minutes}} للسحور',
      iftarNow: 'حان وقت الإفطار!',
      error: 'تعذر الحساب',
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

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

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
