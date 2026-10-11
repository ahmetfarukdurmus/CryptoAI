import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePortfolio } from '../../context/PortfolioContext';
import { useTheme } from '../../context/ThemeContext';
import { ExplainableAICard } from '../../components/ExplainableAICard';
import { QuickTradeModal } from '../../components/QuickTradeModal';
import { CoinPriceHero, Timeframe } from '../../components/coin/CoinPriceHero';
import { TradingViewChart } from '../../components/coin/TradingViewChart';
import { CoinKeyStats } from '../../components/coin/CoinKeyStats';
import { Ionicons } from '@expo/vector-icons';

export default function CoinDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const { coins } = usePortfolio();
  const { colors } = useTheme();
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [tradeModalVisible, setTradeModalVisible] = useState(false);

  const coin = coins.find((c) => c.symbol.toLowerCase() === symbol?.toLowerCase()) || coins[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerSymbol, { color: colors.textPrimary }]}>{coin.symbol} / USDT</Text>
          <Text style={[styles.headerName, { color: colors.textMuted }]}>{coin.name}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setTradeModalVisible(true)}
          style={[styles.quickTradeHeaderBtn, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}
        >
          <Ionicons name="flash" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <CoinPriceHero coin={coin} timeframe={timeframe} onSelectTimeframe={setTimeframe} />
        <TradingViewChart
          coin={coin}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
        <CoinKeyStats coin={coin} />
        <ExplainableAICard signal={coin.signal} currentPrice={coin.price} />
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setTradeModalVisible(true)}
          activeOpacity={0.8}
          style={[styles.tradeActionBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="swap-vertical" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.tradeActionText}>Hızlı Sanal İşlem Aç (Al / Sat)</Text>
        </TouchableOpacity>
      </View>

      <QuickTradeModal
        visible={tradeModalVisible}
        onClose={() => setTradeModalVisible(false)}
        coin={coin}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerSymbol: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerName: {
    fontSize: 11,
  },
  quickTradeHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  container: {
    padding: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  tradeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  tradeActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
