import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MetricWidget({ type, metric, onPress }) {
  const { value, unit, baseline, change, status, label } = metric;
  
  // Decide icon and colors
  let iconName = 'heart-pulse';
  let iconColor = theme.colors.accentCyan;
  let statusColor = theme.colors.textMuted;
  let bgGlow = 'rgba(255, 255, 255, 0.02)';
  
  if (type === 'hrv') {
    iconName = 'heart-flash';
    iconColor = theme.colors.danger;
    statusColor = theme.colors.danger;
    bgGlow = 'rgba(239, 68, 68, 0.05)';
  } else if (type === 'rhr') {
    iconName = 'heart-pulse';
    iconColor = theme.colors.warning;
    statusColor = theme.colors.warning;
    bgGlow = 'rgba(245, 158, 11, 0.05)';
  } else if (type === 'sleep') {
    iconName = 'sleep';
    iconColor = theme.colors.accentBlue;
    statusColor = theme.colors.warning;
    bgGlow = 'rgba(59, 130, 246, 0.05)';
  } else if (type === 'steps') {
    iconName = 'run';
    iconColor = theme.colors.success;
    statusColor = theme.colors.textMuted;
    bgGlow = 'rgba(16, 185, 129, 0.03)';
  }

  // Calculate progress relative to baseline
  const isPending = value === '--' || value === null || value === undefined;
  const ratio = isPending ? 0 : Math.min(value / (baseline || 1), 1.5);
  const displayChange = isPending ? 'Off-Wrist' : change;
  const displayValue = isPending ? '--' : value;
  const displayStatus = isPending ? 'warning' : status;

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { borderColor: displayStatus === 'danger' ? 'rgba(239, 68, 68, 0.22)' : displayStatus === 'warning' ? 'rgba(245, 158, 11, 0.22)' : theme.colors.borderGlow }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Glow Backing */}
      <View style={[styles.glowLayer, { backgroundColor: bgGlow }]} />

      <View style={styles.cardHeader}>
        <View style={styles.iconBg}>
          <MaterialCommunityIcons name={iconName} size={18} color={iconColor} />
        </View>
        <View style={[
          styles.badge, 
          { backgroundColor: displayStatus === 'danger' ? 'rgba(239, 68, 68, 0.12)' : displayStatus === 'warning' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.05)' }
        ]}>
          <Text style={[
            styles.badgeText, 
            { color: displayStatus === 'danger' ? theme.colors.danger : displayStatus === 'warning' ? theme.colors.warning : theme.colors.textSecondary }
          ]}>
            {displayChange}
          </Text>
        </View>
      </View>

      <Text style={styles.widgetLabel} numberOfLines={1}>{label}</Text>

      <View style={styles.valueRow}>
        <Text style={styles.valueText}>{displayValue}</Text>
        <Text style={styles.unitText}>{isPending ? '' : unit}</Text>
      </View>

      <View style={styles.baselineRow}>
        <Text style={styles.baselineLabel}>Baseline:</Text>
        <Text style={styles.baselineValue}>{isPending ? '--' : `${baseline}${unit}`}</Text>
      </View>

      {/* Visual horizontal loading track representing deviation */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[
            styles.progressBarActive, 
            { 
              width: `${Math.min(ratio * 100, 100)}%`,
              backgroundColor: status === 'danger' ? theme.colors.danger : status === 'warning' ? theme.colors.warning : theme.colors.success
            }
          ]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.glassmorphism.backgroundColor,
    borderRadius: theme.glassmorphism.borderRadius,
    borderWidth: 1,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  glowLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  widgetLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  valueText: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  unitText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  baselineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  baselineLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  baselineValue: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    marginTop: 2,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarActive: {
    height: '100%',
    borderRadius: 2,
  }
});
