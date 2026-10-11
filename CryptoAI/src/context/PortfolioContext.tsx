import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CryptoAsset, Position, TradeHistoryItem, PortfolioContextType, TradeResult } from '../types/crypto';
import { INITIAL_COINS } from '../constants/initialCoins';
import { useToast } from './ToastContext';
import {
  fetchBinance24hrTickers,
  mergeCoinsWithBinance,
  Binance24hrTicker,
} from '../services/binanceService';
import {
  getWalletFromApi,
  executeTradeApi,
  getTransactionsFromApi,
  updatePositionTargetsApi,
  INITIAL_PORTFOLIO_BALANCE,
} from '../services/portfolioService';

const STORAGE_CASH_KEY = '@cryptoai_portfolio_cash_v2';
const STORAGE_POSITIONS_KEY = '@cryptoai_portfolio_positions_v2';
const STORAGE_HISTORY_KEY = '@cryptoai_portfolio_history_v2';

const defaultContext: PortfolioContextType = {
  coins: INITIAL_COINS,
  cashBalance: INITIAL_PORTFOLIO_BALANCE,
  totalBalance: INITIAL_PORTFOLIO_BALANCE,
  totalPnL: 0,
  totalPnLPercent: 0,
  dailyPnL: 0,
  dailyPnLPercent: 0,
  positions: [],
  tradeHistory: [],
  openPosition: async () => false,
  closePosition: async () => {},
  executeTrade: async () => ({ success: false, message: '' }),
  updatePositionTarget: async () => {},
  updatePositionTargets: async () => {},
  getOwnedCoinQuantity: () => 0,
  resetPortfolio: () => {},
  refreshPortfolio: async () => {},
  isSyncing: false,
};

