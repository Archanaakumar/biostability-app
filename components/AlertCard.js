import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AlertCard({ alert }) {
  const { title, subtitle, time, type, description, timeToOnset, confidence, actionableTip, isActive } = alert;

  let badgeColor = theme.colors.success;
  let iconName = 'check-circle';
  let borderHighlight = 'rgba(255, 255, 255, 0.05)';

  if (type === 'danger') {
    badgeColor = theme.colors.danger;
    iconName = 'alert-octagon';
    borderHighlight = 'rgba(239, 68, 68, 0.3)';
  } else if (type === 'warning') {
    badgeColor = theme.colors.warning;
    iconName = 'alert';
    borderHighlight = 'rgba(245, 158, 11, 0.3)';
  } else {
    badgeColor = theme.colors.success;
    iconName = 'checkbox-marked-circle-outline';
    borderHighlight = 'rgba(16, 185, 129, 0.3)';
  }

  return (
    <View style={[styles.card, { borderColor: borderHighlight }]}>
      {isActive && <View style={[styles.activeRibbon, { backgroundColor: badgeColor }]} />}
      
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name={iconName} size={20} color={badgeColor} />
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>
        <Text style={styles.timeText}>{time}</Text>
      </View>

      <Text style={styles.descText}>{description}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Pre-Symptom Horizon</Text>
          <Text style={[styles.statValue, { color: badgeColor }]}>{timeToOnset}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>AI Prediction Confidence</Text>
          <Text style={styles.statValue}>{confidence}</Text>
        </View>
      </View>

      {actionableTip && (
        <View style={styles.tipContainer}>
          <View style={styles.tipHeader}>
            <MaterialCommunityIcons name="shield-check" size={16} color={theme.colors.accentCyan} />
            <Text style={styles.tipTitle}>Recommended Action Plan</Text>
          </View>
          <Text style={styles.tipText}>{actionableTip}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.glassmorphism.backgroundColor,
    borderRadius: theme.glassmorphism.borderRadius,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  activeRibbon: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  timeText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  descText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 10,
  },
  tipContainer: {
    backgroundColor: 'rgba(6, 182, 212, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.15)',
    borderRadius: 8,
    padding: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tipTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.accentCyan,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  }
});
