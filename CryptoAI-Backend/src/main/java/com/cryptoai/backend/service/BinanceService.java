package com.cryptoai.backend.service;

import com.cryptoai.backend.dto.response.KlineDto;
import com.cryptoai.backend.dto.response.MarketDataDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface BinanceService {

    List<MarketDataDto> getPopularTickers();

    List<KlineDto> getKlines(String symbol, String interval, int limit);

    BigDecimal getCurrentPrice(String symbol);

    Map<String, BigDecimal> getPricesForSymbols(List<String> symbols);
}
