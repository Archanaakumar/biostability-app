import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme } from '../styles/theme';

export default function ArcGauge({ score = 64, label = 'Systemic Drift' }) {
  // Circular arc configuration
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  
  // A 3/4 circle arc (270 degrees)
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const gapLength = circumference - arcLength;
  
  const isPending = score === '--' || score === null || score === undefined;

  // Calculate progress on the 75% arc
  const progressPercent = isPending ? 0 : Math.min(Math.max(score, 0), 100) / 100;
  const progressLength = arcLength * progressPercent;
  const strokeDashoffset = arcLength - progressLength;
  
  // Determine color matching current score
  let statusColor = theme.colors.accentCyan;
  let scoreText = 'Stable';
  
  if (isPending) {
    statusColor = theme.colors.textMuted;
    scoreText = 'Off-Wrist';
  } else if (score < 50) {
    statusColor = theme.colors.danger;
    scoreText = 'Critical';
  } else if (score < 80) {
    statusColor = theme.colors.warning;
    scoreText = 'Drifting';
  } else {
    statusColor = theme.colors.success;
    scoreText = 'Optimal';
  }

  const getGradientColors = () => {
    if (isPending) {
      return { start: theme.colors.textMuted, end: 'rgba(255,255,255,0.08)', startOpacity: '1', endOpacity: '1' };
    } else if (score < 50) {
      return { start: theme.colors.danger, end: '#F43F5E', startOpacity: '1', endOpacity: '1' };
    } else if (score < 80) {
      return { start: theme.colors.warning, end: '#FB923C', startOpacity: '1', endOpacity: '1' };
    } else {
      return { start: theme.colors.accentBlue, end: theme.colors.accentCyan, startOpacity: '1', endOpacity: '1' };
    }
  };

  const gradColors = getGradientColors();

  return (
    <View style={styles.container}>
      <View style={styles.gaugeWrapper}>
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            {/* Smooth glowing electric blue/cyan gradient */}
            <LinearGradient id="gaugeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={gradColors.start} stopOpacity={gradColors.startOpacity} />
              <Stop offset="100%" stopColor={gradColors.end} stopOpacity={gradColors.endOpacity} />
            </LinearGradient>
          </Defs>
          
          {/* Background Track Arc */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth - 4}
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(135, ${cx}, ${cy})`}
          />
          
          {/* Active Highlight Arc */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="url(#gaugeGrad)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(135, ${cx}, ${cy})`}
          />
        </Svg>
        
        {/* Core Floating Data Panel */}
        <View style={styles.labelContainer}>
          <Text style={styles.scoreNumber}>{score}</Text>
          <Text style={[styles.statusBadge, { color: statusColor }]}>
            {(isPending ? label : scoreText).toUpperCase()}
          </Text>
          <Text style={styles.scoreSubText}>Stability Score</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  gaugeWrapper: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
  },
  scoreNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    letterSpacing: -1,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: -4,
    marginBottom: 4,
  },
  scoreSubText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
});
