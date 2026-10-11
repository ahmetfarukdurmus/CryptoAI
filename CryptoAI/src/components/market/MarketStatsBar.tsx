import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  strongBuyCount: number;
  buyCount: number;
  sellCount: number;
}

export const MarketStatsBar: React.FC<Props> = ({ strongBuyCount, buyCount, sellCount }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.statsBar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={styles.statItem}>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>İzlenen Varlık</Text>
        <Text style={[styles.statVal, { color: colors.textPrimary }]}>20 Parite</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
      <View style={styles.statItem}>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Güçlü Al</Text>
        <Text style={[styles.statVal, { color: colors.bullish }]}>{strongBuyCount} Adet</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
      <View style={styles.statItem}>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Al Sinyali</Text>
        <Text style={[styles.statVal, { color: colors.bullish }]}>{buyCount} Adet</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
      <View style={styles.statItem}>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Sat Sinyali</Text>
        <Text style={[styles.statVal, { color: colors.bearish }]}>{sellCount} Adet</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 20,
  },
});
