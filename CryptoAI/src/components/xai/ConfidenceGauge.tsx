import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AISignal } from '../../types/crypto';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  signal: AISignal;
  currentPrice: number;
}

export const ConfidenceGauge: React.FC<Props> = ({ signal, currentPrice }) => {
  const { t } = useLanguage();
  const { colors } = useTheme();

  // Canlı fiyata göre dinamik hesaplanan hedefler (+%5 Take-Profit, -%3 Stop-Loss)
  const dynamicTakeProfit = currentPrice * 1.05;
  const dynamicStopLoss = currentPrice * 0.97;
  const dynamicSupport = currentPrice * 0.98;
  const dynamicResistance = currentPrice * 1.03;

  const formatPrice = (val: number) =>
    val < 1
      ? `$${val.toFixed(4)}`
      : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <View style={styles.container}>
      {/* Confidence Bar */}
      <View style={styles.confidenceSection}>
        <View style={styles.confidenceHeader}>
          <Text style={[styles.confidenceLabel, { color: colors.textSecondary }]}>{t('ai_confidence')}</Text>
          <Text style={[styles.confidenceValue, { color: colors.primary }]}>%{signal.confidence}</Text>
        </View>
        <View style={[styles.progressBarBackground, { backgroundColor: colors.cardBgElevated }]}>
          <View style={[styles.progressBarFill, { width: `${signal.confidence}%`, backgroundColor: colors.primary }]} />
        </View>
      </View>

      {/* Targets (Take-Profit & Stop-Loss) */}
      <View style={styles.targetsGrid}>
        <View style={[styles.targetBox, { backgroundColor: colors.bullishMuted, borderColor: colors.bullish }]}>
          <View style={styles.targetIconRow}>
            <Ionicons name="flag" size={14} color={colors.bullish} />
            <Text style={[styles.targetLabel, { color: colors.bullish }]}>{t('take_profit')}</Text>
          </View>
          <Text style={[styles.targetPrice, { color: colors.textPrimary }]}>{formatPrice(dynamicTakeProfit)}</Text>
          <Text style={[styles.targetPercent, { color: colors.bullish }]}>+5.0% Potansiyel</Text>
        </View>

        <View style={[styles.targetBox, { backgroundColor: colors.bearishMuted, borderColor: colors.bearish }]}>
          <View style={styles.targetIconRow}>
            <Ionicons name="shield" size={14} color={colors.bearish} />
            <Text style={[styles.targetLabel, { color: colors.bearish }]}>{t('stop_loss')}</Text>
          </View>
          <Text style={[styles.targetPrice, { color: colors.textPrimary }]}>{formatPrice(dynamicStopLoss)}</Text>
          <Text style={[styles.slPercent, { color: colors.bearish }]}>-3.0% Risk Sınırı</Text>
        </View>
      </View>

      {/* Support & Resistance */}
      <View style={[styles.levelsRow, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}>
        <View style={styles.levelItem}>
          <Text style={[styles.levelLabel, { color: colors.textMuted }]}>{t('support')}</Text>
          <Text style={[styles.levelValue, { color: colors.bullish }]}>{formatPrice(dynamicSupport)}</Text>
        </View>
        <View style={[styles.levelDivider, { backgroundColor: colors.border }]} />
        <View style={styles.levelItem}>
          <Text style={[styles.levelLabel, { color: colors.textMuted }]}>{t('resistance')}</Text>
          <Text style={[styles.levelValue, { color: colors.bearish }]}>{formatPrice(dynamicResistance)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  confidenceSection: {
    marginBottom: 14,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  targetsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  targetBox: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  targetIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  targetPrice: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  targetPercent: {
    fontSize: 10,
    fontWeight: '600',
  },
  slPercent: {
    fontSize: 10,
    fontWeight: '600',
  },
  levelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  levelItem: {
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  levelValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  levelDivider: {
    width: 1,
    height: 24,
  },
});
