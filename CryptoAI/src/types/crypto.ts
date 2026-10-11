export type SignalAction = 'GÜÇLÜ AL' | 'AL' | 'NÖTR' | 'SAT' | 'GÜÇLÜ SAT';
export type DirectionType = 'YÜKSELİŞ' | 'DÜŞÜŞ' | 'YATAY';

export interface AISignal {
  action: SignalAction;
  confidence: number; // e.g. 86 (%)
  direction: DirectionType;
  targetProfit: number; // Take-Profit level
  stopLoss: number; // Stop-Loss level
  reasoning: string[]; // Explanations for Explainable AI (XAI)
  indicators: {
    rsi: number;
    macd: string;
    bollinger: string;
    emaTrend: string;
    sentimentScore: number; // Fear & Greed or NLP sentiment
  };
  supportLevel: number;
  resistanceLevel: number;
  timestamp: string;
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: string;
  high24h: number;
  low24h: number;
  marketCap: string;
  sparkline: number[];
  signal: AISignal;
}

export interface Position {
  id: string;
  symbol: string;
  name: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  amount: number;
  totalCost: number;
  targetProfit: number;
  stopLoss: number;
  pnl: number;
  pnlPercent: number;
  openedAt: string;
  isAutopilot: boolean;
}

export interface TradeHistoryItem {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  closePrice: number;
  amount: number;
  pnl: number;
  pnlPercent: number;
  closedAt: string;
  closedReason: 'Take-Profit' | 'Stop-Loss' | 'Manuel' | 'Manuel Alım' | 'Manuel Satım' | 'AI Sinyal Değişimi' | string;
  isAutopilot: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  balance?: number;
  authProvider: 'email' | 'google' | 'apple' | 'demo';
  token: string;
  isBiometricEnabled: boolean;
}

export interface AutopilotConfig {
  enabled: boolean;
  maxTradeRatio: number; // e.g. 0.20 (%20)
  maxOpenPositions: number; // e.g. 5
  minConfidence: number; // e.g. 75 (%)
  autoStopLoss: boolean;
  autoTakeProfit: boolean;
}

export interface AutopilotLog {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'trade' | 'profit' | 'loss';
}

export interface TradeResult {
  success: boolean;
  message: string;
  coinAmount?: number;
  totalUsd?: number;
}

export interface PortfolioContextType {
  coins: CryptoAsset[];
  cashBalance: number;
  totalBalance: number;
  totalPnL: number;
  totalPnLPercent: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  positions: Position[];
  tradeHistory: TradeHistoryItem[];
  openPosition: (symbol: string, side: 'BUY' | 'SELL', amountUsd: number, isAutopilot?: boolean, targetProfit?: number, stopLoss?: number) => Promise<boolean> | boolean;
  closePosition: (positionId: string, reason?: string) => Promise<void> | void;
  executeTrade: (symbol: string, side: 'BUY' | 'SELL', amountUsd: number, coinQuantity?: number, targetProfit?: number, stopLoss?: number) => Promise<TradeResult>;
  updatePositionTarget: (positionId: string, targetProfit: number) => Promise<void> | void;
  updatePositionTargets: (positionId: string, targetProfit?: number, stopLoss?: number) => Promise<void> | void;
  getOwnedCoinQuantity: (symbol: string) => number;
  resetPortfolio: () => void;
  refreshPortfolio: () => Promise<void>;
  isSyncing: boolean;
}
