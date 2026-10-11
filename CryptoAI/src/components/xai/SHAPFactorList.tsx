import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AISignal } from '../../types/crypto';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  signal: AISignal;
}

export const SHAPFactorList: React.FC<Props> = ({ signal }) => {
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Reasoning Section (Why AI took this decision) */}
      <View style={styles.reasoningSection}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="bulb-outline" size={16} color={colors.primary} />
          <Text style={[styles.reasoningTitle, { color: colors.textPrimary }]}>{t('reasoning_title')}</Text>
        </View>
        {signal.reasoning.map((reason, index) => (
          <View key={index} style={styles.reasonItem}>
            <Ionicons name="checkmark-circle-outline" size={14} color={colors.bullish} style={styles.bulletIcon} />
            <Text style={[styles.reasonText, { color: colors.textSecondary }]}>{reason}</Text>
          </View>
        ))}
      </View>

      {/* Indicators Breakdown */}
      <View style={[styles.indicatorsSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.indicatorsTitle, { color: colors.textPrimary }]}>{t('technical_indicators')}</Text>
        <View style={styles.indicatorsGrid}>
          <View style={[styles.indicatorPill, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}>
            <Text style={[styles.indLabel, { color: colors.textMuted }]}>RSI (14)</Text>
            <Text
              style={[
                styles.indValue,
                {
                  color:
                    signal.indicators.rsi < 35
                      ? colors.bullish
                      : signal.indicators.rsi > 70
                      ? colors.bearish
                      : colors.textPrimary,
                },
              ]}
            >
              {signal.indicators.rsi}
            </Text>
          </View>

          <View style={[styles.indicatorPill, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}>
            <Text style={[styles.indLabel, { color: colors.textMuted }]}>NLP Duygu</Text>
            <Text style={[styles.indValue, { color: colors.primary }]}>
              %{signal.indicators.sentimentScore} Pozitif
            </Text>
          </View>

          <View style={[styles.indicatorPill, styles.fullWidth, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}>
            <Text style={[styles.indLabel, { color: colors.textMuted }]}>MACD Durumu</Text>
            <Text style={[styles.indValue, { color: colors.textPrimary }]}>{signal.indicators.macd}</Text>
          </View>

          <View style={[styles.indicatorPill, styles.fullWidth, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}>
            <Text style={[styles.indLabel, { color: colors.textMuted }]}>Bollinger Bantları</Text>
            <Text style={[styles.indValue, { color: colors.textPrimary }]}>{signal.indicators.bollinger}</Text>
          </View>

          <View style={[styles.indicatorPill, styles.fullWidth, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}>
            <Text style={[styles.indLabel, { color: colors.textMuted }]}>EMA Trend</Text>
            <Text style={[styles.indValue, { color: colors.textPrimary }]}>{signal.indicators.emaTrend}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  reasoningSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  reasoningTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingLeft: 4,
  },
  bulletIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  reasonText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  indicatorsSection: {
    paddingTop: 14,
    borderTopWidth: 1,
  },
  indicatorsTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  indicatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  indicatorPill: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    width: '48%',
  },
  fullWidth: {
    width: '100%',
  },
  indLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  indValue: {
    fontSize: 12,
    fontWeight: '700',
  },
});
