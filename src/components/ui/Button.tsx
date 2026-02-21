import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type ViewStyle } from 'react-native';
import { colors, radius, fontSize } from '../../theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  onPress,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? '#FFFFFF' : colors.primary}
        />
      ) : (
        <Text
          style={[
            styles.text,
            textVariants[variant],
            textSizes[size],
            isDisabled && styles.textDisabled,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontWeight: '600',
  },
  textDisabled: {
    opacity: 0.6,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  destructive: { backgroundColor: colors.danger },
};

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { height: 36, paddingHorizontal: 12 },
  md: { height: 44, paddingHorizontal: 16 },
  lg: { height: 48, paddingHorizontal: 20 },
};

const textVariants: Record<Variant, { color: string }> = {
  primary: { color: '#FFFFFF' },
  secondary: { color: colors.text },
  ghost: { color: colors.textMuted },
  destructive: { color: '#FFFFFF' },
};

const textSizes: Record<Size, { fontSize: number }> = {
  sm: { fontSize: fontSize.sm },
  md: { fontSize: fontSize.base },
  lg: { fontSize: fontSize.md },
};
