import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/lib/auth-store';
import { colors, spacing, radius, fontSize } from '../../src/theme/tokens';

export default function SettingsScreen() {
  const { profile, organization, orgRoles, signOut, leaveOrganization } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  const handleLeaveOrg = () => {
    Alert.alert(
      'Leave Organization',
      `Are you sure you want to leave ${organization?.name ?? 'this organization'}? You will need a new access code to rejoin.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            const result = await leaveOrganization();
            if (result.error) {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  const initials = (profile?.full_name || profile?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Account & preferences</Text>
        </View>

        {/* Current user */}
        <View style={styles.currentCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.currentName}>{profile?.full_name || 'User'}</Text>
            <Text style={styles.currentRole}>{profile?.email}</Text>
            {organization && (
              <Text style={styles.currentRole}>{organization.name}</Text>
            )}
            {orgRoles.length > 0 && (
              <Text style={styles.currentRole}>
                {orgRoles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
              </Text>
            )}
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

        {/* Leave Organization */}
        {organization && (
          <TouchableOpacity style={styles.leaveOrgBtn} activeOpacity={0.7} onPress={handleLeaveOrg}>
            <Ionicons name="exit-outline" size={20} color={colors.warning} />
            <Text style={styles.leaveOrgText}>Leave Organization</Text>
          </TouchableOpacity>
        )}

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.7} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Approcure v1.0</Text>
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
  leaveOrgBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    marginHorizontal: spacing.lg, paddingVertical: 14,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.warning,
    marginBottom: spacing.md,
  },
  leaveOrgText: { fontSize: fontSize.md, fontWeight: '600', color: colors.warning },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    marginHorizontal: spacing.lg, paddingVertical: 14,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.danger,
    marginBottom: spacing.xl,
  },
  signOutText: { fontSize: fontSize.md, fontWeight: '600', color: colors.danger },
  footer: { alignItems: 'center', marginTop: spacing.sm },
  footerText: { fontSize: fontSize.xs, color: colors.textMuted },
});
