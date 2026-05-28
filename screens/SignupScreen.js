import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/theme';

export default function SignupScreen({ onNavigateToLogin }) {
  const { signup } = useAuth();

  const [name, setName] = useState('Archanaa');
  const [email, setEmail] = useState('archanaa@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length === 0) return { level: 0, label: '', color: 'transparent' };
    if (password.length < 6) return { level: 1, label: 'Weak', color: theme.colors.danger };
    if (password.length < 10) return { level: 2, label: 'Fair', color: theme.colors.warning };
    return { level: 3, label: 'Strong', color: theme.colors.success };
  };

  const strength = getPasswordStrength();

  const handleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
    } catch (err) {
      setError(err.message);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.glowTR} />
      <View style={styles.glowBL} />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoIconBg}>
              <MaterialCommunityIcons name="dna" size={32} color={theme.colors.accentCyan} />
            </View>
            <Text style={styles.appName}>BioStability</Text>
            <Text style={styles.headerSub}>Create your health baseline profile</Text>
          </Animated.View>

          {/* ── Form Card ──────────────────────────────────────── */}
          <Animated.View style={[styles.formCard, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
          }]}>
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formSubtitle}>Your personalized health intelligence awaits</Text>

            {/* Name */}
            <View style={[styles.inputWrap, nameFocused && styles.inputWrapFocused]}>
              <MaterialCommunityIcons
                name="account-outline"
                size={18}
                color={nameFocused ? theme.colors.accentCyan : theme.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Email */}
            <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
              <MaterialCommunityIcons
                name="email-outline"
                size={18}
                color={emailFocused ? theme.colors.accentCyan : theme.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={[styles.inputWrap, passwordFocused && styles.inputWrapFocused]}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={18}
                color={passwordFocused ? theme.colors.accentCyan : theme.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password (min 6 chars)"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSignup}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={theme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Password strength bar */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBarBg}>
                  {[1, 2, 3].map((seg) => (
                    <View
                      key={seg}
                      style={[
                        styles.strengthSeg,
                        { backgroundColor: strength.level >= seg ? strength.color : 'rgba(255,255,255,0.08)' },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}

            {/* Error */}
            {!!error && (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={14} color={theme.colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Create Account button */}
            <TouchableOpacity
              style={[styles.signupBtn, loading && { opacity: 0.7 }]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#4F46E5', '#06B6D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signupBtnGrad}
              >
                {loading
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : (
                    <>
                      <Text style={styles.signupBtnText}>Create Account</Text>
                      <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFF" style={{ marginLeft: 6 }} />
                    </>
                  )
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* Privacy notice */}
            <Text style={styles.privacyText}>
              By creating an account, your biometric data is stored securely on your device.
              No data leaves your device without consent.
            </Text>

            {/* Divider */}
            <View style={styles.divRow}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>OR</Text>
              <View style={styles.divLine} />
            </View>

            {/* Login link */}
            <TouchableOpacity style={styles.loginRow} onPress={onNavigateToLogin} activeOpacity={0.7}>
              <Text style={styles.loginText}>
                Already have an account?{'  '}
                <Text style={styles.loginAccent}>Sign In →</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Feature highlights ─────────────────────────────── */}
          <Animated.View style={[styles.featuresRow, { opacity: fadeAnim }]}>
            {[
              { icon: 'brain', label: 'AI Insights' },
              { icon: 'shield-lock', label: 'HIPAA Safe' },
              { icon: 'watch', label: '52+ Devices' },
            ].map((f) => (
              <View key={f.label} style={styles.featureChip}>
                <MaterialCommunityIcons name={f.icon} size={14} color={theme.colors.accentCyan} />
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bgPrimary },
  glowTR: {
    position: 'absolute',
    top: -60,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
  },
  glowBL: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(6, 182, 212, 0.06)',
  },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Header
  header: { alignItems: 'center', marginBottom: 28 },
  logoIconBg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(79, 70, 229, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },

  // Form Card
  formCard: {
    width: '100%',
    backgroundColor: theme.glassmorphism.backgroundColor,
    borderRadius: 20,
    borderWidth: theme.glassmorphism.borderWidth,
    borderColor: theme.glassmorphism.borderColor,
    padding: 24,
    ...theme.shadows.card,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 22,
  },

  // Inputs
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 52,
  },
  inputWrapFocused: {
    borderColor: 'rgba(79, 70, 229, 0.5)',
    backgroundColor: 'rgba(79, 70, 229, 0.04)',
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  eyeBtn: { padding: 4 },

  // Password strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    marginTop: -4,
  },
  strengthBarBg: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  strengthSeg: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 10,
    fontWeight: '800',
    width: 44,
  },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.danger,
    fontWeight: '600',
  },

  // Button
  signupBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 4 },
  signupBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  signupBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Privacy
  privacyText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },

  // Divider
  divRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  divText: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '700' },

  // Login link
  loginRow: { alignItems: 'center' },
  loginText: { fontSize: 13, color: theme.colors.textSecondary },
  loginAccent: { color: theme.colors.accentCyan, fontWeight: '800' },

  // Features row
  featuresRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(6, 182, 212, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  featureLabel: {
    fontSize: 10,
    color: theme.colors.accentCyan,
    fontWeight: '700',
  },
});
