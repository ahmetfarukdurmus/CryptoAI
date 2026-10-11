import AsyncStorage from '@react-native-async-storage/async-storage';
import { Position, TradeHistoryItem } from '../types/crypto';
import { apiClient, ApiError } from './api';

export const INITIAL_PORTFOLIO_BALANCE = 10000.00;

export interface TradeExecutePayload {
  symbol: string;
  amount: number;
  side: 'BUY' | 'SELL';
  price?: number;
  takeProfit?: number | null;
  stopLoss?: number | null;
  amountUsd?: number;
}

export interface TradeExecuteResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface WalletApiResponse {
  success: boolean;
  balance: number;
  positions: Position[];
  raw?: any;
  error?: string;
}

export interface TransactionsApiResponse {
  success: boolean;
  transactions: TradeHistoryItem[];
  raw?: any;
  error?: string;
}

/**
 * 1. Cüzdan & Bakiye & Varlıklar: GET /api/wallet
 * Sayfa açıldığında veya yenilendiğinde PostgreSQL'den güncel nakit bakiyeyi ve portföydeki coinleri çeker.
 */
export const getWalletFromApi = async (): Promise<WalletApiResponse> => {
  try {
    let response: any = null;
    try {
      response = await apiClient.get('/wallet');
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 404) {
        response = await apiClient.get('/wallet/balance');
      } else {
        throw err;
      }
    }

    let balance = INITIAL_PORTFOLIO_BALANCE;
    if (typeof response === 'number') {
      balance = response;
    } else if (response) {
      if (typeof response.balance === 'number') balance = response.balance;
      else if (typeof response.cashBalance === 'number') balance = response.cashBalance;
      else if (typeof response.amount === 'number') balance = response.amount;
      else if (response.data && typeof response.data.balance === 'number') balance = response.data.balance;
      else if (response.data && typeof response.data.cashBalance === 'number') balance = response.data.cashBalance;
    }

    // Pozisyon / Varlık listesini normalize et
    let rawPositions: any[] = [];
    if (Array.isArray(response)) rawPositions = response;
    else if (Array.isArray(response?.portfolio)) rawPositions = response.portfolio;
    else if (Array.isArray(response?.positions)) rawPositions = response.positions;
    else if (Array.isArray(response?.holdings)) rawPositions = response.holdings;
    else if (Array.isArray(response?.data?.portfolio)) rawPositions = response.data.portfolio;
    else if (Array.isArray(response?.data?.positions)) rawPositions = response.data.positions;
    else if (Array.isArray(response?.data)) rawPositions = response.data;
    else if (response?.position) rawPositions = [response.position];

    // Eğer /wallet endpoint'i pozisyon dizisi içermiyorsa backend'deki /trade/positions veya /positions endpoint'lerini dene
    if (rawPositions.length === 0) {
      try {
        let posRes: any = null;
        try {
          posRes = await apiClient.get('/trade/positions');
        } catch {
          try {
            posRes = await apiClient.get('/positions');
          } catch {
            posRes = null;
          }
        }

        if (Array.isArray(posRes)) rawPositions = posRes;
        else if (Array.isArray(posRes?.data)) rawPositions = posRes.data;
        else if (Array.isArray(posRes?.positions)) rawPositions = posRes.positions;
      } catch {
        // ignore
      }
    }

    const positions: Position[] = rawPositions.map((item, index) => {
      const symbol = (item.symbol || 'COIN').toUpperCase();
      const amount = Number(item.amount ?? item.quantity ?? item.qty ?? 0);
      const entryPrice = Number(item.entryPrice ?? item.price ?? item.buyPrice ?? item.averagePrice ?? 0);
      const currentPrice = Number(item.currentPrice ?? item.price ?? entryPrice);
      const totalCost = Number(item.totalCost ?? (amount * entryPrice).toFixed(2));
      const tp = Number(item.targetProfit ?? item.takeProfit ?? 0);
      const sl = Number(item.stopLoss ?? item.stopLossPrice ?? 0);

      return {
        id: item.id ? String(item.id) : `pos_${symbol}_${index}_${Date.now()}`,
        symbol,
        name: item.name || item.coinName || symbol,
        side: (item.side || 'BUY').toUpperCase() === 'SELL' ? 'SELL' : 'BUY',
        entryPrice,
        currentPrice,
        amount,
        totalCost,
        targetProfit: tp,
        stopLoss: sl,
        pnl: Number(item.pnl || 0),
        pnlPercent: Number(item.pnlPercent || 0),
        openedAt:
          item.openedAt ||
          item.createdAt ||
          new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        isAutopilot: Boolean(item.isAutopilot),
      };
    });

    return {
      success: true,
      balance,
      positions,
      raw: response,
    };
  } catch (err: any) {
    const isNetworkError =
      !err.status ||
      err.message?.includes('fetch') ||
      err.message?.includes('Network') ||
      err.message?.includes('Failed');

    return {
      success: false,
      balance: INITIAL_PORTFOLIO_BALANCE,
      positions: [],
      error: isNetworkError
        ? 'Sunucuya bağlanılamadı. Lütfen backend sunucunuzun (localhost:8080) çalıştığından emin olun.'
        : err?.message || 'Cüzdan verisi çekilemedi.',
    };
  }
};

