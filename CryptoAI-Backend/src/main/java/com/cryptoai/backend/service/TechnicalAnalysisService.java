package com.cryptoai.backend.service;

import com.cryptoai.backend.dto.response.KlineDto;

import java.util.List;

public interface TechnicalAnalysisService {

    enum SignalType {
        STRONG_BUY,
        STRONG_SELL,
        NEUTRAL
    }

    double calculateRsi(List<KlineDto> klines, int period);

    boolean isOversold(String symbol, double threshold);

    boolean isOverbought(String symbol, double threshold);

    boolean isTrendBreakdown(String symbol);

    SignalType analyzeMarketSignal(String symbol);
}
