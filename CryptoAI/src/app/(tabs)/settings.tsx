import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ProfileHeaderCard } from '../../components/settings/ProfileHeaderCard';
import { ThemeSelectorCard } from '../../components/settings/ThemeSelectorCard';
import { LanguageSelectorCard } from '../../components/settings/LanguageSelectorCard';
import { SecuritySettingsCard } from '../../components/settings/SecuritySettingsCard';
import { AcademicThesisCard } from '../../components/settings/AcademicThesisCard';

export default function SettingsScreen() {
  const { user, logout, toggleBiometrics, loginDemoUser } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmLogout = typeof window !== 'undefined'
        ? window.confirm('Oturumu kapatıp giriş ekranına dönmek istiyor musunuz?')
        : true;
      if (confirmLogout) {
        await logout();
        router.replace('/(auth)/login');
      }
      return;
    }

    Alert.alert(
      t('logout'),
      'Oturumu kapatıp giriş ekranına dönmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Header />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ProfileHeaderCard user={user} />
        <ThemeSelectorCard />
        <SecuritySettingsCard user={user} onToggleBiometrics={toggleBiometrics} />
        <LanguageSelectorCard />
        <AcademicThesisCard />

        <TouchableOpacity
          onPress={loginDemoUser}
          style={[styles.demoSwitchBtn, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={16} color={colors.primary} />
          <Text style={[styles.demoSwitchText, { color: colors.primary }]}>
            Demo Değerlendirme Hesabını Yükle
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutBtn, { backgroundColor: colors.bearishMuted }]}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.bearish} />
          <Text style={[styles.logoutBtnText, { color: colors.bearish }]}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  demoSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  demoSwitchText: {
    fontSize: 13,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
