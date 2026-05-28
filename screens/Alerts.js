import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import { mockData } from '../data/mockData';
import AlertCard from '../components/AlertCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Alerts() {
  const alerts = mockData.alertsList;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageSubtitle}>Predictive Early Warnings</Text>
        <Text style={styles.pageTitle}>Alert Intelligence</Text>
      </View>

      {/* Hero Warning Callout */}
      <View style={styles.warningAlertBox}>
        <View style={styles.pulseContainer}>
          <View style={styles.pulseCircle} />
          <MaterialCommunityIcons name="shield-alert-outline" size={24} color={theme.colors.danger} />
        </View>
        <View style={styles.warningTextCol}>
          <Text style={styles.warningTitle}>Pre-Symptom Drift Engaged</Text>
          <Text style={styles.warningDesc}>AI predicts systemic physiological shift. Actively manage load to circumvent symptom presentation.</Text>
        </View>
      </View>

      {/* Alerts Feed */}
      <Text style={styles.sectionTitle}>Notifications Feed</Text>
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}

      {/* Chronological Breakdown Timeline */}
      <Text style={styles.sectionTitle}>Physiological Degradation Timeline</Text>
      <View style={styles.timelineCard}>
        {/* Day 3 Ago */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <Text style={styles.timelineDay}>72h ago</Text>
            <View style={styles.timelineIconBg}>
              <MaterialCommunityIcons name="sleep" size={14} color={theme.colors.accentBlue} />
            </View>
          </View>
          <View style={styles.timelineLine} />
          <View style={styles.timelineRight}>
            <Text style={styles.timelineEventTitle}>Sleep Deficit Initiated</Text>
            <Text style={styles.timelineEventDesc}>Nocturnal rest dropped to 6.3h (-19% vs baseline). Deep stage repair suppressed by 30%.</Text>
          </View>
        </View>

        {/* Day 2 Ago */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <Text style={styles.timelineDay}>48h ago</Text>
            <View style={styles.timelineIconBg}>
              <MaterialCommunityIcons name="heart-flash" size={14} color={theme.colors.warning} />
            </View>
          </View>
          <View style={styles.timelineLine} />
          <View style={styles.timelineRight}>
            <Text style={styles.timelineEventTitle}>Autonomic Shift Activated</Text>
            <Text style={styles.timelineEventDesc}>Resting HRV suppressed below 60ms (-21%). Sleeping heart rate rose by +5 bpm, signaling autonomic struggle.</Text>
          </View>
        </View>

        {/* Day 1 Ago */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <Text style={styles.timelineDay}>24h ago</Text>
            <View style={styles.timelineIconBg}>
              <MaterialCommunityIcons name="brain" size={14} color={theme.colors.danger} />
            </View>
          </View>
          <View style={styles.timelineLine} />
          <View style={styles.timelineRight}>
            <Text style={styles.timelineEventTitle}>Multi-System Baseline Break</Text>
            <Text style={styles.timelineEventDesc}>HRV collapsed to 51ms (-31%). Behavioral steps restricted by 47% (energy conservation mode engaged).</Text>
          </View>
        </View>

        {/* Today */}
        <View style={[styles.timelineItem, { paddingBottom: 0 }]}>
          <View style={styles.timelineLeft}>
            <Text style={[styles.timelineDay, { color: theme.colors.danger, fontWeight: '800' }]}>Today</Text>
            <View style={[styles.timelineIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
              <MaterialCommunityIcons name="alert-octagon" size={14} color={theme.colors.danger} />
            </View>
          </View>
          <View style={[styles.timelineRight, { marginTop: 2 }]}>
            <Text style={[styles.timelineEventTitle, { color: theme.colors.danger }]}>Early Warning Dispatched</Text>
            <Text style={styles.timelineEventDesc}>Stability Score hits 64 (Danger Horizon). Parasympathetic nervous system fully compressed. Symptom onset predicted within 24-48 hours.</Text>
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
  warningAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 18,
  },
  pulseContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  pulseCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    opacity: 0.5,
  },
  warningTextCol: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.danger,
  },
  warningDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15,
    marginTop: 2,
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
  timelineCard: {
    backgroundColor: 'rgba(18, 27, 46, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
    paddingBottom: 22,
  },
  timelineLeft: {
    width: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  timelineDay: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  timelineIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: 64,
    top: 24,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 12,
  },
  timelineEventTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  timelineEventDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15,
    marginTop: 4,
  }
});
