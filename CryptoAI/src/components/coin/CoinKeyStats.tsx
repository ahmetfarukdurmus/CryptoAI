import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CryptoAsset } from '../../types/crypto';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  coin: CryptoAsset;
}

export const CoinKeyStats: React.FC<Props> = ({ coin }) => {
  const { colors } = useTheme();

  const stats = [
    { label: '24s En Yüksek', val: `$${coin.high24h.toLocaleString()}` },
    { label: '24s En Düşük', val: `$${coin.low24h.toLocaleString()}` },
    { label: '24s Hacim', val: `$${coin.volume24h}` },
    { label: 'Piyasa Değeri', val: `$${coin.marketCap}` },
  ];

  return (
    <View style={styles.statsGrid}>
      {stats.map((s, idx) => (
        <View
          key={idx}
          style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
        >
          <Text style={[styles.statBoxLabel, { color: colors.textMuted }]}>{s.label}</Text>
          <Text style={[styles.statBoxVal, { color: colors.textPrimary }]}>{s.val}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    minWidth: '46%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  statBoxLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  statBoxVal: {
    fontSize: 13,
    fontWeight: '700',
  },
});
