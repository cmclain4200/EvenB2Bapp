import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme/tokens';

interface ScreenLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export function ScreenLayout({ children, style, padded = true }: ScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.container, padded && styles.padded, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
});
