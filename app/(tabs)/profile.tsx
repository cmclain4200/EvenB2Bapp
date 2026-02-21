import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../data/store';
import { UserRole } from '../../data/types';
import { colors, spacing, radius, fontSize } from '../../src/theme/tokens';

const ROLES: { key: UserRole; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
  { key: 'worker', label: 'Field Worker', icon: 'construct-outline', desc: 'Mike Torres – creates requests, uploads receipts' },
  { key: 'manager', label: 'Project Manager', icon: 'checkmark-circle-outline', desc: 'Sarah Chen – approves/rejects requests' },
  { key: 'admin', label: 'Admin', icon: 'shield-outline', desc: 'Tom Bradley – views everything' },
];

export default function SettingsScreen() {
  const store = useStore();
  const [showDemoControls, setShowDemoControls] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHeaderTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      setShowDemoControls((prev) => !prev);
    } else {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 500);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header — triple-tap to reveal demo controls */}
        <TouchableOpacity activeOpacity={1} onPress={handleHeaderTap}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Account & preferences</Text>
          </View>
        </TouchableOpacity>

        {/* Current user */}
        <View style={styles.currentCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {store.currentUser.name.split(' ').map((w) => w[0]).join('')}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.currentName}>{store.currentUser.name}</Text>
            <Text style={styles.currentRole}>{store.currentUser.email}</Text>
            <Text style={styles.currentRole}>Role: {capitalize(store.currentUser.role)}</Text>
          </View>
        </View>

        {/* Settings items */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingsGroup}>
          <SettingsRow icon="notifications-outline" label="Notifications" value="Enabled" />
          <SettingsRow icon="moon-outline" label="Appearance" value="Light" />
          <SettingsRow icon="language-outline" label="Language" value="English" />
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.settingsGroup}>
          <SettingsRow icon="help-circle-outline" label="Help Center" />
          <SettingsRow icon="chatbubble-outline" label="Contact Support" />
          <SettingsRow icon="document-text-outline" label="Terms of Service" />
        </View>

        {/* Demo Controls (hidden until triple-tap) */}
        {showDemoControls && (
          <>
            <View style={styles.demoDivider}>
              <View style={styles.demoDividerLine} />
              <Text style={styles.demoDividerText}>Demo Controls</Text>
              <View style={styles.demoDividerLine} />
            </View>

            <Text style={styles.sectionTitle}>Switch Role</Text>
            {ROLES.map((r) => {
              const isActive = store.currentUser.role === r.key;
              return (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.roleCard, isActive && styles.roleCardActive]}
                  activeOpacity={0.7}
                  onPress={() => store.switchRole(r.key)}
                >
                  <Ionicons
                    name={r.icon}
                    size={24}
                    color={isActive ? colors.primary : colors.textMuted}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.roleLabel, isActive && { color: colors.primary }]}>{r.label}</Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                  </View>
                  {isActive && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Even B2B v1.0</Text>
          <Text style={styles.footerText}>All data is local / mock</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string }) {
  return (
    <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}>
      <Ionicons name={icon} size={20} color={colors.textMuted} />
      <Text style={styles.settingsLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      {value && <Text style={styles.settingsValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={16} color={colors.border} />
    </TouchableOpacity>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  currentCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
    backgroundColor: colors.bg, marginHorizontal: spacing.lg, padding: spacing.lg,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.primary },
  currentName: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  currentRole: { fontSize: fontSize.sm, color: colors.textMuted },
  sectionTitle: {
    fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted,
    paddingHorizontal: spacing.lg, marginBottom: spacing.sm,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  settingsGroup: {
    backgroundColor: colors.bg, marginHorizontal: spacing.lg,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.xl, overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F0F1F3',
  },
  settingsLabel: { fontSize: fontSize.md, color: colors.text },
  settingsValue: { fontSize: fontSize.sm, color: colors.textMuted, marginRight: 4 },
  demoDivider: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginHorizontal: spacing.lg, marginBottom: spacing.lg, marginTop: spacing.sm,
  },
  demoDividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  demoDividerText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' },
  roleCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.bg, marginHorizontal: spacing.lg, padding: spacing.lg,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  roleCardActive: {
    borderColor: colors.primary, backgroundColor: colors.primarySoft,
  },
  roleLabel: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  roleDesc: { fontSize: fontSize.sm, color: colors.textMuted },
  footer: { alignItems: 'center', marginTop: spacing.xl },
  footerText: { fontSize: fontSize.xs, color: colors.textMuted },
});
