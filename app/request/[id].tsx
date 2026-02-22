import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput,
  Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDataStore } from '../../src/lib/data-store';
import { useAuthStore } from '../../src/lib/auth-store';
import { StatusChip, UrgencyChip } from '../../components/StatusChip';
import { colors, spacing, radius, fontSize } from '../../src/theme/tokens';

function fmt(n: number) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 }); }

const NEED_BY: Record<string, string> = {
  today: 'Today', tomorrow: 'Tomorrow', 'this-week': 'This Week', 'next-week': 'Next Week',
};
const CAT: Record<string, string> = {
  materials: 'Materials', tools: 'Tools', 'equipment-rental': 'Equipment Rental',
  subcontract: 'Subcontract', other: 'Other',
};

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useDataStore();
  const can = useAuthStore((s) => s.can);
  const request = store.requests.find((r) => r.id === id);
  const [showPurchaseSheet, setShowPurchaseSheet] = useState(false);
  const [finalTotal, setFinalTotal] = useState('');
  const [purchaseNotes, setPurchaseNotes] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  if (!request) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.textMuted }}>Request not found</Text>
      </View>
    );
  }

  const project = store.getProjectById(request.projectId);
  const costCode = store.getCostCodeById(request.costCodeId);
  const approver = request.approvedBy ? store.getUserById(request.approvedBy) : null;
  const canMarkPurchased = can('po.mark_ordered', request.projectId);

  const parsedFinal = parseFloat(finalTotal) || request.estimatedTotal;
  const variance = parsedFinal - request.estimatedTotal;
  const variancePct = request.estimatedTotal > 0
    ? ((variance / request.estimatedTotal) * 100).toFixed(1)
    : '0.0';

  const handlePickReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled && result.assets[0]?.uri) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const handleConfirmPurchase = async () => {
    setSubmitting(true);
    try {
      await store.markPurchased(request.id, parsedFinal, receiptUri, purchaseNotes);
      setShowPurchaseSheet(false);
      Alert.alert('Marked as Purchased', `${request.poNumber} finalized at ${fmt(parsedFinal)}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const openPurchaseSheet = () => {
    setFinalTotal(request.estimatedTotal.toString());
    setPurchaseNotes('');
    setReceiptUri(undefined);
    setShowPurchaseSheet(true);
  };

  return (
    <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Status Header */}
        <View style={styles.statusRow}>
          <StatusChip status={request.status} />
          <UrgencyChip urgency={request.urgency} />
          <Text style={styles.po}>{request.poNumber}</Text>
        </View>

        <Text style={styles.vendor}>{request.vendor}</Text>
        <Text style={styles.projectName}>{project?.name} · {project?.jobNumber}</Text>

        {/* Meta */}
        <View style={styles.metaGrid}>
          <MetaItem label="Category" value={CAT[request.category] ?? request.category} />
          <MetaItem label="Need By" value={NEED_BY[request.needBy]} highlight={request.needBy === 'today'} />
          <MetaItem label="Cost Code" value={costCode ? `${costCode.code} ${costCode.label}` : '—'} />
          <MetaItem label="Delivery" value={request.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'} />
        </View>

        {/* Line Items */}
        <Text style={styles.sectionTitle}>Line Items</Text>
        <View style={styles.card}>
          {request.lineItems.map((li) => (
            <View key={li.id} style={styles.lineItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.liName}>{li.name}</Text>
                <Text style={styles.liDetail}>{li.quantity} {li.unit} × {fmt(li.estimatedUnitCost)}</Text>
              </View>
              <Text style={styles.liTotal}>{fmt(li.quantity * li.estimatedUnitCost)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated Total</Text>
            <Text style={styles.totalValue}>{fmt(request.estimatedTotal)}</Text>
          </View>
          {request.finalTotal !== undefined && (
            <View style={[styles.totalRow, { borderTopWidth: 0 }]}>
              <Text style={[styles.totalLabel, { color: colors.success }]}>Final Total</Text>
              <Text style={[styles.totalValue, { color: colors.success }]}>{fmt(request.finalTotal)}</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {request.notes ? (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.card}>
              <Text style={styles.notes}>{request.notes}</Text>
            </View>
          </>
        ) : null}

        {/* Rejection reason */}
        {request.status === 'rejected' && request.rejectionReason && (
          <>
            <Text style={styles.sectionTitle}>Rejection Reason</Text>
            <View style={[styles.card, { borderColor: colors.danger, borderWidth: 1.5 }]}>
              <Text style={{ color: colors.danger, fontWeight: '600', marginBottom: 4 }}>Rejected</Text>
              <Text style={styles.notes}>{request.rejectionReason}</Text>
            </View>
          </>
        )}

        {/* Approval info */}
        {(request.status === 'approved' || request.status === 'purchased') && approver && (
          <>
            <Text style={styles.sectionTitle}>Approval</Text>
            <View style={[styles.card, { borderColor: colors.primary, borderWidth: 1.5 }]}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                Approved by {approver.name}
              </Text>
            </View>
          </>
        )}

        {/* Mark Purchased CTA */}
        {request.status === 'approved' && canMarkPurchased && (
          <View style={{ marginTop: spacing.xl }}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.8}
              onPress={openPurchaseSheet}
            >
              <Ionicons name="cart-outline" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Mark as Purchased</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Edit & Resubmit CTA */}
        {request.status === 'rejected' && (
          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: spacing.xl }]}
            activeOpacity={0.8}
            onPress={() => {
              Alert.alert('Demo', 'In production this would open an edit form pre-filled with the original request.');
            }}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Edit & Resubmit</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Purchase Bottom Sheet */}
      <Modal
        visible={showPurchaseSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPurchaseSheet(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetOverlay}
        >
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setShowPurchaseSheet(false)}
          />
          <View style={styles.sheetContainer}>
            {/* Handle */}
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>Finalize Purchase</Text>
            <Text style={styles.sheetSubtitle}>{request.poNumber} · {request.vendor}</Text>

            <ScrollView style={{ maxHeight: 400 }} keyboardShouldPersistTaps="handled">
              {/* Final Total */}
              <Text style={styles.sheetLabel}>Final Total</Text>
              <TextInput
                style={styles.sheetInput}
                placeholder={request.estimatedTotal.toString()}
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={finalTotal}
                onChangeText={setFinalTotal}
              />

              {/* Variance Summary */}
              <View style={styles.varianceCard}>
                <View style={styles.varianceRow}>
                  <Text style={styles.varianceLabel}>Estimated</Text>
                  <Text style={styles.varianceValue}>{fmt(request.estimatedTotal)}</Text>
                </View>
                <View style={styles.varianceRow}>
                  <Text style={styles.varianceLabel}>Final</Text>
                  <Text style={[styles.varianceValue, { fontWeight: '700' }]}>{fmt(parsedFinal)}</Text>
                </View>
                <View style={[styles.varianceRow, { borderTopWidth: 1, borderTopColor: '#F0F1F3', paddingTop: spacing.sm }]}>
                  <Text style={styles.varianceLabel}>Variance</Text>
                  <Text style={[
                    styles.varianceValue,
                    { color: variance > 0 ? colors.danger : variance < 0 ? colors.success : colors.text },
                  ]}>
                    {variance >= 0 ? '+' : ''}{fmt(variance)} ({variancePct}%)
                  </Text>
                </View>
              </View>

              {/* Receipt Upload */}
              <Text style={styles.sheetLabel}>Receipt Photo</Text>
              <TouchableOpacity style={styles.receiptUpload} activeOpacity={0.7} onPress={handlePickReceipt}>
                {receiptUri ? (
                  <View style={styles.receiptAttached}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                    <Text style={styles.receiptAttachedText}>Receipt attached</Text>
                    <TouchableOpacity onPress={() => setReceiptUri(undefined)}>
                      <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={28} color={colors.primary} />
                    <Text style={styles.receiptUploadText}>Tap to attach receipt</Text>
                    <Text style={styles.receiptUploadHint}>Optional but recommended</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Notes */}
              <Text style={styles.sheetLabel}>Notes (optional)</Text>
              <TextInput
                style={[styles.sheetInput, { height: 60, textAlignVertical: 'top' }]}
                placeholder="Any purchase notes..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={purchaseNotes}
                onChangeText={setPurchaseNotes}
              />
            </ScrollView>

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmBtn}
              activeOpacity={0.8}
              onPress={handleConfirmPurchase}
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.confirmBtnText}>Confirm Purchase - {fmt(parsedFinal)}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function MetaItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, highlight && { color: colors.danger }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md },
  po: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted, marginLeft: 'auto' },
  vendor: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text },
  projectName: { fontSize: fontSize.md, color: colors.textMuted, marginBottom: spacing.lg },
  metaGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg,
  },
  metaItem: {
    width: '47%' as any,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 2, textTransform: 'uppercase' },
  metaValue: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  sectionTitle: {
    fontSize: fontSize.sm, fontWeight: '700', color: colors.text,
    marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.bg, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  lineItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: '#F0F1F3',
  },
  liName: { fontSize: fontSize.md, fontWeight: '500', color: colors.text },
  liDetail: { fontSize: fontSize.sm, color: colors.textMuted },
  liTotal: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm,
  },
  totalLabel: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  totalValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  notes: { fontSize: fontSize.md, color: colors.textMuted, lineHeight: 22 },
  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '700' },

  // Bottom Sheet
  sheetOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheetContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
    paddingTop: spacing.md,
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.lg,
  },
  sheetTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  sheetSubtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.lg },
  sheetLabel: {
    fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs,
  },
  sheetInput: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    fontSize: fontSize.md, color: colors.text, marginBottom: spacing.lg,
  },
  varianceCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  varianceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 4,
  },
  varianceLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  varianceValue: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  receiptUpload: {
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
    borderStyle: 'dashed', borderRadius: radius.md, padding: spacing.xl,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  receiptUploadText: { fontSize: fontSize.md, fontWeight: '600', color: colors.primary, marginTop: spacing.xs },
  receiptUploadHint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  receiptAttached: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  receiptAttachedText: { fontSize: fontSize.md, fontWeight: '600', color: colors.success, flex: 1 },
  confirmBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: spacing.md,
  },
  confirmBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '700' },
});
