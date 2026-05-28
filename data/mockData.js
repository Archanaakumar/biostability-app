export const mockData = {
  watchDevice: {
    name: 'Noise ColorFit Pro',
    brand: 'Terra API Sync',
    battery: '78%',
    lastSync: 'Just now',
    status: 'Connected'
  },
  
  todayMetrics: {
    stabilityScore: 64,
    stabilityLabel: 'Systemic Drift',
    insight: 'Your Autonomic Stability is declining. A 38% drop in nocturnal HRV suggests systemic strain 48–72 hours prior to physical symptoms.',
    hrv: {
      value: 46,
      unit: 'ms',
      baseline: 74,
      change: '-37%',
      status: 'danger',
      label: 'Heart Rate Variability'
    },
    rhr: {
      value: 70,
      unit: 'bpm',
      baseline: 61,
      change: '+14%',
      status: 'warning',
      label: 'Resting Heart Rate'
    },
    sleep: {
      value: 5.5,
      unit: 'hrs',
      baseline: 7.8,
      change: '-29%',
      status: 'warning',
      label: 'Sleep Duration'
    },
    steps: {
      value: 4100,
      unit: 'steps',
      baseline: 9500,
      change: '-56%',
      status: 'muted',
      label: 'Daily Steps'
    }
  },
  
  stabilityScoreHistory: [
    { day: 'Wed', score: 88, status: 'stable' },
    { day: 'Thu', score: 86, status: 'stable' },
    { day: 'Fri', score: 84, status: 'stable' },
    { day: 'Sat', score: 79, status: 'warning' },
    { day: 'Sun', score: 74, status: 'warning' },
    { day: 'Mon', score: 69, status: 'danger' },
    { day: 'Tue', score: 64, status: 'danger' }
  ],
  
  trendsData: {
    hrv: [
      { day: 'Wed', actual: 76, baseline: 74 },
      { day: 'Thu', actual: 74, baseline: 74 },
      { day: 'Fri', actual: 71, baseline: 74 },
      { day: 'Sat', actual: 65, baseline: 74 },
      { day: 'Sun', actual: 58, baseline: 74 },
      { day: 'Mon', actual: 51, baseline: 74 },
      { day: 'Tue', actual: 46, baseline: 74 }
    ],
    rhr: [
      { day: 'Wed', actual: 60, baseline: 61 },
      { day: 'Thu', actual: 61, baseline: 61 },
      { day: 'Fri', actual: 62, baseline: 61 },
      { day: 'Sat', actual: 64, baseline: 61 },
      { day: 'Sun', actual: 66, baseline: 61 },
      { day: 'Mon', actual: 68, baseline: 61 },
      { day: 'Tue', actual: 70, baseline: 61 }
    ],
    sleep: [
      { day: 'Wed', actual: 7.9, baseline: 7.8 },
      { day: 'Thu', actual: 7.6, baseline: 7.8 },
      { day: 'Fri', actual: 7.5, baseline: 7.8 },
      { day: 'Sat', actual: 7.1, baseline: 7.8 },
      { day: 'Sun', actual: 6.3, baseline: 7.8 },
      { day: 'Mon', actual: 5.9, baseline: 7.8 },
      { day: 'Tue', actual: 5.5, baseline: 7.8 }
    ],
    steps: [
      { day: 'Wed', actual: 9800, baseline: 9500 },
      { day: 'Thu', actual: 9100, baseline: 9500 },
      { day: 'Fri', actual: 8500, baseline: 9500 },
      { day: 'Sat', actual: 7200, baseline: 9500 },
      { day: 'Sun', actual: 6100, baseline: 9500 },
      { day: 'Mon', actual: 5000, baseline: 9500 },
      { day: 'Tue', actual: 4100, baseline: 9500 }
    ]
  },
  
  alertsList: [
    {
      id: 'alert-1',
      title: 'Invisible Drift Warning',
      subtitle: 'Severe Autonomic Autonomic Shift',
      time: 'Today, 08:30 AM',
      type: 'danger',
      isActive: true,
      description: 'Your resting HRV has deviated by -37% and resting heart rate has risen by +14% compared to your multi-week baseline. This pattern indicates an imminent viral fatigue or stress onset.',
      timeToOnset: 'Estimated 24-48 Hours',
      confidence: '86% Probability',
      actionableTip: 'Prioritize physical recovery immediately. Restrict intensive exercise, increase hydration, and extend sleep opportunity by 90 minutes tonight.'
    },
    {
      id: 'alert-2',
      title: 'Sleep Deficit Shift',
      subtitle: 'Cumulative Sleep Debt Alert',
      time: '2 days ago',
      type: 'warning',
      isActive: false,
      description: 'A 2.3-hour daily deep sleep deficit over 3 consecutive days has triggered an early warning. Sleep recovery is highly recommended to stabilize autonomic response.',
      timeToOnset: 'Mild Drift Detected',
      confidence: '72% Probability',
      actionableTip: 'Ensure your room is cooled and dim, and avoid eating or screen exposure 2 hours before sleeping.'
    },
    {
      id: 'alert-3',
      title: 'Autonomic Balance Restored',
      subtitle: 'System Recovery Detected',
      time: '12 days ago',
      type: 'success',
      isActive: false,
      description: 'The moderate drift warning active on May 10th has successfully resolved. Sleep duration and resting HRV returned to your stable baseline.',
      timeToOnset: 'Baseline Recovered',
      confidence: '100% Stability Re-established',
      actionableTip: 'Your baseline settings have been successfully calibrated.'
    }
  ]
};
