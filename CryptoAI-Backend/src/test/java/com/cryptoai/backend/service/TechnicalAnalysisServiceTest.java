package com.cryptoai.backend.service;

import com.cryptoai.backend.dto.response.KlineDto;
import com.cryptoai.backend.service.impl.TechnicalAnalysisServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TechnicalAnalysisServiceTest {

    @Mock
    private BinanceService binanceService;

    private TechnicalAnalysisServiceImpl technicalAnalysisService;

    @BeforeEach
    void setUp() {
        technicalAnalysisService = new TechnicalAnalysisServiceImpl(binanceService);
    }

    @Test
    @DisplayName("Sürekli yükselen fiyat serisinde RSI 100 olmalı")
    void testCalculateRsiAllGains() {
        List<KlineDto> klines = new ArrayList<>();
        BigDecimal price = new BigDecimal("100.0");
        for (int i = 0; i < 20; i++) {
            klines.add(KlineDto.builder().close(price).build());
            price = price.add(new BigDecimal("2.0"));
        }

        double rsi = technicalAnalysisService.calculateRsi(klines, 14);
        assertEquals(100.0, rsi, 0.001);
    }

    @Test
    @DisplayName("Sürekli düşen fiyat serisinde RSI 0 olmalı")
    void testCalculateRsiAllLosses() {
        List<KlineDto> klines = new ArrayList<>();
        BigDecimal price = new BigDecimal("200.0");
        for (int i = 0; i < 20; i++) {
            klines.add(KlineDto.builder().close(price).build());
            price = price.subtract(new BigDecimal("2.0"));
        }

        double rsi = technicalAnalysisService.calculateRsi(klines, 14);
        assertEquals(0.0, rsi, 0.001);
    }

    @Test
    @DisplayName("Yetersiz mum verisinde RSI nötr (50.0) dönmeli")
    void testCalculateRsiInsufficientData() {
        List<KlineDto> klines = List.of(
                KlineDto.builder().close(new BigDecimal("100.0")).build(),
                KlineDto.builder().close(new BigDecimal("105.0")).build()
        );

        double rsi = technicalAnalysisService.calculateRsi(klines, 14);
        assertEquals(50.0, rsi);
    }

    @Test
    @DisplayName("Aşırı satım (RSI < 30) durumunda isOversold true dönmeli")
    void testIsOversold() {
        List<KlineDto> klines = new ArrayList<>();
        BigDecimal price = new BigDecimal("150.0");
        for (int i = 0; i < 25; i++) {
            klines.add(KlineDto.builder().close(price).build());
            price = price.subtract(new BigDecimal("1.5"));
        }

        when(binanceService.getKlines(eq("BTCUSDT"), eq("15m"), eq(30))).thenReturn(klines);

        boolean oversold = technicalAnalysisService.isOversold("BTC", 30.0);
        assertTrue(oversold);
    }

    @Test
    @DisplayName("Ani düşüş serisinde isTrendBreakdown true dönmeli")
    void testIsTrendBreakdown() {
        List<KlineDto> klines = List.of(
                KlineDto.builder().close(new BigDecimal("100.0")).build(),
                KlineDto.builder().close(new BigDecimal("98.0")).build(),
                KlineDto.builder().close(new BigDecimal("95.0")).build()
        );

        when(binanceService.getKlines(eq("ETHUSDT"), eq("15m"), eq(20))).thenReturn(klines);

        boolean breakdown = technicalAnalysisService.isTrendBreakdown("ETH");
        assertTrue(breakdown);
    }
}
