import React, { useState, memo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface TargetEditModalProps {
  visible: boolean;
  onClose: () => void;
  symbol: string;
  coinName?: string;
  currentPrice: number;
  initialTargetProfit: number;
  initialStopLoss: number;
  onSave: (targetProfit: number, stopLoss: number) => void;
}

export const TargetEditModal: React.FC<TargetEditModalProps> = memo(({
  visible,
  onClose,
  symbol,
  coinName,
  currentPrice,
  initialTargetProfit,
  initialStopLoss,
  onSave,
}) => {
  const { colors, isDark } = useTheme();

  const [prevVisible, setPrevVisible] = useState(visible);
  const [tpInput, setTpInput] = useState(initialTargetProfit > 0 ? initialTargetProfit.toString() : '');
  const [slInput, setSlInput] = useState(initialStopLoss > 0 ? initialStopLoss.toString() : '');

  // Modal açıldığında değerleri başlangıç seviyelerine senkronize et (React 19 render-time state adjustment)
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setTpInput(initialTargetProfit > 0 ? initialTargetProfit.toString() : '');
      setSlInput(initialStopLoss > 0 ? initialStopLoss.toString() : '');
    }
  }

  const formatPrice = (val: number) =>
    val < 1
      ? `$${val.toFixed(4)}`
      : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const setTpPreset = (type: 'delta' | 'pct', val: number) => {
    let target = 0;
    if (type === 'delta') {
      target = currentPrice + val;
    } else {
      target = currentPrice * (1 + val / 100);
    }
    setTpInput(target < 1 ? target.toFixed(4) : target.toFixed(2));
  };

  const setSlPreset = (type: 'delta' | 'pct', val: number) => {
    let target = 0;
    if (type === 'delta') {
      target = Math.max(0.0001, currentPrice - val);
    } else {
      target = Math.max(0.0001, currentPrice * (1 - val / 100));
    }
    setSlInput(target < 1 ? target.toFixed(4) : target.toFixed(2));
  };

  const handleSave = () => {
    const tpNum = parseFloat(tpInput.replace(',', '.'));
    const slNum = parseFloat(slInput.replace(',', '.'));

    const validTp = !isNaN(tpNum) && tpNum > 0 ? tpNum : initialTargetProfit;
    const validSl = !isNaN(slNum) && slNum > 0 ? slNum : initialStopLoss;

    onSave(validTp, validSl);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.card,
              {
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.96)' : colors.cardBg,
                borderColor: isDark ? 'rgba(51, 65, 85, 0.8)' : colors.border,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.headerRow}>
              <View>
                <View style={styles.titleWithBadge}>
                  <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : colors.textPrimary }]}>
                    {symbol} Emir Hedefleri
                  </Text>
                  {coinName ? (
                    <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                      ({coinName})
                    </Text>
                  ) : null}
                </View>
                <View style={styles.livePriceRow}>
                  <View style={styles.liveDot} />
                  <Text style={[styles.livePriceText, { color: colors.textSecondary }]}>
                    Canlı Piyasa Fiyatı: <Text style={{ color: colors.primary, fontWeight: '800' }}>{formatPrice(currentPrice)}</Text>
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.inputBg }]}>
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* 1. Take-Profit (Hedef Kâr) Bölümü */}
              <View style={[styles.targetSection, { borderColor: 'rgba(16, 185, 129, 0.35)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="flag" size={15} color="#10B981" />
                    <Text style={[styles.sectionTitle, { color: '#10B981' }]}>Take-Profit (Hedef Kâr)</Text>
                  </View>
                  <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
                    Fiyat bu seviyeye veya üstüne çıktığında kârla otomatik satılır.
                  </Text>
                </View>

                {/* Serbest Input */}
                <View style={[styles.inputBox, { backgroundColor: isDark ? 'rgba(2, 6, 23, 0.7)' : colors.inputBg, borderColor: 'rgba(16, 185, 129, 0.4)' }]}>
                  <Text style={[styles.currencyPrefix, { color: '#10B981' }]}>$</Text>
                  <TextInput
                    value={tpInput}
                    onChangeText={setTpInput}
                    keyboardType="decimal-pad"
                    placeholder="Hedef satış fiyatı girin"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.inputField, { color: isDark ? '#FFFFFF' : colors.textPrimary }]}
                  />
                </View>

                {/* Hızlı Seçim Butonları (Test için +$2 dahil) */}
                <View style={styles.presetRow}>
                  <Text style={[styles.presetLabel, { color: colors.textMuted }]}>Hızlı Seçim:</Text>
                  <TouchableOpacity onPress={() => setTpPreset('delta', 2)} style={[styles.presetBtn, { borderColor: 'rgba(16, 185, 129, 0.4)' }]}>
                    <Text style={[styles.presetBtnText, { color: '#10B981' }]}>+$2 (Test)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setTpPreset('delta', 10)} style={[styles.presetBtn, { borderColor: 'rgba(16, 185, 129, 0.4)' }]}>
                    <Text style={[styles.presetBtnText, { color: '#10B981' }]}>+$10</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setTpPreset('pct', 2)} style={[styles.presetBtn, { borderColor: 'rgba(16, 185, 129, 0.4)' }]}>
                    <Text style={[styles.presetBtnText, { color: '#10B981' }]}>+%2</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setTpPreset('pct', 5)} style={[styles.presetBtn, { borderColor: 'rgba(16, 185, 129, 0.4)' }]}>
                    <Text style={[styles.presetBtnText, { color: '#10B981' }]}>+%5</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 2. Stop-Loss (Zarar Kes) Bölümü */}
              <View style={[styles.targetSection, { borderColor: 'rgba(239, 68, 68, 0.35)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="shield" size={15} color="#EF4444" />
                    <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Stop-Loss (Zarar Kes)</Text>
                  </View>
                  <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
                    Fiyat bu seviyeye veya altına düştüğünde AUTO_STOP_LOSS tetiklenir.
                  </Text>
                </View>

                {/* Serbest Input */}
                <View style={[styles.inputBox, { backgroundColor: isDark ? 'rgba(2, 6, 23, 0.7)' : colors.inputBg, borderColor: 'rgba(239, 68, 68, 0.4)' }]}>
                  <Text style={[styles.currencyPrefix, { color: '#EF4444' }]}>$</Text>
                  <TextInput
                    value={slInput}
                    onChangeText={setSlInput}
                    keyboardType="decimal-pad"
                    placeholder="Zarar kes fiyatı girin"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.inputField, { color: isDark ? '#FFFFFF' : colors.textPrimary }]}
                  />
                </View>

                {/* Hızlı Seçim Butonları (Test için -$2 dahil) */}
                <View style={styles.presetRow}>
                  <Text style={[styles.presetLabel, { color: colors.textMuted }]}>Hızlı Seçim:</Text>
                  <TouchableOpacity onPress={() => setSlPreset('delta', 2)} style={[styles.presetBtn, { borderColor: 'rgba(239, 68, 68, 0.4)' }]}>
                    <Text style={[styles.presetBtnText, { color: '#EF4444' }]}>-$2 (Test)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSlPreset('delta', 10)} style={[styles.presetBtn, { borderColor: 'rgba(239, 68, 68, 0.4)' }]}>
                    <Text style={[styles.presetBtnText, { color: '#EF4444' }]}>-$10</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSlPreset('pct', 1)} style={[styles.presetBtn, { borderColor: 'rgba(239, 68, 68, 0.4)' }]}>
                    <Text style={[styles.presetBtnText, { color: '#EF4444' }]}>-%1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSlPreset('pct', 3)} style={[styles.presetBtn, { borderColor: 'rgba(239, 68, 68, 0.4)' }]}>
                    <Text style={[styles.presetBtnText, { color: '#EF4444' }]}>-%3</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Aksiyon Butonları */}
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { backgroundColor: colors.inputBg }]}>
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Vazgeç</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark-done" size={16} color="#000000" />
                <Text style={styles.saveBtnText}>Hedefleri Kaydet</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
});

TargetEditModal.displayName = 'TargetEditModal';

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 22,
    borderWidth: 1.2,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  livePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00F2FE',
  },
  livePriceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 6,
  },
  targetSection: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHint: {
    fontSize: 11,
    lineHeight: 15,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginBottom: 8,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '800',
    marginRight: 6,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  presetLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    marginRight: 2,
  },
  presetBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
});
