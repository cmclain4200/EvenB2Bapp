import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, Modal, FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDataStore, RequestCategory, NeedBy, UrgencyLevel, DeliveryMethod, LineItem, PurchaseRequest } from '../src/lib/data-store';
import { colors, spacing, radius, fontSize } from '../src/theme/tokens';

const CATEGORIES: { key: RequestCategory; label: string }[] = [
  { key: 'materials', label: 'Materials' },
  { key: 'tools', label: 'Tools' },
  { key: 'equipment-rental', label: 'Equipment Rental' },
  { key: 'subcontract', label: 'Subcontract' },
  { key: 'other', label: 'Other' },
];

const NEED_BY_OPTIONS: { key: NeedBy; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'this-week', label: 'This Week' },
  { key: 'next-week', label: 'Next Week' },
];

// Session-level recents for vendors
const recentVendors: string[] = [];
const MAX_RECENT_VENDORS = 5;

function addRecentVendor(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const idx = recentVendors.indexOf(trimmed);
  if (idx !== -1) recentVendors.splice(idx, 1);
  recentVendors.unshift(trimmed);
  if (recentVendors.length > MAX_RECENT_VENDORS) recentVendors.pop();
}

interface LineItemDraft {
  id: string;
  name: string;
  qty: string;
  unit: string;
  cost: string;
}

function emptyLineItem(): LineItemDraft {
  return { id: `li-${Date.now()}-${Math.random()}`, name: '', qty: '', unit: 'pcs', cost: '' };
}

