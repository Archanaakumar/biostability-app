import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Image, Switch, Platform, Animated, Easing } from 'react-native';
import { theme } from '../styles/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { healthBridge } from '../services/healthBridgeService';

const USER_WATCH_URI = 'file:///C:/Users/Archanaa/.gemini/antigravity-ide/brain/8cb1cb4f-b592-4286-8a1a-9e48226b0b5b/media__1779939493445.jpg';

export default function WatchConnection({ setTab }) {
  const { user } = useAuth();
  const userId = user?.uid || 'uid_archanaa_123';

  const [device, setDevice] = useState('No Watch Paired');
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Synced Telemetry Display States
  const [watchName, setWatchName] = useState('Pulse Go Buzz');
  const [watchSteps, setWatchSteps] = useState('4850');
  const [watchBattery, setWatchBattery] = useState('26%');
  const [wristState, setWristState] = useState('On-Wrist');
  const [lastSyncTime, setLastSyncTime] = useState('Never');

  // Rotating Ring Animation Ref
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Simulated Native Health Database Permission States
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [permSwitches, setPermSwitches] = useState({
    hrv: true,
    sleep: true,
    rhr: true,
    steps: true,
  });

  const fetchStoredWatchData = () => {
    AsyncStorage.getItem('@biostability:user_watch_data').then(raw => {
      if (raw) {
        setIsConnected(true);
        const parsed = JSON.parse(raw);
        setDevice(`${parsed.watch_name || 'Pulse Go Buzz'} (Archanaa's Watch)`);
        setWatchName(parsed.watch_name || 'Pulse Go Buzz');
        setWatchSteps(String(parsed.current_raw?.steps_count ?? '4850'));
        setWatchBattery(parsed.battery || '26%');
        setWristState(parsed.status === 'Optimal' ? 'On-Wrist' : 'Off-Wrist');
        
        if (parsed.last_synced_at) {
          const syncedDate = new Date(parsed.last_synced_at);
          setLastSyncTime(syncedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else {
          setLastSyncTime('Just now');
        }
      } else {
        setIsConnected(false);
        setDevice("No Watch Paired");
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchStoredWatchData();
    // Set up rapid polling to sync screens
    const interval = setInterval(fetchStoredWatchData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rotates the syncing ring
  const startRotateAnimation = () => {
    rotateAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopRotateAnimation = () => {
    rotateAnim.stopAnimation();
  };

  const toggleSwitch = (key) => {
    setPermSwitches(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTurnAllOn = () => {
    setPermSwitches({ hrv: true, sleep: true, rhr: true, steps: true });
  };

  const handleConnectHealth = () => {
    setPermissionModalOpen(true);
  };

  // Primary AUTOMATIC Sync Button Action
  const triggerWatchSync = () => {
    setIsSyncing(true);
    startRotateAnimation();

    setTimeout(async () => {
      try {
        // AUTOMATICALLY Sync Directly from phone's local Health Store database
        await healthBridge.syncWatchDataDirectly(userId, watchName);
        stopRotateAnimation();
        setIsSyncing(false);
        setSyncSuccess(true);
        fetchStoredWatchData();

        setTimeout(() => {
          setSyncSuccess(false);
        }, 2200);
      } catch (err) {
        stopRotateAnimation();
        setIsSyncing(false);
      }
    }, 2000);
  };

  const handleAllowPermissions = async () => {
    setPermissionModalOpen(false);
    triggerWatchSync();
  };

  const handleDisconnect = async () => {
    await healthBridge.revokePermission();
    setIsConnected(false);
    setDevice('No Watch Paired');
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Sync Active Status Panel */}
      <View style={styles.glassCard}>
        <View style={styles.cardHeader}>
          <View style={styles.statusRow}>
            <View style={[
              styles.pulseDot, 
              { backgroundColor: isConnected ? theme.colors.success : theme.colors.danger }
            ]} />
            <Text style={styles.cardTitle}>Local Health Database Sync</Text>
          </View>
          <Text style={styles.freeBadge}>100% FREE</Text>
        </View>

        <View style={styles.deviceRow}>
          {/* Animated Sync Ring around the Watch Image */}
          <View style={styles.watchWrapperWrapper}>
            {isSyncing && (
              <Animated.View style={[styles.rotatingRing, { transform: [{ rotate: spin }] }]}>
                <View style={styles.ringDot} />
              </Animated.View>
            )}
            <View style={styles.watchIconContainer}>
              {isConnected && device.includes(watchName) ? (
                <Image source={{ uri: USER_WATCH_URI }} style={styles.watchThumbnail} />
              ) : (
                <MaterialCommunityIcons 
                  name={Platform.OS === 'ios' ? 'apple' : 'google-fit'} 
                  size={34} 
                  color={theme.colors.accentCyan} 
                />
              )}
            </View>
          </View>

          <View style={styles.deviceText}>
            <Text style={styles.deviceName}>{device}</Text>
            <Text style={styles.deviceSub}>
              {Platform.OS === 'ios' ? 'Connected via Apple HealthKit' : 'Connected via Google Health Connect'}
            </Text>
            <Text style={styles.lastSyncText}>
              {isConnected 
                ? `Battery: ${watchBattery} • Steps: ${watchSteps} steps • Synced: ${lastSyncTime}` 
                : 'Status: Inactive • Tap below to link Apple Health / Google Health Connect'}
            </Text>
          </View>
        </View>

        {isSyncing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={theme.colors.accentCyan} />
            <Text style={styles.loaderText}>Syncing live metrics from your {watchName} watch...</Text>
          </View>
        ) : syncSuccess ? (
          <View style={styles.successContainer}>
            <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.success} />
            <Text style={styles.successText}>Watch synchronized successfully!</Text>
          </View>
        ) : (
          <View style={styles.actionRow}>
            {!isConnected ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={handleConnectHealth}>
                <MaterialCommunityIcons 
                  name={Platform.OS === 'ios' ? 'heart-flash' : 'google-fit'} 
                  size={16} 
                  color="#FFF" 
                  style={styles.btnIcon} 
                />
                <Text style={styles.btnText}>
                  {Platform.OS === 'ios' ? 'Link Apple Health' : 'Link Health Connect'}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.primaryBtn} onPress={triggerWatchSync}>
                  <MaterialCommunityIcons name="sync" size={16} color="#FFF" style={styles.btnIcon} />
                  <Text style={styles.btnText}>Sync Smartwatch Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
                  <Text style={styles.disconnectText}>Unpair</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      {/* Automatic Sync Banner */}
      {isConnected && (
        <View style={styles.autoSyncInfoCard}>
          <MaterialCommunityIcons name="shield-check" size={18} color={theme.colors.success} />
          <View style={{ flex: 1 }}>
            <Text style={styles.autoSyncTitle}>100% Automated Hardware Link Enabled</Text>
            <Text style={styles.autoSyncSub}>
              BioStability automatically queries your phone's database. Any steps updated by your Noise watch will instantly mirror on your dashboard.
            </Text>
          </View>
        </View>
      )}

      {/* Guide Checklist for Users */}
      <Text style={styles.sectionTitle}>Frictionless Setup Guide</Text>
      <View style={styles.guideContainer}>
        <View style={styles.guideStep}>
          <View style={styles.stepNumber}><Text style={styles.stepNumText}>1</Text></View>
          <View style={styles.stepTextCol}>
            <Text style={styles.stepTitle}>Turn on Noise Fit Bluetooth</Text>
            <Text style={styles.stepSub}>Ensure your Noise watch is syncing steps and health records to the official Noise Fit app on your phone.</Text>
          </View>
        </View>

        <View style={styles.guideStep}>
          <View style={styles.stepNumber}><Text style={styles.stepNumText}>2</Text></View>
          <View style={styles.stepTextCol}>
            <Text style={styles.stepTitle}>
              {Platform.OS === 'ios' ? 'Enable Apple Health Toggle' : 'Enable Google Fit Toggle'}
            </Text>
            <Text style={styles.stepSub}>
              Inside Noise Fit app settings, tap **Sync Settings** and toggle **"Sync with {Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect'}"** to ON.
            </Text>
          </View>
        </View>

        <View style={styles.guideStep}>
          <View style={styles.stepNumber}><Text style={styles.stepNumText}>3</Text></View>
          <View style={styles.stepTextCol}>
            <Text style={styles.stepTitle}>Connect BioStability</Text>
            <Text style={styles.stepSub}>Tap the Link button above, authorize permission, and your watch datasets sync completely for free!</Text>
          </View>
        </View>
      </View>

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
              {/* Header Navigation */}
              <View style={styles.iosHeader}>
                <TouchableOpacity onPress={() => setPermissionModalOpen(false)}>
                  <Text style={styles.iosCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.iosHeaderTitle}>Health</Text>
                <TouchableOpacity onPress={handleAllowPermissions}>
                  <Text style={styles.iosAllowText}>Allow</Text>
                </TouchableOpacity>
              </View>

              {/* Sheet Body */}
              <View style={styles.iosBody}>
                <View style={styles.iosAppHeader}>
                  <MaterialCommunityIcons name="heart-pulse" size={40} color={theme.colors.accentCyan} />
                  <Text style={styles.iosAppTitle}>BioStability</Text>
                  <Text style={styles.iosAppDesc}>
                    would like to access and update your health data in the categories below.
                  </Text>
                </View>

                {/* Categories Wrapper */}
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

                {/* Explanation */}
                <Text style={styles.iosDisclaimer}>
                  BioStability accesses this data securely on your device. Your biometrics are protected under iOS native health policies and encrypted during local sync transfer.
                </Text>
              </View>
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
                <Text style={styles.androidHeaderTitle}>Health Connect</Text>
              </View>

              <Text style={styles.androidTitle}>Allow BioStability access?</Text>
              <Text style={styles.androidDesc}>
                BioStability will have direct access to read steps and heart rate parameters updated by Noise Fit.
              </Text>

              {/* Permissions list */}
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

              {/* Android Actions */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  glassCard: {
    backgroundColor: theme.glassmorphism.backgroundColor,
    borderRadius: theme.glassmorphism.borderRadius,
    borderWidth: theme.glassmorphism.borderWidth,
    borderColor: theme.glassmorphism.borderColor,
    padding: 16,
    ...theme.shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 10,
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  freeBadge: {
    fontSize: 9,
    color: theme.colors.accentCyan,
    fontWeight: '850',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deviceRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  watchIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceText: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  deviceSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  lastSyncText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 4,
    lineHeight: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: theme.colors.accentIndigo,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnIcon: {
    marginRight: 6,
  },
  btnText: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  disconnectBtn: {
    width: 70,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disconnectText: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.04)',
    borderRadius: 8,
    width: '100%',
  },
  loaderText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 8,
    width: '100%',
  },
  successText: {
    fontSize: 11,
    color: theme.colors.success,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    marginTop: 18,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  guideContainer: {
    backgroundColor: 'rgba(18, 27, 46, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 14,
    gap: 14,
  },
  guideStep: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumText: {
    fontSize: 11,
    color: theme.colors.accentCyan,
    fontWeight: '800',
  },
  stepTextCol: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  stepSub: {
    fontSize: 10.5,
    color: theme.colors.textSecondary,
    marginTop: 3,
    lineHeight: 15,
  },
  watchThumbnail: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  // Simulated Syncing Rotating Ring styling
  watchWrapperWrapper: {
    position: 'relative',
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotatingRing: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderTopColor: theme.colors.accentCyan,
    borderRightColor: theme.colors.accentCyan,
  },
  ringDot: {
    position: 'absolute',
    top: 2,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accentCyan,
  },

  // Automatic Health bridge information
  autoSyncInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(48, 209, 88, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(48, 209, 88, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  autoSyncTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#30D158',
  },
  autoSyncSub: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
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
