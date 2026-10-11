package com.cryptoai.backend.service;

import com.cryptoai.backend.dto.response.BinanceTickerDto;
import com.cryptoai.backend.dto.response.KlineDto;
import com.cryptoai.backend.dto.response.MarketDataDto;
import com.cryptoai.backend.service.impl.BinanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BinanceServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private BinanceServiceImpl binanceService;

    @BeforeEach
    void setUp() {
        binanceService = new BinanceServiceImpl(restTemplate, "https://api.binance.com");
    }

    @Test
    @DisplayName("Popüler coin ticker verileri başarıyla çekilmeli")
    void testGetPopularTickers() {
        BinanceTickerDto btcTicker = new BinanceTickerDto();
        btcTicker.setSymbol("BTCUSDT");
        btcTicker.setLastPrice(new BigDecimal("64500.00"));
        btcTicker.setPriceChangePercent(2.85);
        btcTicker.setHighPrice(new BigDecimal("65000.00"));
        btcTicker.setLowPrice(new BigDecimal("63000.00"));
        btcTicker.setVolume(new BigDecimal("21450.5"));

        when(restTemplate.getForObject(anyString(), eq(BinanceTickerDto[].class), anyString()))
                .thenReturn(new BinanceTickerDto[]{btcTicker});

        List<MarketDataDto> tickers = binanceService.getPopularTickers();

        assertNotNull(tickers);
        assertEquals(1, tickers.size());
        MarketDataDto dto = tickers.get(0);
        assertEquals("BTC", dto.getSymbol());
        assertEquals("BTCUSDT", dto.getPair());
        assertEquals("Bitcoin", dto.getName());
        assertEquals(new BigDecimal("64500.00"), dto.getCurrentPrice());
        assertEquals(2.85, dto.getChange24h());
    }

    @Test
    @DisplayName("Mum grafiği (kline) verileri başarıyla ayrıştırılmalı")
    void testGetKlines() {
        String rawJson = "[[1690000000000,\"64000.0\",\"64500.0\",\"63800.0\",\"64200.0\",\"150.5\",1690003600000,\"9662100.0\",1200,\"75.0\",\"4831050.0\",\"0\"]]";

        when(restTemplate.getForObject(anyString(), eq(String.class), any(), any(), any()))
                .thenReturn(rawJson);

        List<KlineDto> klines = binanceService.getKlines("BTCUSDT", "1h", 50);

        assertNotNull(klines);
        assertEquals(1, klines.size());
        KlineDto kline = klines.get(0);
        assertEquals(1690000000000L, kline.getOpenTime());
        assertEquals(new BigDecimal("64000.0"), kline.getOpen());
        assertEquals(new BigDecimal("64500.0"), kline.getHigh());
        assertEquals(new BigDecimal("63800.0"), kline.getLow());
        assertEquals(new BigDecimal("64200.0"), kline.getClose());
        assertEquals(new BigDecimal("150.5"), kline.getVolume());
    }

    @Test
    @DisplayName("Anlık tekil fiyat başarıyla alınmalı")
    void testGetCurrentPrice() {
        Map<String, String> response = Map.of("symbol", "ETHUSDT", "price", "3450.50");

        when(restTemplate.getForObject(anyString(), eq(Map.class), anyString()))
                .thenReturn(response);

        BigDecimal price = binanceService.getCurrentPrice("ETH");

        assertNotNull(price);
        assertEquals(new BigDecimal("3450.50"), price);
    }
}
