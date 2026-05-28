import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Text as SvgText, Defs, LinearGradient, Stop, Line, G } from 'react-native-svg';
import { theme } from '../styles/theme';
import { mockData } from '../data/mockData';

export default function InvisibleDriftChart({ metricType = 'hrv', chartData }) {
  const data = chartData || mockData.trendsData[metricType] || [];
  
  // Dimensions & Padding
  const screenWidth = Dimensions.get('window').width - 32; // Padding margins
  const width = Math.max(screenWidth, 340);
  const height = 185;
  const paddingX = 40;
  const paddingY = 25;
  
  // Calculate value ranges based on metric type
  let minVal = 0;
  let maxVal = 100;
  let unit = '';
  let shadeColor = 'rgba(239, 68, 68, 0.16)'; // Default red shade for drift

  if (metricType === 'hrv') {
    minVal = 30;
    maxVal = 90;
    unit = 'ms';
    shadeColor = 'rgba(244, 63, 94, 0.18)'; // Rose glow
  } else if (metricType === 'rhr') {
    minVal = 50;
    maxVal = 80;
    unit = 'bpm';
    shadeColor = 'rgba(245, 158, 11, 0.15)'; // Warning orange
  } else if (metricType === 'sleep') {
    minVal = 4;
    maxVal = 9;
    unit = 'h';
    shadeColor = 'rgba(59, 130, 246, 0.15)'; // Electric blue
  } else if (metricType === 'steps') {
    minVal = 2000;
    maxVal = 11000;
    unit = '';
    shadeColor = 'rgba(6, 182, 212, 0.15)'; // Cyan
  }

  const yRange = maxVal - minVal;

  // Coordinate projection mapping
  const getCoordinates = () => {
    return data.map((item, index) => {
      const x = paddingX + (index * (width - 2 * paddingX)) / (data.length - 1);
      
      // Prevent division by zero and pin coordinates
      const yActual = height - paddingY - ((item.actual - minVal) / yRange) * (height - 2 * paddingY);
      const yBaseline = height - paddingY - ((item.baseline - minVal) / yRange) * (height - 2 * paddingY);
      
      return {
        x,
        yActual: Math.min(Math.max(yActual, paddingY), height - paddingY),
        yBaseline: Math.min(Math.max(yBaseline, paddingY), height - paddingY),
        day: item.day,
        actualVal: item.actual,
        baselineVal: item.baseline
      };
    });
  };

  const coords = getCoordinates();

  // Generate SVG path for Actual readings
  const getActualLinePath = () => {
    if (coords.length === 0) return '';
    return coords.reduce((path, point, index) => {
      return index === 0 ? `M ${point.x} ${point.yActual}` : `${path} L ${point.x} ${point.yActual}`;
    }, '');
  };

  // Generate SVG path for Baseline readings
  const getBaselineLinePath = () => {
    if (coords.length === 0) return '';
    return coords.reduce((path, point, index) => {
      return index === 0 ? `M ${point.x} ${point.yBaseline}` : `${path} L ${point.x} ${point.yBaseline}`;
    }, '');
  };

  // Generate shaded gap polygon representing "Invisible Drift"
  const getDriftGapPath = () => {
    if (coords.length === 0) return '';
    
    // Trace actual line from left to right
    let path = `M ${coords[0].x} ${coords[0].yActual}`;
    for (let i = 1; i < coords.length; i++) {
      path += ` L ${coords[i].x} ${coords[i].yActual}`;
    }
    // Trace baseline line from right to left
    for (let i = coords.length - 1; i >= 0; i--) {
      path += ` L ${coords[i].x} ${coords[i].yBaseline}`;
    }
    path += ' Z'; // Close path
    return path;
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartTitleContainer}>
        <Text style={styles.chartTitle}>7-Day Physiological Timeline</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.accentCyan }]} />
            <Text style={styles.legendText}>Actual Sync</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotDashed]} />
            <Text style={styles.legendText}>My Baseline</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F43F5E', opacity: 0.5 }]} />
            <Text style={styles.legendText}>Invisible Drift</Text>
          </View>
        </View>
      </View>

      <View style={styles.svgWrapper}>
        <Svg width={width} height={height}>
          <Defs>
            {/* Shaded gap fill gradient */}
            <LinearGradient id="driftGapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={metricType === 'rhr' ? theme.colors.warning : theme.colors.danger} stopOpacity="0.22" />
              <Stop offset="100%" stopColor={metricType === 'rhr' ? theme.colors.warning : theme.colors.danger} stopOpacity="0.04" />
            </LinearGradient>
          </Defs>

          {/* Grid Guideline Y-axis borders */}
          <Line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#1E293B" strokeWidth="1" strokeDasharray="2 4" />
          <Line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#1E293B" strokeWidth="1" strokeDasharray="2 4" />
          <Line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#1E293B" strokeWidth="1" />

          {/* Render Shaded Drift Polygon Gap */}
          <Path d={getDriftGapPath()} fill="url(#driftGapGrad)" />

          {/* Baseline Dotted Curve */}
          <Path d={getBaselineLinePath()} fill="none" stroke={theme.colors.accentIndigo} strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" />

          {/* Actual Line Solid Curve */}
          <Path d={getActualLinePath()} fill="none" stroke={theme.colors.accentCyan} strokeWidth="3" strokeLinecap="round" />

          {/* Interaction Data Points */}
          {coords.map((point, index) => {
            const isToday = index === coords.length - 1;
            return (
              <G key={index}>
                {/* Horizontal baseline marker circles */}
                <Circle cx={point.x} cy={point.yBaseline} r="3" fill={theme.colors.accentIndigo} />
                
                {/* Real-time active coordinate indicators */}
                <Circle
                  cx={point.x}
                  cy={point.yActual}
                  r={isToday ? 6 : 4}
                  fill={isToday ? theme.colors.danger : theme.colors.bgPrimary}
                  stroke={theme.colors.accentCyan}
                  strokeWidth="2.5"
                />

                {/* Day Labels along X-Axis */}
                <SvgText
                  x={point.x}
                  y={height - 6}
                  fill={isToday ? theme.colors.textPrimary : theme.colors.textMuted}
                  fontSize="11"
                  fontWeight={isToday ? '700' : '500'}
                  textAnchor="middle"
                  fontFamily={theme.typography.fontFamily}
                >
                  {point.day}
                </SvgText>

                {/* Latest actual coordinate values (placed at start and end for layout clarity) */}
                {(index === 0 || isToday) && (
                  <SvgText
                    x={point.x}
                    y={point.yActual - 10}
                    fill={theme.colors.textPrimary}
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                    fontFamily={theme.typography.fontFamily}
                  >
                    {`${point.actualVal}${unit}`}
                  </SvgText>
                )}
              </G>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    backgroundColor: theme.glassmorphism.backgroundColor,
    borderRadius: theme.glassmorphism.borderRadius,
    borderWidth: theme.glassmorphism.borderWidth,
    borderColor: theme.glassmorphism.borderColor,
    padding: 14,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendDotDashed: {
    width: 8,
    height: 2,
    backgroundColor: theme.colors.accentIndigo,
  },
  legendText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  svgWrapper: {
    alignItems: 'center',
  },
});
