import React from 'react';
import { View, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { colors, spacing, radius } from '../../theme/tokens';

interface ListRowProps {
  children: React.ReactNode;
  onPress?: () => void;
  leftAccent?: string;
  style?: ViewStyle;
}

export function ListRow({ children, onPress, leftAccent, style }: ListRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.row, style]}
      disabled={!onPress}
    >
      {leftAccent && <View style={[styles.accent, { backgroundColor: leftAccent }]} />}
      <View style={styles.content}>{children}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  accent: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
});
