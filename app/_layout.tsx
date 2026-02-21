import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/theme/tokens';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="request/[id]"
          options={{
            presentation: 'card',
            headerShown: true,
            headerTitle: 'Request Details',
            headerTintColor: colors.primary,
            headerStyle: { backgroundColor: colors.bg },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="create"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'New Purchase Request',
            headerTintColor: colors.primary,
            headerStyle: { backgroundColor: colors.bg },
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </>
  );
}
