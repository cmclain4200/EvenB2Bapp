import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/lib/auth-store';
import { colors, spacing, radius, fontSize } from '../../src/theme/tokens';

export default function SignUpScreen() {
  const { signUp } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) return;
    setError('');
    setLoading(true);

    const result = await signUp(email.trim(), password, fullName.trim());
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.logo}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>E</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join your team on Even B2B</Text>
        </View>

        {success ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successText}>
              We sent a confirmation link to {email}. Tap it to activate your account.
            </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')} style={{ marginTop: spacing.lg }}>
              <Text style={styles.linkBold}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="John Smith"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />
              </View>

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
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')} style={styles.linkRow}>
              <Text style={styles.linkText}>Already have an account? </Text>
              <Text style={styles.linkBold}>Sign in</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  logo: { alignItems: 'center', marginBottom: spacing.xxl },
  logoBox: {
    width: 48, height: 48, borderRadius: radius.md,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  logoText: { color: colors.white, fontSize: fontSize.lg, fontWeight: '700' },
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
  successBox: {
    backgroundColor: colors.successSoft, borderWidth: 1, borderColor: colors.success + '33',
    borderRadius: radius.md, padding: spacing.lg, alignItems: 'center',
  },
  successTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.success },
  successText: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
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
