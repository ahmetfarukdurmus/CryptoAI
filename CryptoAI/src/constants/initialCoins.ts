import { CryptoAsset } from '../types/crypto';

export const INITIAL_COINS: CryptoAsset[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 64250.00,
    change24h: 3.42,
    volume24h: '38.4B',
    high24h: 64800.00,
    low24h: 62100.00,
    marketCap: '1.26T',
    sparkline: [62100, 62500, 62300, 63100, 63800, 63400, 64250],
    signal: {
      action: 'GÜÇLÜ AL',
      confidence: 88,
      direction: 'YÜKSELİŞ',
      targetProfit: 67500.00,
      stopLoss: 62800.00,
      reasoning: [
        'RSI 58.2 - Pozitif momentuma sahip dengeli alım bölgesi.',
        'MACD Golden Cross teyit edildi, histogram pozitif bölgeye geçti.',
        'Binance spot kümülatif hacim deltası (CVD) alıcı baskısını gösteriyor.',
        'NLP Duygu Analizi: Son haber akışı %79 pozitif güven indeksinde.'
      ],
      indicators: {
        rsi: 58.2,
        macd: 'Boğa Kesişimi (Bullish Cross)',
        bollinger: 'Orta bandın üzerinde, üst banda doğru genişleme',
        emaTrend: 'EMA 20 > EMA 50 (Güçlü Yükseliş)',
        sentimentScore: 79
      },
      supportLevel: 62400.00,
      resistanceLevel: 66000.00,
      timestamp: '14:35'
    }
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3480.50,
    change24h: 4.15,
    volume24h: '19.2B',
    high24h: 3520.00,
    low24h: 3320.00,
    marketCap: '418.5B',
    sparkline: [3320, 3350, 3400, 3380, 3440, 3460, 3480.5],
    signal: {
      action: 'GÜÇLÜ AL',
      confidence: 84,
      direction: 'YÜKSELİŞ',
      targetProfit: 3680.00,
      stopLoss: 3380.00,
      reasoning: [
        'Direnç seviyesi $3450 hacimli bir mumla yukarı kırıldı.',
        'Ağ aktivitesi ve Layer 2 gaz tüketimi son 7 günün zirvesinde.',
        'XGBoost sınıflandırıcı 4 saatlik periyotta %84 yükseliş olasılığı öngörüyor.'
      ],
      indicators: {
        rsi: 62.4,
        macd: 'Yükseliş Trendi Güçleniyor',
        bollinger: 'Üst bant zorlanıyor',
        emaTrend: 'EMA 20, 50 ve 200 üzerinde',
        sentimentScore: 82
      },
      supportLevel: 3390.00,
      resistanceLevel: 3550.00,
      timestamp: '14:34'
    }
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    price: 152.80,
    change24h: 6.85,
    volume24h: '5.1B',
    high24h: 155.20,
    low24h: 141.50,
    marketCap: '71.2B',
    sparkline: [141.5, 143, 147, 145, 149, 151, 152.8],
    signal: {
      action: 'GÜÇLÜ AL',
      confidence: 89,
      direction: 'YÜKSELİŞ',
      targetProfit: 168.00,
      stopLoss: 145.00,
      reasoning: [
        'DEX işlem hacminde liderlik sürüyor.',
        'Teknik indikatörlerde flama formasyonu yukarı kırılım yaptı.',
        'LightGBM tahminleme modeli kısa vadede %89 yön tayini bildirdi.'
      ],
      indicators: {
        rsi: 66.8,
        macd: 'Kuvvetli Pozitif Histogram',
        bollinger: 'Üst banda yapışık yükseliş kanalı',
        emaTrend: 'Parabolik EMA açılımı',
        sentimentScore: 88
      },
      supportLevel: 146.00,
      resistanceLevel: 158.00,
      timestamp: '14:32'
    }
  },
  {
    id: 'avalanche',
    symbol: 'AVAX',
    name: 'Avalanche',
    price: 28.40,
    change24h: -1.20,
    volume24h: '680M',
    high24h: 29.80,
    low24h: 27.90,
    marketCap: '11.4B',
    sparkline: [29.5, 29.8, 29.1, 28.8, 28.5, 28.2, 28.4],
    signal: {
      action: 'NÖTR',
      confidence: 55,
      direction: 'YATAY',
      targetProfit: 30.50,
      stopLoss: 27.20,
      reasoning: [
        'Fiyat dar bir konsolidasyon bandında (28$ - 29$) sıkışmış durumda.',
        'Hacim azalışı var, kırılım beklenmeli.',
        'RSI nötr 50 seviyesinde dalgalanıyor.'
      ],
      indicators: {
        rsi: 49.5,
        macd: 'Yatay / Kararsız kesişim',
        bollinger: 'Bantlar daralıyor (Squeeze hazırlığı)',
        emaTrend: 'EMA 20 ve 50 birbirine paralel',
        sentimentScore: 52
      },
      supportLevel: 27.50,
      resistanceLevel: 29.60,
      timestamp: '14:28'
    }
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    price: 592.10,
    change24h: 1.80,
    volume24h: '1.2B',
    high24h: 598.00,
    low24h: 580.00,
    marketCap: '88.3B',
    sparkline: [580, 584, 588, 586, 590, 591, 592.1],
    signal: {
      action: 'AL',
      confidence: 74,
      direction: 'YÜKSELİŞ',
      targetProfit: 620.00,
      stopLoss: 578.00,
      reasoning: [
        'Launchpool duyuruları ve zincir üstü aktivite olumlu.',
        'İstikrarlı destekten tepki aldı.'
      ],
      indicators: {
        rsi: 54.1,
        macd: 'Hafif Boğa Eğilimi',
        bollinger: 'Orta seviyede dengeli',
        emaTrend: 'EMA 50 üzerinde tutunma',
        sentimentScore: 68
      },
      supportLevel: 582.00,
      resistanceLevel: 605.00,
      timestamp: '14:20'
    }
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP',
    price: 0.584,
    change24h: -2.40,
    volume24h: '1.8B',
    high24h: 0.612,
    low24h: 0.575,
    marketCap: '32.9B',
    sparkline: [0.608, 0.612, 0.598, 0.590, 0.582, 0.579, 0.584],
    signal: {
      action: 'SAT',
      confidence: 76,
      direction: 'DÜŞÜŞ',
      targetProfit: 0.540,
      stopLoss: 0.605,
      reasoning: [
        '0.60$ psikolojik desteği aşağı yönlü kırıldı.',
        'Balina cüzdan transferlerinde borsalara giriş gözlendi.',
        'RSI aşağı yönlü ivmeleniyor.'
      ],
      indicators: {
        rsi: 38.6,
        macd: 'Ayı Kesişimi (Bearish Divergence)',
        bollinger: 'Alt bant genişliyor',
        emaTrend: 'EMA 20 < EMA 50',
        sentimentScore: 41
      },
      supportLevel: 0.560,
      resistanceLevel: 0.600,
      timestamp: '14:15'
    }
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.362,
    change24h: 0.95,
    volume24h: '340M',
    high24h: 0.371,
    low24h: 0.354,
    marketCap: '12.8B',
    sparkline: [0.355, 0.358, 0.364, 0.360, 0.361, 0.359, 0.362],
    signal: {
      action: 'NÖTR',
      confidence: 60,
      direction: 'YATAY',
      targetProfit: 0.385,
      stopLoss: 0.345,
      reasoning: [
        'Fiyat taban oluşturma sürecinde.',
        'Açık pozisyon sayısı yatay seyre işaret ediyor.'
      ],
      indicators: {
        rsi: 48.0,
        macd: 'Düz çizgide kesişimsiz',
        bollinger: 'Dar aralıkta',
        emaTrend: 'EMA 50 ile kesişim noktasında',
        sentimentScore: 50
      },
      supportLevel: 0.350,
      resistanceLevel: 0.375,
      timestamp: '14:10'
    }
  },
  {
    id: 'dogecoin',
    symbol: 'DOGE',
    name: 'Dogecoin',
    price: 0.118,
    change24h: 5.30,
    volume24h: '1.4B',
    high24h: 0.122,
    low24h: 0.110,
    marketCap: '17.2B',
    sparkline: [0.111, 0.113, 0.115, 0.114, 0.117, 0.119, 0.118],
    signal: {
      action: 'AL',
      confidence: 78,
      direction: 'YÜKSELİŞ',
      targetProfit: 0.135,
      stopLoss: 0.112,
      reasoning: [
        'Sosyal medya duyarlılığı ve Twitter/X anma hacminde ani sıçrama.',
        'Hacimli kırılım ile kısa pozisyon likidasyonu gerçekleşti.'
      ],
      indicators: {
        rsi: 64.2,
        macd: 'Hızlı yukarı ivme',
        bollinger: 'Üst banda temas',
        emaTrend: 'Kısa vadeli EMA patlaması',
        sentimentScore: 84
      },
      supportLevel: 0.112,
      resistanceLevel: 0.125,
      timestamp: '14:05'
    }
  },
  {
    id: 'polkadot',
    symbol: 'DOT',
    name: 'Polkadot',
    price: 4.62,
    change24h: -0.45,
    volume24h: '190M',
    high24h: 4.75,
    low24h: 4.55,
    marketCap: '6.6B',
    sparkline: [4.68, 4.72, 4.65, 4.60, 4.58, 4.64, 4.62],
    signal: {
      action: 'NÖTR',
      confidence: 52,
      direction: 'YATAY',
      targetProfit: 4.95,
      stopLoss: 4.45,
      reasoning: [
        'Piyasa genelini takip eden düşük korelasyonlu yatay seyir.'
      ],
      indicators: {
        rsi: 46.8,
        macd: 'Nötr eksende',
        bollinger: 'Orta bant civarı',
        emaTrend: 'Yatay',
        sentimentScore: 48
      },
      supportLevel: 4.50,
      resistanceLevel: 4.80,
      timestamp: '13:50'
    }
  },
  {
    id: 'chainlink',
    symbol: 'LINK',
    name: 'Chainlink',
    price: 12.45,
    change24h: 7.20,
    volume24h: '480M',
    high24h: 12.80,
    low24h: 11.50,
    marketCap: '7.5B',
    sparkline: [11.5, 11.7, 12.1, 12.0, 12.3, 12.6, 12.45],
    signal: {
      action: 'GÜÇLÜ AL',
      confidence: 86,
      direction: 'YÜKSELİŞ',
      targetProfit: 14.20,
      stopLoss: 11.80,
      reasoning: [
        'CCIP entegrasyon haberleri ve kurumsal oracles talebi arttı.',
        'XGBoost modeli yüksek güven skoruyla yükseliş sinyali üretti.',
        'RSI 61 ile boğa döngüsünün başında bulunuyor.'
      ],
      indicators: {
        rsi: 61.2,
        macd: 'Boğa Kesişimi Onaylandı',
        bollinger: 'Üst kanal genişliyor',
        emaTrend: 'EMA 20, EMA 50 üstünde',
        sentimentScore: 81
      },
      supportLevel: 11.90,
      resistanceLevel: 13.00,
      timestamp: '13:45'
    }
  },
  {
    id: 'near',
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    price: 5.15,
    change24h: 8.40,
    volume24h: '560M',
    high24h: 5.35,
    low24h: 4.70,
    marketCap: '6.2B',
    sparkline: [4.70, 4.85, 5.00, 4.95, 5.10, 5.25, 5.15],
    signal: {
      action: 'GÜÇLÜ AL',
      confidence: 87,
      direction: 'YÜKSELİŞ',
      targetProfit: 6.00,
      stopLoss: 4.80,
      reasoning: [
        'Kullanıcı AI ajanları entegrasyonu zincir üstü hacmi 2 katına çıkardı.',
        'Direnç kırılımı yüksek hacimle teyit edildi.'
      ],
      indicators: {
        rsi: 68.4,
        macd: 'Kuvvetli Yükseliş Trendi',
        bollinger: 'Üst banda taşma',
        emaTrend: 'Tam Boğa Hizalanması',
        sentimentScore: 86
      },
      supportLevel: 4.85,
      resistanceLevel: 5.40,
      timestamp: '13:30'
    }
  },
  {
    id: 'sui',
    symbol: 'SUI',
    name: 'Sui',
    price: 1.82,
    change24h: 11.20,
    volume24h: '820M',
    high24h: 1.90,
    low24h: 1.60,
    marketCap: '5.1B',
    sparkline: [1.60, 1.66, 1.72, 1.70, 1.78, 1.85, 1.82],
    signal: {
      action: 'GÜÇLÜ AL',
      confidence: 91,
      direction: 'YÜKSELİŞ',
      targetProfit: 2.15,
      stopLoss: 1.68,
      reasoning: [
        'TVL (Kilitli Toplam Değer) tüm zamanların en yüksek seviyesinde.',
        'Yapay zeka algoritması 20 varlık içinde günün en güçlü momentumunu tespit etti.'
      ],
      indicators: {
        rsi: 71.0,
        macd: 'Aşırı Yüksek Momentum',
        bollinger: 'Bant patlaması (Breakout)',
        emaTrend: 'Dikey Yükseliş Eğrisi',
        sentimentScore: 92
      },
      supportLevel: 1.70,
      resistanceLevel: 1.95,
      timestamp: '13:25'
    }
  },
  {
    id: 'arbitrum',
    symbol: 'ARB',
    name: 'Arbitrum',
    price: 0.62,
    change24h: 2.10,
    volume24h: '210M',
    high24h: 0.64,
    low24h: 0.59,
    marketCap: '2.2B',
    sparkline: [0.60, 0.61, 0.63, 0.61, 0.62, 0.63, 0.62],
    signal: {
      action: 'AL',
      confidence: 72,
      direction: 'YÜKSELİŞ',
      targetProfit: 0.70,
      stopLoss: 0.58,
      reasoning: [
        'Ethereum yükselişine paralel olarak L2 tokenlarına fon akışı sürüyor.'
      ],
      indicators: {
        rsi: 53.8,
        macd: 'Pozitif geçiş',
        bollinger: 'Orta-üst bant arası',
        emaTrend: 'EMA 20 destek konumunda',
        sentimentScore: 66
      },
      supportLevel: 0.59,
      resistanceLevel: 0.65,
      timestamp: '13:10'
    }
  },
  {
    id: 'optimism',
    symbol: 'OP',
    name: 'Optimism',
    price: 1.65,
    change24h: 3.50,
    volume24h: '180M',
    high24h: 1.72,
    low24h: 1.58,
    marketCap: '2.0B',
    sparkline: [1.58, 1.60, 1.64, 1.62, 1.66, 1.68, 1.65],
    signal: {
      action: 'AL',
      confidence: 75,
      direction: 'YÜKSELİŞ',
      targetProfit: 1.88,
      stopLoss: 1.55,
      reasoning: [
        'Superchain ekosistem büyümesi ve stabil destek tepkisi.'
      ],
      indicators: {
        rsi: 56.4,
        macd: 'Hafif Boğa',
        bollinger: 'Genişleyen bantlar',
        emaTrend: 'Yukarı yönlü',
        sentimentScore: 71
      },
      supportLevel: 1.58,
      resistanceLevel: 1.74,
      timestamp: '13:00'
    }
  },
  {
    id: 'aptos',
    symbol: 'APT',
    name: 'Aptos',
    price: 8.85,
    change24h: -3.20,
    volume24h: '240M',
    high24h: 9.30,
    low24h: 8.70,
    marketCap: '4.4B',
    sparkline: [9.25, 9.30, 9.10, 8.95, 8.80, 8.75, 8.85],
    signal: {
      action: 'SAT',
      confidence: 77,
      direction: 'DÜŞÜŞ',
      targetProfit: 8.10,
      stopLoss: 9.20,
      reasoning: [
        'Token kilit açılımı öncesi piyasada satış baskısı.',
        'Önemli destek seviyesi test ediliyor, göstergeler zayıf.'
      ],
      indicators: {
        rsi: 39.2,
        macd: 'Düşüş trendi devam ediyor',
        bollinger: 'Alt bantta baskı',
        emaTrend: 'EMA 20 altında',
        sentimentScore: 38
      },
      supportLevel: 8.50,
      resistanceLevel: 9.10,
      timestamp: '12:45'
    }
  },
  {
    id: 'polygon',
    symbol: 'POL',
    name: 'Polygon Ecosystem',
    price: 0.41,
    change24h: 1.10,
    volume24h: '110M',
    high24h: 0.425,
    low24h: 0.40,
    marketCap: '3.1B',
    sparkline: [0.402, 0.406, 0.415, 0.408, 0.412, 0.414, 0.41],
    signal: {
      action: 'NÖTR',
      confidence: 58,
      direction: 'YATAY',
      targetProfit: 0.45,
      stopLoss: 0.38,
      reasoning: [
        'Geçiş süreci sonrası fiyat oturma aşamasında.'
      ],
      indicators: {
        rsi: 48.9,
        macd: 'Durağan',
        bollinger: 'Sıkışık',
        emaTrend: 'Yatay',
        sentimentScore: 54
      },
      supportLevel: 0.395,
      resistanceLevel: 0.430,
      timestamp: '12:30'
    }
  },
  {
    id: 'cosmos',
    symbol: 'ATOM',
    name: 'Cosmos',
    price: 4.80,
    change24h: -1.80,
    volume24h: '120M',
    high24h: 4.98,
    low24h: 4.72,
    marketCap: '1.9B',
    sparkline: [4.95, 4.98, 4.90, 4.84, 4.78, 4.76, 4.80],
    signal: {
      action: 'SAT',
      confidence: 70,
      direction: 'DÜŞÜŞ',
      targetProfit: 4.35,
      stopLoss: 5.05,
      reasoning: [
        'Düşen trend kanalının içinde dirençten red yedi.'
      ],
      indicators: {
        rsi: 41.5,
        macd: 'Ayı Kesişimi',
        bollinger: 'Alt banda doğru eğim',
        emaTrend: 'Düşüş trendinde',
        sentimentScore: 43
      },
      supportLevel: 4.60,
      resistanceLevel: 5.00,
      timestamp: '12:15'
    }
  },
  {
    id: 'uniswap',
    symbol: 'UNI',
    name: 'Uniswap',
    price: 7.65,
    change24h: 4.80,
    volume24h: '310M',
    high24h: 7.85,
    low24h: 7.20,
    marketCap: '4.6B',
    sparkline: [7.20, 7.35, 7.50, 7.42, 7.60, 7.72, 7.65],
    signal: {
      action: 'AL',
      confidence: 81,
      direction: 'YÜKSELİŞ',
      targetProfit: 8.50,
      stopLoss: 7.25,
      reasoning: [
        'Unichain duyurusu sonrası DEX işlem ücreti gelirlerinde artış.',
        'Boğa formasyonu teyit edildi.'
      ],
      indicators: {
        rsi: 63.5,
        macd: 'Pozitif İvme',
        bollinger: 'Genişleyen üst bant',
        emaTrend: 'Güçlü Alım Bölgesi',
        sentimentScore: 80
      },
      supportLevel: 7.30,
      resistanceLevel: 7.95,
      timestamp: '12:00'
    }
  },
  {
    id: 'litecoin',
    symbol: 'LTC',
    name: 'Litecoin',
    price: 68.50,
    change24h: 0.80,
    volume24h: '380M',
    high24h: 69.40,
    low24h: 67.20,
    marketCap: '5.1B',
    sparkline: [67.8, 68.2, 68.9, 68.0, 68.4, 68.8, 68.5],
    signal: {
      action: 'NÖTR',
      confidence: 50,
      direction: 'YATAY',
      targetProfit: 72.00,
      stopLoss: 65.50,
      reasoning: [
        'Düşük volatilite ve konsolidasyon devam ediyor.'
      ],
      indicators: {
        rsi: 50.4,
        macd: 'Düz',
        bollinger: 'Orta seviyede',
        emaTrend: 'Yatay',
        sentimentScore: 51
      },
      supportLevel: 66.80,
      resistanceLevel: 70.00,
      timestamp: '11:45'
    }
  },
  {
    id: 'injective',
    symbol: 'INJ',
    name: 'Injective',
    price: 21.90,
    change24h: 9.60,
    volume24h: '280M',
    high24h: 22.80,
    low24h: 19.80,
    marketCap: '2.1B',
    sparkline: [19.8, 20.4, 21.0, 20.8, 21.5, 22.2, 21.9],
    signal: {
      action: 'GÜÇLÜ AL',
      confidence: 85,
      direction: 'YÜKSELİŞ',
      targetProfit: 25.50,
      stopLoss: 20.20,
      reasoning: [
        'RWA ve türev hacimlerinde ciddi artış kaydedildi.',
        'Hacimli kırılım direnci aştı.'
      ],
      indicators: {
        rsi: 67.2,
        macd: 'Yükseliş Kesişimi',
        bollinger: 'Üst bant zorlanıyor',
        emaTrend: 'EMA 20 > EMA 50 > EMA 200',
        sentimentScore: 83
      },
      supportLevel: 20.50,
      resistanceLevel: 23.00,
      timestamp: '11:30'
    }
  }
];
