import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { CoinCard } from '../../components/CoinCard';
import { MarketStatsBar } from '../../components/market/MarketStatsBar';
import { QuickTradeModal } from '../../components/QuickTradeModal';
import { CryptoAsset } from '../../types/crypto';
import { usePortfolio } from '../../context/PortfolioContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type FilterType = 'all' | 'ai' | 'gainers' | 'losers';

export default function MarketRadarScreen() {
  const { coins } = usePortfolio();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [tradeCoin, setTradeCoin] = useState<CryptoAsset | null>(null);

  const strongBuyCount = useMemo(() => coins.filter((c) => c.signal.action === 'GÜÇLÜ AL').length, [coins]);
  const buyCount = useMemo(() => coins.filter((c) => c.signal.action === 'AL').length, [coins]);
  const sellCount = useMemo(() => coins.filter((c) => c.signal.action === 'SAT' || c.signal.action === 'GÜÇLÜ SAT').length, [coins]);

  const filteredCoins = useMemo(() => {
    return coins.filter((coin) => {
      const matchesSearch =
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.name.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'ai') return coin.signal.action === 'GÜÇLÜ AL' || coin.signal.action === 'AL';
      if (activeFilter === 'gainers') return coin.change24h > 0;
      if (activeFilter === 'losers') return coin.change24h < 0;
      return true;
    });
  }, [coins, searchQuery, activeFilter]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Header />
      <MarketStatsBar strongBuyCount={strongBuyCount} buyCount={buyCount} sellCount={sellCount} />

      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder={t('search_placeholder')}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          onPress={() => setActiveFilter('all')}
          style={[
            styles.filterChip,
            {
              backgroundColor: activeFilter === 'all' ? colors.primaryMuted : colors.cardBgElevated,
              borderColor: activeFilter === 'all' ? colors.primary : colors.border,
            },
          ]}
        >
          <Text style={[styles.filterText, { color: activeFilter === 'all' ? colors.primary : colors.textSecondary }]}>
            {t('filter_all')} ({coins.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveFilter('ai')}
          style={[
            styles.filterChip,
            {
              backgroundColor: activeFilter === 'ai' ? colors.bullishMuted : colors.cardBgElevated,
              borderColor: activeFilter === 'ai' ? colors.bullish : colors.border,
            },
          ]}
        >
          <Text style={[styles.filterText, { color: activeFilter === 'ai' ? colors.bullish : colors.textSecondary }]}>
            🤖 {t('filter_ai_signals')} ({strongBuyCount + buyCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveFilter('gainers')}
          style={[
            styles.filterChip,
            {
              backgroundColor: activeFilter === 'gainers' ? colors.primaryMuted : colors.cardBgElevated,
              borderColor: activeFilter === 'gainers' ? colors.primary : colors.border,
            },
          ]}
        >
          <Text style={[styles.filterText, { color: activeFilter === 'gainers' ? colors.primary : colors.textSecondary }]}>
            🔥 {t('filter_top_gainers')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Coin List */}
      <FlatList
        data={filteredCoins}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => <CoinCard coin={item} onTradePress={(c) => setTradeCoin(c)} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {tradeCoin && (
        <QuickTradeModal
          visible={!!tradeCoin}
          onClose={() => setTradeCoin(null)}
          coin={tradeCoin}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
