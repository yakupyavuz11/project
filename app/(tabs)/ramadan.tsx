import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
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
    iftar: t('Loading'),
    sahur: t('Loading'),
  });
  const [address, setAddress] = useState(t('getting_location'));
  const [error, setError] = useState<string | null>(null);

  const fetchRamadanTimes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error(t('location_permission_required'));
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;

      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      const city = geocode[0]?.city || 'Istanbul';
      const country = geocode[0]?.country || 'Turkey';
      setAddress(`${city}, ${country}`);

      const response = await axios.get(
        'https://api.aladhan.com/v1/timingsByCity',
        {
          params: {
            city,
            country,
            method: 13,
          },
        }
      );

      const timings = response.data?.data?.timings;

      if (!timings || !timings.Fajr || !timings.Maghrib) {
        throw new Error(t('times_not_found'));
      }

      setTimes({
        Fajr: timings.Fajr,
        Maghrib: timings.Maghrib,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t('times_not_found');
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
        return `${hours} ${t('hours')} ve ${minutes} ${t('minutes')}`;
      };

      setCountdown({
        iftar:
          currentTime < iftarTime
            ? formatCountdown(iftarTime - currentTime)
            : t('iftar_time_arrived'),
        sahur:
          currentTime < sahurTime
            ? formatCountdown(sahurTime - currentTime)
            : t('sahur_time_over'),
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
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.text, { color: theme.text.primary }]}>
            {t('loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.errorContainer}>
          <Text style={[styles.text, { color: theme.text.primary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={fetchRamadanTimes}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>
              {t('try_again')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Moon size={24} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>
            {t('ramadan')}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card.background }]}>
          <Text style={[styles.locationText, { color: theme.text.secondary }]}>
            {address}
          </Text>

          <View style={styles.timeContainer}>
            <View style={styles.timeItem}>
              <Text style={[styles.label, { color: theme.ramadan.iftar }]}>
                {t('iftar')}
              </Text>
              <Text style={[styles.time, { color: theme.text.primary }]}>
                {times?.Maghrib || t('unknown')}
              </Text>
              <Text style={[styles.countdown, { color: theme.text.secondary }]}>
                {countdown.iftar}
              </Text>
            </View>

            <View style={styles.timeItem}>
              <Text style={[styles.label, { color: theme.ramadan.sahur }]}>
                {t('sahur')}
              </Text>
              <Text style={[styles.time, { color: theme.text.primary }]}>
                {times?.Fajr || t('unknown')}
              </Text>
              <Text style={[styles.countdown, { color: theme.text.secondary }]}>
                {countdown.sahur}
              </Text>
            </View>
          </View>
        </View>
        {/* Hadisler bölümü */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card.background, marginTop: 20 },
          ]}
        >
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Ramazan ile İlgili Hadisler
          </Text>

          <View style={styles.hadisItem}>
            <Text style={[styles.hadisText, { color: theme.text.secondary }]}>
              1. "Kim Ramazan ayında iman ederek ve sevabını Allah’tan umarak
              oruç tutarsa, geçmiş günahları bağışlanır."
              <Text style={{ fontStyle: 'italic' }}>
                (Bukhari, Hadis No: 38)
              </Text>
            </Text>
          </View>

          <View style={styles.hadisItem}>
            <Text style={[styles.hadisText, { color: theme.text.secondary }]}>
              2. "Ramazan, ümmetim için bir rahmet ayıdır. Allah, bu ayda
              insanları bağışlamayı diler."
              <Text style={{ fontStyle: 'italic' }}>
                (Tirmizi, Hadis No: 682)
              </Text>
            </Text>
          </View>

          <View style={styles.hadisItem}>
            <Text style={[styles.hadisText, { color: theme.text.secondary }]}>
              3. "Oruç, şüphe yok ki bir kalkan gibidir. Oruçlunun kötü
              sözlerden, çirkin davranışlardan korunması gerekir."
              <Text style={{ fontStyle: 'italic' }}>
                (Bukhari, Hadis No: 1904)
              </Text>
            </Text>
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
  hadisItem: {
    marginBottom: 10,
  },
  hadisText: {
    fontSize: 16,
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
