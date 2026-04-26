import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerTitle: 'CycleSense Home',
        }}
      />
      <Tabs.Screen
        name="prediction"
        options={{
          title: 'Prediction',
          headerTitle: 'Your Prediction',
        }}
      />
    </Tabs>
  );
}
