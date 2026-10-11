import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { colors, isDark, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/settings');
  };

  const getInitials = () => {
    if (!user) return 'AI';
    if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return user.name.slice(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      {/* Brand & Status */}
      <View style={styles.brandContainer}>
        <View style={styles.logoRow}>
          <View style={[styles.pulseDot, { backgroundColor: colors.bullish }]} />
          <Text style={[styles.brandName, { color: colors.textPrimary }]}>
            Crypto<Text style={{ color: colors.primary }}>AI</Text>
          </Text>
          <View style={[styles.tag, { backgroundColor: colors.cardBgElevated, borderColor: colors.borderLight }]}>
            <Text style={[styles.tagText, { color: colors.textSecondary }]}>SDK 57</Text>
          </View>
        </View>
        <Text style={[styles.subtext, { color: colors.textMuted }]}>Karar Destek & Otopilot Sistemi</Text>
      </View>

      {/* Actions: Theme Toggle, Language & User */}
      <View style={styles.actionsContainer}>
        {/* Quick Theme Toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.iconActionBtn, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={16}
            color={colors.primary}
          />
        </TouchableOpacity>

        {/* Language switch */}
        <TouchableOpacity
          onPress={toggleLanguage}
          style={[styles.langBtn, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}
        >
          <Ionicons name="globe-outline" size={13} color={colors.primary} />
          <Text style={[styles.langText, { color: colors.textPrimary }]}>{language.toUpperCase()}</Text>
        </TouchableOpacity>

        {/* Profile Avatar */}
        <TouchableOpacity
          onPress={handleProfilePress}
          style={[styles.avatarBtn, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {getInitials()}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  brandContainer: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  subtext: {
    fontSize: 11,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
  },
  avatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
