import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Circle,
  G,
  Rect,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { CryptoAsset } from '../../types/crypto';
import { useTheme } from '../../context/ThemeContext';

export type Timeframe = '15m' | '1h' | '4h' | '1D';
export type ChartStyle = 'area' | 'candles';

interface Props {
  coin: CryptoAsset;
  timeframe?: Timeframe;
  onTimeframeChange?: (tf: Timeframe) => void;
}

interface CandlePoint {
  index: number;
  timeLabel: string;
  fullTime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  price: number; // close
  upperBand: number;
  lowerBand: number;
  middleBand: number;
}

// 1. Dinamik Zaman Serisi ve Bollinger Bandı Üreticisi
const generateChartData = (
  coin: CryptoAsset,
  timeframe: Timeframe
): CandlePoint[] => {
  const count = 30;
  const currentPrice = coin.price;
  const spark = coin.sparkline && coin.sparkline.length > 0 ? coin.sparkline : [currentPrice];
  
  // Zaman dilimi adımları (dakika)
  const stepMinutes =
    timeframe === '15m' ? 15 : timeframe === '1h' ? 60 : timeframe === '4h' ? 240 : 1440;
  const now = Date.now();

  // Temel fiyat eğilimi
  const rawPrices: number[] = [];
  const sparkLen = spark.length;

  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1); // 0 -> 1
    const sparkIdx = Math.min(Math.floor(progress * (sparkLen - 1)), sparkLen - 1);
    const sparkVal = spark[sparkIdx];

    // Zaman dilimine göre volatilite katsayısı
    const vol =
      timeframe === '15m' ? 0.003 : timeframe === '1h' ? 0.007 : timeframe === '4h' ? 0.015 : 0.035;
    
    // Rastgele pazar mikro-salınımı (deterministik i-tabanlı)
    const wave = Math.sin(i * 0.9) * vol * currentPrice * 0.3;
    const noise = Math.cos(i * 1.7) * vol * currentPrice * 0.2;

    const baseRatio = sparkVal / (spark[sparkLen - 1] || currentPrice);
    let p = currentPrice * (0.88 + baseRatio * 0.12) + wave + noise;

    // Son nokta tam anlık fiyat olsun
    if (i === count - 1) {
      p = currentPrice;
    }
    rawPrices.push(p);
  }

  // Bollinger Bantları Hesabı (Periyot: 12, Çarpan: 2)
  const period = 12;
  const k = 2;

  const points: CandlePoint[] = [];

  for (let i = 0; i < count; i++) {
    const close = rawPrices[i];
    const prevClose = i > 0 ? rawPrices[i - 1] : close * 0.998;

    // Gerçekçi mum gövdesi ve fitilleri
    const candleVol = close * (timeframe === '15m' ? 0.002 : 0.005);
    const open = prevClose;
    const high = Math.max(open, close) + Math.abs(Math.sin(i * 2.1)) * candleVol;
    const low = Math.min(open, close) - Math.abs(Math.cos(i * 1.8)) * candleVol;

    // SMA ve Standart Sapma
    const windowStart = Math.max(0, i - period + 1);
    const slice = rawPrices.slice(windowStart, i + 1);
    const sma = slice.reduce((a, b) => a + b, 0) / slice.length;

    const variance =
      slice.reduce((acc, val) => acc + Math.pow(val - sma, 2), 0) / slice.length;
    const stdDev = Math.sqrt(variance);

    const upperBand = sma + k * stdDev;
    const lowerBand = sma - k * stdDev;

    // Zaman formatı
    const pointTime = new Date(now - (count - 1 - i) * stepMinutes * 60 * 1000);
    const hours = pointTime.getHours().toString().padStart(2, '0');
    const mins = pointTime.getMinutes().toString().padStart(2, '0');
    const day = pointTime.getDate();
    const month = pointTime.toLocaleDateString('tr-TR', { month: 'short' });

    const timeLabel = timeframe === '1D' || timeframe === '4h' ? `${day} ${month}` : `${hours}:${mins}`;
    const fullTime = `${day} ${month} ${hours}:${mins}`;

    points.push({
      index: i,
      timeLabel,
      fullTime,
      open,
      high,
      low,
      close,
      price: close,
      upperBand,
      lowerBand,
      middleBand: sma,
    });
  }

  return points;
};

