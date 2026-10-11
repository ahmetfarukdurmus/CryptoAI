import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { usePortfolio } from '../../context/PortfolioContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { PortfolioMetricsCard } from '../../components/portfolio/PortfolioMetricsCard';
import { PositionCard } from '../../components/portfolio/PositionCard';
import { AssetHoldingCard } from '../../components/portfolio/AssetHoldingCard';
import { TradeHistoryList } from '../../components/portfolio/TradeHistoryList';
import { QuickTradeModal } from '../../components/QuickTradeModal';
import { CryptoAsset, Position } from '../../types/crypto';

export type PortfolioTab = 'positions' | 'assets' | 'history';

export default function PortfolioScreen() {
  const {
    totalBalance,
    cashBalance,
    totalPnL,
    totalPnLPercent,
    dailyPnL,
    dailyPnLPercent,
    positions,
    tradeHistory,
    coins,
    closePosition,
    resetPortfolio,
    refreshPortfolio,
    isSyncing,
  } = usePortfolio();
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<PortfolioTab>('positions');
  const [selectedTradeCoin, setSelectedTradeCoin] = useState<CryptoAsset | null>(null);

  // Varlıklarım sekmesi için coin bazlı birleştirilmiş portföy varlıkları
  const consolidatedAssets = useMemo(() => {
    const map = new Map<string, Position>();
    positions.forEach((pos) => {
      const sym = pos.symbol.toUpperCase();
      const existing = map.get(sym);
      if (!existing) {
        map.set(sym, { ...pos });
      } else {
        const totalAmount = existing.amount + pos.amount;
        const totalCost = existing.totalCost + pos.totalCost;
        const avgEntry = totalAmount > 0 ? totalCost / totalAmount : existing.entryPrice;
        map.set(sym, {
          ...existing,
          amount: Number(totalAmount.toFixed(6)),
          totalCost: Number(totalCost.toFixed(2)),
          entryPrice: Number(avgEntry.toFixed(2)),
        });
      }
    });
    return Array.from(map.values());
  }, [positions]);

  const handleClosePosition = (id: string, symbol: string, pnl: number) => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined'
        ? window.confirm(`${symbol} pozisyonunu mevcut fiyattan kapatmak istiyor musunuz? (Net K/Z: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)})`)
        : true;
      if (confirmed) closePosition(id, 'Manuel');
      return;
    }

    Alert.alert(
      'Pozisyon Kapatma',
      `${symbol} pozisyonunu mevcut fiyattan kapatmak istiyor musunuz? (Net K/Z: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)})`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Kapat', style: 'destructive', onPress: () => closePosition(id, 'Manuel') },
      ]
    );
  };

  const handleReset = () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined'
        ? window.confirm('Sanal bakiyeniz başlangıç değeri olan $10.000 seviyesine döndürülecektir.')
        : true;
      if (confirmed) resetPortfolio();
      return;
    }

    Alert.alert(
      'Cüzdanı Sıfırla',
      'Sanal bakiyeniz başlangıç değeri olan $10.000 seviyesine döndürülecektir.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Sıfırla', style: 'destructive', onPress: resetPortfolio },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={refreshPortfolio}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <PortfolioMetricsCard
          totalBalance={totalBalance}
          cashBalance={cashBalance}
          totalPnL={totalPnL}
          totalPnLPercent={totalPnLPercent}
          dailyPnL={dailyPnL}
          dailyPnLPercent={dailyPnLPercent}
          positions={positions}
          onReset={handleReset}
        />

        {/* 3 SEKME (TAB SWITCHER): Açık Pozisyonlar | Varlıklarım | İşlem Geçmişi */}
        <View style={[styles.tabSwitcher, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => setActiveTab('positions')}
            style={[
              styles.switchTab,
              activeTab === 'positions' && { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.switchTabText,
                { color: activeTab === 'positions' ? colors.primary : colors.textSecondary },
              ]}
            >
              Pozisyonlar ({positions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('assets')}
            style={[
              styles.switchTab,
              activeTab === 'assets' && { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.switchTabText,
                { color: activeTab === 'assets' ? colors.primary : colors.textSecondary },
              ]}
            >
              Varlıklarım ({consolidatedAssets.length + 1})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('history')}
            style={[
              styles.switchTab,
              activeTab === 'history' && { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.switchTabText,
                { color: activeTab === 'history' ? colors.primary : colors.textSecondary },
              ]}
            >
              Geçmiş ({tradeHistory.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1. SEKME: AÇIK POZİSYONLAR */}
        {activeTab === 'positions' && (
          positions.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Ionicons name="folder-open-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{t('no_positions')}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {"Piyasa Radarı'ndan coin seçerek veya Otopilot'u açarak işlem başlatabilirsiniz."}
              </Text>
            </View>
          ) : (
            positions.map((pos) => (
              <PositionCard key={pos.id} position={pos} onClose={handleClosePosition} />
            ))
          )
        )}

        {/* 2. SEKME: DETAYLI VARLIKLARIM (HOLDINGS) */}
        {activeTab === 'assets' && (
          <View style={styles.assetsSection}>
            {/* Nakit USDT Varlık Kartı */}
            <View
              style={[
                styles.cashHoldingCard,
                {
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.88)' : colors.cardBg,
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : colors.border,
                },
              ]}
            >
              <View style={styles.cashTopRow}>
                <View style={styles.cashIdentity}>
                  <View style={[styles.cashIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Ionicons name="logo-usd" size={18} color={colors.bullish} />
                  </View>
                  <View>
                    <View style={styles.cashTitleRow}>
                      <Text style={[styles.cashTitle, { color: isDark ? '#FFFFFF' : colors.textPrimary }]}>
                        USDT
                      </Text>
                      <View style={styles.stableBadge}>
                        <Text style={styles.stableBadgeText}>SABİT NAKİT</Text>
                      </View>
                    </View>
                    <Text style={[styles.cashSub, { color: colors.textMuted }]}>Tether USD (Kullanılabilir)</Text>
                  </View>
                </View>

                <View style={styles.cashRightCol}>
                  <Text style={[styles.cashAmountText, { color: colors.bullish }]}>
                    ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={[styles.cashWeightText, { color: colors.textSecondary }]}>
                    %{totalBalance > 0 ? ((cashBalance / totalBalance) * 100).toFixed(1) : '100.0'} Tahsisat
                  </Text>
                </View>
              </View>
            </View>

            {/* Sahip Olunan Kripto Varlık Kartları */}
            {consolidatedAssets.length > 0 ? (
              consolidatedAssets.map((asset) => {
                const coin = coins.find((c) => c.symbol.toUpperCase() === asset.symbol.toUpperCase());
                return (
                  <AssetHoldingCard
                    key={`holding-${asset.symbol}`}
                    position={asset}
                    coin={coin}
                    totalPortfolioValue={totalBalance}
                    onTradePress={(c) => setSelectedTradeCoin(c)}
                  />
                );
              })
            ) : (
              <View style={[styles.emptyHoldingNote, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}>
                <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                <Text style={[styles.emptyHoldingText, { color: colors.textSecondary }]}>
                  Şu an cüzdanınızda $10.000 USDT sanal nakit bulunmaktadır. Piyasa Radarı&apos;ndan coin satın alarak kripto portföyünüzü oluşturabilirsiniz.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 3. SEKME: İŞLEM GEÇMİŞİ */}
        {activeTab === 'history' && <TradeHistoryList tradeHistory={tradeHistory} />}
      </ScrollView>

      {/* Varlık Kartlarından Doğrudan Açılan Al/Sat Modalı */}
      {selectedTradeCoin && (
        <QuickTradeModal
          visible={!!selectedTradeCoin}
          onClose={() => setSelectedTradeCoin(null)}
          coin={selectedTradeCoin}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  tabSwitcher: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    marginBottom: 16,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  switchTabText: {
    fontSize: 12,
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
  assetsSection: {
    marginBottom: 10,
  },
  cashHoldingCard: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  cashTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cashIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cashIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cashTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  stableBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stableBadgeText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  cashSub: {
    fontSize: 11,
    marginTop: 2,
  },
  cashRightCol: {
    alignItems: 'flex-end',
  },
  cashAmountText: {
    fontSize: 15,
    fontWeight: '800',
  },
  cashWeightText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyHoldingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  emptyHoldingText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
  },
});
