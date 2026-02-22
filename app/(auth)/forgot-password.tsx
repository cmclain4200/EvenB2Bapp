import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, radius, fontSize } from '../../src/theme/tokens';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) return;
    setError('');
    setLoading(true);

    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.logo}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkText}>✓</Text>
            </View>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.subtitle}>
              We sent a password reset link to {email}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.logo}>
          <Image source={require('../../assets/approcure-logo.png')} style={styles.logoImg} />
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>
        </View>

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

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.linkRow}>
          <Text style={styles.linkText}>Remember your password? </Text>
          <Text style={styles.linkBold}>Sign in</Text>
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
  checkCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  checkText: { fontSize: fontSize.xl, color: colors.success },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2, textAlign: 'center', paddingHorizontal: spacing.lg },
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
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  linkText: { fontSize: fontSize.sm, color: colors.textMuted },
  linkBold: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
});
