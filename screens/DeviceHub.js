import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Modal, ActivityIndicator, SectionList, Animated, Image, Switch, Platform, ScrollView, Linking
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { healthBridge } from '../services/healthBridgeService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_WATCH_URI = 'file:///C:/Users/Archanaa/.gemini/antigravity-ide/brain/8cb1cb4f-b592-4286-8a1a-9e48226b0b5b/media__1779939493445.jpg';

// ── 52 Brands dataset ─────────────────────────────────────────────────────────
const BRANDS = [
  // ── Indian Brands (22) ──────────────────────────────────────────────────────
  { id: '1',  name: 'Noise',        models: 'ColorFit Pro 5, Twist 3, Luna Ring',    icon: 'watch',          color: '#06B6D4', category: 'Indian',  healthBridge: true  },
  { id: '2',  name: 'boAt',         models: 'Lunar Connect, Wave Dial, Storm Pro',   icon: 'anchor',         color: '#EF4444', category: 'Indian',  healthBridge: true  },
  { id: '3',  name: 'Fire-Boltt',   models: 'Phoenix Ultra, Ring 3, Tornado Pro',    icon: 'fire',           color: '#F59E0B', category: 'Indian',  healthBridge: true  },
  { id: '4',  name: 'Amazfit',      models: 'Bip 5, GTR 4 Mini, GTS 4',             icon: 'lightning-bolt', color: '#3B82F6', category: 'Indian',  healthBridge: true  },
  { id: '5',  name: 'Fastrack',     models: 'Reflex Beat+, Limitless FS1',           icon: 'run-fast',       color: '#10B981', category: 'Indian',  healthBridge: true },
  { id: '6',  name: 'Titan Smart',  models: 'Crest Pro, Crest C, Horizon',           icon: 'clock-outline',  color: '#8B5CF6', category: 'Indian',  healthBridge: true },
  { id: '7',  name: 'GOQii',        models: 'Vital 4, Smart Vital Oxygen',           icon: 'heart-pulse',    color: '#EC4899', category: 'Indian',  healthBridge: true  },
  { id: '8',  name: 'Redmi Watch',  models: 'Watch 4, Watch 3 Active',               icon: 'watch',          color: '#EF4444', category: 'Indian',  healthBridge: true  },
  { id: '9',  name: 'Realme Watch', models: 'S Pro, Watch 3, TechLife S100',         icon: 'watch-variant',  color: '#F59E0B', category: 'Indian',  healthBridge: true  },
  { id: '10', name: 'OnePlus Watch',models: 'Watch 2R, Nord Watch 2',                icon: 'plus-circle',    color: '#6366F1', category: 'Indian',  healthBridge: true  },
  { id: '11', name: 'Pebble',       models: 'Cosmos Engage, Stellar Pro',            icon: 'octagram',       color: '#06B6D4', category: 'Indian',  healthBridge: true },
  { id: '12', name: 'Hammer',       models: 'Pulse 4, Grip 3.0, Active Pro',         icon: 'hammer',         color: '#94A3B8', category: 'Indian',  healthBridge: true },
  { id: '13', name: 'Zebronics',    models: 'Zeb-Iconic, Zeb-Fit4220CH',             icon: 'watch',          color: '#10B981', category: 'Indian',  healthBridge: true },
  { id: '14', name: 'Maxima',       models: 'Nitro X, Max Pro M2',                   icon: 'speedometer',    color: '#3B82F6', category: 'Indian',  healthBridge: true },
  { id: '15', name: 'Crossbeats',   models: 'Ignite Nexus, Orbit Pro',               icon: 'access-point',   color: '#8B5CF6', category: 'Indian',  healthBridge: true },
  { id: '16', name: 'Ambrane',      models: 'Wisdom Evo, Neo Smart',                 icon: 'watch',          color: '#F59E0B', category: 'Indian',  healthBridge: true },
  { id: '17', name: 'IQOO Watch',   models: 'IQOO Watch GT 3',                       icon: 'watch-variant',  color: '#EF4444', category: 'Indian',  healthBridge: true },
  { id: '18', name: 'Portronics',   models: 'Kronos Y3, Omega Smart',                icon: 'watch',          color: '#10B981', category: 'Indian',  healthBridge: true },
  { id: '19', name: 'Gizmore',      models: 'Gizfit Ultra 2, Curve Pro',             icon: 'watch',          color: '#06B6D4', category: 'Indian',  healthBridge: true },
  { id: '20', name: 'Syska',        models: 'SW200 Smart, Glow Series',              icon: 'watch',          color: '#F59E0B', category: 'Indian',  healthBridge: true },
  { id: '21', name: 'Wings',        models: 'Lifestylr Curl 2, Orbit',               icon: 'butterfly',      color: '#EC4899', category: 'Indian',  healthBridge: true },
  { id: '22', name: 'Ptron',        models: 'Force X11, Reflect Jog Pro',            icon: 'watch',          color: '#8B5CF6', category: 'Indian',  healthBridge: true },

  // ── Global Brands (20) ──────────────────────────────────────────────────────
  { id: '23', name: 'Apple Watch',  models: 'Series 10, Ultra 2, SE 3',             icon: 'apple',          color: '#FFFFFF', category: 'Global',  healthBridge: true  },
  { id: '24', name: 'Garmin',       models: 'Fenix 8, Forerunner 965, Venu 3',      icon: 'navigation',     color: '#3B82F6', category: 'Global',  healthBridge: true  },
  { id: '25', name: 'Fitbit',       models: 'Charge 6, Sense 2, Versa 4',           icon: 'star-circle',    color: '#10B981', category: 'Global',  healthBridge: true  },
  { id: '26', name: 'Samsung',      models: 'Galaxy Watch 7, Ultra, Classic',       icon: 'android',        color: '#1428A0', category: 'Global',  healthBridge: true  },
  { id: '27', name: 'Fossil',       models: 'Gen 6 Wellness, Collider HR',          icon: 'clock-outline',  color: '#94A3B8', category: 'Global',  healthBridge: true  },
  { id: '28', name: 'Suunto',       models: 'Race S, 9 Peak Pro, Core',             icon: 'compass',        color: '#EF4444', category: 'Global',  healthBridge: true  },
  { id: '29', name: 'Polar',        models: 'H10 Sensor, Vantage V3, Pacer Pro',    icon: 'snowflake',      color: '#4FC3F7', category: 'Global',  healthBridge: true  },
  { id: '30', name: 'Coros',        models: 'Vertix 2S, Pace 3, Apex 2 Pro',        icon: 'medal',          color: '#F59E0B', category: 'Global',  healthBridge: true  },
  { id: '31', name: 'Whoop',        models: 'Whoop 4.0, Whoop MG',                  icon: 'lightning-bolt', color: '#FFFFFF', category: 'Global',  healthBridge: true  },
  { id: '32', name: 'Oura Ring',    models: 'Oura Ring Gen 3, Heritage',             icon: 'ring',           color: '#6366F1', category: 'Global',  healthBridge: true  },
  { id: '33', name: 'Withings',     models: 'ScanWatch 2, Steel HR, Pulse HR',      icon: 'heart-plus',     color: '#10B981', category: 'Global',  healthBridge: true  },
  { id: '34', name: 'Huawei',       models: 'Watch GT 4, Band 9, Ultimate',         icon: 'shield',         color: '#CF0A2C', category: 'Global',  healthBridge: true },
  { id: '35', name: 'Xiaomi',       models: 'Smart Band 9, 8 Pro, Redmi Band',      icon: 'arm-flex',       color: '#F59E0B', category: 'Global',  healthBridge: true  },
  { id: '36', name: 'Pixel Watch',  models: 'Pixel Watch 3, 3 XL',                  icon: 'google',         color: '#4285F4', category: 'Global',  healthBridge: true  },
  { id: '37', name: 'TicWatch',     models: 'Pro 5 GPS, GTH Pro, E3',               icon: 'timer',          color: '#8B5CF6', category: 'Global',  healthBridge: true  },
  { id: '38', name: 'Amazfit Pro',  models: 'T-Rex 3, Cheetah Pro, Balance',        icon: 'rabbit',         color: '#06B6D4', category: 'Global',  healthBridge: true  },
  { id: '39', name: 'Wahoo',        models: 'TICKR X, ELEMNT Rival, Bolt',          icon: 'bike',           color: '#EF4444', category: 'Global',  healthBridge: true  },
  { id: '40', name: 'Casio',        models: 'G-Shock Move, ProTrek Smart',          icon: 'clock-digital',  color: '#F59E0B', category: 'Global',  healthBridge: true },
  { id: '41', name: 'TagHeuer',     models: 'Connected Calibre E4 45mm',            icon: 'crown',          color: '#94A3B8', category: 'Global',  healthBridge: true },
  { id: '42', name: 'Jabra',        models: 'Sport Life, Pulse, Coach',             icon: 'headphones',     color: '#3B82F6', category: 'Global',  healthBridge: true  },

  // ── Medical Grade (10) ──────────────────────────────────────────────────────
  { id: '43', name: 'Biostrap',     models: 'EVO, Wrist Band Pro',                  icon: 'dna',            color: '#10B981', category: 'Medical', healthBridge: true  },
  { id: '44', name: 'Empatica',     models: 'Embrace Plus, E4 Wristband',           icon: 'pulse',          color: '#8B5CF6', category: 'Medical', healthBridge: true },
  { id: '45', name: 'Masimo',       models: 'W1 Wrist, MightySat Rx',              icon: 'medical-bag',    color: '#EF4444', category: 'Medical', healthBridge: true },
  { id: '46', name: 'Zephyr',       models: 'BioHarness 3.0, StethoScope',         icon: 'chart-line',     color: '#3B82F6', category: 'Medical', healthBridge: true },
  { id: '47', name: 'Hexoskin',     models: 'Smart Shirt, Pro Kit',                 icon: 'account-heart',  color: '#F59E0B', category: 'Medical', healthBridge: true  },
  { id: '48', name: 'Actigraph',    models: 'wGT3X-BT, CentrePoint',               icon: 'chart-bar',      color: '#10B981', category: 'Medical', healthBridge: true },
  { id: '49', name: 'BioIntelliSense', models: 'BioSticker, BioButton',           icon: 'sticker-text',   color: '#06B6D4', category: 'Medical', healthBridge: true },
  { id: '50', name: 'Holter ECG',   models: 'Extended ECG, 14-Day Patch',          icon: 'heart-cog',      color: '#F59E0B', category: 'Medical', healthBridge: true },
  { id: '51', name: 'CardioNet',    models: 'MCOT Patch, BodyGuardian Mini',       icon: 'heart-flash',    color: '#EF4444', category: 'Medical', healthBridge: true },
  { id: '52', name: 'Zepp Health',  models: 'Zepp E, Z Pro, Hybrid',               icon: 'brain',          color: '#6366F1', category: 'Medical', healthBridge: true  },
];

