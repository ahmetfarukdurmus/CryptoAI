import { CryptoAsset } from '../types/crypto';

export interface Binance24hrTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
}

// Takip edilen Binance pariteleri
export const TRACKED_SYMBOLS = [
  'BTC', 'ETH', 'SOL', 'AVAX', 'BNB',
  'XRP', 'ADA', 'DOGE', 'DOT', 'LINK',
  'NEAR', 'SUI', 'ARB', 'OP', 'APT',
  'POL', 'ATOM', 'UNI', 'LTC', 'INJ',
];

const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';

// Hacim formatlayıcı (Örn: 1.25B, 850.5M)
export const formatQuoteVolume = (valStr: string): string => {
  const num = parseFloat(valStr);
  if (isNaN(num) || num <= 0) return '0.00';
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  return `${(num / 1_000).toFixed(1)}K`;
};

/**
 * Binance 24hr Ticker API'sinden tüm paritelerin anlık verilerini çeker
 */
export const fetchBinance24hrTickers = async (): Promise<Record<string, Binance24hrTicker>> => {
  try {
    const pairSymbols = TRACKED_SYMBOLS.map((s) => `"${s}USDT"`).join(',');
    const url = `${BINANCE_BASE_URL}/ticker/24hr?symbols=[${pairSymbols}]`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {};
    }

    const data: Binance24hrTicker[] = await res.json();
    const map: Record<string, Binance24hrTicker> = {};

    if (Array.isArray(data)) {
      data.forEach((item) => {
        const base = item.symbol.replace('USDT', '');
        map[base] = item;
      });
    }

    return map;
  } catch {
    // Ağ hatası veya bağlantı kesintisinde sessizce boş nesne döner, UI çökmez
    return {};
  }
};

/**
 * Mevcut coin listesini taze Binance fiyatları ve istatistikleriyle günceller
 */
export const mergeCoinsWithBinance = (
  prevCoins: CryptoAsset[],
  tickers: Record<string, Binance24hrTicker>
): CryptoAsset[] => {
  if (!tickers || Object.keys(tickers).length === 0) {
    return prevCoins;
  }

  return prevCoins.map((coin) => {
    const ticker = tickers[coin.symbol];
    if (!ticker) return coin;

    const newPrice = parseFloat(ticker.lastPrice);
    if (isNaN(newPrice) || newPrice <= 0) return coin;

    const newChange24h = parseFloat(ticker.priceChangePercent) || coin.change24h;
    const newHigh24h = parseFloat(ticker.highPrice) || coin.high24h;
    const newLow24h = parseFloat(ticker.lowPrice) || coin.low24h;
    const newVolume24h = formatQuoteVolume(ticker.quoteVolume) || coin.volume24h;

    // Sparkline güncelle: son noktaya yeni fiyatı ekle
    let newSparkline = [...coin.sparkline];
    if (newSparkline.length > 0) {
      if (Math.abs(newSparkline[newSparkline.length - 1] - newPrice) > 0.0001) {
        newSparkline = [...newSparkline.slice(1), newPrice];
      }
    } else {
      newSparkline = [newPrice];
    }

    return {
      ...coin,
      price: newPrice,
      change24h: Number(newChange24h.toFixed(2)),
      high24h: newHigh24h,
      low24h: newLow24h,
      volume24h: newVolume24h,
      sparkline: newSparkline,
    };
  });
};
