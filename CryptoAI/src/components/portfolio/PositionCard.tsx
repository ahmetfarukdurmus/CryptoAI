import React, { useState, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Position } from '../../types/crypto';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { usePortfolio } from '../../context/PortfolioContext';
import { TargetEditModal } from './TargetEditModal';

interface Props {
  position: Position;
  onClose: (id: string, symbol: string, pnl: number) => void;
}

export const PositionCard: React.FC<Props> = memo(({ position, onClose }) => {
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();
  const { updatePositionTargets } = usePortfolio();
  const isPosProfit = position.pnl >= 0;

  const [isModalVisible, setIsModalVisible] = useState(false);

  // Take-Profit hedefine kalan yüzde
  const diffToTpPercent =
    position.targetProfit > 0 && position.currentPrice > 0
      ? ((position.targetProfit - position.currentPrice) / position.currentPrice) * 100
      : 0;

  // Stop-Loss risk mesafesi yüzdesi
  const diffToSlPercent =
    position.stopLoss > 0 && position.currentPrice > 0
      ? ((position.currentPrice - position.stopLoss) / position.currentPrice) * 100
      : 0;

  const formatPrice = (val: number) =>
    val < 1
      ? `$${val.toFixed(4)}`
      : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <View style={[styles.posCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {/* 1. Header: Sembol, Yön & Kâr/Zarar */}
      <View style={styles.posHeader}>
        <View style={styles.posSymbolRow}>
          <Text style={[styles.posSymbol, { color: colors.textPrimary }]}>{position.symbol}</Text>
          <View
            style={[
              styles.sideBadge,
              { backgroundColor: position.side === 'BUY' ? colors.bullishMuted : colors.bearishMuted },
            ]}
          >
            <Text style={[styles.sideText, { color: position.side === 'BUY' ? colors.bullish : colors.bearish }]}>
              {position.side}
            </Text>
          </View>
          {position.isAutopilot && (
            <View style={[styles.autopilotTag, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="flash" size={10} color={colors.primary} />
              <Text style={[styles.autopilotTagText, { color: colors.primary }]}>AI Otopilot</Text>
            </View>
          )}
        </View>

        <View style={styles.posPnlCol}>
          <Text style={[styles.posPnl, { color: isPosProfit ? colors.bullish : colors.bearish }]}>
            {isPosProfit ? '+' : ''}${position.pnl.toFixed(2)}
          </Text>
          <Text style={[styles.posPnlPercent, { color: isPosProfit ? colors.bullish : colors.bearish }]}>
            {isPosProfit ? '+' : ''}{position.pnlPercent.toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* 2. Değer Izgarası */}
      <View style={[styles.posGrid, { backgroundColor: colors.cardBgElevated }]}>
        <View style={styles.posGridItem}>
          <Text style={[styles.posGridLabel, { color: colors.textMuted }]}>Giriş Fiyatı</Text>
          <Text style={[styles.posGridValue, { color: colors.textPrimary }]}>
            {formatPrice(position.entryPrice)}
          </Text>
        </View>
        <View style={styles.posGridItem}>
          <Text style={[styles.posGridLabel, { color: colors.textMuted }]}>Güncel Fiyat</Text>
          <Text style={[styles.posGridValue, { color: colors.textPrimary }]}>
            {formatPrice(position.currentPrice)}
          </Text>
        </View>
        <View style={styles.posGridItem}>
          <Text style={[styles.posGridLabel, { color: colors.textMuted }]}>Miktar</Text>
          <Text style={[styles.posGridValue, { color: colors.textPrimary }]}>
            {position.amount} {position.symbol}
          </Text>
        </View>
        <View style={styles.posGridItem}>
          <Text style={[styles.posGridLabel, { color: colors.textMuted }]}>Toplam Değer</Text>
          <Text style={[styles.posGridValue, { color: colors.textPrimary }]}>
            ${(position.amount * position.currentPrice).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* 3. İKİLİ HEDEF GÖRÜNÜMÜ: Take-Profit (Sol - Yeşil) & Stop-Loss (Sağ - Kırmızı) */}
      <View style={styles.targetsContainer}>
        <View style={styles.targetsRow}>
          {/* Sol Kutu: Take-Profit (Hedef Kâr) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsModalVisible(true)}
            style={[
              styles.targetBox,
              {
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.06)',
                borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.3)',
              },
            ]}
          >
            <View style={styles.targetHeaderRow}>
              <Ionicons name="flag" size={12} color="#10B981" />
              <Text style={[styles.targetLabel, { color: '#10B981' }]}>Take-Profit (Hedef Kâr)</Text>
            </View>
            <Text style={[styles.targetPrice, { color: '#10B981' }]}>
              {position.targetProfit > 0 ? formatPrice(position.targetProfit) : 'Ayarlanmadı'}
            </Text>
            <Text style={[styles.targetSub, { color: colors.textMuted }]}>
              {diffToTpPercent > 0 ? `+${diffToTpPercent.toFixed(1)}% kaldı` : '🎯 Seviyede'}
            </Text>
          </TouchableOpacity>

          {/* Sağ Kutu: Stop-Loss (Zarar Kes) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsModalVisible(true)}
            style={[
              styles.targetBox,
              {
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.06)',
                borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : 'rgba(239, 68, 68, 0.3)',
              },
            ]}
          >
            <View style={styles.targetHeaderRow}>
              <Ionicons name="shield" size={12} color="#EF4444" />
              <Text style={[styles.targetLabel, { color: '#EF4444' }]}>Stop-Loss (Zarar Kes)</Text>
            </View>
            <Text style={[styles.targetPrice, { color: '#EF4444' }]}>
              {position.stopLoss > 0 ? formatPrice(position.stopLoss) : 'Ayarlanmadı'}
            </Text>
            <Text style={[styles.targetSub, { color: colors.textMuted }]}>
              {diffToSlPercent > 0 ? `-%${diffToSlPercent.toFixed(1)} risk` : '🛡️ Tetiklendi'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 'Hedefleri Düzenle' Butonu */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setIsModalVisible(true)}
          style={[
            styles.editTargetsBtn,
            {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : colors.inputBg,
              borderColor: isDark ? 'rgba(51, 65, 85, 0.7)' : colors.border,
            },
          ]}
        >
          <Ionicons name="options-outline" size={13} color={colors.primary} />
          <Text style={[styles.editTargetsBtnText, { color: colors.primary }]}>
            Hedefleri Düzenle (TP & SL)
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Manuel Kapatma Butonu */}
      <TouchableOpacity
        onPress={() => onClose(position.id, position.symbol, position.pnl)}
        style={[styles.closePosBtn, { backgroundColor: colors.bearishMuted }]}
        activeOpacity={0.8}
      >
        <Text style={[styles.closePosBtnText, { color: colors.bearish }]}>{t('close_position')}</Text>
      </TouchableOpacity>

      {/* Hedef Düzenleme Modalı */}
      <TargetEditModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        symbol={position.symbol}
        coinName={position.name}
        currentPrice={position.currentPrice}
        initialTargetProfit={position.targetProfit}
        initialStopLoss={position.stopLoss}
        onSave={(tp, sl) => updatePositionTargets(position.id, tp, sl)}
      />
    </View>
  );
});

PositionCard.displayName = 'PositionCard';

const styles = StyleSheet.create({
  posCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  posHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  posSymbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  posSymbol: {
    fontSize: 16,
    fontWeight: '700',
  },
  sideBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sideText: {
    fontSize: 11,
    fontWeight: '700',
  },
  autopilotTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  autopilotTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  posPnlCol: {
    alignItems: 'flex-end',
  },
  posPnl: {
    fontSize: 15,
    fontWeight: '800',
  },
  posPnlPercent: {
    fontSize: 11,
    fontWeight: '700',
  },
  posGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  posGridItem: {
    width: '50%',
    paddingVertical: 4,
  },
  posGridLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  posGridValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  targetsContainer: {
    marginBottom: 12,
  },
  targetsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  targetBox: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
  },
  targetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  targetLabel: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  targetPrice: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  targetSub: {
    fontSize: 10,
    fontWeight: '500',
  },
  editTargetsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  editTargetsBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  closePosBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closePosBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