const CATEGORY_ORDER = ['Indian', 'Global', 'Medical'];
const CATEGORY_LABELS = {
  Indian:  '🇮🇳 Indian Brands',
  Global:  '🌍 Global Brands',
  Medical: '🏥 Medical Grade',
};
const CATEGORY_COUNTS = {
  Indian:  '22 devices',
  Global:  '20 devices',
  Medical: '10 devices',
};

export default function DeviceHub() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [connectedDevice, setConnectedDevice] = useState('No Watch Paired');
  const [modalBrand, setModalBrand] = useState(null);
  
  // Local Database Permissions States
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [permSwitches, setPermSwitches] = useState({
    hrv: true,
    sleep: true,
    rhr: true,
    steps: true,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ── Open external smartwatch/wearable application ───────────────────────────
  const openWearableApp = async (brandName) => {
    if (!brandName) return;
    const name = brandName.toLowerCase();
    
    let scheme = '';
    let storeUrl = '';
    let webUrl = '';
    
    if (name.includes('noise')) {
      scheme = 'noisefit://';
      storeUrl = Platform.OS === 'ios' ? 'https://apps.apple.com/app/noisefit/id1481710954' : 'market://details?id=com.noisefit.activity';
      webUrl = Platform.OS === 'ios' ? 'https://apps.apple.com/app/noisefit/id1481710954' : 'https://play.google.com/store/apps/details?id=com.noisefit.activity';
    } else if (name.includes('garmin')) {
      scheme = 'gconnect://';
      storeUrl = Platform.OS === 'ios' ? 'https://apps.apple.com/app/garmin-connect/id585863432' : 'market://details?id=com.garmin.android.apps.connectmobile';
      webUrl = Platform.OS === 'ios' ? 'https://apps.apple.com/app/garmin-connect/id585863432' : 'https://play.google.com/store/apps/details?id=com.garmin.android.apps.connectmobile';
    } else if (name.includes('fitbit')) {
      scheme = 'fitbit://';
      storeUrl = Platform.OS === 'ios' ? 'https://apps.apple.com/app/fitbit-health-fitness/id462638897' : 'market://details?id=com.fitbit.FitbitMobile';
      webUrl = Platform.OS === 'ios' ? 'https://apps.apple.com/app/fitbit-health-fitness/id462638897' : 'https://play.google.com/store/apps/details?id=com.fitbit.FitbitMobile';
    } else if (name.includes('apple')) {
      scheme = 'x-apple-health://';
      storeUrl = 'x-apple-health://';
      webUrl = 'x-apple-health://';
    } else if (name.includes('samsung')) {
      scheme = Platform.OS === 'ios' ? 'galaxywearable://' : 'galaxywear://';
      storeUrl = Platform.OS === 'ios' ? 'https://apps.apple.com/app/samsung-galaxy-watch/id1117352504' : 'market://details?id=com.samsung.android.geargmanager';
      webUrl = Platform.OS === 'ios' ? 'https://apps.apple.com/app/samsung-galaxy-watch/id1117352504' : 'https://play.google.com/store/apps/details?id=com.samsung.android.geargmanager';
    } else {
      scheme = Platform.OS === 'ios' ? 'x-apple-health://' : 'https://play.google.com/store';
      storeUrl = Platform.OS === 'ios' ? 'x-apple-health://' : 'market://search?q=smartwatch';
      webUrl = Platform.OS === 'ios' ? 'x-apple-health://' : 'https://play.google.com/store/search?q=smartwatch&c=apps';
    }
    
    try {
      const canOpen = await Linking.canOpenURL(scheme);
      if (canOpen) {
        await Linking.openURL(scheme);
      } else {
        await Linking.openURL(storeUrl);
      }
    } catch (_) {
      try {
        await Linking.openURL(webUrl);
      } catch (__) {}
    }
  };

  // ── Open native OS Health Database settings panel ──────────────────────────
  const openSystemHealthDB = async () => {
    if (Platform.OS === 'ios') {
      try {
        await Linking.openURL('x-apple-health://');
      } catch (_) {}
    } else {
      const playStoreLink = 'market://details?id=com.google.android.apps.fitness';
      const webFallback = 'https://play.google.com/store/apps/details?id=com.google.android.apps.fitness';
      try {
        await Linking.openURL('vnd.google.fitness.tracking://');
      } catch (_) {
        try {
          await Linking.openURL(playStoreLink);
        } catch (__) {
          await Linking.openURL(webFallback);
        }
      }
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const fetchLinkState = () => {
      AsyncStorage.getItem('@biostability:user_watch_data').then(raw => {
        if (raw) {
          setConnectedDevice(`Noise ColorFit Pro (${user?.name || 'Archanaa'}'s Watch)`);
        } else {
          setConnectedDevice("No Watch Paired");
        }
      }).catch(() => {});
    };
    fetchLinkState();
    const interval = setInterval(fetchLinkState, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── 2-Column Grid filtering ──────────────────────────────────────────────────
  const sections = useMemo(() => {
    const q = query.toLowerCase();
    const pairBrands = (brands) => {
      const rows = [];
      for (let i = 0; i < brands.length; i += 2) {
        rows.push({ id: `row_${brands[i].id}`, left: brands[i], right: brands[i + 1] || null });
      }
      return rows;
    };

    if (q) {
      const filtered = BRANDS.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.models.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      );
      return filtered.length > 0
        ? [{ title: `Results for "${query}"`, data: pairBrands(filtered) }]
        : [];
    }
    return CATEGORY_ORDER.map((cat) => ({
      title: cat,
      data: pairBrands(BRANDS.filter((b) => b.category === cat)),
    }));
  }, [query]);

  // ── Connect brand flow ─────────────────────────────────────────────────────
  const handleConnect = (brand) => {
    setModalBrand(brand);
  };

  const handlePair = () => {
    setModalBrand(null);
    setPermissionModalOpen(true);
  };

  const toggleSwitch = (key) => {
    setPermSwitches(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTurnAllOn = () => {
    setPermSwitches({ hrv: true, sleep: true, rhr: true, steps: true });
  };

  const handleAllowPermissions = async () => {
    setPermissionModalOpen(false);
    setIsSyncing(true);

    const userId = user?.uid || 'uid_archanaa_123';
    setTimeout(async () => {
      try {
        await healthBridge.grantPermission(userId);
        setSyncSuccess(true);
        setIsSyncing(false);
        setConnectedDevice(`Noise ColorFit Pro (${user?.name || 'Archanaa'}'s Watch)`);
        
        setTimeout(() => {
          setSyncSuccess(false);
        }, 2000);
      } catch (e) {
        setIsSyncing(false);
      }
    }, 1800);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageSubtitle}>Local Database Bridge</Text>
        <Text style={styles.pageTitle}>Device Hub</Text>
      </View>

      {/* Connected device status bar */}
      <View style={styles.activeDeviceBar}>
        <View style={styles.pulseRow}>
          <View style={[styles.pulseDot, { backgroundColor: connectedDevice.includes('Noise') ? theme.colors.success : theme.colors.textMuted }]} />
          <Text style={styles.activeDeviceText}>Active Watch: {connectedDevice}</Text>
        </View>
        <View style={styles.healthTag}>
          <Text style={styles.healthTagText}>DATABASE SYNC</Text>
        </View>
      </View>

      {/* Syncing / Success overlays on main screen */}
      {isSyncing && (
        <View style={styles.loadingToast}>
          <ActivityIndicator size="small" color={theme.colors.accentCyan} />
          <Text style={styles.loadingToastText}>Syncing health database...</Text>
        </View>
      )}

      {syncSuccess && (
        <View style={styles.successToast}>
          <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.success} />
          <Text style={styles.successToastText}>Smartwatch linked successfully!</Text>
        </View>
      )}

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <MaterialCommunityIcons name="magnify" size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search 52+ devices..."
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        {!!query && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
            <MaterialCommunityIcons name="close-circle" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category stats (shown when not searching) */}
      {!query && (
        <View style={styles.categoryStatsRow}>
          {CATEGORY_ORDER.map((cat) => (
            <View key={cat} style={styles.statChip}>
              <Text style={styles.statChipLabel}>{CATEGORY_LABELS[cat]}</Text>
              <Text style={styles.statChipCount}>{CATEGORY_COUNTS[cat]}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Brands section list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {query ? section.title : CATEGORY_LABELS[section.title]}
            </Text>
            {!query && (
              <Text style={styles.sectionCount}>
                {section.data.length * 2 - (section.data[section.data.length - 1]?.right ? 0 : 1)} devices
              </Text>
            )}
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.brandRow}>
            <BrandCard
              brand={item.left}
              isConnected={connectedDevice.includes(item.left.name)}
              onConnect={() => handleConnect(item.left)}
            />
            {item.right ? (
              <BrandCard
                brand={item.right}
                isConnected={connectedDevice.includes(item.right.name)}
                onConnect={() => handleConnect(item.right)}
              />
            ) : (
              <View style={styles.brandCardPlaceholder} />
            )}
          </View>
        )}
        numColumns={undefined}
        renderSectionFooter={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="watch-remove" size={40} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No devices found for "{query}"</Text>
          </View>
        }
      />

      {/* Native Health Setup Instructions Modal */}
      <Modal
        visible={!!modalBrand}
        animationType="slide"
        transparent
        onRequestClose={() => setModalBrand(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.widgetSheet}>
            {/* Widget Header */}
            <View style={styles.widgetHeader}>
              <View style={styles.healthLogoRow}>
                <MaterialCommunityIcons name="heart-flash" size={18} color="#FF2D55" />
                <Text style={styles.healthLogoText}>Native Health Sync</Text>
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>100% FREE</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setModalBrand(null)}>
                <MaterialCommunityIcons name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Modal Content - Scrollable to fit all device heights */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }}>
              <View style={styles.brandDetailView}>
                {/* Brand icon */}
                <View style={[styles.brandIconLarge, { borderColor: `${modalBrand?.color}40` }]}>
                  {modalBrand?.name === 'Noise' ? (
                    <Image source={{ uri: USER_WATCH_URI }} style={styles.brandIconLargeImage} />
                  ) : (
                    <MaterialCommunityIcons
                      name={modalBrand?.icon || 'watch'}
                      size={40}
                      color={modalBrand?.color || theme.colors.accentCyan}
                    />
                  )}
                </View>
                <Text style={styles.brandDetailName}>{modalBrand?.name}</Text>
                <Text style={styles.brandDetailModels}>{modalBrand?.models}</Text>

                {/* Premium 3-Second Onboarding Guide Timeline */}
                <Text style={styles.instructionsHeadline}>⚡ 3-Second Instant Connection Guide</Text>
                <View style={styles.visualTimeline}>
                  {/* Step 1 - Interactive Deep Link */}
                  <TouchableOpacity 
                    style={styles.timelineItem} 
                    onPress={() => openWearableApp(modalBrand?.name)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineIconWrapper, { backgroundColor: 'rgba(6, 182, 212, 0.08)' }]}>
                        <MaterialCommunityIcons name="bluetooth" size={14} color={theme.colors.accentCyan} />
                      </View>
                      <View style={styles.timelineLine} />
                    </View>
                    <View style={styles.timelineRight}>
                      <Text style={styles.timelineStepTitle}>Step 1: Sync to Wearable App</Text>
                      <Text style={styles.timelineStepDesc}>Your physical watch automatically syncs steps via Bluetooth to the standard <Text style={{ color: theme.colors.accentCyan, fontWeight: '700' }}>{modalBrand?.name} Fit</Text> app. <Text style={{ color: theme.colors.accentCyan, fontWeight: '600', textDecorationLine: 'underline' }}>Tap to open app →</Text></Text>
                    </View>
                  </TouchableOpacity>

                  {/* Step 2 - Interactive System Health Deep Link */}
                  <TouchableOpacity 
                    style={styles.timelineItem} 
                    onPress={openSystemHealthDB}
                    activeOpacity={0.75}
                  >
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineIconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.08)' }]}>
                        <MaterialCommunityIcons name="sync" size={14} color={theme.colors.warning} />
                      </View>
                      <View style={styles.timelineLine} />
                    </View>
                    <View style={styles.timelineRight}>
                      <Text style={styles.timelineStepTitle}>Step 2: Share with Phone Health</Text>
                      <Text style={styles.timelineStepDesc}>In settings of your wearable app, turn on <Text style={{ color: theme.colors.warning, fontWeight: '700' }}>Sync with {Platform.OS === 'ios' ? 'Apple Health' : 'Google Fit'}</Text>. <Text style={{ color: theme.colors.warning, fontWeight: '600', textDecorationLine: 'underline' }}>Tap to configure →</Text></Text>
                    </View>
                  </TouchableOpacity>

                  {/* Step 3 */}
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineIconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
                        <MaterialCommunityIcons name="shield-check" size={14} color={theme.colors.success} />
                      </View>
                    </View>
                    <View style={styles.timelineRight}>
                      <Text style={styles.timelineStepTitle}>Step 3: One-Tap Secure Link</Text>
                      <Text style={styles.timelineStepDesc}>Tap the button below. BioStability automatically registers a private background sync worker that imports your biometrics securely.</Text>
                    </View>
                  </View>
                </View>

                {/* What will be synced */}
                <View style={styles.syncDataList}>
                  {['Daily Steps (Synced)', 'Heart Rate Parameters', 'Sleep Analysis', 'Battery Level (26%)'].map((d) => (
                    <View key={d} style={styles.syncDataRow}>
                      <MaterialCommunityIcons name="check" size={13} color={theme.colors.accentCyan} />
                      <Text style={styles.syncDataLabel}>{d}</Text>
                    </View>
                  ))}
                </View>

                {/* Connect button */}
                <TouchableOpacity onPress={handlePair} activeOpacity={0.85} style={styles.connectBtnWrap}>
                  <LinearGradient
                    colors={['#30D158', '#0A84FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.connectBtn}
                  >
                    <MaterialCommunityIcons name="heart-flash" size={16} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.connectBtnText}>Link Watch Database</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.widgetFooter}>
              <MaterialCommunityIcons name="shield-lock" size={12} color={theme.colors.textMuted} />
              <Text style={styles.widgetFooterText}>On-Device Sync · Safe, Local &amp; Private</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── STUNNING PIXEL-PERFECT IOS APPLE HEALTH PERMISSION SHEET ──────────────── */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={permissionModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setPermissionModalOpen(false)}
        >
          <View style={styles.iosModalBackdrop}>
            <View style={styles.iosSheet}>
              <View style={styles.iosHeader}>
                <TouchableOpacity onPress={() => setPermissionModalOpen(false)}>
                  <Text style={styles.iosCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.iosHeaderTitle}>Health</Text>
                <TouchableOpacity onPress={handleAllowPermissions}>
                  <Text style={styles.iosAllowText}>Allow</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={styles.iosBody}>
                  <View style={styles.iosAppHeader}>
                    <MaterialCommunityIcons name="heart-pulse" size={40} color={theme.colors.accentCyan} />
                    <Text style={styles.iosAppTitle}>BioStability</Text>
                    <Text style={styles.iosAppDesc}>
                      would like to access and update your health data in the categories below.
                    </Text>
                  </View>

                  <View style={styles.iosCategoryBox}>
                    <View style={styles.iosCatHeader}>
                      <Text style={styles.iosCatHeaderTitle}>ALLOW "BIOSTABILITY" TO READ:</Text>
                      <TouchableOpacity onPress={handleTurnAllOn}>
                        <Text style={styles.iosTurnAllText}>Turn All Categories On</Text>
                      </TouchableOpacity>
                    </View>

                    {/* HRV */}
                    <View style={styles.iosRow}>
                      <View style={styles.iosRowLeft}>
                        <MaterialCommunityIcons name="heart-flash" size={20} color="#FF3B30" />
                        <Text style={styles.iosRowLabel}>Heart Rate Variability</Text>
                      </View>
                      <Switch
                        value={permSwitches.hrv}
                        onValueChange={() => toggleSwitch('hrv')}
                        trackColor={{ false: '#3a3a3c', true: '#30D158' }}
                        thumbColor="#FFF"
                      />
                    </View>

                    {/* Resting Heart Rate */}
                    <View style={styles.iosRow}>
                      <View style={styles.iosRowLeft}>
                        <MaterialCommunityIcons name="heart-pulse" size={20} color="#FF2D55" />
                        <Text style={styles.iosRowLabel}>Resting Heart Rate</Text>
                      </View>
                      <Switch
                        value={permSwitches.rhr}
                        onValueChange={() => toggleSwitch('rhr')}
                        trackColor={{ false: '#3a3a3c', true: '#30D158' }}
                        thumbColor="#FFF"
                      />
                    </View>

                    {/* Sleep Analysis */}
                    <View style={styles.iosRow}>
                      <View style={styles.iosRowLeft}>
                        <MaterialCommunityIcons name="sleep" size={20} color="#5856D6" />
                        <Text style={styles.iosRowLabel}>Sleep Analysis</Text>
                      </View>
                      <Switch
                        value={permSwitches.sleep}
                        onValueChange={() => toggleSwitch('sleep')}
                        trackColor={{ false: '#3a3a3c', true: '#30D158' }}
                        thumbColor="#FFF"
                      />
                    </View>

                    {/* Steps */}
                    <View style={[styles.iosRow, { borderBottomWidth: 0 }]}>
                      <View style={styles.iosRowLeft}>
                        <MaterialCommunityIcons name="run" size={20} color="#FF9500" />
                        <Text style={styles.iosRowLabel}>Steps</Text>
                      </View>
                      <Switch
                        value={permSwitches.steps}
                        onValueChange={() => toggleSwitch('steps')}
                        trackColor={{ false: '#3a3a3c', true: '#30D158' }}
                        thumbColor="#FFF"
                      />
                    </View>
                  </View>

                  <Text style={styles.iosDisclaimer}>
                    BioStability accesses this data securely on your device. Your biometrics are protected under iOS native health policies and encrypted during local sync transfer.
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : (
        /* ── STUNNING PIXEL-PERFECT ANDROID HEALTH CONNECT PERMISSION DIALOG ──────────────── */
        <Modal
          visible={permissionModalOpen}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setPermissionModalOpen(false)}
        >
          <View style={styles.androidModalBackdrop}>
            <View style={styles.androidDialog}>
              <View style={styles.androidHeader}>
                <MaterialCommunityIcons name="google-fit" size={24} color="#4285F4" />
                <Text style={styles.androidHeaderTitle}>Google Fit</Text>
              </View>

              <Text style={styles.androidTitle}>Allow BioStability access?</Text>
              <Text style={styles.androidDesc}>
                BioStability will have direct access to read steps and heart rate parameters updated by Noise Fit.
              </Text>

              <View style={styles.androidList}>
                {/* Steps */}
                <View style={styles.androidRow}>
                  <View style={styles.androidRowLeft}>
                    <MaterialCommunityIcons name="run" size={20} color="#4285F4" />
                    <Text style={styles.androidRowLabel}>Read Steps</Text>
                  </View>
                  <Switch
                    value={permSwitches.steps}
                    onValueChange={() => toggleSwitch('steps')}
                    trackColor={{ false: 'rgba(255,255,255,0.08)', true: '#4285F4' }}
                    thumbColor="#FFF"
                  />
                </View>

                {/* Heart Rate */}
                <View style={styles.androidRow}>
                  <View style={styles.androidRowLeft}>
                    <MaterialCommunityIcons name="heart-pulse" size={20} color="#EA4335" />
                    <Text style={styles.androidRowLabel}>Read Heart Rate</Text>
                  </View>
                  <Switch
                    value={permSwitches.rhr}
                    onValueChange={() => toggleSwitch('rhr')}
                    trackColor={{ false: 'rgba(255,255,255,0.08)', true: '#4285F4' }}
                    thumbColor="#FFF"
                  />
                </View>

                {/* Sleep */}
                <View style={[styles.androidRow, { borderBottomWidth: 0 }]}>
                  <View style={styles.androidRowLeft}>
                    <MaterialCommunityIcons name="sleep" size={20} color="#34A853" />
                    <Text style={styles.androidRowLabel}>Read Sleep Data</Text>
                  </View>
                  <Switch
                    value={permSwitches.sleep}
                    onValueChange={() => toggleSwitch('sleep')}
                    trackColor={{ false: 'rgba(255,255,255,0.08)', true: '#4285F4' }}
                    thumbColor="#FFF"
                  />
                </View>
              </View>

              <View style={styles.androidActions}>
                <TouchableOpacity onPress={() => setPermissionModalOpen(false)}>
                  <Text style={styles.androidBtnDeny}>Deny</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.androidBtnAllowWrap} onPress={handleAllowPermissions}>
                  <Text style={styles.androidBtnAllow}>Allow</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Animated.View>
  );
}

