import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import axios from 'axios';
import {
  Clock,
  MapPin,
  Moon,
  Book,
  Compass,
  Sun,
  Settings,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import AdBanner from '../components/AdBanner'; // Importing the AdBanner component

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [address, setAddress] = useState<string>('Konum alınıyor...');
  const [iftarTime, setIftarTime] = useState<string>('');
  const [sahurTime, setSahurTime] = useState<string>('');
  const [isRamadan] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrayerTimes = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAddress('Konum izni gerekli');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).catch((error) => {
        console.error('Konum alınamadı:', error);
        setAddress('Konum alınamadı');
        setLoading(false);
        return null;
      });

      if (!location) return;

      const { latitude, longitude } = location.coords;

      // Konum bilgisini adrese çevirme
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (geocode[0]) {
          setAddress(`${geocode[0].city || ''}, ${geocode[0].country || ''}`);
        }
      } catch (error) {
        console.error('Adres çevrilemedi:', error);
        setAddress('Konum bulundu');
      }

      // Namaz vakitlerini alma
      const today = new Date();
      const response = await axios.get('http://api.aladhan.com/v1/timings', {
        params: {
          latitude,
          longitude,
          method: 13,
          date_or_timestamp: `${today.getDate()}-${
            today.getMonth() + 1
          }-${today.getFullYear()}`,
        },
      });

      if (response.data && response.data.data && response.data.data.timings) {
        setPrayerTimes(response.data.data.timings);
        setLoading(false);
      } else {
        throw new Error('Namaz vakitleri alınamadı');
      }
    } catch (error) {
      console.error('Namaz vakitleri alınırken hata:', error);
      setAddress('Vakitler alınamadı');
      setPrayerTimes(null);
      setLoading(false);
    }
  };

  const updateNextPrayer = () => {
    if (!prayerTimes) return;

    const now = new Date();
    const prayers = [
      { name: 'Fajr', displayName: t('imsak'), time: prayerTimes.Fajr },
      { name: 'Sunrise', displayName: t('sunrise'), time: prayerTimes.Sunrise },
      { name: 'Dhuhr', displayName: t('dhuhr'), time: prayerTimes.Dhuhr },
      { name: 'Asr', displayName: t('asr'), time: prayerTimes.Asr },
      { name: 'Maghrib', displayName: t('maghrib'), time: prayerTimes.Maghrib },
      { name: 'Isha', displayName: t('isha'), time: prayerTimes.Isha },
    ];

    const currentTime = now.getHours() * 60 + now.getMinutes();
    let nextPrayerFound = false;

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = hours * 60 + minutes;

      if (prayerTime > currentTime) {
        setNextPrayer(prayer.displayName);
        const diff = prayerTime - currentTime;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        setRemainingTime(`${h} ${t('hours')} ${m} ${t('minutes')}`);
        nextPrayerFound = true;
        break;
      }
    }

    if (!nextPrayerFound) {
      setNextPrayer('İmsak');
      const tomorrowFajr = prayers[0];
      const [hours, minutes] = tomorrowFajr.time.split(':').map(Number);
      const prayerTime = (hours + 24) * 60 + minutes;
      const diff = prayerTime - currentTime;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      setRemainingTime(`${h} ${t('hours')} ${m} ${t('minutes')}`);
    }
  };

  const updateRamadanTimes = () => {
    if (!prayerTimes) return;

    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      // İftar vakti (Akşam namazı)
      const [iftarHour, iftarMinute] =
        prayerTimes.Maghrib.split(':').map(Number);
      const iftarTimeMinutes = iftarHour * 60 + iftarMinute;

      // Sahur vakti (İmsak)
      const [sahurHour, sahurMinute] = prayerTimes.Fajr.split(':').map(Number);
      const sahurTimeMinutes = sahurHour * 60 + sahurMinute;

      // İftar için geri sayım
      if (currentTime < iftarTimeMinutes) {
        const diff = iftarTimeMinutes - currentTime;
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        setIftarTime(`${hours} ${t('hours')} ${minutes} ${t('minutes')}`);
      } else {
        setIftarTime(t('iftar_time_arrived'));
      }

      // Sahur için geri sayım
      if (currentTime < sahurTimeMinutes) {
        const diff = sahurTimeMinutes - currentTime;
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        setSahurTime(`${hours} ${t('hours')} ${minutes} ${t('minutes')}`);
      } else {
        // Yarının sahur vakti
        const diff = 24 * 60 + sahurTimeMinutes - currentTime;
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        setSahurTime(`${hours} ${t('hours')} ${minutes} ${t('minutes')}`);
      }
    } catch (error) {
      console.error('Ramazan vakitleri hesaplanırken hata:', error);
      setIftarTime('Hesaplanamadı');
      setSahurTime('Hesaplanamadı');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrayerTimes();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  useEffect(() => {
    if (prayerTimes) {
      updateNextPrayer();
      updateRamadanTimes();
      const interval = setInterval(() => {
        updateNextPrayer();
        updateRamadanTimes();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [prayerTimes]);

  const QuickAccessCard = ({ title, icon, onPress, theme }) => (
    <TouchableOpacity
      style={[
        styles.quickAccessCard,
        {
          backgroundColor: theme.card.background,
          shadowColor: theme.card.shadow,
        },
      ]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.quickAccessText, { color: theme.text.primary }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.welcomeText, { color: theme.primary }]}>
          {t('ramadan_welcome')}
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.settingsButton}
        >
          <Settings size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: theme.primary }]}>
            {t('welcome')}
          </Text>
          <Text style={[styles.locationText, { color: theme.text.secondary }]}>
            {address}
          </Text>
        </View>

        <View
          style={[
            styles.nextPrayerContainer,
            { backgroundColor: theme.primary },
          ]}
        >
          <Text style={[styles.nextPrayerTitle, { color: theme.background }]}>
            {t('nextPrayer')}
          </Text>
          <Text style={[styles.nextPrayerName, { color: theme.background }]}>
            {nextPrayer}
          </Text>
          <Text style={[styles.nextPrayerTime, { color: theme.background }]}>
            {t('remainingTime')}: {remainingTime}
          </Text>
        </View>

        {isRamadan && (
          <View style={styles.ramadanContainer}>
            <View
              style={[
                styles.ramadanCard,
                {
                  backgroundColor: theme.card.background,
                  shadowColor: theme.card.shadow,
                },
              ]}
            >
              <View style={styles.ramadanIconContainer}>
                <Sun size={24} color={theme.ramadan.iftar} />
                <Text
                  style={[styles.ramadanTitle, { color: theme.text.primary }]}
                >
                  {t('timeToIftar')}
                </Text>
              </View>
              <Text style={[styles.ramadanTime, { color: theme.primary }]}>
                {iftarTime}
              </Text>
              <Text
                style={[styles.ramadanInfo, { color: theme.text.secondary }]}
              >
                {t('iftar')}: {prayerTimes?.Maghrib}
              </Text>
            </View>

            <View
              style={[
                styles.ramadanCard,
                {
                  backgroundColor: theme.card.background,
                  shadowColor: theme.card.shadow,
                },
              ]}
            >
              <View style={styles.ramadanIconContainer}>
                <Moon size={24} color={theme.ramadan.sahur} />
                <Text
                  style={[styles.ramadanTitle, { color: theme.text.primary }]}
                >
                  {t('timeToSahur')}
                </Text>
              </View>
              <Text style={[styles.ramadanTime, { color: theme.primary }]}>
                {sahurTime}
              </Text>
              <Text
                style={[styles.ramadanInfo, { color: theme.text.secondary }]}
              >
                {t('sahur')}: {prayerTimes?.Fajr}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.quickAccessContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            {t('quickAccess')}
          </Text>
          <View style={styles.quickAccessGrid}>
            <QuickAccessCard
              title={t('prayerTimes')}
              icon={<Clock size={32} color={theme.primary} />}
              onPress={() => router.push('/prayer-times')}
              theme={theme}
            />
            <QuickAccessCard
              title={t('qibla')}
              icon={<Compass size={32} color={theme.secondary} />}
              onPress={() => router.push('/qibla')}
              theme={theme}
            />
            <QuickAccessCard
              title={t('quran')}
              icon={<Book size={32} color={theme.ramadan.iftar} />}
              onPress={() => router.push('/quran')}
              theme={theme}
            />
            <QuickAccessCard
              title={t('ramadan')}
              icon={<Moon size={32} color={theme.ramadan.sahur} />}
              onPress={() => router.push('/ramadan')}
              theme={theme}
            />
          </View>
        </View>

        {prayerTimes && (
          <View
            style={[
              styles.todayTimesContainer,
              { backgroundColor: theme.surface },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              {t('todayTimes')}
            </Text>
            <View
              style={[
                styles.timesList,
                { backgroundColor: theme.card.background },
              ]}
            >
              <View
                style={[styles.timeItem, { borderBottomColor: theme.border }]}
              >
                <Text style={[styles.timeLabel, { color: theme.text.primary }]}>
                  {t('fajr')}
                </Text>
                <Text style={[styles.timeValue, { color: theme.prayer.fajr }]}>
                  {prayerTimes.Fajr}
                </Text>
              </View>
              <View
                style={[styles.timeItem, { borderBottomColor: theme.border }]}
              >
                <Text style={[styles.timeLabel, { color: theme.text.primary }]}>
                  {t('sunrise')}
                </Text>
                <Text
                  style={[styles.timeValue, { color: theme.prayer.sunrise }]}
                >
                  {prayerTimes.Sunrise}
                </Text>
              </View>
              <View
                style={[styles.timeItem, { borderBottomColor: theme.border }]}
              >
                <Text style={[styles.timeLabel, { color: theme.text.primary }]}>
                  {t('dhuhr')}
                </Text>
                <Text style={[styles.timeValue, { color: theme.prayer.dhuhr }]}>
                  {prayerTimes.Dhuhr}
                </Text>
              </View>
              <View
                style={[styles.timeItem, { borderBottomColor: theme.border }]}
              >
                <Text style={[styles.timeLabel, { color: theme.text.primary }]}>
                  {t('asr')}
                </Text>
                <Text style={[styles.timeValue, { color: theme.prayer.asr }]}>
                  {prayerTimes.Asr}
                </Text>
              </View>
              <View
                style={[styles.timeItem, { borderBottomColor: theme.border }]}
              >
                <Text style={[styles.timeLabel, { color: theme.text.primary }]}>
                  {t('maghrib')}
                </Text>
                <Text
                  style={[styles.timeValue, { color: theme.prayer.maghrib }]}
                >
                  {prayerTimes.Maghrib}
                </Text>
              </View>
              <View
                style={[styles.timeItem, { borderBottomColor: theme.border }]}
              >
                <Text style={[styles.timeLabel, { color: theme.text.primary }]}>
                  {t('isha')}
                </Text>
                <Text style={[styles.timeValue, { color: theme.prayer.isha }]}>
                  {prayerTimes.Isha}
                </Text>
              </View>
            </View>
          </View>
        )}
        <AdBanner/> 
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
  },
  nextPrayerContainer: {
    padding: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  nextPrayerTitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  nextPrayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8,
  },
  nextPrayerTime: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  ramadanContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  ramadanCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ramadanIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ramadanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  ramadanTime: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginVertical: 8,
  },
  ramadanInfo: {
    fontSize: 14,
    color: '#666',
  },
  quickAccessContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickAccessText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  todayTimesContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  timesList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timeLabel: {
    fontSize: 16,
    color: '#333',
  },
  timeValue: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  settingsButton: {
    padding: 8,
  },
});