/**
 * 2. Alım/Satım İşlemleri: POST /api/trade/execute
 * Kullanıcı işlem yaptığında sembol, miktar, işlem tipi (BUY/SELL), takeProfit ve stopLoss değerlerini backend'e iletir.
 */
export const executeTradeApi = async (payload: TradeExecutePayload): Promise<TradeExecuteResponse> => {
  try {
    const currentPrice =
      payload.price ??
      (payload.amountUsd && payload.amount > 0
        ? Number((payload.amountUsd / payload.amount).toFixed(2))
        : undefined);

    const validTp = payload.takeProfit && payload.takeProfit > 0 ? payload.takeProfit : null;
    const validSl =
      payload.stopLoss && payload.stopLoss > 0 && (!currentPrice || payload.stopLoss < currentPrice)
        ? payload.stopLoss
        : null;

    const body = {
      symbol: payload.symbol.toUpperCase(),
      type: payload.side, // Backend 'type': 'BUY' bekliyor
      side: payload.side,
      amount: payload.amount,
      quantity: payload.amount,
      price: currentPrice,
      takeProfit: validTp,
      targetProfit: validTp,
      stopLoss: validSl,
      stopLossPrice: validSl,
      amountUsd: payload.amountUsd,
    };

    const response = await apiClient.post('/trade/execute', body);

    return {
      success: true,
      message:
        response?.message ||
        `${payload.symbol} ${payload.side === 'BUY' ? 'alımı' : 'satışı'} başarıyla gerçekleştirildi.`,
      data: response,
    };
  } catch (err: any) {
    const rawMsg = err instanceof ApiError ? err.message : (err?.message || 'Sunucuya bağlanılamadı.');
    const isConnErr =
      rawMsg.includes('fetch') ||
      rawMsg.includes('Network') ||
      rawMsg.includes('Failed') ||
      rawMsg.includes('Network request failed') ||
      !err.status;

    return {
      success: false,
      message: isConnErr
        ? 'Sunucuya bağlanılamadı. Lütfen Spring Boot backend sunucunuzun (localhost:8080) çalıştığından emin olun.'
        : rawMsg,
      error: rawMsg,
    };
  }
};

/**
 * 3. İşlem Geçmişi: GET /api/transactions
 * 'Geçmiş' sekmesindeki listeyi doğrudan backend'den gelen gerçek PostgreSQL kayıtlarıyla doldurur.
 */
