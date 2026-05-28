import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import WatchConnection from '../components/WatchConnection';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function Profile({ setTab }) {
  const { logout } = useAuth();
  const [sensitivity, setSensitivity] = useState('Balanced');
  const [baselinePeriod, setBaselinePeriod] = useState('30 Days');
  const [notiToggles, setNotiToggles] = useState({
    drift: true,
    sleep: true,
    cardiac: false,
    baseline: true
  });

  const toggleNoti = (key) => {
    setNotiToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageSubtitle}>Configuration Hub</Text>
        <Text style={styles.pageTitle}>Profile & Sync Settings</Text>
      </View>

      {/* Profile Info Summary */}
      <View style={styles.userCard}>
        <View style={styles.avatarBg}>
          <MaterialCommunityIcons name="account" size={32} color={theme.colors.accentCyan} />
        </View>
        <View style={styles.userTextContainer}>
          <Text style={styles.userName}>Dr. Archanaa</Text>
          <Text style={styles.userEmail}>Physiological Baseline Profile</Text>
          <View style={styles.badgeRow}>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>Age 32</Text>
            </View>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>Calibrated</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Terra API Secure Handshake Panel (WatchConnection) */}
      <WatchConnection setTab={setTab} />

      {/* Developer Webhook shortcut console */}
      <Text style={styles.sectionTitle}>Terra Developer Console</Text>
      <View style={styles.developerCard}>
        <View style={styles.devHeader}>
          <MaterialCommunityIcons name="code-tags" size={18} color={theme.colors.accentCyan} />
          <Text style={styles.devTitle}>TryTerra Developer Sync</Text>
        </View>
        
        <View style={styles.devRow}>
          <Text style={styles.devKey}>Developer ID</Text>
          <Text style={styles.devVal}>biostability-prod-9a2f</Text>
        </View>
        <View style={styles.devDivider} />

        <View style={styles.devRow}>
          <Text style={styles.devKey}>Widget URL</Text>
          <Text style={styles.devVal} numberOfLines={1}>https://widget.tryterra.co/auth...</Text>
        </View>
        <View style={styles.devDivider} />

        <View style={styles.devRow}>
          <Text style={styles.devKey}>Webhook Destination</Text>
          <Text style={styles.devVal} numberOfLines={1}>https://api.biostability.ai/v1/webhook</Text>
        </View>
        <View style={styles.devDivider} />

        <View style={styles.devFooter}>
          <MaterialCommunityIcons name="shield-lock" size={12} color={theme.colors.success} />
          <Text style={styles.devFooterText}>Data is AES-256 encrypted, HIPAA & GDPR compliant.</Text>
        </View>
      </View>

      {/* AI Baseline Calibrations */}
      <Text style={styles.sectionTitle}>AI Baseline Calibration</Text>
      <View style={styles.calibrationCard}>
        {/* Sensitivity Selector */}
        <Text style={styles.sliderLabel}>Detection Sensitivity</Text>
        <View style={styles.optionSelectorRow}>
          {['Clinical', 'Balanced', 'Sensitive'].map((level) => {
            const isSelected = sensitivity === level;
            return (
              <TouchableOpacity 
                key={level} 
                style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                onPress={() => setSensitivity(level)}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{level}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.sliderDesc}>
          {sensitivity === 'Clinical' && 'Triggers warnings only for high-confidence physiological shifts. Minimizes false positives.'}
          {sensitivity === 'Balanced' && 'Recommended. Optimizes early notification timeframes with high prediction reliability.'}
          {sensitivity === 'Sensitive' && 'High alert threshold. Captures minor sub-clinical trends early; may trigger during simple mental stress.'}
        </Text>

        <View style={styles.divider} />

        {/* Baseline Period Selector */}
        <Text style={styles.sliderLabel}>Baseline Rolling Period</Text>
        <View style={styles.optionSelectorRow}>
          {['7 Days', '30 Days', '90 Days'].map((period) => {
            const isSelected = baselinePeriod === period;
            return (
              <TouchableOpacity 
                key={period} 
                style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                onPress={() => setBaselinePeriod(period)}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{period}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.sliderDesc}>
          {baselinePeriod === '7 Days' && 'Highly reactive to acute changes. Best for rapid physical environment updates.'}
          {baselinePeriod === '30 Days' && 'Recommended. Filters seasonal adjustments, providing a highly stable biometric reference.'}
          {baselinePeriod === '90 Days' && 'Deep longitudinal baseline. Integrates seasonal temperature, allergy, and fitness curves.'}
        </Text>
      </View>

      {/* Early Notification Thresholds */}
      <Text style={styles.sectionTitle}>Warning Thresholds</Text>
      <View style={styles.notiCard}>
        {/* Toggle 1 */}
        <View style={styles.notiRow}>
          <View style={styles.notiTextCol}>
            <Text style={styles.notiLabel}>Invisible Drift Warnings</Text>
            <Text style={styles.notiSub}>Alert me 2–3 days prior to predicted symptom onset.</Text>
          </View>
          <TouchableOpacity onPress={() => toggleNoti('drift')}>
            <MaterialCommunityIcons 
              name={notiToggles.drift ? "toggle-switch" : "toggle-switch-off"} 
              size={44} 
              color={notiToggles.drift ? theme.colors.accentCyan : theme.colors.textMuted} 
            />
          </TouchableOpacity>
        </View>

        {/* Toggle 2 */}
        <View style={styles.notiRow}>
          <View style={styles.notiTextCol}>
            <Text style={styles.notiLabel}>Sleep Debt Alerts</Text>
            <Text style={styles.notiSub}>Notify when sleep architecture drops below 20% of baseline.</Text>
          </View>
          <TouchableOpacity onPress={() => toggleNoti('sleep')}>
            <MaterialCommunityIcons 
              name={notiToggles.sleep ? "toggle-switch" : "toggle-switch-off"} 
              size={44} 
              color={notiToggles.sleep ? theme.colors.accentCyan : theme.colors.textMuted} 
            />
          </TouchableOpacity>
        </View>

        {/* Toggle 3 */}
        <View style={styles.notiRow}>
          <View style={styles.notiTextCol}>
            <Text style={styles.notiLabel}>Autonomic Cardiac Alerts</Text>
            <Text style={styles.notiSub}>Alert on high sleeping resting heart rate deviations.</Text>
          </View>
          <TouchableOpacity onPress={() => toggleNoti('cardiac')}>
            <MaterialCommunityIcons 
              name={notiToggles.cardiac ? "toggle-switch" : "toggle-switch-off"} 
              size={44} 
              color={notiToggles.cardiac ? theme.colors.accentCyan : theme.colors.textMuted} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Premium Sign Out Button */}
      <TouchableOpacity 
        style={styles.signOutBtn}
        onPress={logout}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="logout" size={18} color={theme.colors.danger} style={{ marginRight: 8 }} />
        <Text style={styles.signOutText}>Sign Out from BioStability</Text>
      </TouchableOpacity>

      {/* Footer Info */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>BioStability App Engine v1.0.4</Text>
        <Text style={styles.footerSub}>Powered by tryterra.co API integration.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  pageSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  avatarBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  userEmail: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  profileBadge: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  profileBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 18,
  },
  developerCard: {
    backgroundColor: 'rgba(6, 182, 212, 0.03)',
    borderRadius: theme.glassmorphism.borderRadius,
    borderWidth: theme.glassmorphism.borderWidth,
    borderColor: 'rgba(6, 182, 212, 0.15)',
    padding: 16,
    ...theme.shadows.card,
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  devTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  devRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  devKey: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  devVal: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: theme.colors.accentCyan,
    fontWeight: '700',
  },
  devDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginVertical: 4,
  },
  devFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  devFooterText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  calibrationCard: {
    backgroundColor: theme.glassmorphism.backgroundColor,
    borderRadius: theme.glassmorphism.borderRadius,
    borderWidth: theme.glassmorphism.borderWidth,
    borderColor: theme.glassmorphism.borderColor,
    padding: 16,
    ...theme.shadows.card,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionSelectorRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 10,
    padding: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  optionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  optionBtnSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
  },
  optionText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
  },
  sliderDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15,
    marginTop: 8,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 14,
  },
  notiCard: {
    backgroundColor: 'rgba(18, 27, 46, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  notiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  notiTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  notiLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  notiSub: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  footerContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
  footerSub: {
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    marginBottom: 8,
  },
  signOutText: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  }
});
