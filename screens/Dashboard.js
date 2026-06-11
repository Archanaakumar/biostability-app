import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Image, Modal, ActivityIndicator, Switch, Platform } from 'react-native';
import { theme } from '../styles/theme';
import ArcGauge from '../components/ArcGauge';
import MetricWidget from '../components/MetricWidget';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { healthBridge } from '../services/healthBridgeService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const USER_WATCH_URI = 'file:///C:/Users/Archanaa/.gemini/antigravity-ide/brain/8cb1cb4f-b592-4286-8a1a-9e48226b0b5b/media__1779939493445.jpg';

export default function Dashboard({ setTab }) {
  const { user } = useAuth();
  const [scoreData, setScoreData] = useState(null);
  const [isLinked, setIsLinked] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pairing Permission Modal States
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [permSwitches, setPermSwitches] = useState({
    hrv: true,
    sleep: true,
    rhr: true,
    steps: true,
  });

  // ── Poll AsyncStorage every 3s — reads watch data AND link state ────────────
  useEffect(() => {
    const refreshFromStorage = async () => {
      try {
        const raw = await AsyncStorage.getItem('@biostability:user_watch_data');
        if (raw) {
          const parsed = JSON.parse(raw);
          setIsLinked(true);
          setScoreData(parsed); // ← directly use stored watch data
        } else {
          setIsLinked(false);
          setScoreData(null);
        }
      } catch (_) {}
    };
    refreshFromStorage();
    const interval = setInterval(refreshFromStorage, 3000);
    return () => clearInterval(interval);
  }, []);

  // ── Pulse animation (runs once on mount) ─────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleTurnAllOn = () => {
    setPermSwitches({ hrv: true, sleep: true, rhr: true, steps: true });
  };

  const toggleSwitch = (key) => {
    setPermSwitches(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAllowPermissions = async () => {
    setPermissionModalOpen(false);
    setIsSyncing(true);

    const userId = user?.uid || 'uid_archanaa_123';
    setTimeout(async () => {
      try {
        // Sync watch data — stores in AsyncStorage, picked up by 3s poll automatically
        const watchData = await healthBridge.grantPermission(userId);
        setSyncSuccess(true);
        setIsSyncing(false);
        setIsLinked(true);
        setScoreData(watchData); // ← immediately reflect synced values

        setTimeout(() => setSyncSuccess(false), 2500);
      } catch (e) {
        setIsSyncing(false);
      }
    }, 1800);
  };

  // ── Derive display values (live API data → fallback to mock) ───────────────
  const score = isLinked ? (scoreData?.score ?? '--') : '--';
  const statusLabel = isLinked ? (scoreData?.status ?? 'Off-Wrist Calibration') : 'No Device Linked';
  const insight = isLinked 
    ? "Autonomic balance is undergoing off-wrist calibration. PPG sensors are inactive; fasten watch securely to your wrist to calibrate stability indices."
    : `No biometric stream active. Tap the Link button below to sync steps and heart rate datasets from ${Platform.OS === 'ios' ? 'Apple Health' : 'Google Fit'} completely for free.`;
  
  const raw = scoreData?.current_raw;
  const baseline = scoreData?.baseline;
  const deviations = scoreData?.deviations;

  const buildMetric = (key, fallback, unit, label, adverseDir) => {
    if (!raw || !baseline) return fallback;
    const val = raw[key];
    const dev = deviations?.[key] ?? 0;
    const absD = Math.abs(dev).toFixed(1);
    const sign = dev > 0 ? '+' : '';
    const isAdverse = adverseDir === 'down' ? dev < 0 : dev > 0;
    const status =
      isAdverse && Math.abs(dev) > 20 ? 'danger'
      : isAdverse && Math.abs(dev) > 8  ? 'warning'
      : 'ok';
    return {
      value: adverseDir === 'down' && key === 'steps_count' ? Math.round(val) : val,
      unit,
      baseline: baseline[key],
      change: val === '--' || val === null ? 'Off-Wrist' : `${sign}${absD}%`,
      status: val === '--' || val === null ? 'warning' : status,
      label,
    };
  };

  const metrics = {
    hrv:   isLinked ? buildMetric('hrv_ms',      { value: '--', unit: 'ms', baseline: 74, change: 'Off-Wrist', status: 'warning', label: 'Heart Rate Variability' }, 'ms',    'Heart Rate Variability', 'down') : { value: '--', unit: 'ms', baseline: 74, change: 'No Sync', status: 'muted', label: 'Heart Rate Variability' },
    rhr:   isLinked ? buildMetric('rhr_bpm',     { value: '--', unit: 'bpm', baseline: 61, change: 'Off-Wrist', status: 'warning', label: 'Resting Heart Rate' }, 'bpm',   'Resting Heart Rate',     'up') : { value: '--', unit: 'bpm', baseline: 61, change: 'No Sync', status: 'muted', label: 'Resting Heart Rate' },
    sleep: isLinked ? buildMetric('sleep_hrs',   { value: '--', unit: 'hrs', baseline: 7.8, change: 'Off-Wrist', status: 'warning', label: 'Sleep Duration' }, 'hrs',   'Sleep Duration',         'down') : { value: '--', unit: 'hrs', baseline: 7.8, change: 'No Sync', status: 'muted', label: 'Sleep Duration' },
    steps: isLinked ? buildMetric('steps_count', { value: 0, unit: 'steps', baseline: 9500, change: '-100%', status: 'warning', label: 'Daily Steps' }, 'steps', 'Daily Steps',            'down') : { value: '--', unit: 'steps', baseline: 9500, change: 'No Sync', status: 'muted', label: 'Daily Steps' },
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Physiological Health</Text>
          <Text style={styles.appName}>BioStability AI</Text>
        </View>

        {/* Sync Status Badge */}
        <TouchableOpacity style={styles.syncIndicator} onPress={() => setTab('profile')}>
          <Animated.View style={[styles.liveDot, {
            backgroundColor: isLinked ? theme.colors.success : theme.colors.accentCyan,
            transform: [{ scale: isLinked ? pulseAnim : 1 }],
          }]} />
          <MaterialCommunityIcons
            name={isLinked ? 'check-decagram' : 'sync-alert'}
            size={13}
            color={theme.colors.accentCyan}
          />
          <Text style={styles.syncText}>{isLinked ? 'Active' : 'Unlinked'}</Text>
          <Text style={styles.freeTag}>FREE</Text>
        </TouchableOpacity>
      </View>

      {/* Premium Profile Card (First Page Profile Visibility) */}
      <TouchableOpacity 
        style={styles.dashboardProfileCard} 
        onPress={() => setTab('profile')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['rgba(6, 182, 212, 0.08)', 'rgba(79, 70, 229, 0.03)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCardGrad}
        >
          <View style={styles.profileAvatarBg}>
            <MaterialCommunityIcons name="account" size={26} color={theme.colors.accentCyan} />
            <View style={[styles.profileAvatarDot, { backgroundColor: isLinked ? theme.colors.success : theme.colors.warning }]} />
          </View>
          <View style={styles.profileTextWrapper}>
            <View style={styles.profileNameRow}>
              <Text style={styles.dashboardProfileName}>{user?.name || 'Archanaa'}</Text>
              <View style={[styles.profileStatusBadge, { borderColor: isLinked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)' }]}>
                <Text style={[styles.profileStatusText, { color: isLinked ? theme.colors.success : theme.colors.warning }]}>
                  {isLinked ? 'Calibrated' : 'Offline'}
                </Text>
              </View>
            </View>
            <Text style={styles.dashboardProfileEmail}>Physiological Baseline Profile</Text>
            <View style={styles.dashboardBadgeRow}>
              <View style={styles.dashboardProfileBadge}>
                <Text style={styles.dashboardProfileBadgeText}>Age {user?.age || '32'}</Text>
              </View>
              {user?.gender && (
                <View style={styles.dashboardProfileBadge}>
                  <Text style={styles.dashboardProfileBadgeText}>{user.gender}</Text>
                </View>
              )}
              <View style={styles.dashboardProfileBadge}>
                <Text style={styles.dashboardProfileBadgeText}>Calibrated</Text>
              </View>
              <View style={styles.dashboardProfileBadge}>
                <Text style={styles.dashboardProfileBadgeText}>ID: {user?.uid ? user.uid.replace('uid_', '').toUpperCase() : 'ARCHANAA'}</Text>
              </View>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textMuted} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Hero Arc Gauge Panel */}
      <View style={styles.heroCard}>
        <View style={styles.heroGlassGlow} />
        <ArcGauge score={score} label={statusLabel} />

        {/* Predictive AI Insight */}
        <View style={styles.insightBox}>
          <View style={styles.insightHeader}>
            <MaterialCommunityIcons name="brain" size={18} color={theme.colors.accentCyan} />
            <Text style={styles.insightTitle}>Pre-Symptomatic AI Insight</Text>
          </View>
          <Text style={styles.insightDesc}>{insight}</Text>
          <TouchableOpacity style={styles.detailsBtn} onPress={() => setTab('score')}>
            <Text style={styles.detailsBtnText}>View Mathematical Breakdown</Text>
            <MaterialCommunityIcons name="arrow-right" size={14} color={theme.colors.accentCyan} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Autonomic Indicators */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Autonomic Indicators</Text>
        <TouchableOpacity onPress={() => setTab('trends')}>
          <Text style={styles.viewMoreLink}>Compare Trends</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.widgetsGrid}>
        <View style={styles.gridRow}>
          <MetricWidget type="hrv"   metric={metrics.hrv}   onPress={() => setTab('trends')} />
          <MetricWidget type="rhr"   metric={metrics.rhr}   onPress={() => setTab('trends')} />
        </View>
        <View style={styles.gridRow}>
          <MetricWidget type="sleep" metric={metrics.sleep} onPress={() => setTab('trends')} />
          <MetricWidget type="steps" metric={metrics.steps} onPress={() => setTab('trends')} />
        </View>
      </View>

      {/* Connected Watch Banners / Loading Indicators */}
      {isSyncing ? (
        <View style={styles.loaderBanner}>
          <ActivityIndicator color={theme.colors.accentCyan} size="small" />
          <Text style={styles.loaderText}>Link health database in progress...</Text>
        </View>
      ) : syncSuccess ? (
        <View style={styles.successBanner}>
          <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.success} />
          <Text style={styles.successText}>Noise smartwatch linked successfully!</Text>
        </View>
      ) : !isLinked ? (
        <TouchableOpacity style={styles.unlinkedBanner} onPress={() => setPermissionModalOpen(true)} activeOpacity={0.9}>
          <LinearGradient
            colors={['rgba(6, 182, 212, 0.12)', 'rgba(79, 70, 229, 0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.unlinkedGrad}
          >
            <View style={styles.unlinkedLeft}>
              <Animated.View style={[styles.beaconDot, {
                opacity: pulseAnim.interpolate({ inputRange: [1, 1.4], outputRange: [1, 0.2] }),
                transform: [{ scale: pulseAnim }],
              }]} />
              <MaterialCommunityIcons 
                name={Platform.OS === 'ios' ? 'heart-flash' : 'google-fit'} 
                size={26} 
                color={theme.colors.accentCyan} 
                style={{ marginLeft: 8 }} 
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.unlinkedTitle}>
                  {Platform.OS === 'ios' ? 'Link Apple Health' : 'Link Google Fit'}
                </Text>
                <Text style={styles.unlinkedSub}>Sync {user?.name || 'Archanaa'}'s Noise watch steps &amp; battery for free</Text>
              </View>
            </View>
            <View style={styles.linkPill}>
              <Text style={styles.linkPillText}>FREE SYNC</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.deviceBanner} onPress={() => setTab('profile')}>
          <View style={styles.deviceBannerLeft}>
            <View style={styles.watchCircleBg}>
              <Image source={{ uri: USER_WATCH_URI }} style={styles.watchCircleThumbnail} />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.deviceBannerTitle}>
                {scoreData?.watch_name || 'Pulse Go Buzz'} ({user?.name || 'Archanaa'}'s Watch)
              </Text>
              <Text style={styles.deviceBannerSub}>
                Synced via {Platform.OS === 'ios' ? 'Apple Health' : 'Google Fit'} · Battery: {scoreData?.battery || '26%'} 🟢
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}

      {/* ── STUNNING PIXEL-PERFECT IOS APPLE HEALTH PERMISSION SHEET ──────────────── */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={permissionModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setPermissionModalOpen(false)}
        >
          <View style={styles.iosModalBackdrop}>
            <View style={styles.iosSheet}>
              <View style={styles.iosHeader}>
                <TouchableOpacity onPress={() => setPermissionModalOpen(false)}>
                  <Text style={styles.iosCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.iosHeaderTitle}>Health</Text>
                <TouchableOpacity onPress={handleAllowPermissions}>
                  <Text style={styles.iosAllowText}>Allow</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={styles.iosBody}>
                  <View style={styles.iosAppHeader}>
                    <MaterialCommunityIcons name="heart-pulse" size={40} color={theme.colors.accentCyan} />
                    <Text style={styles.iosAppTitle}>BioStability</Text>
                    <Text style={styles.iosAppDesc}>
                      would like to access and update your health data in the categories below.
                    </Text>
                  </View>

                  <View style={styles.iosCategoryBox}>
                    <View style={styles.iosCatHeader}>
                      <Text style={styles.iosCatHeaderTitle}>ALLOW "BIOSTABILITY" TO READ:</Text>
                      <TouchableOpacity onPress={handleTurnAllOn}>
                        <Text style={styles.iosTurnAllText}>Turn All Categories On</Text>
                      </TouchableOpacity>
                    </View>

                    {/* HRV */}
                    <View style={styles.iosRow}>
                      <View style={styles.iosRowLeft}>
                        <MaterialCommunityIcons name="heart-flash" size={20} color="#FF3B30" />
                        <Text style={styles.iosRowLabel}>Heart Rate Variability</Text>
                      </View>
                      <Switch
                        value={permSwitches.hrv}
                        onValueChange={() => toggleSwitch('hrv')}
                        trackColor={{ false: '#3a3a3c', true: '#30D158' }}
                        thumbColor="#FFF"
                      />
                    </View>

                    {/* Resting Heart Rate */}
                    <View style={styles.iosRow}>
                      <View style={styles.iosRowLeft}>
                        <MaterialCommunityIcons name="heart-pulse" size={20} color="#FF2D55" />
                        <Text style={styles.iosRowLabel}>Resting Heart Rate</Text>
                      </View>
                      <Switch
                        value={permSwitches.rhr}
                        onValueChange={() => toggleSwitch('rhr')}
                        trackColor={{ false: '#3a3a3c', true: '#30D158' }}
                        thumbColor="#FFF"
                      />
                    </View>

                    {/* Sleep Analysis */}
                    <View style={styles.iosRow}>
                      <View style={styles.iosRowLeft}>
                        <MaterialCommunityIcons name="sleep" size={20} color="#5856D6" />
                        <Text style={styles.iosRowLabel}>Sleep Analysis</Text>
                      </View>
                      <Switch
                        value={permSwitches.sleep}
                        onValueChange={() => toggleSwitch('sleep')}
                        trackColor={{ false: '#3a3a3c', true: '#30D158' }}
                        thumbColor="#FFF"
                      />
                    </View>

                    {/* Steps */}
                    <View style={[styles.iosRow, { borderBottomWidth: 0 }]}>
                      <View style={styles.iosRowLeft}>
                        <MaterialCommunityIcons name="run" size={20} color="#FF9500" />
                        <Text style={styles.iosRowLabel}>Steps</Text>
                      </View>
                      <Switch
                        value={permSwitches.steps}
                        onValueChange={() => toggleSwitch('steps')}
                        trackColor={{ false: '#3a3a3c', true: '#30D158' }}
                        thumbColor="#FFF"
                      />
                    </View>
                  </View>

                  <Text style={styles.iosDisclaimer}>
                    BioStability accesses this data securely on your device. Your biometrics are protected under iOS native health policies and encrypted during local sync transfer.
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : (
        /* ── STUNNING PIXEL-PERFECT ANDROID HEALTH CONNECT PERMISSION DIALOG ──────────────── */
        <Modal
          visible={permissionModalOpen}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setPermissionModalOpen(false)}
        >
          <View style={styles.androidModalBackdrop}>
            <View style={styles.androidDialog}>
              <View style={styles.androidHeader}>
                <MaterialCommunityIcons name="google-fit" size={24} color="#4285F4" />
                <Text style={styles.androidHeaderTitle}>Google Fit</Text>
              </View>

              <Text style={styles.androidTitle}>Allow BioStability access?</Text>
              <Text style={styles.androidDesc}>
                BioStability will have direct access to read steps and heart rate parameters updated by Noise Fit.
              </Text>

              <View style={styles.androidList}>
                {/* Steps */}
                <View style={styles.androidRow}>
                  <View style={styles.androidRowLeft}>
                    <MaterialCommunityIcons name="run" size={20} color="#4285F4" />
                    <Text style={styles.androidRowLabel}>Read Steps</Text>
                  </View>
                  <Switch
                    value={permSwitches.steps}
                    onValueChange={() => toggleSwitch('steps')}
                    trackColor={{ false: 'rgba(255,255,255,0.08)', true: '#4285F4' }}
                    thumbColor="#FFF"
                  />
                </View>

                {/* Heart Rate */}
                <View style={styles.androidRow}>
                  <View style={styles.androidRowLeft}>
                    <MaterialCommunityIcons name="heart-pulse" size={20} color="#EA4335" />
                    <Text style={styles.androidRowLabel}>Read Heart Rate</Text>
                  </View>
                  <Switch
                    value={permSwitches.rhr}
                    onValueChange={() => toggleSwitch('rhr')}
                    trackColor={{ false: 'rgba(255,255,255,0.08)', true: '#4285F4' }}
                    thumbColor="#FFF"
                  />
                </View>

                {/* Sleep */}
                <View style={[styles.androidRow, { borderBottomWidth: 0 }]}>
                  <View style={styles.androidRowLeft}>
                    <MaterialCommunityIcons name="sleep" size={20} color="#34A853" />
                    <Text style={styles.androidRowLabel}>Read Sleep Data</Text>
                  </View>
                  <Switch
                    value={permSwitches.sleep}
                    onValueChange={() => toggleSwitch('sleep')}
                    trackColor={{ false: 'rgba(255,255,255,0.08)', true: '#4285F4' }}
                    thumbColor="#FFF"
                  />
                </View>
              </View>

              <View style={styles.androidActions}>
                <TouchableOpacity onPress={() => setPermissionModalOpen(false)}>
                  <Text style={styles.androidBtnDeny}>Deny</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.androidBtnAllowWrap} onPress={handleAllowPermissions}>
                  <Text style={styles.androidBtnAllow}>Allow</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgPrimary },
  contentContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },

  dashboardProfileCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
    ...theme.shadows.card,
  },
  profileCardGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  profileAvatarBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profileAvatarDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.bgPrimary,
  },
  profileTextWrapper: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dashboardProfileName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  profileStatusBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  profileStatusText: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dashboardProfileEmail: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  dashboardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  dashboardProfileBadge: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dashboardProfileBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  welcomeText: {
    fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  appName: {
    fontSize: 26, fontWeight: '900', color: theme.colors.textPrimary,
    marginTop: 2, letterSpacing: -0.5,
  },
  syncIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1, borderColor: 'rgba(6, 182, 212, 0.2)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  syncText: { color: theme.colors.accentCyan, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  freeTag: {
    fontSize: 8, color: '#30D158', fontWeight: '850',
    backgroundColor: 'rgba(48,209,88,0.1)', paddingHorizontal: 5,
    paddingVertical: 1, borderRadius: 3, marginLeft: 2,
  },

  heroCard: {
    backgroundColor: theme.glassmorphism.backgroundColor,
    borderRadius: theme.glassmorphism.borderRadius,
    borderWidth: theme.glassmorphism.borderWidth,
    borderColor: theme.glassmorphism.borderColor,
    padding: 16, alignItems: 'center', marginBottom: 14,
    position: 'relative', overflow: 'hidden', ...theme.shadows.card,
  },
  heroGlassGlow: {
    position: 'absolute', top: -60, left: -60, width: 200, height: 200,
    borderRadius: 100, backgroundColor: 'rgba(59, 130, 246, 0.04)',
  },
  insightBox: {
    backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)', borderRadius: 12,
    padding: 14, width: '100%', marginTop: 6,
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  insightTitle: {
    fontSize: 12, fontWeight: '800', color: theme.colors.accentCyan,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  insightDesc: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
  detailsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 8,
  },
  detailsBtnText: { fontSize: 11, color: theme.colors.accentCyan, fontWeight: '700' },

  sectionHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14, fontWeight: '800', color: theme.colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  viewMoreLink: { fontSize: 12, fontWeight: '700', color: theme.colors.accentCyan },
  widgetsGrid: { gap: 12, marginBottom: 20 },
  gridRow: { flexDirection: 'row', gap: 12 },

  deviceBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12, padding: 12,
  },
  deviceBannerLeft: { flexDirection: 'row', alignItems: 'center' },
  deviceBannerTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary },
  deviceBannerSub: { fontSize: 10, color: theme.colors.textMuted, marginTop: 2 },

  unlinkedBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.22)',
    marginBottom: 20,
    ...theme.shadows.card,
  },
  unlinkedGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  unlinkedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  beaconDot: {
    position: 'absolute',
    left: -4,
    top: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accentCyan,
  },
  unlinkedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  unlinkedSub: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  linkPill: {
    backgroundColor: '#30D158',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  linkPillText: {
    color: '#1C1C1E',
    fontSize: 9,
    fontWeight: '900',
  },
  watchCircleBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  watchCircleThumbnail: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },

  loaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.15)',
    marginBottom: 20,
  },
  loaderText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    marginBottom: 20,
  },
  successText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '700',
  },

  // iOS Native Styling Modal Sheets
  iosModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  iosSheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    height: '84%',
    paddingBottom: 32,
  },
  iosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  iosCancelText: {
    color: '#0A84FF',
    fontSize: 16,
  },
  iosHeaderTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  iosAllowText: {
    color: '#30D158',
    fontSize: 16,
    fontWeight: '600',
  },
  iosBody: {
    padding: 16,
  },
  iosAppHeader: {
    alignItems: 'center',
    marginVertical: 12,
  },
  iosAppTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  iosAppDesc: {
    color: '#8E8E93',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  iosCategoryBox: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    marginTop: 20,
    overflow: 'hidden',
  },
  iosCatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#1C1C1E',
  },
  iosCatHeaderTitle: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
  },
  iosTurnAllText: {
    color: '#0A84FF',
    fontSize: 11,
    fontWeight: '600',
  },
  iosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  iosRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iosRowLabel: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
  },
  iosDisclaimer: {
    color: '#8E8E93',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 15,
    paddingHorizontal: 16,
  },

  // Android Native Styling dialog
  androidModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidDialog: {
    backgroundColor: '#202124',
    borderRadius: 28,
    width: '86%',
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  androidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  androidHeaderTitle: {
    color: '#E8EAED',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  androidTitle: {
    color: '#E8EAED',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  androidDesc: {
    color: '#9AA0A6',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
  },
  androidList: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  androidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  androidRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  androidRowLabel: {
    color: '#E8EAED',
    fontSize: 14,
    fontWeight: '600',
  },
  androidActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
    marginTop: 10,
  },
  androidBtnDeny: {
    color: '#8AB4F8',
    fontSize: 14,
    fontWeight: '700',
    padding: 8,
  },
  androidBtnAllowWrap: {
    backgroundColor: '#8AB4F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  androidBtnAllow: {
    color: '#202124',
    fontSize: 14,
    fontWeight: '700',
  },
});
