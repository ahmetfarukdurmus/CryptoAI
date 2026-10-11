package com.cryptoai.backend.service;

import com.cryptoai.backend.dto.request.TradeRequestDto;
import com.cryptoai.backend.dto.response.TradeResponseDto;
import com.cryptoai.backend.dto.response.WalletDetailResponse;
import com.cryptoai.backend.entity.PortfolioItem;
import com.cryptoai.backend.entity.Transaction;
import com.cryptoai.backend.entity.User;
import com.cryptoai.backend.entity.Wallet;
import com.cryptoai.backend.entity.enums.TransactionType;
import com.cryptoai.backend.exception.ApiException;
import com.cryptoai.backend.repository.PortfolioItemRepository;
import com.cryptoai.backend.repository.TransactionRepository;
import com.cryptoai.backend.repository.WalletRepository;
import com.cryptoai.backend.service.impl.TradeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TradeServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private PortfolioItemRepository portfolioItemRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private BinanceService binanceService;

    @InjectMocks
    private TradeServiceImpl tradeService;

    private Long userId;
    private Wallet sampleWallet;

    @BeforeEach
    void setUp() {
        userId = 1L;
        User sampleUser = User.builder()
                .id(userId)
                .email("trader@cryptoai.com")
                .fullName("Crypto Trader")
                .isVerified(true)
                .build();

        sampleWallet = Wallet.builder()
                .id(10L)
                .user(sampleUser)
                .usdtBalance(new BigDecimal("10000.0000"))
                .build();
    }

    @Test
    @DisplayName("İlk kez coin alımı (BUY) başarılı olmalı")
    void testBuyTradeSuccess() {
        TradeRequestDto request = new TradeRequestDto("BTC", TransactionType.BUY, new BigDecimal("0.1"), null);
        request.setTakeProfit(new BigDecimal("65000.0000"));
        request.setStopLoss(new BigDecimal("55000.0000"));

        when(binanceService.getCurrentPrice("BTCUSDT")).thenReturn(new BigDecimal("60000.0000"));
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(sampleWallet));
        when(portfolioItemRepository.findByWalletIdAndCoinSymbol(sampleWallet.getId(), "BTC")).thenReturn(Optional.empty());

        TradeResponseDto response = tradeService.executeTrade(userId, request);

        assertNotNull(response);
        assertEquals(TransactionType.BUY, response.getType());
        assertEquals("BTC", response.getCoinSymbol());
        assertEquals(new BigDecimal("0.10000000"), response.getAmount());
        assertEquals(new BigDecimal("6000.0000"), response.getTotalUsdt());
        assertEquals(new BigDecimal("4000.0000"), response.getRemainingUsdtBalance());
        assertEquals(new BigDecimal("60000.0000"), response.getNewAveragePrice());

        verify(walletRepository, times(1)).save(sampleWallet);
        org.mockito.ArgumentCaptor<PortfolioItem> itemCaptor = org.mockito.ArgumentCaptor.forClass(PortfolioItem.class);
        verify(portfolioItemRepository, times(1)).save(itemCaptor.capture());
        assertEquals(new BigDecimal("65000.0000"), itemCaptor.getValue().getTakeProfit());
        assertEquals(new BigDecimal("55000.0000"), itemCaptor.getValue().getStopLoss());
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    @DisplayName("Mevcut coinin üzerine alım yapıldığında ağırlıklı ortalama maliyet doğru hesaplanmalı")
    void testBuyTradeWeightedAverageCost() {
        PortfolioItem existingItem = PortfolioItem.builder()
                .id(101L)
                .wallet(sampleWallet)
                .coinSymbol("BTC")
                .amount(new BigDecimal("0.10000000"))
                .averagePrice(new BigDecimal("60000.0000"))
                .build();

        TradeRequestDto request = new TradeRequestDto("BTC", TransactionType.BUY, new BigDecimal("0.1"), null);

        when(binanceService.getCurrentPrice("BTCUSDT")).thenReturn(new BigDecimal("70000.0000"));
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(sampleWallet));
        when(portfolioItemRepository.findByWalletIdAndCoinSymbol(sampleWallet.getId(), "BTC")).thenReturn(Optional.of(existingItem));

        TradeResponseDto response = tradeService.executeTrade(userId, request);

        assertNotNull(response);
        // (0.1 * 60,000 + 0.1 * 70,000) / 0.2 = 65,000.0000
        assertEquals(new BigDecimal("65000.0000"), response.getNewAveragePrice());
        assertEquals(new BigDecimal("0.20000000"), existingItem.getAmount());
        assertEquals(new BigDecimal("3000.0000"), sampleWallet.getUsdtBalance()); // 10000 - 7000
    }

    @Test
    @DisplayName("Yetersiz USDT bakiyesinde alım işlemi reddedilmeli")
    void testBuyTradeInsufficientBalance() {
        sampleWallet.setUsdtBalance(new BigDecimal("1000.0000"));
        TradeRequestDto request = new TradeRequestDto("BTC", TransactionType.BUY, new BigDecimal("0.1"), null);

        when(binanceService.getCurrentPrice("BTCUSDT")).thenReturn(new BigDecimal("60000.0000")); // Maliyet: 6000 USDT
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(sampleWallet));

        ApiException ex = assertThrows(ApiException.class, () -> tradeService.executeTrade(userId, request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("Yetersiz USDT bakiyesi"));
    }

    @Test
    @DisplayName("Kısmi satış işlemi (SELL) başarılı olmalı ve bakiye artmalı")
    void testSellTradeSuccess() {
        PortfolioItem existingItem = PortfolioItem.builder()
                .id(102L)
                .wallet(sampleWallet)
                .coinSymbol("ETH")
                .amount(new BigDecimal("2.00000000"))
                .averagePrice(new BigDecimal("3000.0000"))
                .build();

        TradeRequestDto request = new TradeRequestDto("ETH", TransactionType.SELL, new BigDecimal("1.0"), null);

        when(binanceService.getCurrentPrice("ETHUSDT")).thenReturn(new BigDecimal("3500.0000")); // Gelir: 3500 USDT
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(sampleWallet));
        when(portfolioItemRepository.findByWalletIdAndCoinSymbol(sampleWallet.getId(), "ETH")).thenReturn(Optional.of(existingItem));

        TradeResponseDto response = tradeService.executeTrade(userId, request);

        assertNotNull(response);
        assertEquals(TransactionType.SELL, response.getType());
        assertEquals(new BigDecimal("13500.0000"), sampleWallet.getUsdtBalance()); // 10000 + 3500
        assertEquals(new BigDecimal("1.00000000"), existingItem.getAmount());
        assertEquals(new BigDecimal("3000.0000"), existingItem.getAveragePrice()); // Satışta ortalama maliyet değişmez
    }

    @Test
    @DisplayName("Portföyde olmayan coin satılmaya çalışıldığında hata fırlatılmalı")
    void testSellTradeNonExistingCoin() {
        TradeRequestDto request = new TradeRequestDto("SOL", TransactionType.SELL, new BigDecimal("5.0"), null);

        when(binanceService.getCurrentPrice("SOLUSDT")).thenReturn(new BigDecimal("150.0000"));
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(sampleWallet));
        when(portfolioItemRepository.findByWalletIdAndCoinSymbol(sampleWallet.getId(), "SOL")).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> tradeService.executeTrade(userId, request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("Portföyünüzde SOL bulunmamaktadır"));
    }

    @Test
    @DisplayName("Tüm coinin satılması durumunda portföyden silinmeli")
    void testSellTradeAllCoinRemovesItem() {
        PortfolioItem existingItem = PortfolioItem.builder()
                .id(103L)
                .wallet(sampleWallet)
                .coinSymbol("AVAX")
                .amount(new BigDecimal("10.00000000"))
                .averagePrice(new BigDecimal("25.0000"))
                .build();

        TradeRequestDto request = new TradeRequestDto("AVAX", TransactionType.SELL, new BigDecimal("10.0"), null);

        when(binanceService.getCurrentPrice("AVAXUSDT")).thenReturn(new BigDecimal("30.0000"));
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(sampleWallet));
        when(portfolioItemRepository.findByWalletIdAndCoinSymbol(sampleWallet.getId(), "AVAX")).thenReturn(Optional.of(existingItem));

        TradeResponseDto response = tradeService.executeTrade(userId, request);

        assertNotNull(response);
        verify(portfolioItemRepository, times(1)).delete(existingItem);
    }

    @Test
    @DisplayName("Cüzdan detayları ve canlı piyasa değerlemesi doğru hesaplanmalı")
    void testGetWalletDetails() {
        PortfolioItem item = PortfolioItem.builder()
                .id(104L)
                .wallet(sampleWallet)
                .coinSymbol("BTC")
                .amount(new BigDecimal("0.10000000"))
                .averagePrice(new BigDecimal("60000.0000"))
                .build();

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(sampleWallet));
        when(portfolioItemRepository.findByWalletId(sampleWallet.getId())).thenReturn(List.of(item));
        when(binanceService.getPricesForSymbols(List.of("BTC"))).thenReturn(Map.of("BTC", new BigDecimal("65000.0000")));
        when(transactionRepository.findTop20ByUserIdOrderByTimestampDesc(userId)).thenReturn(Collections.emptyList());
        when(transactionRepository.findByWalletIdOrderByTimestampDesc(sampleWallet.getId())).thenReturn(Collections.emptyList());

        WalletDetailResponse response = tradeService.getWalletDetails(userId);

        assertNotNull(response);
        assertEquals(new BigDecimal("10000.0000"), response.getUsdtBalance());
        // Coins Value: 0.1 * 65,000 = 6,500.0000
        assertEquals(new BigDecimal("6500.0000"), response.getTotalCoinsValue());
        // Invested: 0.1 * 60,000 = 6,000.0000
        assertEquals(new BigDecimal("6000.0000"), response.getTotalInvested());
        // Total Portfolio: 10,000 + 6,500 = 16,500.0000
        assertEquals(new BigDecimal("16500.0000"), response.getTotalPortfolioValue());
        // PnL: 6500 - 6000 = 500.0000 (+8.33%)
        assertEquals(new BigDecimal("500.0000"), response.getTotalProfitOrLoss());
    }
}
