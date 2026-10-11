import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { CryptoAsset } from '../types/crypto';
import { usePortfolio } from '../context/PortfolioContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Ionicons } from '@expo/vector-icons';

interface QuickTradeModalProps {
  visible: boolean;
  onClose: () => void;
  coin: CryptoAsset;
  initialSide?: 'BUY' | 'SELL';
}

export const QuickTradeModal: React.FC<QuickTradeModalProps> = ({
  visible,
  onClose,
  coin,
  initialSide = 'BUY',
}) => {
  const { cashBalance, getOwnedCoinQuantity, executeTrade } = usePortfolio();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [side, setSide] = useState<'BUY' | 'SELL'>(initialSide);
  const [inputMode, setInputMode] = useState<'USD' | 'COIN'>('USD');
  const [amountStr, setAmountStr] = useState<string>('500');
  const [targetProfitStr, setTargetProfitStr] = useState<string>('');
  const [enableTakeProfit, setEnableTakeProfit] = useState<boolean>(true);
  const [stopLossStr, setStopLossStr] = useState<string>('');
  const [enableStopLoss, setEnableStopLoss] = useState<boolean>(true);

  const ownedQuantity = getOwnedCoinQuantity(coin.symbol);
  const ownedValueUsd = ownedQuantity * coin.price;

  // Şeffaf Karar Kartı'ndaki AI risk sınırı (-3.0%) ve kâr hedefi (+5.0%)
  const aiStopLoss = coin.price > 0
    ? Number((coin.price * 0.97).toFixed(coin.price < 1 ? 4 : 2))
    : 0;
  const aiTakeProfit = coin.signal?.targetProfit && coin.signal.targetProfit > coin.price
    ? coin.signal.targetProfit
    : Number((coin.price * 1.05).toFixed(coin.price < 1 ? 4 : 2));

  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setSide(initialSide);
      if (initialSide === 'SELL' && ownedQuantity > 0) {
        setAmountStr((ownedValueUsd * 0.5).toFixed(2));
      } else {
        setAmountStr('500');
      }
      setInputMode('USD');

      // Take-Profit varsayılan değeri (+%5 veya AI hedef)
      const defaultTp = aiTakeProfit > 0
        ? (coin.price < 1 ? aiTakeProfit.toFixed(4) : aiTakeProfit.toFixed(2))
        : (coin.price * 1.05).toFixed(2);
      setTargetProfitStr(defaultTp);
      setEnableTakeProfit(true);

      // Stop-Loss varsayılan değeri (-%3.0 AI Risk Sınırı)
      const defaultSl = aiStopLoss > 0
        ? (coin.price < 1 ? aiStopLoss.toFixed(4) : aiStopLoss.toFixed(2))
        : (coin.price * 0.97).toFixed(2);
      setStopLossStr(defaultSl);
      setEnableStopLoss(true);
    }
  }

  // Hesaplamalar
  const numericInput = parseFloat(amountStr) || 0;
  const amountUsd = inputMode === 'USD' ? numericInput : numericInput * coin.price;
  const coinQuantity = inputMode === 'COIN' ? numericInput : (coin.price > 0 ? numericInput / coin.price : 0);

  const handlePercentage = (pct: number) => {
    if (side === 'BUY') {
      const maxCash = cashBalance;
      const calcUsd = (maxCash * pct) / 100;
      if (inputMode === 'USD') {
        setAmountStr(calcUsd > 0 ? calcUsd.toFixed(2) : '0');
      } else {
        const qty = coin.price > 0 ? calcUsd / coin.price : 0;
        setAmountStr(qty > 0 ? qty.toFixed(4) : '0');
      }
    } else {
      const maxCoin = ownedQuantity;
      const calcCoin = (maxCoin * pct) / 100;
      if (inputMode === 'COIN') {
        setAmountStr(calcCoin > 0 ? calcCoin.toFixed(4) : '0');
      } else {
        const usdVal = calcCoin * coin.price;
        setAmountStr(usdVal > 0 ? usdVal.toFixed(2) : '0');
      }
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleExecute = async () => {
    if (submitting) return;

    if (amountUsd <= 0 || coinQuantity <= 0) {
      const msg = 'Lütfen sıfırdan büyük geçerli bir miktar girin.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Geçersiz Miktar', msg);
      return;
    }

    if (side === 'BUY' && amountUsd > cashBalance) {
      const msg = `Yetersiz Nakit Bakiye!\nMevcut: $${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT`;
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Yetersiz Bakiye', msg);
      return;
    }

    if (side === 'SELL') {
      if (ownedQuantity <= 0) {
        const msg = `Portföyünüzde satabileceğiniz ${coin.symbol} bulunmuyor.`;
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('İşlem Engellendi', msg);
        return;
      }
      if (coinQuantity > ownedQuantity + 0.000001) {
        const msg = `Maksimum ${ownedQuantity.toFixed(4)} ${coin.symbol} satabilirsiniz.`;
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Miktar Aşıldı', msg);
        return;
      }
    }

    const parsedTp = enableTakeProfit && side === 'BUY' ? parseFloat(targetProfitStr.replace(',', '.')) : undefined;
    const finalTp = parsedTp && !isNaN(parsedTp) && parsedTp > 0 ? parsedTp : undefined;

    const parsedSl = enableStopLoss && side === 'BUY' ? parseFloat(stopLossStr.replace(',', '.')) : undefined;
    let finalSl: number | undefined = undefined;

    if (parsedSl && !isNaN(parsedSl) && parsedSl > 0) {
      // 3. TETİKLENME MANTIĞI KONTROLÜ:
      // stopLoss değeri asla mevcut fiyata eşit veya yüksek olamaz (böylece işlem açılır açılmaz anında kapanmaz)
      if (side === 'BUY' && parsedSl >= coin.price) {
        const msg = `Stop-Loss ($${parsedSl}) güncel piyasa fiyatından ($${coin.price}) düşük olmalıdır!\nAksi halde işleminiz açılır açılmaz anında zararla kapanır.`;
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Geçersiz Stop-Loss Seviyesi', msg);
        return;
      }
      finalSl = parsedSl;
    }

    setSubmitting(true);
    try {
      const result = await executeTrade(coin.symbol, side, amountUsd, coinQuantity, finalTp, finalSl);

      if (result.success) {
        const notes: string[] = [];
        if (finalTp) notes.push(`TP: $${finalTp.toLocaleString()}`);
        if (finalSl) notes.push(`SL: $${finalSl.toLocaleString()}`);
        const targetsNote = notes.length > 0 ? ` (${notes.join(' | ')})` : '';

        showToast(
          result.message + targetsNote,
          side === 'BUY' ? 'success' : 'error',
          side === 'BUY' ? 'Alım Gerçekleşti 🚀' : 'Satım Gerçekleşti 🔻'
        );
        onClose();
      } else {
        if (Platform.OS === 'web') window.alert(result.message);
        else Alert.alert('İşlem Başarısız', result.message);
      }
    } catch {
      showToast('Sunucuya bağlanılamadı.', 'error', 'Hata ❌');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalContent, { backgroundColor: colors.modalBg, borderTopColor: colors.border }]}>
            {/* Handle Bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleGroup}>
                <View style={[styles.coinIconBadge, { backgroundColor: colors.cardBgElevated }]}>
                  <Text style={[styles.coinIconText, { color: colors.primary }]}>{coin.symbol.slice(0, 3)}</Text>
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                    {coin.name} <Text style={{ color: colors.textMuted }}>({coin.symbol})</Text>
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                    Canlı Fiyat: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.cardBgElevated }]}>
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Side Selector (BUY / SELL) Tabs */}
            <View style={[styles.sideSelector, { backgroundColor: colors.cardBgElevated }]}>
              <TouchableOpacity
                onPress={() => setSide('BUY')}
                activeOpacity={0.8}
                style={[
                  styles.sideTab,
                  side === 'BUY' && {
                    backgroundColor: colors.bullish,
                    shadowColor: colors.bullish,
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 4,
                  },
                ]}
              >
                <Ionicons name="trending-up" size={16} color={side === 'BUY' ? '#FFFFFF' : colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.sideTabText, { color: side === 'BUY' ? '#FFFFFF' : colors.textSecondary }]}>
                  AL (BUY)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSide('SELL')}
                activeOpacity={0.8}
                style={[
                  styles.sideTab,
                  side === 'SELL' && {
                    backgroundColor: colors.bearish,
                    shadowColor: colors.bearish,
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 4,
                  },
                ]}
              >
                <Ionicons name="trending-down" size={16} color={side === 'SELL' ? '#FFFFFF' : colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.sideTabText, { color: side === 'SELL' ? '#FFFFFF' : colors.textSecondary }]}>
                  SAT (SELL)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Content */}
            <ScrollView
              style={{ maxHeight: 420 }}
              contentContainerStyle={{ paddingBottom: 6 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Available Balance Status Banner */}
              <View style={[styles.balanceBanner, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}>
                <View style={styles.balanceCol}>
                  <Text style={[styles.balanceSubLabel, { color: colors.textMuted }]}>
                    {side === 'BUY' ? 'Kullanılabilir Nakit' : 'Cüzdandaki Varlık'}
                  </Text>
                  <Text style={[styles.balanceMainText, { color: side === 'BUY' ? colors.bullish : colors.primary }]}>
                    {side === 'BUY'
                      ? `$${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT`
                      : `${ownedQuantity.toFixed(4)} ${coin.symbol} (≈$${ownedValueUsd.toFixed(2)})`}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setInputMode(inputMode === 'USD' ? 'COIN' : 'USD')}
                  style={[styles.modeToggleBtn, { borderColor: colors.primary, backgroundColor: colors.primaryMuted }]}
                >
                  <Ionicons name="swap-horizontal" size={13} color={colors.primary} />
                  <Text style={[styles.modeToggleText, { color: colors.primary }]}>
                    {inputMode === 'USD' ? 'USDT Gir' : `${coin.symbol} Gir`}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Amount Input Box */}
              <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Text style={[styles.inputPrefix, { color: colors.textMuted }]}>
                  {inputMode === 'USD' ? '$' : '🪙'}
                </Text>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  keyboardType="numeric"
                  value={amountStr}
                  onChangeText={setAmountStr}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  autoFocus={false}
                />
                <Text style={[styles.inputSuffix, { color: colors.textMuted }]}>
                  {inputMode === 'USD' ? 'USDT' : coin.symbol}
                </Text>
              </View>

              {/* Counter Conversion Display */}
              <View style={styles.conversionRow}>
                <Text style={[styles.conversionText, { color: colors.textSecondary }]}>
                  {inputMode === 'USD'
                    ? `≈ ${coinQuantity.toFixed(4)} ${coin.symbol}`
                    : `≈ $${amountUsd.toFixed(2)} USDT`}
                </Text>
              </View>

              {/* Smart Percentage Buttons */}
              <View style={styles.pctRow}>
                {[25, 50, 75, 100].map((pct) => (
                  <TouchableOpacity
                    key={pct}
                    onPress={() => handlePercentage(pct)}
                    activeOpacity={0.7}
                    style={[
                      styles.pctBtn,
                      {
                        backgroundColor: colors.cardBgElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.pctBtnText, { color: colors.textPrimary }]}>
                      %{pct}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* AI Signal Badge Note */}
              <View style={[styles.aiSignalNote, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}>
                <Ionicons name="sparkles" size={15} color={colors.primary} />
                <Text style={[styles.aiSignalNoteText, { color: colors.textPrimary }]}>
                  AI Tavsiyesi: <Text style={{ fontWeight: '800', color: colors.primary }}>{coin.signal?.action || 'NÖTR'}</Text> (Güven: %{coin.signal?.confidence || 85})
                </Text>
              </View>

              {/* 1. Otomatik Satış Hedefi (Take-Profit / Limit Emir) */}
              {side === 'BUY' && (
                <View style={[styles.tpCard, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}>
                  <View style={styles.tpHeaderRow}>
                    <View style={styles.tpTitleGroup}>
                      <Ionicons name="flag" size={14} color="#00F2FE" />
                      <Text style={[styles.tpTitle, { color: colors.textPrimary }]}>
                        Otomatik Satış Hedefi (Take-Profit)
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setEnableTakeProfit(!enableTakeProfit)}
                      activeOpacity={0.7}
                      style={[
                        styles.tpToggleBtn,
                        { backgroundColor: enableTakeProfit ? 'rgba(0, 242, 254, 0.2)' : colors.inputBg },
                      ]}
                    >
                      <Text style={[styles.tpToggleText, { color: enableTakeProfit ? '#00F2FE' : colors.textMuted }]}>
                        {enableTakeProfit ? 'AKTİF' : 'DEVRE DIŞI'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {enableTakeProfit && (
                    <View style={styles.tpBody}>
                      <View style={[styles.tpInputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                        <Text style={[styles.tpInputPrefix, { color: colors.textMuted }]}>$</Text>
                        <TextInput
                          value={targetProfitStr}
                          onChangeText={setTargetProfitStr}
                          keyboardType="decimal-pad"
                          placeholder="Örn: 70000"
                          placeholderTextColor={colors.textMuted}
                          style={[styles.tpTextInput, { color: colors.textPrimary }]}
                        />
                        <Text style={[styles.tpInputSuffix, { color: '#00F2FE' }]}>USDT</Text>
                      </View>

                      <View style={styles.tpPresetsRow}>
                        {[5, 10, 20].map((pct) => (
                          <TouchableOpacity
                            key={`tp-pct-${pct}`}
                            onPress={() => {
                              const val = coin.price * (1 + pct / 100);
                              setTargetProfitStr(val < 1 ? val.toFixed(4) : val.toFixed(2));
                            }}
                            style={[styles.tpPresetBtn, { backgroundColor: colors.inputBg }]}
                          >
                            <Text style={[styles.tpPresetText, { color: colors.textSecondary }]}>+%{pct}</Text>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                          onPress={() => {
                            setTargetProfitStr(aiTakeProfit > 0 ? (coin.price < 1 ? aiTakeProfit.toFixed(4) : aiTakeProfit.toFixed(2)) : '');
                          }}
                          style={[styles.tpPresetBtn, { backgroundColor: 'rgba(0, 242, 254, 0.15)' }]}
                        >
                          <Text style={[styles.tpPresetText, { color: '#00F2FE', fontWeight: '800' }]}>AI Hedef</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* 2. Zararı Durdur (Stop-Loss / Risk Sınırı) */}
              {side === 'BUY' && (
                <View style={[styles.tpCard, { backgroundColor: colors.cardBgElevated, borderColor: colors.border, marginTop: -4 }]}>
                  <View style={styles.tpHeaderRow}>
                    <View style={styles.tpTitleGroup}>
                      <Ionicons name="shield-outline" size={14} color="#EF4444" />
                      <Text style={[styles.tpTitle, { color: colors.textPrimary }]}>
                        Zararı Durdur (Stop-Loss)
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setEnableStopLoss(!enableStopLoss)}
                      activeOpacity={0.7}
                      style={[
                        styles.tpToggleBtn,
                        { backgroundColor: enableStopLoss ? 'rgba(239, 68, 68, 0.2)' : colors.inputBg },
                      ]}
                    >
                      <Text style={[styles.tpToggleText, { color: enableStopLoss ? '#EF4444' : colors.textMuted }]}>
                        {enableStopLoss ? 'AKTİF' : 'DEVRE DIŞI'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {enableStopLoss && (
                    <View style={styles.tpBody}>
                      <View style={[styles.tpInputBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                        <Text style={[styles.tpInputPrefix, { color: colors.textMuted }]}>$</Text>
                        <TextInput
                          value={stopLossStr}
                          onChangeText={setStopLossStr}
                          keyboardType="decimal-pad"
                          placeholder="Örn: 65000"
                          placeholderTextColor={colors.textMuted}
                          style={[styles.tpTextInput, { color: colors.textPrimary }]}
                        />
                        <Text style={[styles.tpInputSuffix, { color: '#EF4444' }]}>USDT</Text>
                      </View>

                      <View style={styles.tpPresetsRow}>
                        {[2, 5, 10].map((pct) => (
                          <TouchableOpacity
                            key={`sl-pct-${pct}`}
                            onPress={() => {
                              const val = coin.price * (1 - pct / 100);
                              setStopLossStr(val < 1 ? val.toFixed(4) : val.toFixed(2));
                            }}
                            style={[styles.tpPresetBtn, { backgroundColor: colors.inputBg }]}
                          >
                            <Text style={[styles.tpPresetText, { color: colors.textSecondary }]}>-%{pct}</Text>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                          onPress={() => {
                            setStopLossStr(aiStopLoss > 0 ? (coin.price < 1 ? aiStopLoss.toFixed(4) : aiStopLoss.toFixed(2)) : '');
                          }}
                          style={[styles.tpPresetBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}
                        >
                          <Text style={[styles.tpPresetText, { color: '#EF4444', fontWeight: '800' }]}>AI Risk Sınırı</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Execute Button */}
            <TouchableOpacity
              onPress={handleExecute}
              disabled={submitting}
              activeOpacity={0.85}
              style={[
                styles.executeBtn,
                {
                  backgroundColor: submitting
                    ? colors.textMuted
                    : side === 'BUY' ? colors.bullish : colors.bearish,
                  shadowColor: side === 'BUY' ? colors.bullish : colors.bearish,
                  opacity: submitting ? 0.7 : 1,
                },
              ]}
            >
              <Text style={styles.executeBtnText}>
                {submitting
                  ? 'İşleniyor...'
                  : side === 'BUY'
                  ? `Sanal Alım Yap ($${amountUsd.toFixed(2)})`
                  : `Sanal Satış Yap (${coinQuantity.toFixed(4)} ${coin.symbol})`}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderTopWidth: 1.5,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coinIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinIconText: {
    fontSize: 13,
    fontWeight: '800',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideSelector: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  sideTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  sideTabText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  balanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  balanceCol: {
    flex: 1,
  },
  balanceSubLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  balanceMainText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
  },
  inputPrefix: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
  },
  inputSuffix: {
    fontSize: 13,
    fontWeight: '700',
  },
  conversionRow: {
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingRight: 4,
  },
  conversionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pctRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  pctBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  pctBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  aiSignalNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  aiSignalNoteText: {
    fontSize: 11.5,
  },
  executeBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  executeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tpCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  tpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tpTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tpTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  tpToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tpToggleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tpBody: {
    marginTop: 10,
  },
  tpInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 42,
  },
  tpInputPrefix: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  tpTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 0,
  },
  tpInputSuffix: {
    fontSize: 11,
    fontWeight: '800',
  },
  tpPresetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  tpPresetBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  tpPresetText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
