import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import axios from 'axios';
import { Moon } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface PrayerTimes {
  Fajr: string;
  Maghrib: string;
}

interface CountdownTimes {
  iftar: string;
  sahur: string;
}

export default function RamadanScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [countdown, setCountdown] = useState<CountdownTimes>({ 
    iftar: 'Yükleniyor...', 
    sahur: 'Yükleniyor...' 
  });
  const [address, setAddress] = useState('Konum alınıyor...');
  const [error, setError] = useState<string | null>(null);

  const fetchRamadanTimes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Konum izni gerekli');
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;

      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      const city = geocode[0]?.city || 'Istanbul';
      const country = geocode[0]?.country || 'Turkey';
      setAddress(`${city}, ${country}`);

      const response = await axios.get('https://api.aladhan.com/v1/timingsByCity', {
        params: {
          city,
          country,
          method: 13
        }
      });

      const timings = response.data?.data?.timings;
      
      if (!timings || !timings.Fajr || !timings.Maghrib) {
        throw new Error('Vakitler alınamadı');
      }

      setTimes({
        Fajr: timings.Fajr,
        Maghrib: timings.Maghrib
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Vakitler alınamadı';
      setError(errorMessage);
      console.error('Error fetching times:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRamadanTimes();
  }, []);

  useEffect(() => {
    if (!times) return;

    const updateCountdown = () => {
      const now = new Date();
      const parseTime = (timeStr: string): number => {
        const [hour, minute] = timeStr.split(':').map(Number);
        return hour * 60 + minute;
      };

      const iftarTime = parseTime(times.Maghrib);
      const sahurTime = parseTime(times.Fajr);
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const formatCountdown = (diff: number): string => {
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return `${hours} saat ${minutes} dakika`;
      };

      setCountdown({
        iftar: currentTime < iftarTime 
          ? formatCountdown(iftarTime - currentTime) 
          : 'İftar vakti geldi!',
        sahur: currentTime < sahurTime 
          ? formatCountdown(sahurTime - currentTime) 
          : 'Sahur vakti bitti'
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [times]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRamadanTimes();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.text, { color: theme.text.primary }]}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.text, { color: theme.text.primary }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={fetchRamadanTimes}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Moon size={24} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>{t('ramadan')}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card.background }]}>
          <Text style={[styles.locationText, { color: theme.text.secondary }]}>
            {address}
          </Text>

          <View style={styles.timeContainer}>
            <View style={styles.timeItem}>
              <Text style={[styles.label, { color: theme.ramadan.iftar }]}>İftar</Text>
              <Text style={[styles.time, { color: theme.text.primary }]}>
                {times?.Maghrib || 'Bilinmiyor'}
              </Text>
              <Text style={[styles.countdown, { color: theme.text.secondary }]}>
                {countdown.iftar}
              </Text>
            </View>

            <View style={styles.timeItem}>
              <Text style={[styles.label, { color: theme.ramadan.sahur }]}>Sahur</Text>
              <Text style={[styles.time, { color: theme.text.primary }]}>
                {times?.Fajr || 'Bilinmiyor'}
              </Text>
              <Text style={[styles.countdown, { color: theme.text.secondary }]}>
                {countdown.sahur}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  locationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeItem: {
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  time: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  countdown: {
    fontSize: 14,
  },
  text: {
    fontSize: 16,
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});