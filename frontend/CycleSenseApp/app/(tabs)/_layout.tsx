import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#E91E8C', tabBarInactiveTintColor: '#999' }}>
      {/* ── Dashboard (landing) ── */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerTitle: 'CycleSense 🌸',
          headerStyle: { backgroundColor: '#E91E8C' },
          headerShown: false,          // hero section acts as header
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Log Cycle',
          headerTitle: 'CycleSense',
          headerStyle: { backgroundColor: '#E91E8C' },
          headerTintColor: '#fff',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          headerTitle: 'Cycle History',
          headerStyle: { backgroundColor: '#E91E8C' },
          headerTintColor: '#fff',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="prediction"
        options={{
          title: 'Prediction',
          headerTitle: 'Your Prediction',
          headerStyle: { backgroundColor: '#E91E8C' },
          headerTintColor: '#fff',
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}
