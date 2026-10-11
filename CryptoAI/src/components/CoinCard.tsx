import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { CryptoAsset } from '../types/crypto';
import { useTheme } from '../context/ThemeContext';
import { SignalBadge } from './SignalBadge';
import { Ionicons } from '@expo/vector-icons';

interface CoinCardProps {
  coin: CryptoAsset;
  onTradePress?: (coin: CryptoAsset) => void;
}

export const CoinCard: React.FC<CoinCardProps> = memo(({ coin, onTradePress }) => {
  const { colors } = useTheme();
  const isPositive = coin.change24h >= 0;

  const handlePress = () => {
    router.push({
      pathname: '/coin/[symbol]',
      params: { symbol: coin.symbol },
    });
  };

  const spark = coin.sparkline && coin.sparkline.length > 0 ? coin.sparkline : [coin.price];
  const minVal = Math.min(...spark);
  const maxVal = Math.max(...spark);
  const range = maxVal - minVal || 1;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
        },
      ]}
    >
      {/* 1. SOL TARAF: Coin Amblemi, Sembol & Adı + Sinyal Rozeti (Pill) */}
      <View style={styles.leftCol}>
        <View
          style={[
            styles.symbolBadge,
            {
              backgroundColor: colors.cardBgElevated,
              borderColor: colors.borderLight,
            },
          ]}
        >
          <Text style={[styles.symbolText, { color: colors.textPrimary }]}>
            {coin.symbol.slice(0, 4)}
          </Text>
        </View>

        <View style={styles.nameBlock}>
          <View style={styles.symbolRow}>
            <Text style={[styles.symbolTitle, { color: colors.textPrimary }]}>
              {coin.symbol}
            </Text>
            <Text style={[styles.nameText, { color: colors.textMuted }]} numberOfLines={1}>
              {coin.name}
            </Text>
          </View>

          {/* Sinyal Rozeti: Coin adının hemen altında ferah ve kompakt neon hap */}
          <View style={styles.signalWrapper}>
            <SignalBadge
              action={coin.signal.action}
              confidence={coin.signal.confidence}
              compact
            />
          </View>
        </View>
      </View>

      {/* 2. ORTA TARAF: Nefes Alan Mini Trend Çizgisi (Sparkline) */}
      <View style={styles.sparklineContainer}>
        {spark.map((val, idx) => {
          const heightPercent = Math.max(16, Math.min(100, ((val - minVal) / range) * 100));
          return (
            <View
              key={idx}
              style={[
                styles.sparklineBar,
                {
                  height: `${heightPercent}%`,
                  backgroundColor: isPositive ? colors.bullish : colors.bearish,
                  opacity: 0.35 + (idx / spark.length) * 0.65,
                },
              ]}
            />
          );
        })}
      </View>

      {/* 3. SAĞ TARAF: Net Büyük Anlık Fiyat, 24s Değişim ve Şık "Al/Sat" Butonu */}
      <View style={styles.rightCol}>
        <Text style={[styles.priceText, { color: colors.textPrimary }]}>
          ${coin.price < 1
            ? coin.price.toFixed(4)
            : coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>

        <View style={styles.actionRow}>
          <View
            style={[
              styles.changeBadge,
              { backgroundColor: isPositive ? colors.bullishMuted : colors.bearishMuted },
            ]}
          >
            <Ionicons
              name={isPositive ? 'arrow-up' : 'arrow-down'}
              size={10}
              color={isPositive ? colors.bullish : colors.bearish}
            />
            <Text
              style={[
                styles.changeText,
                { color: isPositive ? colors.bullish : colors.bearish },
              ]}
            >
              {isPositive ? '+' : ''}{coin.change24h.toFixed(2)}%
            </Text>
          </View>

          {onTradePress && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                onTradePress(coin);
              }}
              activeOpacity={0.7}
              style={[
                styles.tradeBtn,
                {
                  backgroundColor: colors.primaryMuted,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={[styles.tradeBtnText, { color: colors.primary }]}>
                Al/Sat
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.4,
    gap: 10,
  },
  symbolBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    justifyContent: 'center',
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  symbolTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  nameText: {
    fontSize: 11,
    fontWeight: '500',
    flexShrink: 1,
  },
  signalWrapper: {
    alignSelf: 'flex-start',
  },
  sparklineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 28,
    width: 52,
    gap: 2,
    marginHorizontal: 8,
  },
  sparklineBar: {
    flex: 1,
    borderRadius: 1,
  },
  rightCol: {
    alignItems: 'flex-end',
    flex: 1.3,
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 2,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tradeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

CoinCard.displayName = 'CoinCard';
