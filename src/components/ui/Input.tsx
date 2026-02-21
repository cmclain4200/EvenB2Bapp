import React, { useState } from 'react';
import { View, TextInput, StyleSheet, type TextInputProps, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, radius, fontSize, spacing } from '../../theme/tokens';

interface InputProps extends TextInputProps {
  label?: string;
  helper?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, helper, error, containerStyle, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label && <Text variant="label" style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && <Text variant="caption" style={styles.error}>{error}</Text>}
      {!error && helper && <Text variant="caption" style={styles.helper}>{helper}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
  },
  input: {
    height: 44,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.base,
    color: colors.text,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    marginTop: 4,
  },
  helper: {
    marginTop: 4,
  },
});
