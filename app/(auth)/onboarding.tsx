import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useAuthStore } from '../../src/lib/auth-store';
import { colors, spacing, radius, fontSize } from '../../src/theme/tokens';

export default function OnboardingScreen() {
  const { claimAccessCode, signOut } = useAuthStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    if (!code.trim()) return;
    setError('');
    setLoading(true);

    const result = await claimAccessCode(code.trim());
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
    // Auth store onboarded change triggers navigation in _layout
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.logo}>
          <Image source={require('../../assets/approcure-logo.png')} style={styles.logoImg} />
          <Text style={styles.title}>Join Your Team</Text>
          <Text style={styles.subtitle}>Enter the access code your admin gave you</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Access Code</Text>
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              placeholder="XXXX-XXXX"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={12}
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, (loading || !code.trim()) && styles.buttonDisabled]}
            onPress={handleClaim}
            disabled={loading || !code.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{loading ? 'Joining...' : 'Join Organization'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have a code? Ask your project admin.</Text>
          <TouchableOpacity onPress={signOut} style={{ marginTop: spacing.sm }}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  logo: { alignItems: 'center', marginBottom: spacing.xxl },
  logoImg: { width: 48, height: 48, borderRadius: radius.md, marginBottom: spacing.lg },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  form: { gap: spacing.lg },
  field: { gap: 4 },
  label: { fontSize: fontSize.xs, fontWeight: '600', color: colors.text },
  codeInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.lg,
    fontSize: fontSize.lg, color: colors.text, backgroundColor: colors.bg,
    textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 4,
  },
  errorBox: {
    backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger + '33',
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  errorText: { fontSize: fontSize.xs, color: colors.danger },
  button: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.white, fontSize: fontSize.md, fontWeight: '600' },
  footer: { alignItems: 'center', marginTop: spacing.xxl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  footerText: { fontSize: fontSize.xs, color: colors.textMuted },
  signOutText: { fontSize: fontSize.sm, color: colors.textMuted },
});
