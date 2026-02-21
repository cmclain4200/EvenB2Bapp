import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useDataStore, PurchaseRequest } from '../src/lib/data-store';
import { StatusChip, UrgencyChip } from './StatusChip';
import { colors, spacing, radius, fontSize } from '../src/theme/tokens';

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86400000);
  return `${days}d ago`;
}

const NEED_BY: Record<string, string> = {
  today: 'Today', tomorrow: 'Tomorrow', 'this-week': 'This Week', 'next-week': 'Next Week',
};

function needByColor(needBy: string): string {
  if (needBy === 'today') return colors.danger;
  if (needBy === 'tomorrow') return colors.warning;
  return colors.textMuted;
}

export function RequestCard({ request }: { request: PurchaseRequest }) {
  const project = useDataStore((s) => s.getProjectById(request.projectId));
  const isUrgent = request.urgency === 'urgent' && request.status === 'pending';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/request/${request.id}`)}
    >
      {/* Red left stripe for urgent */}
      {isUrgent && <View style={styles.urgentStripe} />}

      <View style={styles.cardInner}>
        <View style={styles.topRow}>
          <View style={styles.chips}>
            <StatusChip status={request.status} />
            <UrgencyChip urgency={request.urgency} />
          </View>
          <Text style={styles.time}>{timeAgo(request.createdAt)}</Text>
        </View>

        <Text style={styles.vendor} numberOfLines={1}>{request.vendor}</Text>
        <Text style={styles.project} numberOfLines={1}>{project?.name} · {request.poNumber}</Text>

        <View style={styles.bottomRow}>
          <Text style={styles.amount}>{formatCurrency(request.estimatedTotal)}</Text>
          <Text style={[styles.needBy, { color: needByColor(request.needBy) }]}>
            Need by {NEED_BY[request.needBy]}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  urgentStripe: {
    width: 4,
    backgroundColor: colors.danger,
  },
  cardInner: {
    flex: 1,
    padding: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    gap: 6,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  vendor: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  project: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  needBy: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});
