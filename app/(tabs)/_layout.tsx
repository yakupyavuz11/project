import { Tabs } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { Home, Moon, Calendar, Compass } from 'lucide-react-native';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
          marginBottom: 16,
          elevation: 8,
          shadowColor: theme.card.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text.secondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="prayer-times"
        options={{
          title: 'Namaz',
          tabBarIcon: ({ color, size }) => <Moon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ramadan"
        options={{
          title: 'Ramazan',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: 'Kıble',
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}