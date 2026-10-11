import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Position } from '../../types/crypto';

interface Props {
  totalBalance: number;
  cashBalance: number;
  totalPnL: number;
  totalPnLPercent: number;
  dailyPnL?: number;
  dailyPnLPercent?: number;
  positions: Position[];
  onReset: () => void;
}

export const PortfolioMetricsCard: React.FC<Props> = ({
  totalBalance,
  cashBalance,
  totalPnL,
  totalPnLPercent,
  dailyPnL = 0,
  dailyPnLPercent = 0,
  positions,
  onReset,
}) => {
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();

  const isTotalProfit = totalPnL >= 0;
  const isDailyProfit = dailyPnL >= 0;

  return (
    <View
      style={[
        styles.glassCard,
        {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.88)' : colors.cardBg,
          borderColor: isDark ? 'rgba(0, 229, 255, 0.35)' : colors.border,
          shadowColor: isDark ? '#00E5FF' : '#000000',
        },
      ]}
    >
      {/* Decorative Neon Glow Accent Bar */}
      <View style={styles.neonAccentGlow} />

      {/* Header: Label & Reset */}
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <View style={[styles.pulseDot, { backgroundColor: colors.bullish }]} />
          <Text style={[styles.cardLabel, { color: isDark ? '#94A3B8' : colors.textSecondary }]}>
            {t('total_balance')} (CANLI)
          </Text>
        </View>

        <TouchableOpacity
          onPress={onReset}
          activeOpacity={0.7}
          style={[styles.resetButton, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : colors.cardBgElevated }]}
        >
          <Ionicons name="refresh-outline" size={13} color={colors.primary} />
          <Text style={[styles.resetButtonText, { color: colors.primary }]}>$10K Sıfırla</Text>
        </TouchableOpacity>
      </View>

      {/* Big Total Portfolio Value */}
      <View style={styles.mainBalanceRow}>
        <Text style={[styles.currencyPrefix, { color: colors.primary }]}>$</Text>
        <Text style={[styles.totalBalanceValue, { color: isDark ? '#FFFFFF' : colors.textPrimary }]}>
          {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Text style={[styles.currencySuffix, { color: isDark ? '#64748B' : colors.textMuted }]}>USDT</Text>
      </View>

      {/* Available Cash Row */}
      <View style={[styles.cashAvailableBanner, { backgroundColor: isDark ? 'rgba(2, 6, 23, 0.6)' : colors.inputBg }]}>
        <View style={styles.cashAvailableLeft}>
          <Ionicons name="wallet-outline" size={15} color={colors.bullish} />
          <Text style={[styles.cashAvailableLabel, { color: isDark ? '#94A3B8' : colors.textSecondary }]}>
            Kullanılabilir Nakit:
          </Text>
        </View>
        <Text style={[styles.cashAvailableValue, { color: colors.bullish }]}>
          ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
        </Text>
      </View>

      {/* PnL Metrics Badges (Günlük K/Z & Toplam Getiri) */}
      <View style={styles.pnlBadgesContainer}>
        {/* Günlük K/Z */}
        <View
          style={[
            styles.metricBadge,
            {
              backgroundColor: isDailyProfit ? 'rgba(0, 230, 118, 0.14)' : 'rgba(255, 82, 82, 0.14)',
              borderColor: isDailyProfit ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 82, 82, 0.4)',
            },
          ]}
        >
          <View style={styles.badgeHeader}>
            <Ionicons
              name={isDailyProfit ? 'trending-up' : 'trending-down'}
              size={14}
              color={isDailyProfit ? '#00E676' : '#FF5252'}
            />
            <Text style={[styles.badgeSubtitle, { color: isDark ? '#94A3B8' : colors.textMuted }]}>Günlük P&L</Text>
          </View>
          <Text style={[styles.badgeValue, { color: isDailyProfit ? '#00E676' : '#FF5252' }]}>
            {isDailyProfit ? '+' : ''}${dailyPnL.toFixed(2)} ({isDailyProfit ? '+' : ''}{dailyPnLPercent.toFixed(2)}%)
          </Text>
        </View>

        {/* Toplam Getiri */}
        <View
          style={[
            styles.metricBadge,
            {
              backgroundColor: isTotalProfit ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 82, 82, 0.12)',
              borderColor: isTotalProfit ? 'rgba(0, 229, 255, 0.4)' : 'rgba(255, 82, 82, 0.4)',
            },
          ]}
        >
          <View style={styles.badgeHeader}>
            <Ionicons
              name={isTotalProfit ? 'sparkles' : 'alert-circle'}
              size={13}
              color={isTotalProfit ? colors.primary : '#FF5252'}
            />
            <Text style={[styles.badgeSubtitle, { color: isDark ? '#94A3B8' : colors.textMuted }]}>Toplam P&L</Text>
          </View>
          <Text style={[styles.badgeValue, { color: isTotalProfit ? colors.primary : '#FF5252' }]}>
            {isTotalProfit ? '+' : ''}${totalPnL.toFixed(2)} ({isTotalProfit ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
          </Text>
        </View>
      </View>

      {/* Asset Allocation Bar */}
      <View style={[styles.allocationSection, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : colors.border }]}>
        <View style={styles.allocationHeader}>
          <Text style={[styles.allocationTitle, { color: isDark ? '#94A3B8' : colors.textSecondary }]}>
            Varlık Dağılımı ({positions.length} Coin + Nakit)
          </Text>
          <Text style={[styles.allocationPercent, { color: colors.primary }]}>
            %{totalBalance > 0 ? ((cashBalance / totalBalance) * 100).toFixed(0) : 100} Nakit
          </Text>
        </View>

        <View style={[styles.allocationBarContainer, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : colors.cardBgElevated }]}>
          <View
            style={[
              styles.allocationSegment,
              {
                width: `${Math.max(4, Math.min(100, (cashBalance / totalBalance) * 100))}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
          {positions.map((pos, idx) => {
            const segPercent = Math.max(3, ((pos.amount * pos.currentPrice) / totalBalance) * 100);
            const palette = ['#00E676', '#FF9100', '#7C4DFF', '#00E5FF'];
            return (
              <View
                key={pos.id}
                style={[
                  styles.allocationSegment,
                  { width: `${segPercent}%`, backgroundColor: palette[idx % palette.length] },
                ]}
              />
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendText, { color: isDark ? '#CBD5E1' : colors.textSecondary }]}>USDT</Text>
          </View>
          {positions.slice(0, 4).map((pos, idx) => {
            const palette = ['#00E676', '#FF9100', '#7C4DFF', '#00E5FF'];
            return (
              <View key={pos.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: palette[idx % palette.length] }]} />
                <Text style={[styles.legendText, { color: isDark ? '#CBD5E1' : colors.textSecondary }]}>
                  {pos.symbol}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glassCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
      },
    }),
  },
  neonAccentGlow: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#00E5FF',
    opacity: 0.85,
    borderRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  cardLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mainBalanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: '800',
    marginRight: 4,
  },
  totalBalanceValue: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  currencySuffix: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  cashAvailableBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  cashAvailableLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cashAvailableLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  cashAvailableValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  pnlBadgesContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricBadge: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  badgeSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  allocationSection: {
    paddingTop: 12,
    borderTopWidth: 1,
  },
  allocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  allocationTitle: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  allocationPercent: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  allocationBarContainer: {
    height: 7,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 8,
  },
  allocationSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
