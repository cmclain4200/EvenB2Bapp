import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { colors, spacing } from '../../theme/tokens';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionTitle, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text variant="body" style={styles.title}>{title}</Text>
      {description && <Text variant="muted" style={styles.description}>{description}</Text>}
      {actionTitle && onAction && (
        <View style={styles.action}>
          <Button title={actionTitle} variant="secondary" size="sm" onPress={onAction} />
        </View>
      )}
    </View>
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text variant="muted" style={styles.loadingText}>{message}</Text>
    </View>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <View style={styles.container}>
      <Text variant="body" style={styles.title}>{message}</Text>
      {onRetry && (
        <View style={styles.action}>
          <Button title="Try again" variant="secondary" size="sm" onPress={onRetry} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: spacing.xl,
  },
  icon: {
    marginBottom: spacing.md,
    opacity: 0.4,
  },
  title: {
    textAlign: 'center',
    fontWeight: '500',
  },
  description: {
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  action: {
    marginTop: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
  },
});
