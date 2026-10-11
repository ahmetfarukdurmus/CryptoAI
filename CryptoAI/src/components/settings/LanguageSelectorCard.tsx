import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export const LanguageSelectorCard: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="language-outline" size={18} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('app_language')}</Text>
      </View>
      <View style={styles.optionsRow}>
        <TouchableOpacity
          onPress={() => setLanguage('tr')}
          style={[
            styles.langOption,
            {
              backgroundColor: language === 'tr' ? colors.primaryMuted : colors.cardBgElevated,
              borderColor: language === 'tr' ? colors.primary : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.langText,
              { color: language === 'tr' ? colors.textPrimary : colors.textSecondary },
              language === 'tr' && styles.langTextActive,
            ]}
          >
            🇹🇷 Türkçe (Varsayılan)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLanguage('en')}
          style={[
            styles.langOption,
            {
              backgroundColor: language === 'en' ? colors.primaryMuted : colors.cardBgElevated,
              borderColor: language === 'en' ? colors.primary : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.langText,
              { color: language === 'en' ? colors.textPrimary : colors.textSecondary },
              language === 'en' && styles.langTextActive,
            ]}
          >
            🇬🇧 English (Global)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  langOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
  },
  langTextActive: {
    fontWeight: '700',
  },
});
