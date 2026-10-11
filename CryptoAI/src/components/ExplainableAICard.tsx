import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AISignal } from '../types/crypto';
import { SignalBadge } from './SignalBadge';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { ConfidenceGauge } from './xai/ConfidenceGauge';
import { SHAPFactorList } from './xai/SHAPFactorList';

interface ExplainableAICardProps {
  signal: AISignal;
  currentPrice: number;
}

export const ExplainableAICard: React.FC<ExplainableAICardProps> = ({ signal, currentPrice }) => {
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.aiIconBadge, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name="hardware-chip" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('explainable_ai')}</Text>
        </View>
        <SignalBadge action={signal.action} confidence={signal.confidence} />
      </View>

      <ConfidenceGauge signal={signal} currentPrice={currentPrice} />
      <SHAPFactorList signal={signal} />
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
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
});
