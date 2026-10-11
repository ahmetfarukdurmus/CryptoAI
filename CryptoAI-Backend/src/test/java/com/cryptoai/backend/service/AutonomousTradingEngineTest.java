package com.cryptoai.backend.service;

import com.cryptoai.backend.dto.request.TradeRequestDto;
import com.cryptoai.backend.entity.PortfolioItem;
import com.cryptoai.backend.entity.User;
import com.cryptoai.backend.entity.Wallet;
import com.cryptoai.backend.entity.enums.TransactionType;
import com.cryptoai.backend.repository.PortfolioItemRepository;
import com.cryptoai.backend.repository.WalletRepository;
import com.cryptoai.backend.service.impl.AutonomousTradingEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AutonomousTradingEngineTest {

    @Mock
    private PortfolioItemRepository portfolioItemRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private BinanceService binanceService;

    @Mock
    private TradeService tradeService;

    @Mock
    private TechnicalAnalysisService technicalAnalysisService;

    private AutonomousTradingEngine tradingEngine;

    private User sampleUser;
    private Wallet sampleWallet;
    private PortfolioItem sampleBtcPosition;

    @BeforeEach
    void setUp() {
        tradingEngine = new AutonomousTradingEngine(
                portfolioItemRepository,
                walletRepository,
                binanceService,
                tradeService,
                technicalAnalysisService
        );

        ReflectionTestUtils.setField(tradingEngine, "enabled", true);
        ReflectionTestUtils.setField(tradingEngine, "takeProfitRatio", 1.05);
        ReflectionTestUtils.setField(tradingEngine, "stopLossRatio", 0.97);
        ReflectionTestUtils.setField(tradingEngine, "aiBuyAmountUsdt", 100.0);
        ReflectionTestUtils.setField(tradingEngine, "cooldownSeconds", 60L);

        sampleUser = User.builder()
                .id(1L)
                .email("bot@cryptoai.com")
                .fullName("Bot Trader")
                .isVerified(true)
                .build();

        sampleWallet = Wallet.builder()
                .id(10L)
                .user(sampleUser)
                .usdtBalance(new BigDecimal("5000.0000"))
                .build();

        sampleBtcPosition = PortfolioItem.builder()
                .id(101L)
                .wallet(sampleWallet)
                .coinSymbol("BTC")
                .amount(new BigDecimal("0.10000000"))
                .averagePrice(new BigDecimal("60000.0000"))
                .build();
    }

    @Test
    @DisplayName("Fiyat belirlenen takeProfit seviyesine ulaştığında AUTO_TAKE_PROFIT tetiklenmeli")
    void testTakeProfitTriggered() {
        // Alış: 60,000$, Hedef TakeProfit: 63,000$, Güncel: 63,500$
        sampleBtcPosition.setTakeProfit(new BigDecimal("63000.0000"));

        when(portfolioItemRepository.findAllActivePositions()).thenReturn(List.of(sampleBtcPosition));
        when(binanceService.getPricesForSymbols(List.of("BTC"))).thenReturn(Map.of("BTC", new BigDecimal("63500.0000")));
        when(walletRepository.findWalletsWithAvailableBalance(any(BigDecimal.class))).thenReturn(List.of());

        tradingEngine.runTradingCycle();

        ArgumentCaptor<TradeRequestDto> captor = ArgumentCaptor.forClass(TradeRequestDto.class);
        verify(tradeService, times(1)).executeTrade(eq(1L), captor.capture());

        TradeRequestDto captured = captor.getValue();
        assertEquals("BTC", captured.getSymbol());
        assertEquals(TransactionType.AUTO_TAKE_PROFIT, captured.getType());
        assertEquals(new BigDecimal("0.10000000"), captured.getAmount());
    }

    @Test
    @DisplayName("TakeProfit null olduğunda kâr yüksek olsa dahi satış tetiklenmemeli (Null-Safety)")
    void testTakeProfitNullSafety() {
        // TakeProfit tanımlanmamış (null), güncel fiyat çok yüksek olsa bile tetiklenmemeli
        sampleBtcPosition.setTakeProfit(null);

        when(portfolioItemRepository.findAllActivePositions()).thenReturn(List.of(sampleBtcPosition));
        when(binanceService.getPricesForSymbols(List.of("BTC"))).thenReturn(Map.of("BTC", new BigDecimal("70000.0000")));
        when(walletRepository.findWalletsWithAvailableBalance(any(BigDecimal.class))).thenReturn(List.of());

        tradingEngine.runTradingCycle();

        verify(tradeService, never()).executeTrade(anyLong(), any(TradeRequestDto.class));
    }

    @Test
    @DisplayName("Fiyat belirlenen stopLoss seviyesine düştüğünde AUTO_STOP_LOSS tetiklenmeli")
    void testStopLossTriggered() {
        // Alış: 60,000$, StopLoss: 58,200$, Güncel: 57,000$
        sampleBtcPosition.setStopLoss(new BigDecimal("58200.0000"));

        when(portfolioItemRepository.findAllActivePositions()).thenReturn(List.of(sampleBtcPosition));
        when(binanceService.getPricesForSymbols(List.of("BTC"))).thenReturn(Map.of("BTC", new BigDecimal("57000.0000")));
        when(walletRepository.findWalletsWithAvailableBalance(any(BigDecimal.class))).thenReturn(List.of());

        tradingEngine.runTradingCycle();

        ArgumentCaptor<TradeRequestDto> captor = ArgumentCaptor.forClass(TradeRequestDto.class);
        verify(tradeService, times(1)).executeTrade(eq(1L), captor.capture());

        TradeRequestDto captured = captor.getValue();
        assertEquals("BTC", captured.getSymbol());
        assertEquals(TransactionType.AUTO_STOP_LOSS, captured.getType());
        assertEquals(new BigDecimal("0.10000000"), captured.getAmount());
    }

    @Test
    @DisplayName("StopLoss null olduğunda düşüş olsa dahi zarar kes satışı tetiklenmemeli (Null-Safety)")
    void testStopLossNullSafety() {
        // StopLoss tanımlanmamış (null), fiyat düşse bile tetiklenmemeli
        sampleBtcPosition.setStopLoss(null);

        when(portfolioItemRepository.findAllActivePositions()).thenReturn(List.of(sampleBtcPosition));
        when(binanceService.getPricesForSymbols(List.of("BTC"))).thenReturn(Map.of("BTC", new BigDecimal("50000.0000")));
        when(walletRepository.findWalletsWithAvailableBalance(any(BigDecimal.class))).thenReturn(List.of());

        tradingEngine.runTradingCycle();

        verify(tradeService, never()).executeTrade(anyLong(), any(TradeRequestDto.class));
    }

    @Test
    @DisplayName("Ani trend kırılımı tespit edildiğinde AI_TREND_EXIT tetiklenmeli")
    void testAiTrendExitTriggered() {
        // Alış: 60,000$, Güncel: 60,100$, ancak trend kırılımı var
        when(portfolioItemRepository.findAllActivePositions()).thenReturn(List.of(sampleBtcPosition));
        when(binanceService.getPricesForSymbols(List.of("BTC"))).thenReturn(Map.of("BTC", new BigDecimal("60100.0000")));
        when(technicalAnalysisService.isTrendBreakdown("BTC")).thenReturn(true);
        when(walletRepository.findWalletsWithAvailableBalance(any(BigDecimal.class))).thenReturn(List.of());

        tradingEngine.runTradingCycle();

        ArgumentCaptor<TradeRequestDto> captor = ArgumentCaptor.forClass(TradeRequestDto.class);
        verify(tradeService, times(1)).executeTrade(eq(1L), captor.capture());

        TradeRequestDto captured = captor.getValue();
        assertEquals("BTC", captured.getSymbol());
        assertEquals(TransactionType.AI_TREND_EXIT, captured.getType());
    }

    @Test
    @DisplayName("Boşta nakit varken aşırı satım tespit edildiğinde AI_AUTO_BUY TP/SL ile tetiklenmeli")
    void testAiAutoBuyTriggered() {
        when(portfolioItemRepository.findAllActivePositions()).thenReturn(List.of());
        when(walletRepository.findWalletsWithAvailableBalance(any(BigDecimal.class))).thenReturn(List.of(sampleWallet));
        when(binanceService.getCurrentPrice("BTCUSDT")).thenReturn(new BigDecimal("60000.0000"));
        // Watchlistteki BTC için aşırı satım sinyali
        when(technicalAnalysisService.isOversold(eq("BTC"), anyDouble())).thenReturn(true);

        tradingEngine.runTradingCycle();

        ArgumentCaptor<TradeRequestDto> captor = ArgumentCaptor.forClass(TradeRequestDto.class);
        verify(tradeService, atLeastOnce()).executeTrade(eq(1L), captor.capture());

        TradeRequestDto captured = captor.getValue();
        assertEquals("BTC", captured.getSymbol());
        assertEquals(TransactionType.AI_AUTO_BUY, captured.getType());
        assertEquals(new BigDecimal("100.0"), captured.getTotalUsdt());
        assertNotNull(captured.getTakeProfit());
        assertNotNull(captured.getStopLoss());
        assertEquals(new BigDecimal("63000.0000"), captured.getTakeProfit()); // 60,000 * 1.05
        assertEquals(new BigDecimal("58200.0000"), captured.getStopLoss());   // 60,000 * 0.97
    }
}
