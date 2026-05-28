import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function LoginScreen({ onNavigateToSignup }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('archanaa@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation refs
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(50)).current;
  const scaleAnim  = useRef(new Animated.Value(0.85)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Mount animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start();

    // Logo pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // AuthContext will update user → App.js renders main tabs
    } catch (err) {
      setError(err.message);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Ambient glows */}
      <View style={styles.glowTL} />
      <View style={styles.glowBR} />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo Section ─────────────────────────────────────── */}
          <Animated.View style={[styles.logoSection, {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }]}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient
                colors={['rgba(6,182,212,0.18)', 'rgba(79,70,229,0.12)', 'transparent']}
                style={styles.logoRing}
              >
                <View style={styles.logoIconBg}>
                  <MaterialCommunityIcons name="heart-pulse" size={40} color={theme.colors.accentCyan} />
                </View>
              </LinearGradient>
            </Animated.View>
            <Text style={styles.appName}>BioStability</Text>
            <Text style={styles.appTagline}>Pre-Symptomatic Health Intelligence</Text>

            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Local Health Sync · 100% Free Watch Sync</Text>
            </View>
          </Animated.View>

          {/* ── Form Card ────────────────────────────────────────── */}
          <Animated.View style={[styles.formCard, {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { translateX: shakeAnim },
            ],
          }]}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Sign in to your health profile</Text>

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
                placeholder="Password"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={theme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Error message */}
            {!!error && (
              <Animated.View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={14} color={theme.colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            {/* Sign In button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#06B6D4', '#4F46E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginBtnGrad}
              >
                {loading
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : (
                    <>
                      <Text style={styles.loginBtnText}>Sign In</Text>
                      <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" style={{ marginLeft: 6 }} />
                    </>
                  )
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divRow}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>OR</Text>
              <View style={styles.divLine} />
            </View>

            {/* Signup link */}
            <TouchableOpacity style={styles.signupRow} onPress={onNavigateToSignup} activeOpacity={0.7}>
              <Text style={styles.signupText}>
                New to BioStability?{'  '}
                <Text style={styles.signupAccent}>Create Account →</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Footer ───────────────────────────────────────────── */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <MaterialCommunityIcons name="shield-lock" size={12} color={theme.colors.textMuted} />
            <Text style={styles.footerText}>HIPAA &amp; GDPR Compliant · AES-256 Encrypted</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  },
  glowTL: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(6, 182, 212, 0.06)',
  },
  glowBR: {
    position: 'absolute',
    bottom: -100,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(79, 70, 229, 0.07)',
  },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // ── Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
  },
  statusText: {
    fontSize: 10,
    color: theme.colors.success,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Form Card
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
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 24,
  },

  // ── Inputs
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 52,
  },
  inputWrapFocused: {
    borderColor: 'rgba(6, 182, 212, 0.5)',
    backgroundColor: 'rgba(6, 182, 212, 0.04)',
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  eyeBtn: { padding: 4 },

  // ── Error
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
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.danger,
    fontWeight: '600',
  },

  // ── Button
  loginBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 4 },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── Divider
  divRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  divText: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '700' },

  // ── Signup link
  signupRow: { alignItems: 'center' },
  signupText: { fontSize: 13, color: theme.colors.textSecondary },
  signupAccent: { color: theme.colors.accentCyan, fontWeight: '800' },

  // ── Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 32,
  },
  footerText: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
});