// BrandCard Component
function BrandCard({ brand, isConnected, onConnect }) {
  return (
    <View style={[styles.brandCard, isConnected && styles.brandCardActive]}>
      <View style={styles.brandCardTop}>
        {/* Icon */}
        <View style={[styles.brandIconBg, { borderColor: `${brand.color}35` }]}>
          {brand.name === 'Noise' ? (
            <Image source={{ uri: USER_WATCH_URI }} style={styles.brandWatchThumbnail} />
          ) : (
            <MaterialCommunityIcons name={brand.icon} size={26} color={brand.color} />
          )}
        </View>

        {/* Status */}
        {isConnected ? (
          <View style={styles.connectedBadge}>
            <View style={styles.connectedDot} />
            <Text style={styles.connectedText}>Synced</Text>
          </View>
        ) : brand.healthBridge ? (
          <View style={styles.healthBadgeSmall}>
            <Text style={styles.healthBadgeSmallText}>Local</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.brandCardName} numberOfLines={1}>{brand.name}</Text>
      <Text style={styles.brandCardModels} numberOfLines={2}>{brand.models}</Text>

      <TouchableOpacity
        style={[styles.connectCardBtn, isConnected && styles.connectCardBtnActive]}
        onPress={onConnect}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={isConnected ? 'check' : 'plus'}
          size={13}
          color={isConnected ? theme.colors.success : theme.colors.accentCyan}
        />
        <Text style={[styles.connectCardBtnText, isConnected && { color: theme.colors.success }]}>
          {isConnected ? 'Linked' : 'Link'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgPrimary },

  header: { paddingHorizontal: 16, paddingTop: 14, marginBottom: 12 },
  pageSubtitle: {
    fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  pageTitle: { fontSize: 26, fontWeight: '900', color: theme.colors.textPrimary, marginTop: 2 },

  // Active device bar
  activeDeviceBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(48, 209, 88, 0.06)',
    borderWidth: 1, borderColor: 'rgba(48, 209, 88, 0.15)',
    marginHorizontal: 16, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12,
  },
  pulseRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  pulseDot: { width: 7, height: 7, borderRadius: 3.5 },
  activeDeviceText: { fontSize: 12, color: theme.colors.textPrimary, fontWeight: '700' },
  healthTag: {
    backgroundColor: 'rgba(48, 209, 88, 0.1)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  healthTagText: { fontSize: 8, color: '#30D158', fontWeight: '850', letterSpacing: 0.5 },

  // Toasts
  loadingToast: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(6,182,212,0.08)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)',
    borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginHorizontal: 16, marginBottom: 12,
  },
  loadingToastText: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' },
  successToast: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
    borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginHorizontal: 16, marginBottom: 12,
  },
  successToastText: { fontSize: 11, color: theme.colors.success, fontWeight: '700' },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12, paddingHorizontal: 12, marginHorizontal: 16, marginBottom: 10, height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: theme.colors.textPrimary, fontSize: 14 },
  clearBtn: { padding: 4 },

  // Category stats
  categoryStatsRow: {
    flexDirection: 'row', gap: 6, paddingHorizontal: 16, marginBottom: 8,
  },
  statChip: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8, padding: 8, alignItems: 'center',
  },
  statChipLabel: { fontSize: 8, color: theme.colors.textMuted, fontWeight: '700', textAlign: 'center' },
  statChipCount: { fontSize: 11, color: theme.colors.accentCyan, fontWeight: '800', marginTop: 2 },

  // Section list
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 14, marginBottom: 8,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.textPrimary },
  sectionCount: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '600' },

  brandRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  brandCard: {
    flex: 1,
    backgroundColor: 'rgba(18, 27, 46, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 12,
  },
  brandCardPlaceholder: {
    flex: 1,
  },
  brandCardActive: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  brandCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  brandIconBg: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  connectedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  connectedDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: theme.colors.success },
  connectedText: { fontSize: 8, color: theme.colors.success, fontWeight: '800' },
  healthBadgeSmall: {
    backgroundColor: 'rgba(48, 209, 88, 0.08)', borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 3,
  },
  healthBadgeSmallText: { fontSize: 8, color: '#30D158', fontWeight: '700' },
  brandCardName: { fontSize: 13, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 3 },
  brandCardModels: { fontSize: 9, color: theme.colors.textMuted, lineHeight: 13, marginBottom: 10 },
  connectCardBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(6, 182, 212, 0.25)',
    backgroundColor: 'rgba(6, 182, 212, 0.06)', borderRadius: 7, paddingVertical: 6,
  },
  connectCardBtnActive: {
    borderColor: 'rgba(16, 185, 129, 0.25)',
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  connectCardBtnText: { fontSize: 10, color: theme.colors.accentCyan, fontWeight: '800' },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: theme.colors.textMuted, textAlign: 'center' },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  widgetSheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.18)',
    paddingTop: 16, paddingHorizontal: 20, paddingBottom: 32, minHeight: '74%',
  },
  widgetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
    marginBottom: 20,
  },
  healthLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  healthLogoText: { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  freeBadge: {
    backgroundColor: 'rgba(48, 209, 88, 0.1)', borderWidth: 1,
    borderColor: 'rgba(48, 209, 88, 0.2)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2,
  },
  freeBadgeText: { fontSize: 7, color: '#30D158', fontWeight: '850', letterSpacing: 0.5 },

  // Brand detail
  brandDetailView: { alignItems: 'center', paddingTop: 4 },
  brandIconLarge: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  brandDetailName: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  brandDetailModels: { fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 12 },
  
  instructionsHeadline: {
    alignSelf: 'flex-start', fontSize: 12, fontWeight: '800',
    color: theme.colors.textSecondary, textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 8, marginTop: 8,
  },
  instructionStepCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, padding: 12, gap: 10, marginBottom: 16,
  },
  stepText: {
    fontSize: 11.5, color: theme.colors.textSecondary, lineHeight: 16,
  },

  // Premium Onboarding Timeline
  visualTimeline: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  timelineIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 4,
    minHeight: 18,
  },
  timelineRight: {
    flex: 1,
    paddingTop: 1,
  },
  timelineStepTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2,
  },
  timelineStepDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15,
  },

  syncDataList: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10, padding: 12, marginBottom: 20, gap: 8,
  },
  syncDataRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  syncDataLabel: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
  connectBtnWrap: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  connectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 15,
  },
  connectBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },

  // Widget footer
  widgetFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 14, marginTop: 16,
  },
  widgetFooterText: { fontSize: 10, color: theme.colors.textMuted },
  brandWatchThumbnail: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  brandIconLargeImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  // iOS Native Styling Modal Sheets
  iosModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  iosSheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    height: '84%',
    paddingBottom: 32,
  },
  iosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  iosCancelText: {
    color: '#0A84FF',
    fontSize: 16,
  },
  iosHeaderTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  iosAllowText: {
    color: '#30D158',
    fontSize: 16,
    fontWeight: '600',
  },
  iosBody: {
    padding: 16,
  },
  iosAppHeader: {
    alignItems: 'center',
    marginVertical: 12,
  },
  iosAppTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  iosAppDesc: {
    color: '#8E8E93',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  iosCategoryBox: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    marginTop: 20,
    overflow: 'hidden',
  },
  iosCatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#1C1C1E',
  },
  iosCatHeaderTitle: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
  },
  iosTurnAllText: {
    color: '#0A84FF',
    fontSize: 11,
    fontWeight: '600',
  },
  iosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  iosRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iosRowLabel: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
  },
  iosDisclaimer: {
    color: '#8E8E93',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 15,
    paddingHorizontal: 16,
  },

  // Android Native Styling dialog
  androidModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidDialog: {
    backgroundColor: '#202124',
    borderRadius: 28,
    width: '86%',
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  androidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  androidHeaderTitle: {
    color: '#E8EAED',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  androidTitle: {
    color: '#E8EAED',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  androidDesc: {
    color: '#9AA0A6',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
  },
  androidList: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  androidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  androidRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  androidRowLabel: {
    color: '#E8EAED',
    fontSize: 14,
    fontWeight: '600',
  },
  androidActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
    marginTop: 10,
  },
  androidBtnDeny: {
    color: '#8AB4F8',
    fontSize: 14,
    fontWeight: '700',
    padding: 8,
  },
  androidBtnAllowWrap: {
    backgroundColor: '#8AB4F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  androidBtnAllow: {
    color: '#202124',
    fontSize: 14,
    fontWeight: '700',
  },
});
