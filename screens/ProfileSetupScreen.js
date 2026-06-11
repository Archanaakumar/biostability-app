import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/theme';

export default function ProfileSetupScreen({ onComplete }) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name === 'Archanaa' ? '' : (user?.name || ''));
  const [age, setAge] = useState('32');
  const [gender, setGender] = useState('Female');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Update profile locally and securely
      await updateProfile({
        name: name.trim(),
        age: age.trim() || '32',
        gender: gender,
        hasSetupCompleted: true,
      });
      onComplete?.();
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Background glow effects */}
      <View style={styles.glowTL} />
      <View style={styles.glowBR} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.logoSection}>
            <LinearGradient
              colors={['rgba(6,182,212,0.18)', 'rgba(79,70,229,0.12)', 'transparent']}
              style={styles.logoRing}
            >
              <View style={styles.logoIconBg}>
                <MaterialCommunityIcons name="account-circle-outline" size={40} color={theme.colors.accentCyan} />
              </View>
            </LinearGradient>
            <Text style={styles.appName}>Personalize Profile</Text>
            <Text style={styles.appTagline}>Let's calibrate your pre-symptomatic AI baseline</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Your Details</Text>
            <Text style={styles.formSubtitle}>Input your profile parameters below:</Text>

            {/* Name Input */}
            <Text style={styles.inputLabel}>WHAT IS YOUR NAME?</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="account-outline" size={18} color={theme.colors.accentCyan} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Age Input */}
            <Text style={styles.inputLabel}>YOUR CURRENT AGE</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="calendar-range" size={18} color={theme.colors.accentCyan} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter age (e.g. 32)"
                placeholderTextColor={theme.colors.textMuted}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>

            {/* Gender Selector Option */}
            <Text style={styles.inputLabel}>BIOLOGICAL GENDER</Text>
            <View style={styles.genderRow}>
              {['Female', 'Male', 'Other'].map((g) => {
                const isSelected = gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderBtn, isSelected && styles.genderBtnSelected]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.genderText, isSelected && styles.genderTextSelected]}>{g}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={14} color={theme.colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Save Button */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
              <LinearGradient
                colors={['#06B6D4', '#4F46E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtnGrad}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.saveBtnText}>Generate AI Baseline</Text>
                    <MaterialCommunityIcons name="chevron-right" size={18} color="#FFF" style={{ marginLeft: 4 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoIconBg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  formCard: {
    width: '100%',
    backgroundColor: theme.glassmorphism.backgroundColor,
    borderRadius: 20,
    borderWidth: theme.glassmorphism.borderWidth,
    borderColor: theme.glassmorphism.borderColor,
    padding: 22,
    ...theme.shadows.card,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  formSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '850',
    color: theme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 12,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
    marginBottom: 12,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  genderBtnSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  genderText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  genderTextSelected: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
  },
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
    marginTop: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 11,
    color: theme.colors.danger,
    fontWeight: '600',
  },
  saveBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 18,
  },
  saveBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
