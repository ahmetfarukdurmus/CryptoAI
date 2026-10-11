package com.cryptoai.backend.service.impl;

import com.cryptoai.backend.dto.response.KlineDto;
import com.cryptoai.backend.service.BinanceService;
import com.cryptoai.backend.service.TechnicalAnalysisService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TechnicalAnalysisServiceImpl implements TechnicalAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(TechnicalAnalysisServiceImpl.class);

    private final BinanceService binanceService;

    public TechnicalAnalysisServiceImpl(BinanceService binanceService) {
        this.binanceService = binanceService;
    }

    @Override
    public double calculateRsi(List<KlineDto> klines, int period) {
        if (klines == null || klines.size() <= period) {
            return 50.0; // Yetersiz veri durumunda nötr değer
        }

        double gainSum = 0.0;
        double lossSum = 0.0;

        // İlk periyot ortalaması
        for (int i = 1; i <= period; i++) {
            BigDecimal currentClose = klines.get(i).getClose();
            BigDecimal prevClose = klines.get(i - 1).getClose();
            if (currentClose == null || prevClose == null) {
                continue;
            }
            double change = currentClose.subtract(prevClose).doubleValue();
            if (change >= 0) {
                gainSum += change;
            } else {
                lossSum += Math.abs(change);
            }
        }

        double avgGain = gainSum / period;
        double avgLoss = lossSum / period;

        // Kalan mumlar için Wilder düzeltmesi (Smoothing)
        for (int i = period + 1; i < klines.size(); i++) {
            BigDecimal currentClose = klines.get(i).getClose();
            BigDecimal prevClose = klines.get(i - 1).getClose();
            if (currentClose == null || prevClose == null) {
                continue;
            }
            double change = currentClose.subtract(prevClose).doubleValue();
            double gain = change >= 0 ? change : 0;
            double loss = change < 0 ? Math.abs(change) : 0;

            avgGain = (avgGain * (period - 1) + gain) / period;
            avgLoss = (avgLoss * (period - 1) + loss) / period;
        }

        if (avgLoss == 0) {
            return 100.0;
        }
        if (avgGain == 0) {
            return 0.0;
        }

        double rs = avgGain / avgLoss;
        return 100.0 - (100.0 / (1.0 + rs));
    }

    @Override
    public boolean isOversold(String symbol, double threshold) {
        String pair = formatPair(symbol);
        List<KlineDto> klines = binanceService.getKlines(pair, "15m", 30);
        double rsi = calculateRsi(klines, 14);
        return rsi <= threshold;
    }

    @Override
    public boolean isOverbought(String symbol, double threshold) {
        String pair = formatPair(symbol);
        List<KlineDto> klines = binanceService.getKlines(pair, "15m", 30);
        double rsi = calculateRsi(klines, 14);
        return rsi >= threshold;
    }

    @Override
    public boolean isTrendBreakdown(String symbol) {
        String pair = formatPair(symbol);
        List<KlineDto> klines = binanceService.getKlines(pair, "15m", 20);
        if (klines == null || klines.size() < 3) {
            return false;
        }

        KlineDto last = klines.get(klines.size() - 1);
        KlineDto prev = klines.get(klines.size() - 2);
        KlineDto beforePrev = klines.get(klines.size() - 3);

        if (last.getClose() == null || prev.getClose() == null || beforePrev.getClose() == null) {
            return false;
        }

        boolean twoConsecutiveDrops = last.getClose().compareTo(prev.getClose()) < 0
                && prev.getClose().compareTo(beforePrev.getClose()) < 0;

        double dropPercent = 0.0;
        if (prev.getClose().compareTo(BigDecimal.ZERO) > 0) {
            dropPercent = prev.getClose().subtract(last.getClose()).doubleValue() / prev.getClose().doubleValue() * 100.0;
        }

        return twoConsecutiveDrops || dropPercent >= 1.5;
    }

    @Override
    public SignalType analyzeMarketSignal(String symbol) {
        String pair = formatPair(symbol);
        List<KlineDto> klines = binanceService.getKlines(pair, "15m", 30);
        double rsi = calculateRsi(klines, 14);

        if (rsi < 30.0) {
            log.info("AI Sinyal: {} için Aşırı Satım (RSI={}) -> GÜÇLÜ ALIM", symbol, String.format("%.2f", rsi));
            return SignalType.STRONG_BUY;
        } else if (rsi > 70.0 || isTrendBreakdown(symbol)) {
            log.info("AI Sinyal: {} için Aşırı Alım/Trend Kırılımı (RSI={}) -> GÜÇLÜ SATIM", symbol, String.format("%.2f", rsi));
            return SignalType.STRONG_SELL;
        }

        return SignalType.NEUTRAL;
    }

    private String formatPair(String symbol) {
        String clean = symbol.trim().toUpperCase().replace("USDT", "");
        return clean + "USDT";
    }
}