const PortfolioContext = createContext<PortfolioContextType>(defaultContext);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [coins, setCoins] = useState<CryptoAsset[]>(INITIAL_COINS);
  const [cashBalance, setCashBalance] = useState<number>(INITIAL_PORTFOLIO_BALANCE);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Güncel değerleri referanslarda senkronize tut
  const positionsRef = useRef(positions);
  const cashBalanceRef = useRef(cashBalance);
  const tradeHistoryRef = useRef(tradeHistory);

  useEffect(() => {
    positionsRef.current = positions;
    cashBalanceRef.current = cashBalance;
    tradeHistoryRef.current = tradeHistory;
  }, [positions, cashBalance, tradeHistory]);

  // 1. Portföy durumunu yerel önbelleğe kaydetme yardımcısı
  const persistState = useCallback(async (newCash: number, newPos: Position[], newHist: TradeHistoryItem[]) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_CASH_KEY, newCash.toString()),
        AsyncStorage.setItem(STORAGE_POSITIONS_KEY, JSON.stringify(newPos)),
        AsyncStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(newHist)),
      ]);
    } catch (e) {
      console.warn('Portfolio save warning:', e);
    }
  }, []);

  // 2. PostgreSQL Backend API Senkronizasyonu (GET /api/wallet & GET /api/transactions)
  const refreshPortfolioFromApi = useCallback(async (showFeedback = false) => {
    setIsSyncing(true);
    try {
      const [walletRes, transRes] = await Promise.all([
        getWalletFromApi(),
        getTransactionsFromApi(),
      ]);

      if (walletRes.success) {
        if (typeof walletRes.balance === 'number') {
          setCashBalance(walletRes.balance);
        }
        // PostgreSQL'den gelen pozisyonlar varsa güncelle;
        // Eğer backend pozisyon dönmediyse (örn. boş dizi []) ama yerelde açık pozisyon varsa,
        // yerel pozisyonları yok yere EZME (overwrite hatasını engelle)!
        if (Array.isArray(walletRes.positions) && walletRes.positions.length > 0) {
          setPositions(walletRes.positions);
        }
      }

      if (transRes.success) {
        if (Array.isArray(transRes.transactions) && transRes.transactions.length > 0) {
          setTradeHistory(transRes.transactions);
        }
      }

      if (walletRes.success || transRes.success) {
        const finalCash = walletRes.success && typeof walletRes.balance === 'number'
          ? walletRes.balance
          : cashBalanceRef.current;
        const finalPos = walletRes.success && Array.isArray(walletRes.positions) && walletRes.positions.length > 0
          ? walletRes.positions
          : positionsRef.current;
        const finalHist = transRes.success && Array.isArray(transRes.transactions) && transRes.transactions.length > 0
          ? transRes.transactions
          : tradeHistoryRef.current;
        persistState(finalCash, finalPos, finalHist);

        if (showFeedback) {
          showToast('Cüzdan ve işlemler PostgreSQL ile eşitlendi.', 'success', 'Veriler Güncellendi 🔄');
        }
      } else if (showFeedback) {
        showToast(
          'Sunucuya bağlanılamadı. Lütfen backend sunucunuzun (localhost:8080) çalıştığından emin olun.',
          'error',
          'Sunucu Bağlantı Hatası ❌'
        );
      }
    } catch {
      if (showFeedback) {
        showToast(
          'Sunucuya bağlanılamadı. Lütfen backend sunucunuzun (localhost:8080) çalıştığından emin olun.',
          'error',
          'Sunucu Bağlantı Hatası ❌'
        );
      }
    } finally {
      setIsSyncing(false);
    }
  }, [persistState, showToast]);

  // 3. İlk açılışta önbelleği yükle ve backend ile senkronize et
  useEffect(() => {
    let isMounted = true;
    const loadSavedPortfolio = async () => {
      try {
        const [savedCash, savedPos, savedHist] = await Promise.all([
          AsyncStorage.getItem(STORAGE_CASH_KEY),
          AsyncStorage.getItem(STORAGE_POSITIONS_KEY),
          AsyncStorage.getItem(STORAGE_HISTORY_KEY),
        ]);

        if (isMounted) {
          if (savedCash !== null) {
            const parsedCash = parseFloat(savedCash);
            if (!isNaN(parsedCash)) setCashBalance(parsedCash);
          }
          if (savedPos) {
            const parsedPos = JSON.parse(savedPos);
            if (Array.isArray(parsedPos)) setPositions(parsedPos);
          }
          if (savedHist) {
            const parsedHist = JSON.parse(savedHist);
            if (Array.isArray(parsedHist)) setTradeHistory(parsedHist);
          }
        }
      } catch (e) {
        console.warn('Portfolio load warning:', e);
      } finally {
        // Canlı PostgreSQL backend verilerini çek
        if (isMounted) {
          refreshPortfolioFromApi(false);
        }
      }
    };

    loadSavedPortfolio();
    return () => {
      isMounted = false;
    };
  }, [refreshPortfolioFromApi]);

  // 3. Otomatik Emir Kontrolü (Stop-Loss & Take-Profit)
  const checkTakeProfit = useCallback((freshCoins: CryptoAsset[]) => {
    const currentPositions = positionsRef.current;
    if (currentPositions.length === 0) return;

    let triggeredAny = false;
    let newCash = cashBalanceRef.current;
    const remainingPositions: Position[] = [];
    const newHistoryItems: TradeHistoryItem[] = [];

    currentPositions.forEach((pos) => {
      const coin = freshCoins.find((c) => c.symbol === pos.symbol);
      const currentPrice = coin ? coin.price : pos.currentPrice;

      // 1. Stop-Loss Kontrolü (Düşünce Satma / Zarar Kes)
      // BUY pozisyonunda fiyat belirlenen stopLoss seviyesine eşit veya altına düştüğünde
      // VE stopLoss pozisyonun giriş fiyatının altında olmalı (işlem açılır açılmaz anında kapanmayı engeller)
      const isStopLossHit =
        pos.stopLoss && pos.stopLoss > 0
          ? pos.side === 'BUY'
            ? currentPrice <= pos.stopLoss && pos.stopLoss < pos.entryPrice
            : currentPrice >= pos.stopLoss && pos.stopLoss > pos.entryPrice
          : false;

      // 2. Take-Profit Kontrolü (Hedef Kâr)
      // BUY pozisyonunda fiyat belirlenen targetProfit seviyesine eşit veya üstüne çıktığında
      const isTakeProfitHit =
        pos.targetProfit && pos.targetProfit > 0
          ? pos.side === 'BUY'
            ? currentPrice >= pos.targetProfit
            : currentPrice <= pos.targetProfit
          : false;

      if (isStopLossHit) {
        triggeredAny = true;
        const returnAmount = Number((pos.amount * currentPrice).toFixed(2));
        const pnl = Number((returnAmount - pos.totalCost).toFixed(2));
        const pnlPercent = pos.totalCost > 0 ? Number(((pnl / pos.totalCost) * 100).toFixed(2)) : 0;

        newCash = Number((newCash + returnAmount).toFixed(2));

        const historyItem: TradeHistoryItem = {
          id: `hist_sl_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          symbol: pos.symbol,
          side: 'SELL',
          entryPrice: pos.entryPrice,
          closePrice: currentPrice,
          amount: pos.amount,
          pnl,
          pnlPercent,
          closedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          closedReason: 'AUTO_STOP_LOSS',
          isAutopilot: pos.isAutopilot,
        };

        newHistoryItems.push(historyItem);

        // Ekran üstü kırmızı Toast bildirimi
        showToast(
          `🛡️ Stop-Loss Tetiklendi: ${pos.name || pos.symbol} $${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} seviyesinden otomatik zararı durduruldu.`,
          'error',
          'Stop-Loss Tetiklendi (AUTO_STOP_LOSS) 🛡️'
        );
      } else if (isTakeProfitHit) {
        triggeredAny = true;
        const returnAmount = Number((pos.amount * currentPrice).toFixed(2));
        const pnl = Number((returnAmount - pos.totalCost).toFixed(2));
        const pnlPercent = pos.totalCost > 0 ? Number(((pnl / pos.totalCost) * 100).toFixed(2)) : 0;

        newCash = Number((newCash + returnAmount).toFixed(2));

        const historyItem: TradeHistoryItem = {
          id: `hist_tp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          symbol: pos.symbol,
          side: 'SELL',
          entryPrice: pos.entryPrice,
          closePrice: currentPrice,
          amount: pos.amount,
          pnl,
          pnlPercent,
          closedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          closedReason: 'Take-Profit',
          isAutopilot: pos.isAutopilot,
        };

        newHistoryItems.push(historyItem);

        // Ekran üstü yeşil Toast bildirimi patlat
        showToast(
          `🎯 Hedef Fiyat Görüldü: ${pos.name || pos.symbol} $${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} seviyesinden kârla otomatik satıldı!`,
          'success',
          'Otomatik Satış Gerçekleşti 🎯'
        );
      } else {
        remainingPositions.push(pos);
      }
    });

    if (triggeredAny) {
      const updatedHistory = [...newHistoryItems, ...tradeHistoryRef.current];
      setCashBalance(newCash);
      setPositions(remainingPositions);
      setTradeHistory(updatedHistory);
      persistState(newCash, remainingPositions, updatedHistory);
    }
  }, [persistState, showToast]);

  // 4. Canlı Binance Public 24hr Ticker API Fiyat Akışı (Saniyelik 1000ms Reaktif Güncelleme)
  useEffect(() => {
    let isMounted = true;
    let tickCounter = 0;

    const syncBinancePrices = async () => {
      try {
        tickCounter++;
        let tickers: Record<string, Binance24hrTicker> | null = null;

        // Her 3 saniyede bir Binance API'sinden gerçek verileri çek (rate-limit korumalı)
        if (tickCounter % 3 === 1) {
          tickers = await fetchBinance24hrTickers();
        }

        if (isMounted) {
          setCoins((prevCoins) => {
            let nextCoins = prevCoins;
            if (tickers && Object.keys(tickers).length > 0) {
              nextCoins = mergeCoinsWithBinance(prevCoins, tickers);
            } else {
              // Her saniye (1000ms) reaktif piyasa mikro-salınımı:
              // Açık pozisyonu olan coinler MUTLAKA anlık titreşir, diğerleri dinamik dalgalanır
              nextCoins = prevCoins.map((coin) => {
                const hasPosition = positionsRef.current.some(
                  (p) => p.symbol.toUpperCase() === coin.symbol.toUpperCase()
                );
                if (!hasPosition && Math.random() > 0.6) return coin;

                const fluctuation = (Math.random() - 0.495) * 0.0008; // -0.04% ile +0.04%
                const decimals = coin.price < 0.1 ? 6 : coin.price < 1 ? 4 : 2;
                const newPrice = Number((coin.price * (1 + fluctuation)).toFixed(decimals));

                let newSparkline = [...coin.sparkline];
                if (newSparkline.length > 0) {
                  newSparkline = [...newSparkline.slice(1), newPrice];
                }

                return {
                  ...coin,
                  price: newPrice,
                  sparkline: newSparkline,
                };
              });
            }

            checkTakeProfit(nextCoins);
            return nextCoins;
          });
        }
      } catch {
        // Hata durumunda UI çökmez
      }
    };

    // İlk açılışta anında çek
    syncBinancePrices();

    // Saniyelik (1000ms) kesintisiz canlı akış
    const interval = setInterval(syncBinancePrices, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [checkTakeProfit]);

  // 5. Anlık piyasa fiyatları ile güncellenen pozisyonlar
  const livePositions = useMemo(() => {
    return positions.map((pos) => {
      const coin = coins.find((c) => c.symbol === pos.symbol);
      const currentPrice = coin ? coin.price : pos.currentPrice;
      const currentVal = pos.amount * currentPrice;
      const pnl = currentVal - pos.totalCost;
      const pnlPercent = pos.totalCost > 0 ? (pnl / pos.totalCost) * 100 : 0;

      return {
        ...pos,
        currentPrice,
        pnl: Number(pnl.toFixed(2)),
        pnlPercent: Number(pnlPercent.toFixed(2)),
      };
    });
  }, [coins, positions]);

  // Toplam varlık hesaplamaları
  const totalPositionsValue = useMemo(() => {
    return livePositions.reduce((acc, pos) => acc + pos.amount * pos.currentPrice, 0);
  }, [livePositions]);

  const totalPositionsCost = useMemo(() => {
    return livePositions.reduce((acc, pos) => acc + pos.totalCost, 0);
  }, [livePositions]);

  // Toplam Bakiye = Nakit ($) + Sahip olunan coinlerin anlık piyasa değeri ($)
  const totalBalance = useMemo(() => {
    return Number((cashBalance + totalPositionsValue).toFixed(2));
  }, [cashBalance, totalPositionsValue]);

  // Toplam K/Z
  const totalPnL = useMemo(() => {
    return Number((totalPositionsValue - totalPositionsCost).toFixed(2));
  }, [totalPositionsValue, totalPositionsCost]);

  const totalPnLPercent = useMemo(() => {
    return totalPositionsCost > 0 ? Number(((totalPnL / totalPositionsCost) * 100).toFixed(2)) : 0;
  }, [totalPnL, totalPositionsCost]);

  // Günlük K/Z (24 saatlik getiri tahmini)
  const dailyPnL = useMemo(() => {
    return livePositions.reduce((acc, pos) => {
      const coin = coins.find((c) => c.symbol === pos.symbol);
      const change24h = coin ? coin.change24h : 0;
      const posValue = pos.amount * pos.currentPrice;
      return acc + (posValue * (change24h / 100));
    }, 0);
  }, [livePositions, coins]);

  const dailyPnLPercent = useMemo(() => {
    return totalBalance > 0 ? Number(((dailyPnL / totalBalance) * 100).toFixed(2)) : 0;
  }, [dailyPnL, totalBalance]);

  // Kullanıcının cüzdanındaki toplam coin miktarını döner (Çoklu pozisyonların toplamı)
  const getOwnedCoinQuantity = useCallback(
    (symbol: string): number => {
      return positionsRef.current
        .filter((p) => p.symbol.toUpperCase() === symbol.toUpperCase())
        .reduce((sum, p) => sum + p.amount, 0);
    },
    []
  );

  /**
   * CANLI ALIM-SATIM (SPOT TRADE) FONKSİYONU
   * - Çoklu pozisyon desteği: Her alım (BUY) bağımsız bir Position kartı oluşturur.
   * - Aynı coinden birden fazla alım yapılsa dahi birbirini ezmez (overwrite yapmaz).
   * - Hem PostgreSQL Backend (POST /api/trade/execute) hem yerel kalıcılık (AsyncStorage) ile tam senkron çalışır.
   */
  const executeTrade = useCallback(
    async (
      symbol: string,
      side: 'BUY' | 'SELL',
      amountUsd: number,
      coinQuantity?: number,
      targetProfit?: number,
      stopLoss?: number
    ): Promise<TradeResult> => {
      const sym = symbol.toUpperCase();
      const coin = coins.find((c) => c.symbol.toUpperCase() === sym);
      if (!coin) {
        return { success: false, message: `${symbol} varlığı bulunamadı.` };
      }

      const qty =
        coinQuantity && coinQuantity > 0
          ? coinQuantity
          : Number((amountUsd / coin.price).toFixed(6));

      // 3. TETİKLENME MANTIĞI KONTROLÜ:
      // stopLoss ve takeProfit değerleri kullanıcının girdiği / etkinleştirdiği değerler olmalıdır.
      // Girilmediyse veya devre dışıysa 0 / null gitmelidir, asla mevcut fiyata eşit gitmemelidir.
      const finalTargetProfit =
        targetProfit && targetProfit > 0
          ? targetProfit
          : 0;

      const finalStopLoss =
        stopLoss && stopLoss > 0 && (side !== 'BUY' || stopLoss < coin.price)
          ? stopLoss
          : 0;

      if (side === 'BUY') {
        if (amountUsd <= 0 && qty <= 0) {
          return { success: false, message: 'İşlem tutarı $0 dan büyük olmalıdır.' };
        }
        if (amountUsd > cashBalanceRef.current) {
          return {
            success: false,
            message: `Yetersiz Bakiye! Mevcut nakit: $${cashBalanceRef.current.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT`,
          };
        }

        const costUsd = Number(amountUsd.toFixed(2));
        const newCash = Number((cashBalanceRef.current - costUsd).toFixed(2));

        // Her alım için bağımsız, benzersiz bir Position kartı oluştur (Asla önceki pozisyonları ezmez!)
        const newPosition: Position = {
          id: `pos_${sym}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          symbol: sym,
          name: coin.name || sym,
          side: 'BUY',
          entryPrice: coin.price,
          currentPrice: coin.price,
          amount: qty,
          totalCost: costUsd,
          targetProfit: finalTargetProfit,
          stopLoss: finalStopLoss,
          pnl: 0,
          pnlPercent: 0,
          openedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          isAutopilot: false,
        };

        const updatedPositions = [newPosition, ...positionsRef.current];

        const buyHistoryItem: TradeHistoryItem = {
          id: `hist_buy_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          symbol: sym,
          side: 'BUY',
          entryPrice: coin.price,
          closePrice: coin.price,
          amount: qty,
          pnl: 0,
          pnlPercent: 0,
          closedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          closedReason: 'Alım Emri (BUY)',
          isAutopilot: false,
        };

        const updatedHistory = [buyHistoryItem, ...tradeHistoryRef.current];

        // 1. Önce anında yerel state'e ekle ve önbelleğe kaydet
        setCashBalance(newCash);
        setPositions(updatedPositions);
        setTradeHistory(updatedHistory);
        persistState(newCash, updatedPositions, updatedHistory);

        // 2. PostgreSQL Backend'e istek at: POST /api/trade/execute
        const apiRes = await executeTradeApi({
          symbol: sym,
          amount: qty,
          side: 'BUY',
          price: coin.price,
          takeProfit: finalTargetProfit > 0 ? finalTargetProfit : null,
          stopLoss: finalStopLoss > 0 ? finalStopLoss : null,
          amountUsd: costUsd,
        });

        if (apiRes.success) {
          showToast(
            `${sym} alım emri PostgreSQL backend'e kaydedildi.`,
            'success',
            'İşlem Başarılı 🚀'
          );
        } else {
          showToast(
            `${sym} alımı portföye eklendi (${apiRes.message || 'Yerel kayıt'}).`,
            'info',
            'İşlem Gerçekleşti 📱'
          );
        }

        return {
          success: true,
          message: apiRes.message || `${sym} pozisyonu başarıyla açıldı.`,
          coinAmount: qty,
          totalUsd: costUsd,
        };
      } else {
        // SELL (Satış) işlemi - Çoklu pozisyonlardan FIFO yöntemiyle eksiltir
        const totalOwned = positionsRef.current
          .filter((p) => p.symbol.toUpperCase() === sym)
          .reduce((sum, p) => sum + p.amount, 0);

        if (totalOwned <= 0) {
          return {
            success: false,
            message: `Portföyünüzde satabileceğiniz ${sym} bulunmuyor.`,
          };
        }
        if (qty > totalOwned + 0.000001) {
          return {
            success: false,
            message: `Maksimum ${totalOwned.toFixed(4)} ${sym} satabilirsiniz.`,
          };
        }

        let remainingToSell = qty;
        let totalCostOfSold = 0;
        const newPositions: Position[] = [];

        for (const pos of positionsRef.current) {
          if (pos.symbol.toUpperCase() !== sym || remainingToSell <= 0) {
            newPositions.push(pos);
            continue;
          }

          if (pos.amount <= remainingToSell + 0.000001) {
            // Pozisyon tamamen kapandı
            remainingToSell -= pos.amount;
            totalCostOfSold += pos.totalCost;
          } else {
            // Pozisyon kısmen satıldı
            const soldPortion = remainingToSell;
            const remainingPortion = pos.amount - soldPortion;
            const costPerUnit = pos.amount > 0 ? pos.totalCost / pos.amount : pos.entryPrice;
            totalCostOfSold += soldPortion * costPerUnit;

            remainingToSell = 0;
            newPositions.push({
              ...pos,
              amount: Number(remainingPortion.toFixed(6)),
              totalCost: Number((remainingPortion * costPerUnit).toFixed(2)),
            });
          }
        }

        const saleProceeds = Number((qty * coin.price).toFixed(2));
        const pnl = Number((saleProceeds - totalCostOfSold).toFixed(2));
        const pnlPercent = totalCostOfSold > 0 ? Number(((pnl / totalCostOfSold) * 100).toFixed(2)) : 0;
        const newCash = Number((cashBalanceRef.current + saleProceeds).toFixed(2));

        const sellHistoryItem: TradeHistoryItem = {
          id: `hist_sell_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          symbol: sym,
          side: 'SELL',
          entryPrice: totalCostOfSold > 0 && qty > 0 ? Number((totalCostOfSold / qty).toFixed(2)) : coin.price,
          closePrice: coin.price,
          amount: qty,
          pnl,
          pnlPercent,
          closedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          closedReason: 'Satış Emri (SELL)',
          isAutopilot: false,
        };

        const updatedHistory = [sellHistoryItem, ...tradeHistoryRef.current];

        setCashBalance(newCash);
        setPositions(newPositions);
        setTradeHistory(updatedHistory);
        persistState(newCash, newPositions, updatedHistory);

        const apiRes = await executeTradeApi({
          symbol: sym,
          amount: qty,
          side: 'SELL',
          price: coin.price,
          takeProfit: finalTargetProfit > 0 ? finalTargetProfit : null,
          stopLoss: finalStopLoss > 0 ? finalStopLoss : null,
          amountUsd: saleProceeds,
        });

        if (apiRes.success) {
          showToast(
            `${sym} satışı backend'e iletildi.`,
            'error',
            'Satış Gerçekleşti 🔻'
          );
        }

        return {
          success: true,
          message: apiRes.message || `${sym} satışı başarıyla tamamlandı.`,
          coinAmount: qty,
          totalUsd: saleProceeds,
        };
      }
    },
    [coins, persistState, showToast]
  );

  // Eski API uyumluluğu için openPosition
  const openPosition = useCallback(
    async (
      symbol: string,
      side: 'BUY' | 'SELL',
      amountUsd: number,
      isAutopilot: boolean = false,
      targetProfit?: number,
      stopLoss?: number
    ): Promise<boolean> => {
      const res = await executeTrade(symbol, side, amountUsd, undefined, targetProfit, stopLoss);
      return res.success;
    },
    [executeTrade]
  );

  // Pozisyon kapatma (Yalnızca tıklanan benzersiz kartı kapatır ve backend ile senkronize eder)
  const closePosition = useCallback(
    async (positionId: string, reason: string = 'Manuel') => {
      const pos = livePositions.find((p) => p.id === positionId);
      if (!pos) return;

      const returnAmount = Number((pos.amount * pos.currentPrice).toFixed(2));
      const pnl = Number((returnAmount - pos.totalCost).toFixed(2));
      const pnlPercent = pos.totalCost > 0 ? Number(((pnl / pos.totalCost) * 100).toFixed(2)) : 0;

      const newCash = Number((cashBalanceRef.current + returnAmount).toFixed(2));
      const remainingPositions = positionsRef.current.filter((p) => p.id !== positionId);

      const historyItem: TradeHistoryItem = {
        id: `hist_close_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        symbol: pos.symbol,
        side: 'SELL',
        entryPrice: pos.entryPrice,
        closePrice: pos.currentPrice,
        amount: pos.amount,
        pnl,
        pnlPercent,
        closedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        closedReason: reason,
        isAutopilot: pos.isAutopilot,
      };

      const updatedHistory = [historyItem, ...tradeHistoryRef.current];

      // Yerel state ve AsyncStorage'dan anında kaldır
      setCashBalance(newCash);
      setPositions(remainingPositions);
      setTradeHistory(updatedHistory);
      persistState(newCash, remainingPositions, updatedHistory);

      // Backend'e kapatma satış emrini ilet
      const apiRes = await executeTradeApi({
        symbol: pos.symbol,
        amount: pos.amount,
        side: 'SELL',
        amountUsd: returnAmount,
      });

      if (apiRes.success) {
        showToast(
          `${pos.symbol} pozisyonu başarıyla kapatıldı (${reason}).`,
          'success',
          'Pozisyon Kapatıldı'
        );
      } else {
        showToast(
          `${pos.symbol} pozisyonu kapatıldı (${reason}).`,
          'info',
          'Pozisyon Kapatıldı'
        );
      }
    },
    [livePositions, persistState, showToast]
  );

  // Pozisyon Take-Profit ve Stop-Loss hedef fiyatlarını backend'e iletip güncelleme
  const updatePositionTargets = useCallback(
    async (positionId: string, newTargetProfit?: number, newStopLoss?: number) => {
      const pos = positionsRef.current.find((p) => p.id === positionId);
      const symbol = pos ? pos.symbol : '';

      // 1. Backend'e hedefleri ilet (PostgreSQL kalıcılığı için)
      await updatePositionTargetsApi(positionId, symbol, newTargetProfit, newStopLoss);

      // 2. Yalnızca ilgili pozisyonun hedeflerini güncelle ve önbelleğe yaz
      const nextPositions = positionsRef.current.map((p) => {
        if (p.id !== positionId) return p;
        return {
          ...p,
          targetProfit:
            newTargetProfit !== undefined && newTargetProfit > 0
              ? newTargetProfit
              : p.targetProfit,
          stopLoss:
            newStopLoss !== undefined && newStopLoss > 0
              ? newStopLoss
              : p.stopLoss,
        };
      });

      setPositions(nextPositions);
      persistState(cashBalanceRef.current, nextPositions, tradeHistoryRef.current);

      const parts: string[] = [];
      if (newTargetProfit && newTargetProfit > 0) {
        parts.push(`TP: $${newTargetProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
      }
      if (newStopLoss && newStopLoss > 0) {
        parts.push(`SL: $${newStopLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
      }

      showToast(
        `Hedefler PostgreSQL backend'e iletildi (${parts.join(' | ')}).`,
        'info',
        'Emir Seviyeleri Güncellendi 🎯'
      );
    },
    [persistState, showToast]
  );

  // Geriye dönük uyumluluk için tekil updatePositionTarget
  const updatePositionTarget = useCallback(
    async (positionId: string, newTarget: number) => {
      await updatePositionTargets(positionId, newTarget, undefined);
    },
    [updatePositionTargets]
  );

  // Portföyü başlangıç $10,000.00 USDT seviyesine sıfırla
  const resetPortfolio = useCallback(() => {
    setCashBalance(INITIAL_PORTFOLIO_BALANCE);
    setPositions([]);
    setTradeHistory([]);
    persistState(INITIAL_PORTFOLIO_BALANCE, [], []);
  }, [persistState]);

  return (
    <PortfolioContext.Provider
      value={{
        coins,
        cashBalance,
        totalBalance,
        totalPnL,
        totalPnLPercent,
        dailyPnL,
        dailyPnLPercent,
        positions: livePositions,
        tradeHistory,
        openPosition,
        closePosition,
        executeTrade,
        updatePositionTarget,
        updatePositionTargets,
        getOwnedCoinQuantity,
        resetPortfolio,
        refreshPortfolio: () => refreshPortfolioFromApi(true),
        isSyncing,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext);
