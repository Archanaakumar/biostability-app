import React, { useState } from 'react';
import {
  View, StyleSheet,
  Platform, TouchableOpacity, Text, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './styles/theme';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ── Auth ──────────────────────────────────────────────────────────────────────
import { AuthProvider, useAuth } from './context/AuthContext';

// ── Screens ───────────────────────────────────────────────────────────────────
import Dashboard from './screens/Dashboard';
import StabilityScoreDetails from './screens/StabilityScoreDetails';
import HealthTrends from './screens/HealthTrends';
import Alerts from './screens/Alerts';
import Profile from './screens/Profile';
import DeviceHub from './screens/DeviceHub';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';

// ── Navigation tabs (6 tabs) ──────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', icon: 'view-dashboard', label: 'Home'    },
  { id: 'score',     icon: 'brain',          label: 'Index'   },
  { id: 'trends',    icon: 'chart-line',     label: 'Trends'  },
  { id: 'devices',   icon: 'watch-variant',  label: 'Devices' },
  { id: 'alerts',    icon: 'bell',           label: 'Alerts', badge: true },
  { id: 'profile',   icon: 'account-cog',   label: 'Setup'   },
];

// ── Main tab navigator (authenticated users only) ─────────────────────────────
function AppNavigator() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setTab={setActiveTab} />;
      case 'score':     return <StabilityScoreDetails />;
      case 'trends':    return <HealthTrends />;
      case 'devices':   return <DeviceHub />;
      case 'alerts':    return <Alerts />;
      case 'profile':   return <Profile setTab={setActiveTab} />;
      default:          return <Dashboard setTab={setActiveTab} />;
    }
  };

  return (
    <View style={styles.appContainer}>
      <ExpoStatusBar style="light" backgroundColor={theme.colors.bgPrimary} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.screenWrapper}>
          {renderScreen()}
        </View>
      </SafeAreaView>

      {/* Floating Glassmorphic Bottom Navigator */}
      <View style={styles.floatingNavContainer}>
        <View style={styles.glassNavBar}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.navTab}
                onPress={() => setActiveTab(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={20}
                    color={isActive ? theme.colors.accentCyan : theme.colors.textSecondary}
                    style={isActive ? styles.activeIconGlow : null}
                  />
                  {item.badge && (
                    <View style={[styles.alertBadgeDot, { backgroundColor: theme.colors.danger }]} />
                  )}
                </View>

                <Text style={[
                  styles.navLabel,
                  { color: isActive ? theme.colors.textPrimary : theme.colors.textMuted },
                ]}>
                  {item.label}
                </Text>

                {isActive && <View style={styles.activeIndicatorDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ── Auth Gate — renders Login/Signup or main app based on auth state ───────────
function AuthGate() {
  const { user, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'signup'

  // Splash / loading state
  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <MaterialCommunityIcons name="heart-pulse" size={52} color={theme.colors.accentCyan} />
        <Text style={styles.splashTitle}>BioStability</Text>
        <ActivityIndicator color={theme.colors.accentCyan} style={{ marginTop: 24 }} size="small" />
      </View>
    );
  }

  // Not authenticated → show auth screens
  if (!user) {
    return authScreen === 'signup'
      ? <SignupScreen onNavigateToLogin={() => setAuthScreen('login')} />
      : <LoginScreen onNavigateToSignup={() => setAuthScreen('signup')} />;
  }

  // Authenticated → show main app
  return <AppNavigator />;
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // Main container
  appContainer: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  },
  safeArea: {
    flex: 1,
  },
  screenWrapper: {
    flex: 1,
    paddingBottom: 78, // Account for floating nav bar height
  },

  // Splash screen
  splashContainer: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  splashTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: 12,
  },

  // Navigation bar — slightly narrower margins to fit 6 tabs
  floatingNavContainer: {
    position: 'absolute',
    bottom: 12,
    left: 10,
    right: 10,
    height: 64,
    zIndex: 100,
  },
  glassNavBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 27, 46, 0.88)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.borderGlow,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.glow,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    height: 22,
    justifyContent: 'center',
  },
  activeIconGlow: {
    textShadowColor: 'rgba(6, 182, 212, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  alertBadgeDot: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1,
    borderColor: '#121B2E',
  },
  navLabel: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  activeIndicatorDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.accentCyan,
    ...theme.shadows.glowCyan,
  },
});
