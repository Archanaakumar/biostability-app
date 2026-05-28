import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import { mockData } from '../data/mockData';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function StabilityScoreDetails() {
  const data = mockData.todayMetrics;

  const weights = [
    { name: 'HRV Autonomic Tone', weight: '40%', val: '46 ms', status: 'danger', dev: '-37% Drift', icon: 'heart-flash' },
    { name: 'Sleep Stage Architecture', weight: '30%', val: '5.5 hrs', status: 'warning', dev: '-29% Debt', icon: 'sleep' },
    { name: 'Resting HR Stability', weight: '20%', val: '70 bpm', status: 'warning', dev: '+14% Rise', icon: 'heart-pulse' },
    { name: 'Daily Activity Load', weight: '10%', val: '4,100 stp', status: 'muted', dev: 'Balanced', icon: 'run' }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Page Title */}
      <View style={styles.header}>
        <Text style={styles.pageSubtitle}>Predictive Calculations</Text>
        <Text style={styles.pageTitle}>Stability Analysis</Text>
      </View>

      {/* AI Score Card */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreRow}>
          <View>
            <Text style={styles.scoreHeaderLabel}>Physiological Index</Text>
            <Text style={styles.scoreStatusText}>{data.stabilityLabel}</Text>
          </View>
          <Text style={styles.scoreBig}>{data.stabilityScore}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.scoreExplanation}>
          The BioStability index is an AI-calibrated metric computed over multi-week baselines. A drop below 70 indicates a "Systemic Drift", suggesting early immune or physical decline **up to 72 hours before you feel symptoms**.
        </Text>
      </View>

      {/* Mathematical Weights List */}
      <Text style={styles.sectionTitle}>Computational Weighting</Text>
      <View style={styles.weightsCard}>
        {weights.map((item, idx) => {
          let statusColor = theme.colors.textSecondary;
          if (item.status === 'danger') statusColor = theme.colors.danger;
          else if (item.status === 'warning') statusColor = theme.colors.warning;
          
          return (
            <View key={idx} style={[
              styles.weightRow, 
              idx !== weights.length - 1 && styles.weightRowBorder
            ]}>
              <View style={styles.weightLabelContainer}>
                <View style={styles.iconBg}>
                  <MaterialCommunityIcons name={item.icon} size={16} color={statusColor} />
                </View>
                <View>
                  <Text style={styles.weightName}>{item.name}</Text>
                  <Text style={styles.weightPercent}>Weight: {item.weight}</Text>
                </View>
              </View>
              
              <View style={styles.weightValues}>
                <Text style={styles.weightValText}>{item.val}</Text>
                <Text style={[styles.weightDevText, { color: statusColor }]}>{item.dev}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Diagnostic Logs */}
      <Text style={styles.sectionTitle}>Physiological Audit Log</Text>
      <View style={styles.logContainer}>
        {/* Log Item 1 */}
        <View style={styles.logRow}>
          <View style={[styles.logIndicator, { backgroundColor: theme.colors.danger }]} />
          <View style={styles.logTextContainer}>
            <Text style={styles.logTitle}>Parasympathetic Shift Detected</Text>
            <Text style={styles.logDesc}>Root-mean-square of successive differences (rMSSD) dropped by 28ms under multi-week baseline. Vagal activity is suppressed, signaling acute neurological threat.</Text>
            <Text style={styles.logTime}>4 hours ago • Telemetry Sync</Text>
          </View>
        </View>

        {/* Log Item 2 */}
        <View style={styles.logRow}>
          <View style={[styles.logIndicator, { backgroundColor: theme.colors.warning }]} />
          <View style={styles.logTextContainer}>
            <Text style={styles.logTitle}>Circadian Rest Deficit</Text>
            <Text style={styles.logDesc}>Sleep latency extended by 22 minutes. Deep sleep duration diminished by 45% over 72 hours, amplifying recovery debt.</Text>
            <Text style={styles.logTime}>18 hours ago • Wearable Raw Sync</Text>
          </View>
        </View>

        {/* Log Item 3 */}
        <View style={styles.logRow}>
          <View style={[styles.logIndicator, { backgroundColor: theme.colors.warning }]} />
          <View style={styles.logTextContainer}>
            <Text style={styles.logTitle}>Resting HR Incongruity</Text>
            <Text style={styles.logDesc}>A +9 bpm deviation in sleeping heart rate registered. Elevating cardiovascular tone indicates early cytokine pathway stimulation.</Text>
            <Text style={styles.logTime}>1 day ago • Health Connect API</Text>
          </View>
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
  scoreCard: {
    backgroundColor: theme.glassmorphism.backgroundColor,
    borderRadius: theme.glassmorphism.borderRadius,
    borderWidth: theme.glassmorphism.borderWidth,
    borderColor: theme.glassmorphism.borderColor,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.card,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreHeaderLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreStatusText: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.warning,
    marginTop: 4,
  },
  scoreBig: {
    fontSize: 56,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 12,
  },
  scoreExplanation: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
  },
  weightsCard: {
    backgroundColor: 'rgba(18, 27, 46, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 22,
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  weightRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  weightLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  weightPercent: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  weightValues: {
    alignItems: 'flex-end',
  },
  weightValText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  weightDevText: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  logContainer: {
    gap: 12,
  },
  logRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
  },
  logIndicator: {
    width: 3,
    borderRadius: 1.5,
    marginVertical: 4,
  },
  logTextContainer: {
    flex: 1,
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  logDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15,
    marginTop: 4,
  },
  logTime: {
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 6,
    fontWeight: '600',
  }
});
