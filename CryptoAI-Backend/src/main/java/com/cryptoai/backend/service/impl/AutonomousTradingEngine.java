package com.cryptoai.backend.service.impl;

import com.cryptoai.backend.dto.request.TradeRequestDto;
import com.cryptoai.backend.entity.PortfolioItem;
import com.cryptoai.backend.entity.Wallet;
import com.cryptoai.backend.entity.enums.TransactionType;
import com.cryptoai.backend.repository.PortfolioItemRepository;
import com.cryptoai.backend.repository.WalletRepository;
import com.cryptoai.backend.service.BinanceService;
import com.cryptoai.backend.service.TechnicalAnalysisService;
import com.cryptoai.backend.service.TradeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AutonomousTradingEngine {

    private static final Logger log = LoggerFactory.getLogger(AutonomousTradingEngine.class);

    // ANSI Renk Kodları
    private static final String ANSI_RESET = "\u001B[0m";
    private static final String ANSI_GREEN = "\u001B[32m";
    private static final String ANSI_RED = "\u001B[31m";
    private static final String ANSI_YELLOW = "\u001B[33m";
    private static final String ANSI_CYAN = "\u001B[36m";
    private static final String ANSI_BOLD = "\u001B[1m";

    private final PortfolioItemRepository portfolioItemRepository;
    private final WalletRepository walletRepository;
    private final BinanceService binanceService;
    private final TradeService tradeService;
    private final TechnicalAnalysisService technicalAnalysisService;

    @Value("${bot.trading.enabled:true}")
    private boolean enabled;

    @Value("${bot.trading.take-profit-ratio:1.05}")
    private double takeProfitRatio;

    @Value("${bot.trading.stop-loss-ratio:0.97}")
    private double stopLossRatio;

    @Value("${bot.trading.ai-buy-amount-usdt:100.0}")
    private double aiBuyAmountUsdt;

    @Value("${bot.trading.cooldown-seconds:60}")
    private long cooldownSeconds;

    // AI alımları için izlenen popüler ana coinler
    private static final List<String> WATCHLIST_COINS = List.of("BTC", "ETH", "SOL", "AVAX");

    // "userId:coinSymbol" -> son alım zaman damgası (milisaniye)
    private final Map<String, Long> buyCooldowns = new ConcurrentHashMap<>();

    public AutonomousTradingEngine(
            PortfolioItemRepository portfolioItemRepository,
            WalletRepository walletRepository,
            BinanceService binanceService,
            TradeService tradeService,
            TechnicalAnalysisService technicalAnalysisService) {
        this.portfolioItemRepository = portfolioItemRepository;
        this.walletRepository = walletRepository;
        this.binanceService = binanceService;
        this.tradeService = tradeService;
        this.technicalAnalysisService = technicalAnalysisService;
    }

    @Scheduled(fixedRateString = "${bot.trading.fixed-rate-ms:5000}")
    public void runTradingCycle() {
        if (!enabled) {
            return;
        }

        try {
            // 1. Açık pozisyonları tara (Take-Profit, Stop-Loss ve AI Trend Exit)
            evaluateOpenPositions();

            // 2. Boşta nakdi olan cüzdanlar için AI Alım sinyallerini tara
            evaluateAiBuyOpportunities();
        } catch (Exception ex) {
            log.error("Otonom bot döngüsünde beklenmeyen hata: {}", ex.getMessage(), ex);
        }
    }

    /**
     * Kullanıcıların portföylerindeki açık pozisyonları inceler ve Take-Profit / Stop-Loss / Trend Exit tetikler.
     */
    private void evaluateOpenPositions() {
        List<PortfolioItem> activePositions = portfolioItemRepository.findAllActivePositions();
        if (activePositions.isEmpty()) {
            return;
        }

        List<String> symbols = activePositions.stream()
                .map(PortfolioItem::getCoinSymbol)
                .distinct()
                .toList();

        Map<String, BigDecimal> currentPrices = binanceService.getPricesForSymbols(symbols);

        for (PortfolioItem item : activePositions) {
            try {
                String symbol = item.getCoinSymbol();
                BigDecimal currentPrice = currentPrices.get(symbol);
                if (currentPrice == null || currentPrice.compareTo(BigDecimal.ZERO) <= 0) {
                    continue;
                }

                BigDecimal avgPrice = item.getAveragePrice();
                if (avgPrice == null || avgPrice.compareTo(BigDecimal.ZERO) <= 0) {
                    continue;
                }

                Long userId = item.getWallet().getUser().getId();
                double currentPriceVal = currentPrice.doubleValue();
                double avgPriceVal = avgPrice.doubleValue();
                double profitPercent = ((currentPriceVal - avgPriceVal) / avgPriceVal) * 100.0;

                // 1. Take-Profit Kontrolü (Null-safe hedef kâr kontrolü)
                if (item.getTakeProfit() != null && currentPrice.compareTo(item.getTakeProfit()) >= 0) {
                    TradeRequestDto request = TradeRequestDto.builder()
                            .symbol(symbol)
                            .type(TransactionType.AUTO_TAKE_PROFIT)
                            .amount(item.getAmount())
                            .price(currentPrice)
                            .build();

                    tradeService.executeTrade(userId, request);

                    log.info("{}{}[AUTO-BOT] {} Take-Profit tetiklendi! Fiyat: {}$, Hedef: {}$, Kâr: +{}% realize edildi. (Kullanıcı ID: {}){}",
                            ANSI_BOLD, ANSI_GREEN, symbol, currentPrice.toPlainString(), item.getTakeProfit().toPlainString(), String.format("%.2f", profitPercent), userId, ANSI_RESET);
                    continue;
                }

                // 2. Stop-Loss Kontrolü (Null-safe zarar kes kontrolü)
                if (item.getStopLoss() != null && currentPrice.compareTo(item.getStopLoss()) <= 0) {
                    TradeRequestDto request = TradeRequestDto.builder()
                            .symbol(symbol)
                            .type(TransactionType.AUTO_STOP_LOSS)
                            .amount(item.getAmount())
                            .price(currentPrice)
                            .build();

                    tradeService.executeTrade(userId, request);

                    log.info("{}{}[AUTO-BOT] {} Stop-Loss tetiklendi! Fiyat: {}$, Stop: {}$, Zarar kesildi: -{}% (Kullanıcı ID: {}){}",
                            ANSI_BOLD, ANSI_RED, symbol, currentPrice.toPlainString(), item.getStopLoss().toPlainString(), String.format("%.2f", Math.abs(profitPercent)), userId, ANSI_RESET);
                    continue;
                }

                // 3. AI Trend Kırılımı / Erken Çıkış Kontrolü (RSI > 75 veya ani negatif momentum)
                if (technicalAnalysisService.isTrendBreakdown(symbol)) {
                    TradeRequestDto request = TradeRequestDto.builder()
                            .symbol(symbol)
                            .type(TransactionType.AI_TREND_EXIT)
                            .amount(item.getAmount())
                            .price(currentPrice)
                            .build();

                    tradeService.executeTrade(userId, request);

                    log.info("{}{}[AUTO-BOT] {} AI Trend Kırılım Sinyali! Erken çıkış yapıldı. Fiyat: {}$, PnL: {}% (Kullanıcı ID: {}){}",
                            ANSI_BOLD, ANSI_YELLOW, symbol, currentPrice.toPlainString(), String.format("%.2f", profitPercent), userId, ANSI_RESET);
                }

            } catch (Exception e) {
                log.warn("Pozisyon değerlendirilirken hata oluştu (id={}): {}", item.getId(), e.getMessage());
            }
        }
    }

    /**
     * Boşta USDT bakiyesi olan cüzdanları tarayarak RSI aşırı satım sinyalinde küçük alımlar yapar.
     */
    private void evaluateAiBuyOpportunities() {
        BigDecimal minRequiredBalance = BigDecimal.valueOf(aiBuyAmountUsdt);
        List<Wallet> eligibleWallets = walletRepository.findWalletsWithAvailableBalance(minRequiredBalance);
        if (eligibleWallets.isEmpty()) {
            return;
        }

        for (String coin : WATCHLIST_COINS) {
            try {
                // RSI < 32 ise aşırı satım / güçlü alım sinyali
                if (!technicalAnalysisService.isOversold(coin, 32.0)) {
                    continue;
                }

                for (Wallet wallet : eligibleWallets) {
                    Long userId = wallet.getUser().getId();
                    String cooldownKey = userId + ":" + coin;
                    long lastBuyTime = buyCooldowns.getOrDefault(cooldownKey, 0L);

                    // Cooldown kontrolü (varsayılan: 60 saniye)
                    if (System.currentTimeMillis() - lastBuyTime < (cooldownSeconds * 1000)) {
                        continue;
                    }

                    if (wallet.getUsdtBalance().compareTo(minRequiredBalance) < 0) {
                        continue;
                    }

                    BigDecimal currentPrice = binanceService.getCurrentPrice(coin + "USDT");
                    BigDecimal tp = null;
                    BigDecimal sl = null;
                    if (currentPrice != null && currentPrice.compareTo(BigDecimal.ZERO) > 0) {
                        tp = currentPrice.multiply(BigDecimal.valueOf(takeProfitRatio)).setScale(4, RoundingMode.HALF_UP);
                        sl = currentPrice.multiply(BigDecimal.valueOf(stopLossRatio)).setScale(4, RoundingMode.HALF_UP);
                    }

                    TradeRequestDto request = TradeRequestDto.builder()
                            .symbol(coin)
                            .type(TransactionType.AI_AUTO_BUY)
                            .totalUsdt(minRequiredBalance)
                            .takeProfit(tp)
                            .stopLoss(sl)
                            .build();

                    tradeService.executeTrade(userId, request);
                    buyCooldowns.put(cooldownKey, System.currentTimeMillis());

                    log.info("{}{}[AUTO-BOT] AI Güçlü Alım Sinyali (Aşırı Satım) -> {} alındı! Tutar: {} USDT (Kullanıcı ID: {}){}",
                            ANSI_BOLD, ANSI_CYAN, coin, minRequiredBalance.toPlainString(), userId, ANSI_RESET);
                }
            } catch (Exception e) {
                log.warn("AI alım sinyali değerlendirilirken hata ({}): {}", coin, e.getMessage());
            }
        }
    }
}
