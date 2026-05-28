export const theme = {
  colors: {
    bgPrimary: '#0B0F19',
    bgSecondary: '#121B2E',
    bgCard: 'rgba(18, 27, 46, 0.75)',
    borderGlow: 'rgba(59, 130, 246, 0.18)',
    borderActive: 'rgba(6, 182, 212, 0.4)',
    
    // Accents
    accentBlue: '#3B82F6',
    accentCyan: '#06B6D4',
    accentIndigo: '#4F46E5',
    
    // Status
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    
    // Typography
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    
    // Gradients (Visual helpers)
    gradientBlueCyan: ['#3B82F6', '#06B6D4'],
    gradientDark: ['#0B0F19', '#111827'],
    gradientCard: ['rgba(21, 31, 55, 0.8)', 'rgba(11, 17, 30, 0.9)'],
    gradientWarning: ['#F59E0B', '#D97706'],
    gradientDanger: ['#EF4444', '#DC2626'],
  },
  typography: {
    fontFamily: 'System',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 22,
      xxl: 32,
      huge: 48,
    },
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      bold: '700',
      heavy: '900',
    }
  },
  shadows: {
    glow: {
      shadowColor: '#3B82F6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    glowCyan: {
      shadowColor: '#06B6D4',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 15,
      elevation: 8,
    },
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    }
  },
  glassmorphism: {
    backgroundColor: 'rgba(18, 27, 46, 0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  }
};
