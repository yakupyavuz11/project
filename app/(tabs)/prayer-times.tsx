import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { Clock, MapPin } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export default function PrayerTimesScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [address, setAddress] = useState<string>('Konum alınıyor...');
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [remainingTime, setRemainingTime] = useState<string>('');

  const fetchPrayerTimes = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAddress('Konum izni gerekli');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Konum bilgisini adrese çevirme
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode[0]) {
        setAddress(`${geocode[0].city || ''}, ${geocode[0].country || ''}`);
      }

      // Namaz vakitlerini alma
      const today = new Date();
      const response = await axios.get('http://api.aladhan.com/v1/timings', {
        params: {
          latitude,
          longitude,
          method: 13, // Turkey method
          date_or_timestamp: `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`
        }
      });

      setPrayerTimes(response.data.data.timings);
      setLoading(false);
    } catch (error) {
      console.error('Namaz vakitleri alınırken hata:', error);
      setAddress('Namaz vakitleri alınamadı');
      setLoading(false);
    }
  };

  const updateNextPrayer = () => {
    if (!prayerTimes) return;

    const now = new Date();
    const prayers = [
      { name: 'Fajr', displayName: 'İmsak', time: prayerTimes.Fajr },
      { name: 'Sunrise', displayName: 'Güneş', time: prayerTimes.Sunrise },
      { name: 'Dhuhr', displayName: 'Öğle', time: prayerTimes.Dhuhr },
      { name: 'Asr', displayName: 'İkindi', time: prayerTimes.Asr },
      { name: 'Maghrib', displayName: 'Akşam', time: prayerTimes.Maghrib },
      { name: 'Isha', displayName: 'Yatsı', time: prayerTimes.Isha }
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
        setRemainingTime(`${h} saat ${m} dakika`);
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
      setRemainingTime(`${h} saat ${m} dakika`);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  useEffect(() => {
    if (prayerTimes) {
      updateNextPrayer();
      const interval = setInterval(updateNextPrayer, 60000);
      return () => clearInterval(interval);
    }
  }, [prayerTimes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrayerTimes();
    setRefreshing(false);
  };

  const PrayerCard = ({ name, time, isNext }: { name: string; time: string; isNext: boolean }) => (
    <View style={[
      styles.prayerCard,
      { 
        backgroundColor: isNext ? theme.primary : theme.card.background,
        shadowColor: theme.card.shadow
      }
    ]}>
      <View style={styles.prayerCardContent}>
        <View style={styles.prayerCardLeft}>
          <Clock size={24} color={isNext ? theme.background : theme.primary} />
          <Text style={[
            styles.prayerName,
            { color: isNext ? theme.background : theme.text.primary }
          ]}>{name}</Text>
        </View>
        <Text style={[
          styles.prayerTime,
          { color: isNext ? theme.background : theme.primary }
        ]}>{time}</Text>
      </View>
      {isNext && (
        <View style={[styles.nextPrayerBadge, { backgroundColor: theme.background }]}>
          <Text style={[styles.nextPrayerText, { color: theme.primary }]}>
            {remainingTime}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            {t('prayerTimes')}
          </Text>
          <View style={[styles.locationContainer, { backgroundColor: theme.surface }]}>
            <MapPin size={20} color={theme.primary} />
            <Text style={[styles.locationText, { color: theme.text.secondary }]}>
              {address}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {prayerTimes && (
            <>
              <PrayerCard name={t('fajr')} time={prayerTimes.Fajr} isNext={nextPrayer === 'İmsak'} />
              <PrayerCard name={t('sunrise')} time={prayerTimes.Sunrise} isNext={nextPrayer === 'Güneş'} />
              <PrayerCard name={t('dhuhr')} time={prayerTimes.Dhuhr} isNext={nextPrayer === 'Öğle'} />
              <PrayerCard name={t('asr')} time={prayerTimes.Asr} isNext={nextPrayer === 'İkindi'} />
              <PrayerCard name={t('maghrib')} time={prayerTimes.Maghrib} isNext={nextPrayer === 'Akşam'} />
              <PrayerCard name={t('isha')} time={prayerTimes.Isha} isNext={nextPrayer === 'Yatsı'} />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 16,
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  prayerCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  prayerCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  prayerCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 12,
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextPrayerBadge: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  nextPrayerText: {
    fontSize: 14,
    fontWeight: '500',
  },
});