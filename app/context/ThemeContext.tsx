import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Theme {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  text: {
    primary: string;
    secondary: string;
  };
  card: {
    background: string;
    shadow: string;
  };
  prayer: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  ramadan: {
    iftar: string;
    sahur: string;
  };
}

const lightTheme: Theme = {
  background: '#F7F7F7',
  surface: '#F5F5F5',
  primary: '#051a2d',
  secondary: '#1976D2',
  border: '#E0E0E0',
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
  text: {
    primary: '#212121',
    secondary: '#757575',
  },
  card: {
    background: '#FFFFFF',
    shadow: '#000000',
  },
  prayer: {
    fajr: '#673AB7',
    sunrise: '#FF9800',
    dhuhr: '#2196F3',
    asr: '#00BCD4',
    maghrib: '#E91E63',
    isha: '#3F51B5'
  },
  ramadan: {
    iftar: '#E91E63',
    sahur: '#673AB7'
  }
};

const darkTheme: Theme = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#81C784',
  secondary: '#64B5F6',
  border: '#333333',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
  },
  card: {
    background: '#1E1E1E',
    shadow: '#000000',
  },
  prayer: {
    fajr: '#9575CD',
    sunrise: '#FFB74D',
    dhuhr: '#64B5F6',
    asr: '#4DD0E1',
    maghrib: '#F06292',
    isha: '#7986CB'
  },
  ramadan: {
    iftar: '#F06292',
    sahur: '#9575CD'
  }
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'true');
      }
    } catch (error) {
      console.error('Tema tercihi yüklenirken hata:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newIsDark = !isDark;
      setIsDark(newIsDark);
      await AsyncStorage.setItem('isDarkMode', newIsDark.toString());
    } catch (error) {
      console.error('Tema değiştirilirken hata:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 