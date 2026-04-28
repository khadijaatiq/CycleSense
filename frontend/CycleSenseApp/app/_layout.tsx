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
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      {/* 3. Individual screens outside tabs */}
      <Stack.Screen
        name="(tabs)/home"
        options={{ title: 'Log Your Cycle' }}
      />

      {/* 4. Reset password (pushed from dashboard) */}
      <Stack.Screen
        name="(auth)/reset-password"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
