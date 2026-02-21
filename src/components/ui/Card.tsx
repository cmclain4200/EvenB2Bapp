import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const paddings = {
  none: 0,
  sm: spacing.lg,
  md: spacing.xl,
  lg: spacing.xxl,
};

export function Card({ children, padding = 'md', style }: CardProps) {
  return (
    <View style={[styles.card, { padding: paddings[padding] }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