export default function CreateRequestScreen() {
  const store = useDataStore();

  const [projectId, setProjectId] = useState(store.projects[0]?.id ?? '');
  const [vendor, setVendor] = useState('');
  const [vendorFocused, setVendorFocused] = useState(false);
  const [category, setCategory] = useState<RequestCategory>('materials');
  const [costCodeId, setCostCodeId] = useState(store.costCodes[0]?.id ?? '');
  const [costCodeSearch, setCostCodeSearch] = useState('');
  const [showCostCodeModal, setShowCostCodeModal] = useState(false);
  const [needBy, setNeedBy] = useState<NeedBy>('this-week');
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [delivery, setDelivery] = useState<DeliveryMethod>('pickup');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);

  // Multiple line items
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([emptyLineItem()]);

  // Vendor suggestions
  const knownVendors = useMemo(() => {
    const v = new Set(store.requests.map((r) => r.vendor));
    return Array.from(v).sort();
  }, [store.requests]);

  const vendorSuggestions = useMemo(() => {
    const q = vendor.toLowerCase().trim();
    if (!q) {
      // Show recents when empty
      return recentVendors.slice(0, 4);
    }
    return knownVendors.filter((v) => v.toLowerCase().includes(q)).slice(0, 5);
  }, [vendor, knownVendors]);

  // Cost code filtering
  const filteredCostCodes = useMemo(() => {
    const q = costCodeSearch.toLowerCase().trim();
    if (!q) return store.costCodes;
    return store.costCodes.filter(
      (cc) =>
        cc.code.toLowerCase().includes(q) ||
        cc.label.toLowerCase().includes(q) ||
        cc.category.toLowerCase().includes(q)
    );
  }, [costCodeSearch, store.costCodes]);

  const selectedCostCode = store.getCostCodeById(costCodeId);

  // Totals
  const estimatedTotal = lineItems.reduce((sum, li) => {
    return sum + (parseFloat(li.qty) || 0) * (parseFloat(li.cost) || 0);
  }, 0);

  const isValid =
    vendor.trim() &&
    lineItems.some((li) => li.name.trim() && parseFloat(li.qty) > 0 && parseFloat(li.cost) > 0);

  const updateLineItem = (id: string, field: keyof LineItemDraft, value: string) => {
    setLineItems((items) =>
      items.map((li) => (li.id === id ? { ...li, [field]: value } : li))
    );
  };

  const addLineItem = () => {
    setLineItems((items) => [...items, emptyLineItem()]);
  };

  const removeLineItem = (id: string) => {
    setLineItems((items) => items.filter((li) => li.id !== id));
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setAttachments((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isValid || submitting) return;

    const validItems = lineItems
      .filter((li) => li.name.trim() && parseFloat(li.qty) > 0 && parseFloat(li.cost) > 0)
      .map((li) => ({
        name: li.name.trim(),
        quantity: parseFloat(li.qty),
        unit: li.unit || 'pcs',
        estimatedUnitCost: parseFloat(li.cost),
      }));

    addRecentVendor(vendor);
    setSubmitting(true);

    try {
      const created = await store.addRequest({
        projectId,
        vendor: vendor.trim(),
        category,
        costCodeId,
        lineItems: validItems,
        estimatedTotal,
        needBy,
        urgency,
        notes: notes.trim(),
        deliveryMethod: delivery,
        deliveryAddress: delivery === 'delivery'
          ? store.getProjectById(projectId)?.address
          : undefined,
        attachments,
      });

      Alert.alert('Request Submitted', `${created?.poNumber ?? 'Request'} is pending approval.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Project */}
        <Text style={styles.sectionTitle}>Job / Project</Text>
        <View style={styles.chipRow}>
          {store.projects.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setProjectId(p.id)}
              style={[styles.selectChip, projectId === p.id && styles.selectChipActive]}
            >
              <Text style={[styles.selectChipText, projectId === p.id && styles.selectChipTextActive]}>
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Vendor with autocomplete */}
        <Text style={styles.sectionTitle}>Vendor</Text>
        <View>
          <TextInput
            style={styles.input}
            placeholder="e.g. Home Depot, Sunbelt Rentals..."
            placeholderTextColor={colors.textMuted}
            value={vendor}
            onChangeText={setVendor}
            onFocus={() => setVendorFocused(true)}
            onBlur={() => setTimeout(() => setVendorFocused(false), 200)}
            autoCapitalize="words"
          />
          {vendorFocused && vendorSuggestions.length > 0 && (
            <View style={styles.suggestionsBox}>
              {!vendor.trim() && recentVendors.length > 0 && (
                <Text style={styles.suggestionsLabel}>Recent</Text>
              )}
              {vendorSuggestions.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={styles.suggestionRow}
                  onPress={() => {
                    setVendor(v);
                    setVendorFocused(false);
                  }}
                >
                  <Ionicons
                    name={!vendor.trim() ? 'time-outline' : 'business-outline'}
                    size={14}
                    color={colors.textMuted}
                  />
                  <Text style={styles.suggestionText}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Category */}
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.key}
              onPress={() => setCategory(c.key)}
              style={[styles.selectChip, category === c.key && styles.selectChipActive]}
            >
              <Text style={[styles.selectChipText, category === c.key && styles.selectChipTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Line Items */}
        <Text style={styles.sectionTitle}>Items</Text>
        {lineItems.map((li, index) => (
          <View key={li.id} style={styles.lineItemCard}>
            {lineItems.length > 1 && (
              <View style={styles.lineItemHeader}>
                <Text style={styles.lineItemIndex}>Item {index + 1}</Text>
                <TouchableOpacity onPress={() => removeLineItem(li.id)}>
                  <Ionicons name="close-circle" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            )}
            <TextInput
              style={styles.input}
              placeholder="Item name (e.g. 80lb Concrete Mix)"
              placeholderTextColor={colors.textMuted}
              value={li.name}
              onChangeText={(v) => updateLineItem(li.id, 'name', v)}
            />
            <View style={styles.row3}>
              <View style={styles.col3}>
                <Text style={styles.label}>Qty</Text>
                <TextInput
                  style={styles.input}
                  placeholder="40"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={li.qty}
                  onChangeText={(v) => updateLineItem(li.id, 'qty', v)}
                />
              </View>
              <View style={styles.col3}>
                <Text style={styles.label}>Unit</Text>
                <TextInput
                  style={styles.input}
                  placeholder="bags"
                  placeholderTextColor={colors.textMuted}
                  value={li.unit}
                  onChangeText={(v) => updateLineItem(li.id, 'unit', v)}
                />
              </View>
              <View style={styles.col3}>
                <Text style={styles.label}>Est. Unit Cost</Text>
                <TextInput
                  style={styles.input}
                  placeholder="6.50"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  value={li.cost}
                  onChangeText={(v) => updateLineItem(li.id, 'cost', v)}
                />
              </View>
            </View>
            {(parseFloat(li.qty) || 0) * (parseFloat(li.cost) || 0) > 0 && (
              <Text style={styles.lineItemSubtotal}>
                Subtotal: ${((parseFloat(li.qty) || 0) * (parseFloat(li.cost) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.addItemBtn} onPress={addLineItem}>
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.addItemText}>Add Item</Text>
        </TouchableOpacity>

        {estimatedTotal > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated Total</Text>
            <Text style={styles.totalValue}>${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          </View>
        )}

        {/* Cost Code — searchable modal */}
        <Text style={styles.sectionTitle}>Cost Code</Text>
        <TouchableOpacity
          style={styles.costCodeTrigger}
          onPress={() => {
            setCostCodeSearch('');
            setShowCostCodeModal(true);
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.costCodeTriggerText}>
              {selectedCostCode ? `${selectedCostCode.code} ${selectedCostCode.label}` : 'Select cost code...'}
            </Text>
            {selectedCostCode && (
              <Text style={styles.costCodeCategory}>{selectedCostCode.category}</Text>
            )}
          </View>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Need By */}
        <Text style={styles.sectionTitle}>Need By</Text>
        <View style={styles.chipRow}>
          {NEED_BY_OPTIONS.map((n) => (
            <TouchableOpacity
              key={n.key}
              onPress={() => setNeedBy(n.key)}
              style={[styles.selectChip, needBy === n.key && styles.selectChipActive]}
            >
              <Text style={[styles.selectChipText, needBy === n.key && styles.selectChipTextActive]}>
                {n.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Urgency */}
        <Text style={styles.sectionTitle}>Urgency</Text>
        <View style={styles.chipRow}>
          <TouchableOpacity
            onPress={() => setUrgency('normal')}
            style={[styles.selectChip, urgency === 'normal' && styles.selectChipActive]}
          >
            <Text style={[styles.selectChipText, urgency === 'normal' && styles.selectChipTextActive]}>Normal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setUrgency('urgent')}
            style={[styles.selectChip, urgency === 'urgent' && { backgroundColor: colors.dangerSoft, borderColor: colors.danger }]}
          >
            <Text style={[styles.selectChipText, urgency === 'urgent' && { color: colors.danger }]}>
              Urgent
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delivery */}
        <Text style={styles.sectionTitle}>Pickup or Delivery?</Text>
        <View style={styles.chipRow}>
          <TouchableOpacity
            onPress={() => setDelivery('pickup')}
            style={[styles.selectChip, delivery === 'pickup' && styles.selectChipActive]}
          >
            <Text style={[styles.selectChipText, delivery === 'pickup' && styles.selectChipTextActive]}>Pickup</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDelivery('delivery')}
            style={[styles.selectChip, delivery === 'delivery' && styles.selectChipActive]}
          >
            <Text style={[styles.selectChipText, delivery === 'delivery' && styles.selectChipTextActive]}>Deliver to Site</Text>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Any special instructions, context..."
          placeholderTextColor={colors.textMuted}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        {/* Attachments */}
        <Text style={styles.sectionTitle}>Photos / Quote</Text>
        <View style={styles.chipRow}>
          {attachments.map((uri, i) => (
            <View key={i} style={styles.thumbPlaceholder}>
              <Ionicons name="image" size={24} color={colors.primary} />
            </View>
          ))}
          <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePickImage}>
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={!isValid}
        >
          <Text style={[styles.submitBtnText, !isValid && { color: colors.textMuted }]}>
            Submit Request
          </Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Cost Code Search Modal */}
      <Modal visible={showCostCodeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.costCodeModal}>
            <View style={styles.costCodeModalHeader}>
              <Text style={styles.costCodeModalTitle}>Select Cost Code</Text>
              <TouchableOpacity onPress={() => setShowCostCodeModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.costCodeSearchWrap}>
              <Ionicons name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={styles.costCodeSearchInput}
                placeholder="Search by code, name, or category..."
                placeholderTextColor={colors.textMuted}
                value={costCodeSearch}
                onChangeText={setCostCodeSearch}
                autoFocus
              />
              {costCodeSearch.length > 0 && (
                <TouchableOpacity onPress={() => setCostCodeSearch('')}>
                  <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={filteredCostCodes}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item: cc }) => (
                <TouchableOpacity
                  style={[
                    styles.costCodeRow,
                    cc.id === costCodeId && styles.costCodeRowActive,
                  ]}
                  onPress={() => {
                    setCostCodeId(cc.id);
                    setShowCostCodeModal(false);
                  }}
                >
                  <Text style={styles.costCodeRowCode}>{cc.code}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.costCodeRowLabel}>{cc.label}</Text>
                    <Text style={styles.costCodeRowCategory}>{cc.category}</Text>
                  </View>
                  {cc.id === costCodeId && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                  <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
                    No codes match "{costCodeSearch}"
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.sm,
  },
  selectChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  selectChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  selectChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  selectChipTextActive: {
    color: colors.primary,
  },
  row3: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  col3: { flex: 1 },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  totalLabel: { fontSize: fontSize.md, fontWeight: '600', color: colors.primary },
  totalValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.primary },
  thumbPlaceholder: {
    width: 60, height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBtn: {
    width: 100, height: 60,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addPhotoText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '600' },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitBtnDisabled: {
    backgroundColor: colors.border,
  },
  submitBtnText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#fff',
  },

  // Vendor autocomplete
  suggestionsBox: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginTop: -spacing.sm + 2,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  suggestionsLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F1F3',
  },
  suggestionText: {
    fontSize: fontSize.md,
    color: colors.text,
  },

  // Line items
  lineItemCard: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  lineItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lineItemIndex: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  lineItemSubtotal: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'right',
    marginTop: 4,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  addItemText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },

  // Cost code modal
  costCodeTrigger: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  costCodeTriggerText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  costCodeCategory: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  costCodeModal: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '75%',
    overflow: 'hidden',
  },
  costCodeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  costCodeModalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  costCodeSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  costCodeSearchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  costCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F1F3',
  },
  costCodeRowActive: {
    backgroundColor: colors.primarySoft,
  },
  costCodeRowCode: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    width: 42,
  },
  costCodeRowLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  costCodeRowCategory: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
