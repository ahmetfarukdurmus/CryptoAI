import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Position, CryptoAsset } from '../../types/crypto';
import { useTheme } from '../../context/ThemeContext';

interface AssetHoldingCardProps {
  position: Position;
  coin?: CryptoAsset;
  totalPortfolioValue: number;
  onTradePress: (coin: CryptoAsset) => void;
}

export const AssetHoldingCard: React.FC<AssetHoldingCardProps> = memo(({
  position,
  coin,
  totalPortfolioValue,
  onTradePress,
}) => {
  const { colors, isDark } = useTheme();

  const currentPrice = coin ? coin.price : position.currentPrice;
  const holdingValue = Number((position.amount * currentPrice).toFixed(2));
  const totalCost = position.totalCost;
  const pnlUsd = Number((holdingValue - totalCost).toFixed(2));
  const pnlPercent = totalCost > 0 ? Number(((pnlUsd / totalCost) * 100).toFixed(2)) : 0;
  const isProfit = pnlUsd >= 0;

  // Portföy içindeki ağırlığı (%)
  const portfolioWeight =
    totalPortfolioValue > 0
      ? Math.min(100, (holdingValue / totalPortfolioValue) * 100).toFixed(1)
      : '0.0';

  const formatPrice = (val: number) =>
    val < 1
      ? `$${val.toFixed(4)}`
      : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleTrade = () => {
    if (coin) {
      onTradePress(coin);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.82)' : colors.cardBg,
          borderColor: isDark ? 'rgba(51, 65, 85, 0.7)' : colors.border,
        },
      ]}
    >
      {/* 1. ÜST SATIR: Coin Amblemi, Adı, Sembolü ve Portföy Ağırlık Rozeti */}
      <View style={styles.topRow}>
        <View style={styles.assetIdentity}>
          <View
            style={[
              styles.symbolCircle,
              {
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : colors.cardBgElevated,
                borderColor: isDark ? 'rgba(0, 242, 254, 0.3)' : colors.border,
              },
            ]}
          >
            <Text style={[styles.symbolText, { color: isDark ? '#FFFFFF' : colors.textPrimary }]}>
              {position.symbol.slice(0, 4)}
            </Text>
          </View>

          <View style={styles.nameBlock}>
            <View style={styles.symbolNameRow}>
              <Text style={[styles.coinSymbol, { color: isDark ? '#FFFFFF' : colors.textPrimary }]}>
                {position.symbol}
              </Text>
              <Text style={[styles.coinName, { color: colors.textMuted }]} numberOfLines={1}>
                {position.name || position.symbol}
              </Text>
            </View>
            <Text style={[styles.livePriceSub, { color: colors.textSecondary }]}>
              Piyasa: <Text style={{ color: isDark ? '#E2E8F0' : colors.textPrimary, fontWeight: '700' }}>{formatPrice(currentPrice)}</Text>
            </Text>
          </View>
        </View>

        {/* Portföy Ağırlığı Rozeti */}
        <View style={[styles.weightPill, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : colors.inputBg }]}>
          <Text style={[styles.weightText, { color: colors.primary }]}>%{portfolioWeight} Portföy</Text>
        </View>
      </View>

      {/* 2. ORTA DETAY TABLOSU: Miktar, Ortalama Maliyet ve Toplam Varlık Değeri */}
      <View
        style={[
          styles.metricsBox,
          {
            backgroundColor: isDark ? 'rgba(2, 6, 23, 0.55)' : colors.cardBgElevated,
            borderColor: isDark ? 'rgba(30, 41, 59, 0.8)' : colors.border,
          },
        ]}
      >
        <View style={styles.metricCol}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Varlık Miktarı</Text>
          <Text style={[styles.metricValue, { color: isDark ? '#FFFFFF' : colors.textPrimary }]}>
            {position.amount} {position.symbol}
          </Text>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

        <View style={styles.metricCol}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Ortalama Maliyet</Text>
          <Text style={[styles.metricValue, { color: isDark ? '#FFFFFF' : colors.textPrimary }]}>
            {formatPrice(position.entryPrice)}
          </Text>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

        <View style={[styles.metricCol, { alignItems: 'flex-end' }]}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Piyasa Değeri</Text>
          <Text style={[styles.metricValueBold, { color: colors.primary }]}>
            ${holdingValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      {/* 3. ALT SATIR: Canlı Kâr/Zarar (P&L) ve Hızlı "Al / Sat" Aksiyon Butonu */}
      <View style={styles.bottomRow}>
        <View style={styles.pnlGroup}>
          <Text style={[styles.pnlLabel, { color: colors.textMuted }]}>Anlık Net Kâr/Zarar:</Text>
          <View style={styles.pnlValuesRow}>
            <Text style={[styles.pnlUsdText, { color: isProfit ? colors.bullish : colors.bearish }]}>
              {isProfit ? '+' : ''}${pnlUsd.toFixed(2)} USDT
            </Text>
            <View
              style={[
                styles.pnlPercentBadge,
                { backgroundColor: isProfit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' },
              ]}
            >
              <Ionicons
                name={isProfit ? 'arrow-up' : 'arrow-down'}
                size={10}
                color={isProfit ? colors.bullish : colors.bearish}
              />
              <Text style={[styles.pnlPercentText, { color: isProfit ? colors.bullish : colors.bearish }]}>
                {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        {coin && (
          <TouchableOpacity
            onPress={handleTrade}
            activeOpacity={0.75}
            style={[
              styles.tradeBtn,
              {
                backgroundColor: colors.primaryMuted,
                borderColor: colors.primary,
              },
            ]}
          >
            <Ionicons name="swap-horizontal" size={13} color={colors.primary} />
            <Text style={[styles.tradeBtnText, { color: colors.primary }]}>Al / Sat</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

AssetHoldingCard.displayName = 'AssetHoldingCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assetIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  symbolCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  symbolText: {
    fontSize: 12,
    fontWeight: '800',
  },
  nameBlock: {
    flex: 1,
  },
  symbolNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  coinSymbol: {
    fontSize: 15,
    fontWeight: '800',
  },
  coinName: {
    fontSize: 12,
    fontWeight: '500',
  },
  livePriceSub: {
    fontSize: 11,
    marginTop: 1,
  },
  weightPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weightText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  metricCol: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 3,
  },
  metricValue: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  metricValueBold: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  metricDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pnlGroup: {
    flex: 1,
  },
  pnlLabel: {
    fontSize: 10.5,
    marginBottom: 2,
  },
  pnlValuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pnlUsdText: {
    fontSize: 13,
    fontWeight: '800',
  },
  pnlPercentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  pnlPercentText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  tradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tradeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