// 2. Bezier Spline SVG Path Üreticisi
const buildBezierPath = (
  coords: { x: number; y: number }[],
  isClosed = false,
  bottomY = 0
): string => {
  if (coords.length === 0) return '';
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;

  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(coords.length - 1, i + 2)];

    // Catmull-Rom kontrol noktaları
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  if (isClosed) {
    const last = coords[coords.length - 1];
    const first = coords[0];
    d += ` L ${last.x.toFixed(1)} ${bottomY.toFixed(1)} L ${first.x.toFixed(1)} ${bottomY.toFixed(1)} Z`;
  }

  return d;
};

export const TradingViewChart: React.FC<Props> = ({
  coin,
  timeframe = '1h',
  onTimeframeChange,
}) => {
  const { colors } = useTheme();
  const [internalTf, setInternalTf] = useState<Timeframe>(timeframe);
  const selectedTf = timeframe || internalTf;
  const [chartStyle, setChartStyle] = useState<ChartStyle>('area');
  const [showBollinger, setShowBollinger] = useState(true);

  // Crosshair state
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [chartWidth, setChartWidth] = useState(340);
  const chartHeight = 220;

  const padding = { top: 20, bottom: 26, left: 8, right: 8 };

  const handleTimeframeSelect = (tf: Timeframe) => {
    setInternalTf(tf);
    setActiveIndex(null);
    if (onTimeframeChange) {
      onTimeframeChange(tf);
    }
  };

  // Zaman serisi verisi
  const data = useMemo(
    () => generateChartData(coin, selectedTf),
    [coin, selectedTf]
  );

  // Min ve Max Fiyat sınırları (Bollinger bantları dahil)
  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    data.forEach((p) => {
      const candidates = [p.low, p.high, p.close];
      if (showBollinger) {
        candidates.push(p.upperBand, p.lowerBand);
      }
      candidates.forEach((c) => {
        if (c < min) min = c;
        if (c > max) max = c;
      });
    });

    const pad = (max - min) * 0.08 || 1;
    return { minVal: min - pad, maxVal: max + pad };
  }, [data, showBollinger]);

  // Koordinat dönüşüm fonksiyonları
  const getX = useCallback(
    (index: number) => {
      const usableWidth = chartWidth - padding.left - padding.right;
      return padding.left + (index / (data.length - 1)) * usableWidth;
    },
    [chartWidth, data.length, padding.left, padding.right]
  );

  const getY = useCallback(
    (val: number) => {
      const usableHeight = chartHeight - padding.top - padding.bottom;
      return (
        chartHeight -
        padding.bottom -
        ((val - minVal) / (maxVal - minVal || 1)) * usableHeight
      );
    },
    [chartHeight, minVal, maxVal, padding.top, padding.bottom]
  );

  // SVG Yolları
  const { pricePath, areaPath, upperBPath, lowerBPath, bandFillPath } = useMemo(() => {
    const priceCoords = data.map((d) => ({ x: getX(d.index), y: getY(d.close) }));
    const upperCoords = data.map((d) => ({ x: getX(d.index), y: getY(d.upperBand) }));
    const lowerCoords = data.map((d) => ({ x: getX(d.index), y: getY(d.lowerBand) }));

    const pPath = buildBezierPath(priceCoords);
    const aPath = buildBezierPath(priceCoords, true, chartHeight - padding.bottom);

    const uPath = buildBezierPath(upperCoords);
    const lPath = buildBezierPath(lowerCoords);

    // Bollinger Bandı Kanal Dolgusu (Upper -> Lower ters -> Z)
    let bFill = '';
    if (upperCoords.length > 0 && lowerCoords.length > 0) {
      bFill = buildBezierPath(upperCoords);
      const reversedLower = [...lowerCoords].reverse();
      reversedLower.forEach((p, idx) => {
        bFill += idx === 0 ? ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      });
      bFill += ' Z';
    }

    return {
      pricePath: pPath,
      areaPath: aPath,
      upperBPath: uPath,
      lowerBPath: lPath,
      bandFillPath: bFill,
    };
  }, [data, getX, getY, chartHeight, padding.bottom]);

  // PanResponder Dokunmatik Crosshair
  const updateCrosshair = useCallback(
    (locationX: number) => {
      const usableWidth = chartWidth - padding.left - padding.right;
      const relativeX = locationX - padding.left;
      const ratio = Math.max(0, Math.min(1, relativeX / usableWidth));
      const idx = Math.round(ratio * (data.length - 1));
      setActiveIndex(Math.max(0, Math.min(data.length - 1, idx)));
    },
    [chartWidth, data.length, padding.left, padding.right]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          updateCrosshair(evt.nativeEvent.locationX);
        },
        onPanResponderMove: (evt) => {
          updateCrosshair(evt.nativeEvent.locationX);
        },
        onPanResponderRelease: () => {
          // Dokunuş bitince 2.2 sn sonra aktif noktayı temizle
          setTimeout(() => {
            setActiveIndex(null);
          }, 2200);
        },
        onPanResponderTerminate: () => {
          setActiveIndex(null);
        },
      }),
    [updateCrosshair]
  );

  // Aktif nokta veya son nokta
  const currentPoint = activeIndex !== null ? data[activeIndex] : data[data.length - 1];
  const firstPoint = data[0];
  const periodChangePercent =
    firstPoint && currentPoint
      ? ((currentPoint.close - firstPoint.close) / firstPoint.close) * 100
      : coin.change24h;

  const isPositive = periodChangePercent >= 0;
  const strokeColor = isPositive ? '#10B981' : '#EF4444';
  const glowColor = isPositive ? '#00F2FE' : '#F43F5E';

  // Formatlayıcı
  const formatPrice = (val: number) =>
    val < 1
      ? `$${val.toFixed(4)}`
      : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
        },
      ]}
      onLayout={(e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width - 32;
        if (w > 100) setChartWidth(w);
      }}
    >
      {/* 1. KART BAŞLIĞI & KONTROLLER */}
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <View style={styles.badgeRow}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Fiyat & Bollinger Kanalı
            </Text>
            {showBollinger && (
              <View style={styles.indicatorPill}>
                <View style={styles.indicatorDot} />
                <Text style={styles.indicatorPillText}>BB(12, 2)</Text>
              </View>
            )}
          </View>
          <Text style={[styles.subText, { color: colors.textMuted }]}>
            {activeIndex !== null ? `Zaman: ${currentPoint.fullTime}` : 'Canlı Piyasa & AI Trend'}
          </Text>
        </View>

        {/* Araç Butonları (Stil & Bollinger Aç/Kapa) */}
        <View style={styles.toolButtons}>
          <TouchableOpacity
            onPress={() => setShowBollinger(!showBollinger)}
            style={[
              styles.toolBtn,
              { backgroundColor: showBollinger ? 'rgba(0, 242, 254, 0.15)' : colors.inputBg },
            ]}
          >
            <Text
              style={[
                styles.toolBtnText,
                { color: showBollinger ? '#00F2FE' : colors.textMuted },
              ]}
            >
              BB
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setChartStyle(chartStyle === 'area' ? 'candles' : 'area')}
            style={[styles.toolBtn, { backgroundColor: colors.inputBg }]}
          >
            <Ionicons
              name={chartStyle === 'area' ? 'stats-chart' : 'analytics'}
              size={14}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. DİNAMİK ZAMAN SEÇİCİ SEKMELERİ (15m, 1h, 4h, 1D) */}
      <View style={[styles.timeframeBar, { backgroundColor: colors.inputBg }]}>
        {(['15m', '1h', '4h', '1D'] as Timeframe[]).map((tf) => {
          const active = selectedTf === tf;
          return (
            <TouchableOpacity
              key={tf}
              onPress={() => handleTimeframeSelect(tf)}
              style={[
                styles.tfBtn,
                active && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.tfBtnText,
                  { color: active ? '#FFFFFF' : colors.textMuted },
                  active && styles.tfBtnTextActive,
                ]}
              >
                {tf}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. CANLI / ETKİLEŞİMLİ FİYAT BALONU (TOOLTIP OVERLAY) */}
      <View style={[styles.priceOverlay, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}>
        <View style={styles.priceRow}>
          <Text style={[styles.activePriceText, { color: colors.textPrimary }]}>
            {formatPrice(currentPoint.close)}
          </Text>
          <View
            style={[
              styles.changeBadge,
              { backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' },
            ]}
          >
            <Ionicons
              name={isPositive ? 'arrow-up' : 'arrow-down'}
              size={11}
              color={strokeColor}
            />
            <Text style={[styles.changeText, { color: strokeColor }]}>
              {isPositive ? '+' : ''}
              {periodChangePercent.toFixed(2)}%
            </Text>
          </View>
        </View>

        {showBollinger && (
          <View style={styles.bbLegendRow}>
            <Text style={[styles.bbLegendItem, { color: 'rgba(0, 242, 254, 0.8)' }]}>
              Üst: {formatPrice(currentPoint.upperBand)}
            </Text>
            <Text style={[styles.bbLegendItem, { color: 'rgba(255, 255, 255, 0.5)' }]}>
              Orta: {formatPrice(currentPoint.middleBand)}
            </Text>
            <Text style={[styles.bbLegendItem, { color: 'rgba(0, 242, 254, 0.8)' }]}>
              Alt: {formatPrice(currentPoint.lowerBand)}
            </Text>
          </View>
        )}
      </View>

      {/* 4. PROFESYONEL VE ETKİLEŞİMLİ SVG GRAFİK ALANI */}
      <View style={styles.chartWrapper} {...panResponder.panHandlers}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            {/* Alan Gradyanı: Neon Üstten Şeffaf Alta */}
            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={isPositive ? '#00F2FE' : '#EF4444'} stopOpacity="0.32" />
              <Stop offset="50%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity="0.10" />
              <Stop offset="100%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity="0.0" />
            </LinearGradient>

            {/* Bollinger Kanal Şeffaf Neon Dolgu */}
            <LinearGradient id="bollingerGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#00F2FE" stopOpacity="0.06" />
              <Stop offset="100%" stopColor="#00F2FE" stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          {/* Yatay Kılavuz Çizgileri */}
          {[0.25, 0.5, 0.75].map((ratio, idx) => {
            const yPos = padding.top + (chartHeight - padding.top - padding.bottom) * ratio;
            return (
              <Line
                key={`grid-${idx}`}
                x1={padding.left}
                y1={yPos}
                x2={chartWidth - padding.right}
                y2={yPos}
                stroke={colors.border}
                strokeWidth={0.8}
                strokeDasharray="4 4"
                opacity={0.4}
              />
            );
          })}

          {/* TEKNİK GÖSTERGE: Bollinger Bantları Kanalı */}
          {showBollinger && (
            <G>
              {/* Kanal Gölgesi */}
              {bandFillPath ? (
                <Path d={bandFillPath} fill="url(#bollingerGradient)" />
              ) : null}

              {/* Üst Bollinger Bandı (Neon Cyan Kesikli Çizgi) */}
              <Path
                d={upperBPath}
                stroke="rgba(0, 242, 254, 0.5)"
                strokeWidth={1.2}
                strokeDasharray="3 3"
                fill="none"
              />

              {/* Alt Bollinger Bandı (Neon Cyan Kesikli Çizgi) */}
              <Path
                d={lowerBPath}
                stroke="rgba(0, 242, 254, 0.5)"
                strokeWidth={1.2}
                strokeDasharray="3 3"
                fill="none"
              />
            </G>
          )}

          {/* GRAFİK TİPİ: Alan / Çizgi (Bezier) */}
          {chartStyle === 'area' ? (
            <G>
              {/* Neon Gölge Dolgusu */}
              <Path d={areaPath} fill="url(#areaGradient)" />

              {/* Ana Pürüzsüz Bezier Çizgisi */}
              <Path
                d={pricePath}
                stroke={strokeColor}
                strokeWidth={2.4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </G>
          ) : (
            /* GRAFİK TİPİ: Mum Grafiği (Candlesticks) */
            <G>
              {data.map((c) => {
                const cx = getX(c.index);
                const isGreen = c.close >= c.open;
                const candleColor = isGreen ? '#10B981' : '#EF4444';

                const openY = getY(c.open);
                const closeY = getY(c.close);
                const highY = getY(c.high);
                const lowY = getY(c.low);

                const topY = Math.min(openY, closeY);
                const bodyHeight = Math.max(2, Math.abs(closeY - openY));
                const candleWidth = Math.max(3, (chartWidth / data.length) * 0.55);

                return (
                  <G key={`candle-${c.index}`}>
                    {/* İnce Fitil (Wick) */}
                    <Line
                      x1={cx}
                      y1={highY}
                      x2={cx}
                      y2={lowY}
                      stroke={candleColor}
                      strokeWidth={1.2}
                      opacity={0.8}
                    />
                    {/* Mum Gövdesi (Body) */}
                    <Rect
                      x={cx - candleWidth / 2}
                      y={topY}
                      width={candleWidth}
                      height={bodyHeight}
                      fill={candleColor}
                      rx={1.5}
                    />
                  </G>
                );
              })}
            </G>
          )}

          {/* DOKUNMATİK CROSSHAIR VE KILAVUZ ÇİZGİSİ */}
          {activeIndex !== null ? (
            <G>
              {/* Dikey Kılavuz Çizgisi (Vertical Guide Line) */}
              <Line
                x1={getX(activeIndex)}
                y1={padding.top}
                x2={getX(activeIndex)}
                y2={chartHeight - padding.bottom}
                stroke="#FFFFFF"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.65}
              />

              {/* Yatay Kılavuz Çizgisi (Horizontal Guide Line) */}
              <Line
                x1={padding.left}
                y1={getY(currentPoint.close)}
                x2={chartWidth - padding.right}
                y2={getY(currentPoint.close)}
                stroke="#FFFFFF"
                strokeWidth={0.8}
                strokeDasharray="3 3"
                opacity={0.35}
              />

              {/* Kesişim Dairesi (Glowing Focal Node) */}
              <Circle
                cx={getX(activeIndex)}
                cy={getY(currentPoint.close)}
                r={7}
                fill={glowColor}
                opacity={0.3}
              />
              <Circle
                cx={getX(activeIndex)}
                cy={getY(currentPoint.close)}
                r={3.8}
                fill="#FFFFFF"
                stroke={strokeColor}
                strokeWidth={2}
              />
            </G>
          ) : (
            /* Parmak dokunmadığında canlı son fiyat parıltı noktası */
            <G>
              <Circle
                cx={getX(data.length - 1)}
                cy={getY(coin.price)}
                r={6}
                fill={glowColor}
                opacity={0.4}
              />
              <Circle
                cx={getX(data.length - 1)}
                cy={getY(coin.price)}
                r={3}
                fill="#FFFFFF"
                stroke={strokeColor}
                strokeWidth={2}
              />
            </G>
          )}
        </Svg>
      </View>

      {/* 5. GRAFİK ALT BİLGİ & ZAMAN DAMGALARI */}
      <View style={styles.timeAxisRow}>
        <Text style={[styles.axisText, { color: colors.textMuted }]}>
          {data[0]?.timeLabel}
        </Text>
        <Text style={[styles.axisText, { color: colors.textMuted }]}>
          {data[Math.floor(data.length / 2)]?.timeLabel}
        </Text>
        <Text style={[styles.axisText, { color: colors.textMuted }]}>
          {data[data.length - 1]?.timeLabel}
        </Text>
      </View>

      {/* Düşük & Yüksek 24s Göstergesi */}
      <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
        <View style={styles.rangeCol}>
          <Text style={[styles.rangeLabel, { color: colors.textMuted }]}>En Düşük (24s)</Text>
          <Text style={[styles.rangeVal, { color: colors.textPrimary }]}>
            ${coin.low24h.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <View style={styles.centerRangeBar}>
          <View style={[styles.trackBg, { backgroundColor: colors.inputBg }]}>
            {(() => {
              const range = coin.high24h - coin.low24h || 1;
              const posPercent = Math.max(
                0,
                Math.min(100, ((coin.price - coin.low24h) / range) * 100)
              );
              return (
                <View
                  style={[
                    styles.trackFill,
                    { width: `${posPercent}%`, backgroundColor: strokeColor },
                  ]}
                />
              );
            })()}
          </View>
        </View>

        <View style={[styles.rangeCol, { alignItems: 'flex-end' }]}>
          <Text style={[styles.rangeLabel, { color: colors.textMuted }]}>En Yüksek (24s)</Text>
          <Text style={[styles.rangeVal, { color: colors.textPrimary }]}>
            ${coin.high24h.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  indicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 242, 254, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    gap: 4,
  },
  indicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00F2FE',
  },
  indicatorPillText: {
    color: '#00F2FE',
    fontSize: 10,
    fontWeight: '700',
  },
  subText: {
    fontSize: 11,
    marginTop: 2,
  },
  toolButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeframeBar: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 3,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  tfBtn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tfBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tfBtnTextActive: {
    fontWeight: '800',
  },
  priceOverlay: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activePriceText: {
    fontSize: 20,
    fontWeight: '800',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bbLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  bbLegendItem: {
    fontSize: 10,
    fontWeight: '600',
  },
  chartWrapper: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  timeAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
    marginBottom: 12,
  },
  axisText: {
    fontSize: 10,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  rangeCol: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  rangeVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  centerRangeBar: {
    flex: 1.5,
    paddingHorizontal: 8,
  },
  trackBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
  },
});
