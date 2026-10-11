import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TradeHistoryItem } from '../../types/crypto';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  tradeHistory: TradeHistoryItem[];
}

export const TradeHistoryList: React.FC<Props> = ({ tradeHistory }) => {
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();

  const formatDateTime = (raw: string) => {
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        return `${d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
    } catch {
      // ignore
    }
    return raw || 'Yeni';
  };

  if (tradeHistory.length === 0) {
    return (
      <View style={[styles.emptyCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Ionicons name="time-outline" size={40} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{t('no_history')}</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Gerçekleştirdiğiniz alım ve satım emirleri anlık olarak burada listelenir.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {tradeHistory.map((item) => {
        const isBuy = item.side === 'BUY';
        const isProfit = item.pnl >= 0;
        const totalUsd = item.amount * item.closePrice;

        return (
          <View
            key={item.id}
            style={[
              styles.historyCard,
              {
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : colors.cardBg,
                borderColor: isBuy ? 'rgba(0, 230, 118, 0.25)' : 'rgba(255, 82, 82, 0.25)',
              },
            ]}
          >
            {/* Top row: Symbol, Side badge, Reason & Total / PnL */}
            <View style={styles.historyHeader}>
              <View style={styles.historySymbolRow}>
                <View
                  style={[
                    styles.sideIconBox,
                    { backgroundColor: isBuy ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 82, 82, 0.15)' },
                  ]}
                >
                  <Ionicons
                    name={isBuy ? 'arrow-down' : 'arrow-up'}
                    size={14}
                    color={isBuy ? colors.bullish : colors.bearish}
                  />
                </View>
                <View>
                  <Text style={[styles.historySymbol, { color: colors.textPrimary }]}>{item.symbol}</Text>
                  <Text style={[styles.historyDate, { color: colors.textMuted }]}>{formatDateTime(item.closedAt)}</Text>
                </View>
              </View>

              <View style={styles.rightHeaderCol}>
                <Text
                  style={[
                    styles.mainAmountText,
                    { color: isBuy ? colors.bullish : (isProfit ? colors.bullish : colors.bearish) },
                  ]}
                >
                  {isBuy ? `$${totalUsd.toFixed(2)}` : `${isProfit ? '+' : ''}$${item.pnl.toFixed(2)}`}
                </Text>
                <Text style={[styles.historySubBadge, { color: isBuy ? colors.bullish : colors.bearish }]}>
                  {isBuy ? 'ALIM (BUY)' : `SATIM (${isProfit ? '+' : ''}${item.pnlPercent.toFixed(1)}%)`}
                </Text>
              </View>
            </View>

            {/* Bottom details row */}
            <View style={[styles.historyDetails, { backgroundColor: isDark ? 'rgba(2, 6, 23, 0.5)' : colors.inputBg }]}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>İşlem Adedi</Text>
                <Text style={[styles.detailVal, { color: colors.textPrimary }]}>
                  {item.amount} {item.symbol}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>İşlem Fiyatı</Text>
                <Text style={[styles.detailVal, { color: colors.textPrimary }]}>
                  ${item.closePrice.toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Sebep</Text>
                <Text
                  style={[
                    styles.detailVal,
                    {
                      color:
                        item.closedReason === 'AUTO_STOP_LOSS'
                          ? colors.bearish
                          : item.closedReason === 'Take-Profit'
                          ? colors.bullish
                          : colors.textSecondary,
                      fontWeight:
                        item.closedReason === 'AUTO_STOP_LOSS' || item.closedReason === 'Take-Profit'
                          ? '800'
                          : '600',
                    },
                  ]}
                >
                  {item.closedReason === 'AUTO_STOP_LOSS'
                    ? '🛡️ AUTO_STOP_LOSS'
                    : item.closedReason === 'Take-Profit'
                    ? '🎯 Take-Profit'
                    : (item.closedReason || 'Manuel')}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  historyCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
    marginBottom: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historySymbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sideIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historySymbol: {
    fontSize: 15,
    fontWeight: '800',
  },
  historyDate: {
    fontSize: 11,
    marginTop: 2,
  },
  rightHeaderCol: {
    alignItems: 'flex-end',
  },
  mainAmountText: {
    fontSize: 15,
    fontWeight: '800',
  },
  historySubBadge: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailVal: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
