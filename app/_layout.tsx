import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from '@expo-google-fonts/ibm-plex-sans';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono';
import { useAuthStore } from '../src/lib/auth-store';
import { useDataStore } from '../src/lib/data-store';
import { colors } from '../src/theme/tokens';

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading, onboarded, organization, initialize } = useAuthStore();
  const initData = useDataStore((s) => s.initialize);
  const dataLoading = useDataStore((s) => s.loading);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initialize().then(() => setInitialized(true));
  }, [initialize]);

  // Initialize data store when auth is ready and onboarded
  useEffect(() => {
    if (initialized && session && onboarded && organization) {
      initData();
    }
  }, [initialized, session, onboarded, organization, initData]);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session) {
      // Not signed in — go to auth
      if (!inAuthGroup) {
        router.replace('/(auth)/sign-in');
      }
    } else if (!onboarded) {
      // Signed in but not onboarded — go to onboarding
      router.replace('/(auth)/onboarding');
    } else {
      // Signed in and onboarded — go to app
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [initialized, session, onboarded, segments, router]);

  if (!initialized || (session && onboarded && dataLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <AuthGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(auth)" />
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
      </AuthGate>
    </>
  );
}
