import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import InvisibleDriftChart from '../components/InvisibleDriftChart';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { mockData } from '../data/mockData';

export default function HealthTrends() {
  const { user } = useAuth();
  const [metric, setMetric] = useState('hrv');
  const [trendsData, setTrendsData] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const userId = user?.uid || 'demo_user';
    apiService.getTrends(userId, 14).then((data) => {
      setTrendsData(data);
      setIsOffline(!!data?.offline);
    });
  }, [user?.uid]);

  // Build chart-compatible data from API or fall back to mockData
  const getChartData = (metricKey) => {
    if (!trendsData?.trends) return mockData.trendsData[metricKey];
    const baselineVal = trendsData.baseline?.[metricKey === 'hrv' ? 'hrv_ms'
      : metricKey === 'rhr' ? 'rhr_bpm'
      : metricKey === 'sleep' ? 'sleep_hrs' : 'steps_count'] || 0;
    return trendsData.trends.map((t, i) => ({
      day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i % 7],
      actual: metricKey === 'hrv' ? t.hrv_ms
        : metricKey === 'rhr' ? t.rhr_bpm
        : metricKey === 'sleep' ? t.sleep_hrs : t.steps_count,
      baseline: baselineVal,
    }));
  };

  const tabs = [
    { id: 'hrv', label: 'HRV', icon: 'heart-flash' },
    { id: 'rhr', label: 'Rest HR', icon: 'heart-pulse' },
    { id: 'sleep', label: 'Sleep', icon: 'sleep' },
    { id: 'steps', label: 'Steps', icon: 'run' }
  ];

  const details = {
    hrv: {
      title: 'Autonomic Vagal Suppression',
      explanation: 'Heart Rate Variability (HRV) measures the micro-variation in time between heartbeats. A suppression below your personal baseline (currently -37% off target) suggests parasympathetic withdrawal and active sympathetic arousal. This autonomic shift occurs up to 4 days before fever or upper respiratory symptoms emerge.',
      clinicalNote: 'High risk of immunological challenge.'
    },
    rhr: {
      title: 'Sleeping Cardiovascular Stress',
      explanation: 'Resting Heart Rate (RHR) increases as your heart beats faster to pump immune cells. Your sleep RHR has drifted +14% higher (from 61 to 70 bpm). Elevated RHR during sleep is a primary signature of cellular energy redistribution associated with early-stage incubation.',
      clinicalNote: 'Elevated cardiac stress signature.'
    },
    sleep: {
      title: 'Sleep Architecture Compression',
      explanation: 'Sleep Duration has declined by -29% relative to your baseline (averaging 5.5 hours instead of 7.8). Furthermore, deep sleep and REM cycles have suffered compression, impairing physical repair mechanisms and compounding the systemic drift.',
      clinicalNote: 'Severe recovery deficit recorded.'
    },
    steps: {
      title: 'Sub-conscious Energy Conservation',
      explanation: 'Daily steps are down by -56% (4,100 steps vs 9,500 baseline). When your immune system begins working sub-clinically, your brain subconsciously restricts Non-Exercise Activity Thermogenesis (NEAT) to save energy. You move less hours before you feel actual fatigue.',
      clinicalNote: 'Restricted behavioral activity profile.'
    }
  };

  const activeDetail = details[metric];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.pageSubtitle}>Biometric Overlays</Text>
            <Text style={styles.pageTitle}>Invisible Drift Trends</Text>
          </View>
          {isOffline && (
            <View style={styles.offlineBadge}>
              <MaterialCommunityIcons name="cloud-off-outline" size={10} color={theme.colors.textMuted} />
              <Text style={styles.offlineBadgeText}>Demo</Text>
            </View>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const isActive = tab.id === metric;
          return (
            <TouchableOpacity 
              key={tab.id} 
              style={[styles.tab, isActive && styles.activeTab]} 
              onPress={() => setMetric(tab.id)}
            >
              <MaterialCommunityIcons 
                name={tab.icon} 
                size={16} 
                color={isActive ? theme.colors.accentCyan : theme.colors.textSecondary} 
              />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Invisible Drift Graph */}
      <InvisibleDriftChart metricType={metric} chartData={getChartData(metric)} />

      {/* Numerical Diagnostics Grid */}
      <View style={styles.statsCard}>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Multi-Week Baseline</Text>
          <Text style={styles.statNumber}>
            {metric === 'hrv' ? '74 ms' : metric === 'rhr' ? '61 bpm' : metric === 'sleep' ? '7.8 hrs' : '9,500'}
          </Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Current 7d Avg</Text>
          <Text style={[styles.statNumber, { color: theme.colors.accentCyan }]}>
            {metric === 'hrv' ? '59 ms' : metric === 'rhr' ? '65 bpm' : metric === 'sleep' ? '6.7 hrs' : '7,100'}
          </Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Absolute Deviation</Text>
          <Text style={[styles.statNumber, { color: metric === 'steps' ? theme.colors.textSecondary : theme.colors.danger }]}>
            {metric === 'hrv' ? '-20.2%' : metric === 'rhr' ? '+6.5%' : metric === 'sleep' ? '-14.1%' : '-25.2%'}
          </Text>
        </View>
      </View>

      {/* Clinical Interpretation Card */}
      <View style={styles.clinicalCard}>
        <View style={styles.clinicalHeader}>
          <MaterialCommunityIcons name="microscope" size={20} color={theme.colors.accentCyan} />
          <Text style={styles.clinicalTitle}>{activeDetail.title}</Text>
        </View>
        
        <Text style={styles.clinicalDesc}>{activeDetail.explanation}</Text>
        
        <View style={styles.alertNoteBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={14} color={theme.colors.danger} />
          <Text style={styles.alertNoteText}>{activeDetail.clinicalNote}</Text>
        </View>
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
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 4,
  },
  offlineBadgeText: {
    fontSize: 8,
    color: theme.colors.textMuted,
    fontWeight: '700',
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
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
  },
  tabText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 27, 46, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingVertical: 12,
    marginVertical: 14,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  clinicalCard: {
    backgroundColor: theme.glassmorphism.backgroundColor,
    borderRadius: theme.glassmorphism.borderRadius,
    borderWidth: theme.glassmorphism.borderWidth,
    borderColor: theme.glassmorphism.borderColor,
    padding: 16,
    ...theme.shadows.card,
  },
  clinicalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  clinicalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  clinicalDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  alertNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  alertNoteText: {
    fontSize: 11,
    color: theme.colors.danger,
    fontWeight: '700',
  }
});
