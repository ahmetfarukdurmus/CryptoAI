import React, { createContext, useContext, useState, useEffect } from 'react';
import { AutopilotConfig, AutopilotLog } from '../types/crypto';
import { usePortfolio } from './PortfolioContext';

interface AutopilotContextType {
  config: AutopilotConfig;
  logs: AutopilotLog[];
  toggleAutopilot: () => void;
  updateConfig: (newConfig: Partial<AutopilotConfig>) => void;
  clearLogs: () => void;
}

const DEFAULT_CONFIG: AutopilotConfig = {
  enabled: true,
  maxTradeRatio: 0.15, // Max 15% per trade
  maxOpenPositions: 4, // Max 4 concurrent trades
  minConfidence: 80, // Minimum 80% AI confidence required
  autoStopLoss: true,
  autoTakeProfit: true,
};

const AutopilotContext = createContext<AutopilotContextType>({
  config: DEFAULT_CONFIG,
  logs: [],
  toggleAutopilot: () => {},
  updateConfig: () => {},
  clearLogs: () => {},
});

export const AutopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AutopilotConfig>(DEFAULT_CONFIG);
  const { coins, cashBalance, totalBalance, positions, openPosition, closePosition } = usePortfolio();

  const [logs, setLogs] = useState<AutopilotLog[]>([
    {
      id: 'log_1',
      time: '14:28:10',
      message: 'BackgroundService başlatıldı: Binance akışı ve AI sinyal dinleyicisi devrede.',
      type: 'info',
    },
    {
      id: 'log_2',
      time: '14:30:45',
      message: 'SOL için GÜÇLÜ AL sinyali (%89 güven) alındı. Risk kuralı uygun (%12 bakiye tahsisi). Sanal alım emri açıldı.',
      type: 'trade',
    },
    {
      id: 'log_3',
      time: '14:32:00',
      message: 'Risk Kontrolü: 2 aktif açık pozisyon mevcut (Limit: 4). Sistem yeni sinyalleri tarıyor.',
      type: 'info',
    }
  ]);

  const addLog = (message: string, type: AutopilotLog['type'] = 'info') => {
    const newLog: AutopilotLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      type,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const toggleAutopilot = () => {
    setConfig((prev) => {
      const nextState = !prev.enabled;
      addLog(
        nextState 
          ? 'Otopilot devreye alındı. Algoritmik alım-satım aktif.' 
          : 'Otopilot durduruldu. Yeni otomatik işlem açılmayacak.',
        'info'
      );
      return { ...prev, enabled: nextState };
    });
  };

  const updateConfig = (newSettings: Partial<AutopilotConfig>) => {
    setConfig((prev) => ({ ...prev, ...newSettings }));
    addLog('Risk yönetimi parametreleri güncellendi.', 'info');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Background Autopilot Evaluation Loop (simulating ASP.NET Core BackgroundService)
  useEffect(() => {
    if (!config.enabled) return;

    const interval = setInterval(() => {
      // 1. Check Take-Profit and Stop-Loss for open positions
      positions.forEach((pos) => {
        if (!pos.isAutopilot) return;

        // Take Profit Check
        if (config.autoTakeProfit && pos.currentPrice >= pos.targetProfit) {
          addLog(
            `[OTOMATİK KÂR AL] ${pos.symbol} hedef kâr seviyesine (${pos.targetProfit}$) ulaştı! Pozisyon kârla kapatıldı (+%${pos.pnlPercent}).`,
            'profit'
          );
          closePosition(pos.id, 'Take-Profit');
        } 
        // Stop Loss Check
        else if (config.autoStopLoss && pos.currentPrice <= pos.stopLoss) {
          addLog(
            `[OTOMATİK ZARAR DURDUR] ${pos.symbol} zarar durdur seviyesine (${pos.stopLoss}$) indi. Risk sınırlaması gereği pozisyon kapatıldı (%${pos.pnlPercent}).`,
            'loss'
          );
          closePosition(pos.id, 'Stop-Loss');
        }
      });

      // 2. Check if new AI signals meet autopilot criteria
      if (positions.length < config.maxOpenPositions) {
        // Find candidate coins with GÜÇLÜ AL and confidence >= minConfidence
        const candidates = coins.filter(
          (c) =>
            c.signal.action === 'GÜÇLÜ AL' &&
            c.signal.confidence >= config.minConfidence &&
            !positions.some((p) => p.symbol === c.symbol)
        );

        if (candidates.length > 0 && Math.random() < 0.25) {
          const targetCoin = candidates[Math.floor(Math.random() * candidates.length)];
          const allocatedAmount = Math.min(
            cashBalance * config.maxTradeRatio,
            totalBalance * config.maxTradeRatio
          );

          if (allocatedAmount >= 100 && cashBalance >= allocatedAmount) {
            const success = openPosition(targetCoin.symbol, 'BUY', Math.floor(allocatedAmount), true);
            if (success) {
              addLog(
                `[OTOPİLOT EMİR İCRA EDİLDİ] ${targetCoin.symbol} için %${targetCoin.signal.confidence} güvenli ${targetCoin.signal.action} sinyali yakalandı. $${Math.floor(allocatedAmount)} tutarında pozisyon açıldı.`,
                'trade'
              );
            }
          }
        }
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [config, positions, coins, cashBalance, totalBalance, openPosition, closePosition]);

  return (
    <AutopilotContext.Provider
      value={{
        config,
        logs,
        toggleAutopilot,
        updateConfig,
        clearLogs,
      }}
    >
      {children}
    </AutopilotContext.Provider>
  );
};

export const useAutopilot = () => useContext(AutopilotContext);
