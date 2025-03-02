import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bookmark, Languages } from 'lucide-react-native';
import axios from 'axios';

interface Verse {
  number: number;
  text: string;
  translation: {
    tr: string;
    en: string;
  };
}

interface SurahDetail {
  name: string;
  verses: Verse[];
  totalVerses: number;
}

export default function SurahDetailScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [showTranslation, setShowTranslation] = useState<'ar' | 'tr' | 'en'>('ar');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSurahDetails();
  }, [id]);

  const fetchSurahDetails = async () => {
    try {
      setLoading(true);
      // Arapça metin için API çağrısı
      const arabicResponse = await axios.get(`http://api.alquran.cloud/v1/surah/${id}`);
      
      // Türkçe çeviri için API çağrısı
      const turkishResponse = await axios.get(`http://api.alquran.cloud/v1/surah/${id}/tr.diyanet`);
      
      // İngilizce çeviri için API çağrısı
      const englishResponse = await axios.get(`http://api.alquran.cloud/v1/surah/${id}/en.sahih`);

      // Verileri birleştirme
      const verses = arabicResponse.data.data.ayahs.map((ayah: any, index: number) => ({
        number: ayah.numberInSurah,
        text: ayah.text,
        translation: {
          tr: turkishResponse.data.data.ayahs[index].text,
          en: englishResponse.data.data.ayahs[index].text
        }
      }));

      setSurah({
        name: arabicResponse.data.data.name,
        verses,
        totalVerses: arabicResponse.data.data.numberOfAyahs
      });
      setLoading(false);
    } catch (err) {
      console.error('Sure detayları alınırken hata:', err);
      setError('Sure detayları yüklenemedi');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.surface }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {surah?.name}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.surface }]}
            onPress={() => console.log('Yer işareti eklendi')}
          >
            <Bookmark size={20} color={theme.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.surface }]}
            onPress={() => {
              setShowTranslation(
                showTranslation === 'ar' ? 'tr' :
                showTranslation === 'tr' ? 'en' : 'ar'
              );
            }}
          >
            <Languages size={20} color={theme.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {surah?.verses.map((verse) => (
          <View
            key={verse.number}
            style={[styles.verseContainer, { backgroundColor: theme.card.background }]}
          >
            <View style={[styles.verseHeader, { borderBottomColor: theme.border }]}>
              <View style={[styles.verseNumber, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.verseNumberText, { color: theme.primary }]}>
                  {verse.number}
                </Text>
              </View>
            </View>
            
            <Text style={[
              styles.verseText,
              { color: theme.text.primary },
              showTranslation === 'ar' && styles.arabicText
            ]}>
              {showTranslation === 'ar' ? verse.text :
               showTranslation === 'tr' ? verse.translation.tr :
               verse.translation.en}
            </Text>
          </View>
        ))}
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  verseContainer: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  verseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  verseText: {
    fontSize: 16,
    lineHeight: 28,
    padding: 16,
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 42,
    textAlign: 'right',
    fontFamily: 'System',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
  },
}); 