export const getTransactionsFromApi = async (): Promise<TransactionsApiResponse> => {
  try {
    let response: any = null;
    try {
      response = await apiClient.get('/transactions');
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 404) {
        response = await apiClient.get('/trade/transactions');
      } else {
        throw err;
      }
    }

    let rawList: any[] = [];
    if (Array.isArray(response)) rawList = response;
    else if (Array.isArray(response?.transactions)) rawList = response.transactions;
    else if (Array.isArray(response?.data)) rawList = response.data;
    else if (Array.isArray(response?.content)) rawList = response.content; // Spring Data JPA Page<T> desteği

    const transactions: TradeHistoryItem[] = rawList.map((item, index) => {
      const symbol = (item.symbol || 'COIN').toUpperCase();
      const amount = Number(item.amount ?? item.quantity ?? item.qty ?? 0);
      const entryPrice = Number(item.entryPrice ?? item.price ?? item.buyPrice ?? 0);
      const closePrice = Number(item.closePrice ?? item.price ?? item.sellPrice ?? entryPrice);
      const pnl = Number(item.pnl ?? item.profit ?? 0);
      const pnlPercent = Number(item.pnlPercent ?? 0);

      let closedAt = item.closedAt || item.timestamp || item.createdAt || '';
      if (!closedAt) {
        closedAt = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      }

      const closedReason = item.closedReason || item.reason || item.status || 'Manuel';

      return {
        id: item.id ? String(item.id) : `hist_${symbol}_${index}_${Date.now()}`,
        symbol,
        side: (item.side || item.type || 'BUY').toUpperCase() === 'SELL' ? 'SELL' : 'BUY',
        entryPrice,
        closePrice,
        amount,
        pnl,
        pnlPercent,
        closedAt,
        closedReason,
        isAutopilot: Boolean(item.isAutopilot),
      };
    });

    return {
      success: true,
      transactions,
      raw: response,
    };
  } catch (err: any) {
    const isNetworkError =
      !err.status ||
      err.message?.includes('fetch') ||
      err.message?.includes('Network') ||
      err.message?.includes('Failed');

    return {
      success: false,
      transactions: [],
      error: isNetworkError
        ? 'Sunucuya bağlanılamadı. Lütfen backend sunucunuzun (localhost:8080) çalıştığından emin olun.'
        : err?.message || 'İşlem geçmişi çekilemedi.',
    };
  }
};

/**
 * 4. Stop-Loss ve Take-Profit Seviyelerini Backend'e İletme
 */
export const updatePositionTargetsApi = async (
  positionId: string,
  symbol: string,
  takeProfit?: number,
  stopLoss?: number
): Promise<{ success: boolean; message?: string }> => {
  try {
    const body = { positionId, symbol, takeProfit, stopLoss };
    let res: any = null;
    try {
      res = await apiClient.post('/trade/targets', body);
    } catch {
      try {
        res = await apiClient.put(`/trade/position/${positionId}`, body);
      } catch {
        res = null;
      }
    }
    return { success: true, message: res?.message };
  } catch (err: any) {
    return { success: false, message: err?.message };
  }
};

export interface PortfolioData {
  cashBalance: number;
  positions: Position[];
  tradeHistory: TradeHistoryItem[];
}

const PORTFOLIO_STORAGE_PREFIX = '@cryptoai_portfolio_';

export const fetchUserPortfolio = async (uid: string): Promise<PortfolioData | null> => {
  try {
    const walletRes = await getWalletFromApi();
    const transRes = await getTransactionsFromApi();

    const raw = await AsyncStorage.getItem(`${PORTFOLIO_STORAGE_PREFIX}${uid}`);
    if (raw && !walletRes.success) {
      const data = JSON.parse(raw);
      return {
        cashBalance: typeof data.cashBalance === 'number' ? data.cashBalance : INITIAL_PORTFOLIO_BALANCE,
        positions: Array.isArray(data.positions) ? data.positions : [],
        tradeHistory: Array.isArray(data.tradeHistory) ? data.tradeHistory : [],
      };
    }

    return {
      cashBalance: walletRes.balance,
      positions: walletRes.positions,
      tradeHistory: transRes.transactions,
    };
  } catch (err) {
    console.log('Fetch portfolio error:', err);
    return null;
  }
};

export const saveUserPortfolio = async (uid: string, data: Partial<PortfolioData>): Promise<void> => {
  try {
    const key = `${PORTFOLIO_STORAGE_PREFIX}${uid}`;
    const raw = await AsyncStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : {};

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.log('Save portfolio error:', err);
  }
};
