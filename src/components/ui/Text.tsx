import React from 'react';
import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native';
import { colors, fontSize, fontWeight } from '../../theme/tokens';

type Variant = 'title' | 'subtitle' | 'body' | 'muted' | 'label' | 'caption';

interface TextProps extends RNTextProps {
  variant?: Variant;
}

export function Text({ variant = 'body', style, ...props }: TextProps) {
  return <RNText style={[styles[variant], style]} {...props} />;
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    lineHeight: 22,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    color: colors.text,
    lineHeight: 20,
  },
  muted: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    color: colors.textMuted,
    lineHeight: 18,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
