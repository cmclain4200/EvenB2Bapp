import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/lib/auth-store';
import { colors, spacing, radius, fontSize } from '../../src/theme/tokens';

export default function SignInScreen() {
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) return;
    setError('');
    setLoading(true);

    const result = await signIn(email.trim(), password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
    // Auth state change in _layout handles navigation
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Logo */}
        <View style={styles.logo}>
          <Image source={require('../../assets/approcure-logo.png')} style={styles.logoImg} />
          <Text style={styles.title}>Approcure</Text>
          <Text style={styles.subtitle}>Purchase Approvals for Construction</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@company.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 6 characters"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotRow}>
          <Text style={styles.linkBold}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')} style={styles.linkRow}>
          <Text style={styles.linkText}>Don&apos;t have an account? </Text>
          <Text style={styles.linkBold}>Sign up</Text>
        </TouchableOpacity>
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
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  form: { gap: spacing.lg },
  field: { gap: 4 },
  label: { fontSize: fontSize.xs, fontWeight: '600', color: colors.text },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: fontSize.md, color: colors.text, backgroundColor: colors.bg,
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
  forgotRow: { alignItems: 'center', marginTop: spacing.lg },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
  linkText: { fontSize: fontSize.sm, color: colors.textMuted },
  linkBold: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
});
