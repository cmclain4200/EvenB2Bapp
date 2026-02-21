import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors, radius, fontSize } from '../../theme/tokens';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: string;
  dot?: boolean;
  style?: ViewStyle;
}

const bgColors: Record<BadgeVariant, string> = {
  default: colors.surface,
  success: colors.successSoft,
  warning: colors.warningSoft,
  danger: colors.dangerSoft,
  info: colors.primarySoft,
};

const textColors: Record<BadgeVariant, string> = {
  default: colors.textMuted,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  info: colors.primary,
};

export function Badge({ variant = 'default', children, dot = false, style }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColors[variant] }, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: textColors[variant] }]} />}
      <Text style={[styles.text, { color: textColors[variant] }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});
