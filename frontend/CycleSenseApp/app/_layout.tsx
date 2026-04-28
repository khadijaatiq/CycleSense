import 'react-native-reanimated';
import { Stack } from 'expo-router';




export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#E91E8C' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* 1. Auth Group (Register & Login) */}
      <Stack.Screen
        name="(auth)/index"
        options={{ title: 'CycleSense — Register' }}
      />
      <Stack.Screen
        name="(auth)/login"
        options={{ title: 'CycleSense — Login' }}
      />

      {/* 2. Tabs Group (Main App) */}
      {/* We hide the Stack header here because (tabs) has its own header */}
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      {/* 3. Individual screens outside of tabs if needed */}
      <Stack.Screen
        name="(tabs)/home"
        options={{ title: 'Log Your Cycle' }}
      />
    </Stack>
  );
}
