import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export const AcademicThesisCard: React.FC = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();

  const details = [
    { label: 'Veri Kaynakları', val: 'Binance WebSocket, Yahoo Finance, Kaggle' },
    { label: 'Makine Öğrenmesi', val: 'XGBoost & LightGBM Sınıflandırıcılar' },
    { label: 'Duygu Analizi (NLP)', val: 'Kripto Haber & Korku/Açgözlülük İndeksi' },
    { label: 'Backend & Servisler', val: 'ASP.NET Core C#, Python FastAPI, SignalR' },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="school-outline" size={18} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('academic_info')}</Text>
      </View>
      <Text style={[styles.lead, { color: colors.textSecondary }]}>
        Yapay Zeka Destekli Kripto Para Karar Destek ve Otopilot Portföy Simülasyon Sistemi
      </Text>

      <View style={styles.grid}>
        {details.map((item, idx) => (
          <View
            key={idx}
            style={[
              styles.item,
              { backgroundColor: colors.cardBgElevated, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.itemLabel, { color: colors.primary }]}>{item.label}</Text>
            <Text style={[styles.itemVal, { color: colors.textPrimary }]}>{item.val}</Text>
          </View>
        ))}
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
  lead: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 18,
  },
  grid: {
    gap: 10,
  },
  item: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  itemVal: {
    fontSize: 12,
  },
});
