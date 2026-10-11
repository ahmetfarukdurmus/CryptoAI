import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CryptoAsset } from '../../types/crypto';
import { useTheme } from '../../context/ThemeContext';

export type Timeframe = '15m' | '1h' | '4h' | '1D';

interface Props {
  coin: CryptoAsset;
  timeframe: Timeframe;
  onSelectTimeframe: (tf: Timeframe) => void;
}

export const CoinPriceHero: React.FC<Props> = ({ coin, timeframe, onSelectTimeframe }) => {
  const { colors } = useTheme();
  const isPositive = coin.change24h >= 0;

  return (
    <View style={styles.priceHero}>
      <View>
        <Text style={[styles.mainPrice, { color: colors.textPrimary }]}>
          ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <View style={styles.heroChangeRow}>
          <View
            style={[
              styles.heroChangeBadge,
              { backgroundColor: isPositive ? colors.bullishMuted : colors.bearishMuted },
            ]}
          >
            <Ionicons
              name={isPositive ? 'arrow-up' : 'arrow-down'}
              size={12}
              color={isPositive ? colors.bullish : colors.bearish}
            />
            <Text style={[styles.heroChangeText, { color: isPositive ? colors.bullish : colors.bearish }]}>
              {isPositive ? '+' : ''}{coin.change24h.toFixed(2)}%
            </Text>
          </View>
          <Text style={[styles.timeframeText, { color: colors.textMuted }]}>Bugün (24s)</Text>
        </View>
      </View>

      <View style={[styles.timeframeContainer, { backgroundColor: colors.cardBgElevated }]}>
        {(['15m', '1h', '4h', '1D'] as Timeframe[]).map((tf) => {
          const active = timeframe === tf;
          return (
            <TouchableOpacity
              key={tf}
              onPress={() => onSelectTimeframe(tf)}
              style={[styles.tfBtn, active && { backgroundColor: colors.primary }]}
            >
              <Text
                style={[
                  styles.tfBtnText,
                  { color: active ? colors.background : colors.textSecondary },
                  active && styles.tfBtnTextActive,
                ]}
              >
                {tf}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  priceHero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  mainPrice: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  heroChangeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeframeText: {
    fontSize: 11,
  },
  timeframeContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 3,
  },
  tfBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tfBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tfBtnTextActive: {
    fontWeight: '700',
  },
});
