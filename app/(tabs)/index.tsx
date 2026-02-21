import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../data/store';
import { RequestCard } from '../../components/RequestCard';
import { RequestStatus } from '../../data/types';
import { colors, spacing, fontSize, radius } from '../../src/theme/tokens';

const TABS: { key: RequestStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'purchased', label: 'Purchased' },
];

export default function RequestsListScreen() {
  const [activeTab, setActiveTab] = useState<RequestStatus | 'all'>('all');
  const store = useStore();
  const myRequests = store.getMyRequests();

  const filtered = useMemo(() => {
    if (activeTab === 'all') return myRequests;
    return myRequests.filter((r) => r.status === activeTab);
  }, [myRequests, activeTab]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Requests</Text>
          <Text style={styles.subtitle}>
            {store.currentUser.name} · {store.currentUser.role}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          activeOpacity={0.8}
          onPress={() => router.push('/create')}
        >
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.createBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabsContent}
          renderItem={({ item }) => {
            const isActive = activeTab === item.key;
            const count = item.key === 'all'
              ? myRequests.length
              : myRequests.filter((r) => r.status === item.key).length;
            return (
              <TouchableOpacity
                onPress={() => setActiveTab(item.key)}
                style={[styles.tab, isActive && styles.tabActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {item.label}
                </Text>
                {count > 0 && (
                  <Text style={[styles.tabCount, isActive && styles.tabCountActive]}>
                    {count}
                  </Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RequestCard request={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No requests yet</Text>
            <Text style={styles.emptySubtext}>Tap "+ New" to create a purchase request</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  createBtnText: { color: '#fff', fontWeight: '600', fontSize: fontSize.md },
  tabsContainer: { marginBottom: spacing.sm },
  tabsContent: { paddingHorizontal: spacing.lg, gap: 6 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: '#fff' },
  tabCount: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  tabCountActive: { color: 'rgba(255,255,255,0.8)' },
  listContent: { paddingTop: spacing.sm, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  emptySubtext: { fontSize: fontSize.sm, color: colors.textMuted },
});
