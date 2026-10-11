import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AutopilotConfig } from '../../types/crypto';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  config: AutopilotConfig;
  onUpdate: (newConfig: Partial<AutopilotConfig>) => void;
}

export const RiskConfigSliders: React.FC<Props> = ({ config, onUpdate }) => {
  const { t } = useLanguage();
  const { colors } = useTheme();

  const tradeRatioOptions = [0.10, 0.15, 0.20, 0.25];
  const maxPositionsOptions = [2, 3, 4, 5];
  const minConfidenceOptions = [70, 75, 80, 85];

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={styles.sectionHeader}>
        <Ionicons name="options-outline" size={18} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('risk_settings')}</Text>
      </View>

      {/* 1. Max Balance Ratio per trade */}
      <View style={styles.settingBlock}>
        <View style={styles.settingLabelRow}>
          <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>{t('max_trade_ratio')}</Text>
          <Text style={[styles.settingValue, { color: colors.primary }]}>%{Math.round(config.maxTradeRatio * 100)}</Text>
        </View>
        <View style={styles.optionsRow}>
          {tradeRatioOptions.map((ratio) => {
            const active = config.maxTradeRatio === ratio;
            return (
              <TouchableOpacity
                key={ratio}
                onPress={() => onUpdate({ maxTradeRatio: ratio })}
                style={[
                  styles.optionPill,
                  {
                    backgroundColor: active ? colors.primaryMuted : colors.cardBgElevated,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: active ? colors.primary : colors.textSecondary, fontWeight: active ? '700' : '600' }]}>
                  %{Math.round(ratio * 100)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. Max Open Positions */}
      <View style={styles.settingBlock}>
        <View style={styles.settingLabelRow}>
          <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>{t('max_positions')}</Text>
          <Text style={[styles.settingValue, { color: colors.primary }]}>{config.maxOpenPositions} Pozisyon</Text>
        </View>
        <View style={styles.optionsRow}>
          {maxPositionsOptions.map((count) => {
            const active = config.maxOpenPositions === count;
            return (
              <TouchableOpacity
                key={count}
                onPress={() => onUpdate({ maxOpenPositions: count })}
                style={[
                  styles.optionPill,
                  {
                    backgroundColor: active ? colors.primaryMuted : colors.cardBgElevated,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: active ? colors.primary : colors.textSecondary, fontWeight: active ? '700' : '600' }]}>
                  {count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Minimum Confidence Threshold */}
      <View style={styles.settingBlock}>
        <View style={styles.settingLabelRow}>
          <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>{t('min_confidence')}</Text>
          <Text style={[styles.settingValue, { color: colors.primary }]}>%{config.minConfidence}</Text>
        </View>
        <View style={styles.optionsRow}>
          {minConfidenceOptions.map((conf) => {
            const active = config.minConfidence === conf;
            return (
              <TouchableOpacity
                key={conf}
                onPress={() => onUpdate({ minConfidence: conf })}
                style={[
                  styles.optionPill,
                  {
                    backgroundColor: active ? colors.primaryMuted : colors.cardBgElevated,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: active ? colors.primary : colors.textSecondary, fontWeight: active ? '700' : '600' }]}>
                  %{conf}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 4. Auto Take-Profit & Stop-Loss */}
      <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Otomatik Kâr Al (Take-Profit)</Text>
          <Text style={[styles.switchSublabel, { color: colors.textMuted }]}>Hedef fiyata ulaşıldığında kârı realize et</Text>
        </View>
        <Switch
          value={config.autoTakeProfit}
          onValueChange={(val) => onUpdate({ autoTakeProfit: val })}
          trackColor={{ false: colors.border, true: colors.bullish }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
        <View>
          <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>Otomatik Zarar Kes (Stop-Loss)</Text>
          <Text style={[styles.switchSublabel, { color: colors.textMuted }]}>Risk sınırına ulaşıldığında sermayeyi koru</Text>
        </View>
        <Switch
          value={config.autoStopLoss}
          onValueChange={(val) => onUpdate({ autoStopLoss: val })}
          trackColor={{ false: colors.border, true: colors.bullish }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingBlock: {
    marginBottom: 16,
  },
  settingLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  optionText: {
    fontSize: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  switchSublabel: {
    fontSize: 11,
  },
});
