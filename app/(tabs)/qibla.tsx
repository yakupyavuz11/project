import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { useTheme } from '../context/ThemeContext';
import { Compass, MapPin, RotateCcw } from 'lucide-react-native';
import { t } from 'i18next';

export default function QiblaScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [magnetometer, setMagnetometer] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [accuracy, setAccuracy] = useState<'high' | 'low' | 'unreliable'>(
    'unreliable'
  );

  const calculateQibla = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Konum izni gerekli');
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Kabe'nin koordinatları
      const KAABA_LAT = 21.422487;
      const KAABA_LNG = 39.826206;

      const phi1 = (latitude * Math.PI) / 180;
      const phi2 = (KAABA_LAT * Math.PI) / 180;
      const lambda1 = (longitude * Math.PI) / 180;
      const lambda2 = (KAABA_LNG * Math.PI) / 180;

      const y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
      const x =
        Math.cos(phi1) * Math.sin(phi2) -
        Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);
      const qibla = (Math.atan2(y, x) * 180) / Math.PI;

      setQiblaDirection((qibla + 360) % 360);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kıble yönü hesaplanamadı');
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateQibla();

    const subscription = Magnetometer.addListener((data) => {
      let angle = (Math.atan2(data.y, data.x) * 180) / Math.PI;
      angle = (angle + 360) % 360;
      setMagnetometer(angle);

      // Pusula hassasiyetini kontrol et
      const magnitude = Math.sqrt(
        data.x * data.x + data.y * data.y + data.z * data.z
      );
      if (magnitude > 40) {
        setAccuracy('high');
      } else if (magnitude > 20) {
        setAccuracy('low');
      } else {
        setAccuracy('unreliable');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const getAccuracyColor = () => {
    switch (accuracy) {
      case 'high':
        return theme.success;
      case 'low':
        return theme.warning;
      default:
        return theme.error;
    }
  };

  const getAccuracyText = () => {
    switch (accuracy) {
      case 'high':
        return t('high_accuracy');
      case 'low':
        return t('low_accuracy');
      default:
        return t('unreliable');
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.text, { color: theme.text.primary }]}>
            {t('calculating_qibla')}
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
            onPress={calculateQibla}
          >
            <RotateCcw size={24} color={theme.background} />
            <Text style={[styles.buttonText, { color: theme.background }]}>
              {t('try_again')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const rotation = magnetometer - qiblaDirection;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Compass size={24} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {t('qibla_compass')}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card.background }]}>
        <View style={styles.compassContainer}>
          <View
            style={[
              styles.compassOuter,
              {
                transform: [{ rotate: `${rotation}deg` }],
                borderColor: theme.border,
              },
            ]}
          >
            <View style={[styles.compassInner, { borderColor: theme.border }]}>
              <View style={styles.northContainer}>
                <Text style={[styles.northText, { color: theme.error }]}>
                  N
                </Text>
              </View>

              <View
                style={[
                  styles.directionLine,
                  { backgroundColor: theme.border },
                ]}
              />
              <View
                style={[
                  styles.directionLine,
                  {
                    backgroundColor: theme.border,
                    transform: [{ rotate: '90deg' }],
                  },
                ]}
              />
              <View
                style={[
                  styles.directionLine,
                  {
                    backgroundColor: theme.border,
                    transform: [{ rotate: '45deg' }],
                  },
                ]}
              />
              <View
                style={[
                  styles.directionLine,
                  {
                    backgroundColor: theme.border,
                    transform: [{ rotate: '135deg' }],
                  },
                ]}
              />

              <View style={styles.arrowContainer}>
                <View
                  style={[styles.arrowHead, { backgroundColor: theme.primary }]}
                />
                <View
                  style={[styles.arrowBody, { backgroundColor: theme.primary }]}
                />
              </View>
            </View>
          </View>

          <View
            style={[
              styles.kaaba,
              {
                backgroundColor: theme.card.background,
                borderColor: theme.primary,
              },
            ]}
          >
            <MapPin size={28} color={theme.primary} />
          </View>

          <Text style={[styles.degrees, { color: theme.text.primary }]}>
            {Math.round(rotation)}°
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.accuracyText, { color: getAccuracyColor() }]}>
            {getAccuracyText()}
          </Text>

          <Text style={[styles.hint, { color: theme.text.secondary }]}>
            {t('qibla_hint')}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 340,
    position: 'relative',
  },
  compassOuter: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  compassInner: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  northContainer: {
    position: 'absolute',
    top: 10,
    alignItems: 'center',
  },
  northText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  directionLine: {
    position: 'absolute',
    width: 120,
    height: 1,
    opacity: 0.3,
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: -10,
  },
  arrowBody: {
    width: 4,
    height: 100,
    borderRadius: 2,
  },
  kaaba: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  degrees: {
    position: 'absolute',
    bottom: 0,
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  accuracyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginTop: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
