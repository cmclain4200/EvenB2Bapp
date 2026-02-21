import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RequestStatus, UrgencyLevel } from '../data/types';
import { colors, radius, fontSize } from '../src/theme/tokens';

const STATUS_STYLES: Record<RequestStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: colors.surface, text: colors.textMuted, label: 'Draft' },
  pending: { bg: colors.warningSoft, text: colors.warning, label: 'Pending' },
  approved: { bg: colors.successSoft, text: colors.success, label: 'Approved' },
  rejected: { bg: colors.dangerSoft, text: colors.danger, label: 'Rejected' },
  purchased: { bg: colors.primarySoft, text: colors.primary, label: 'Purchased' },
};

export function StatusChip({ status }: { status: RequestStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <View style={[styles.chip, { backgroundColor: s.bg }]}>
      <Text style={[styles.chipText, { color: s.text }]}>{s.label}</Text>
    </View>
  );
}

export function UrgencyChip({ urgency }: { urgency: UrgencyLevel }) {
  if (urgency === 'normal') return null;
  return (
    <View style={[styles.chip, styles.urgentChip]}>
      <Text style={[styles.chipText, { color: colors.danger }]}>Urgent</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  chipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  urgentChip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.danger,
  },
});
