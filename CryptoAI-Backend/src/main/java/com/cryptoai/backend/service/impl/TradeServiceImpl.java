package com.cryptoai.backend.service.impl;

import com.cryptoai.backend.dto.request.TradeRequestDto;
import com.cryptoai.backend.dto.response.*;
import com.cryptoai.backend.entity.PortfolioItem;
import com.cryptoai.backend.entity.Transaction;
import com.cryptoai.backend.entity.User;
import com.cryptoai.backend.entity.Wallet;
import com.cryptoai.backend.entity.enums.TransactionType;
import com.cryptoai.backend.exception.ApiException;
import com.cryptoai.backend.repository.PortfolioItemRepository;
import com.cryptoai.backend.repository.TransactionRepository;
import com.cryptoai.backend.repository.WalletRepository;
import com.cryptoai.backend.service.BinanceService;
import com.cryptoai.backend.service.TradeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class TradeServiceImpl implements TradeService {

    private static final Logger log = LoggerFactory.getLogger(TradeServiceImpl.class);

    private final WalletRepository walletRepository;
    private final PortfolioItemRepository portfolioItemRepository;
    private final TransactionRepository transactionRepository;
    private final BinanceService binanceService;

    public TradeServiceImpl(
            WalletRepository walletRepository,
            PortfolioItemRepository portfolioItemRepository,
            TransactionRepository transactionRepository,
            BinanceService binanceService) {
        this.walletRepository = walletRepository;
        this.portfolioItemRepository = portfolioItemRepository;
        this.transactionRepository = transactionRepository;
        this.binanceService = binanceService;
    }

    @Override
    @Transactional
    public TradeResponseDto executeTrade(Long userId, TradeRequestDto request) {
        if (request == null || request.getSymbol() == null || request.getType() == null) {
            throw new ApiException("Geçersiz alım-satım isteği. Sembol ve işlem tipi zorunludur.", HttpStatus.BAD_REQUEST);
        }

        String cleanSymbol = request.getSymbol().trim().toUpperCase().replace("USDT", "");
        String pair = cleanSymbol + "USDT";

        log.info("Alım-satım işlemi yürütülüyor: userId={}, type={}, symbol={}", userId, request.getType(), cleanSymbol);

        // İstemciden fiyat gönderildiyse kullan, gönderilmediyse Binance'ten canlı çek
        BigDecimal executionPrice;
        if (request.getPrice() != null && request.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            executionPrice = request.getPrice().setScale(4, RoundingMode.HALF_UP);
        } else {
            executionPrice = binanceService.getCurrentPrice(pair);
        }

        if (executionPrice == null || executionPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException("Fiyat bilgisi belirlenemedi.", HttpStatus.BAD_REQUEST);
        }

        // Miktar veya Toplam USDT hesaplaması
        BigDecimal amount;
        BigDecimal totalUsdt;

        if (request.getAmount() != null && request.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            amount = request.getAmount().setScale(8, RoundingMode.HALF_UP);
            totalUsdt = amount.multiply(executionPrice).setScale(4, RoundingMode.HALF_UP);
        } else if (request.getTotalUsdt() != null && request.getTotalUsdt().compareTo(BigDecimal.ZERO) > 0) {
            totalUsdt = request.getTotalUsdt().setScale(4, RoundingMode.HALF_UP);
            amount = totalUsdt.divide(executionPrice, 8, RoundingMode.HALF_UP);
        } else {
            throw new ApiException("Lütfen işlem miktarı (amount) veya toplam tutar (totalUsdt) giriniz.", HttpStatus.BAD_REQUEST);
        }

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Kullanıcıya ait cüzdan bulunamadı.", HttpStatus.NOT_FOUND));

        User user = wallet.getUser();
        BigDecimal newAveragePrice = BigDecimal.ZERO;

        if (request.getType().isBuy()) {
            // USDT Bakiye kontrolü
            if (wallet.getUsdtBalance().compareTo(totalUsdt) < 0) {
                throw new ApiException(
                        String.format("Yetersiz USDT bakiyesi. Mevcut: %s USDT, Gereken: %s USDT",
                                wallet.getUsdtBalance().stripTrailingZeros().toPlainString(),
                                totalUsdt.stripTrailingZeros().toPlainString()),
                        HttpStatus.BAD_REQUEST
                );
            }

            // USDT bakiyesinden düş
            wallet.setUsdtBalance(wallet.getUsdtBalance().subtract(totalUsdt).setScale(4, RoundingMode.HALF_UP));
            walletRepository.save(wallet);

            // Portföyü güncelle (Ağırlıklı Ortalama Maliyet Formülü)
            Optional<PortfolioItem> existingItemOpt = portfolioItemRepository.findByWalletIdAndCoinSymbol(wallet.getId(), cleanSymbol);

            PortfolioItem portfolioItem;
            if (existingItemOpt.isPresent()) {
                portfolioItem = existingItemOpt.get();
                BigDecimal currentAmount = portfolioItem.getAmount();
                BigDecimal currentAvgPrice = portfolioItem.getAveragePrice();

                BigDecimal totalAmount = currentAmount.add(amount);
                BigDecimal totalCostBefore = currentAmount.multiply(currentAvgPrice);
                BigDecimal totalCostNew = amount.multiply(executionPrice);

                newAveragePrice = totalCostBefore.add(totalCostNew).divide(totalAmount, 4, RoundingMode.HALF_UP);

                portfolioItem.setAmount(totalAmount.setScale(8, RoundingMode.HALF_UP));
                portfolioItem.setAveragePrice(newAveragePrice);
            } else {
                newAveragePrice = executionPrice.setScale(4, RoundingMode.HALF_UP);
                portfolioItem = PortfolioItem.builder()
                        .wallet(wallet)
                        .coinSymbol(cleanSymbol)
                        .amount(amount)
                        .averagePrice(newAveragePrice)
                        .build();
            }

            if (request.getTakeProfit() != null) {
                portfolioItem.setTakeProfit(request.getTakeProfit());
            }
            if (request.getStopLoss() != null) {
                portfolioItem.setStopLoss(request.getStopLoss());
            }

            portfolioItemRepository.save(portfolioItem);

        } else { // SELL veya AUTO_SELL
            PortfolioItem portfolioItem = portfolioItemRepository.findByWalletIdAndCoinSymbol(wallet.getId(), cleanSymbol)
                    .orElseThrow(() -> new ApiException("Portföyünüzde " + cleanSymbol + " bulunmamaktadır.", HttpStatus.BAD_REQUEST));

            if (portfolioItem.getAmount().compareTo(amount) < 0) {
                throw new ApiException(
                        String.format("Yetersiz %s miktarı. Portföydeki miktar: %s, Satılmak istenen: %s",
                                cleanSymbol,
                                portfolioItem.getAmount().stripTrailingZeros().toPlainString(),
                                amount.stripTrailingZeros().toPlainString()),
                        HttpStatus.BAD_REQUEST
                );
            }

            // Satış gelirini USDT bakiyesine ekle
            wallet.setUsdtBalance(wallet.getUsdtBalance().add(totalUsdt).setScale(4, RoundingMode.HALF_UP));
            walletRepository.save(wallet);

            BigDecimal remainingAmount = portfolioItem.getAmount().subtract(amount);
            newAveragePrice = portfolioItem.getAveragePrice();

            if (remainingAmount.compareTo(new BigDecimal("0.00000001")) <= 0) {
                // Tümü satıldıysa portföyden kaldır
                portfolioItemRepository.delete(portfolioItem);
            } else {
                portfolioItem.setAmount(remainingAmount.setScale(8, RoundingMode.HALF_UP));
                portfolioItemRepository.save(portfolioItem);
            }
        }

        // Transaction tablosuna log kaydı at
        Transaction transaction = Transaction.builder()
                .user(user)
                .wallet(wallet)
                .type(request.getType())
                .coinSymbol(cleanSymbol)
                .amount(amount)
                .price(executionPrice.setScale(4, RoundingMode.HALF_UP))
                .totalUsdt(totalUsdt)
                .timestamp(LocalDateTime.now())
                .build();

        transactionRepository.save(transaction);

        log.info("İşlem başarıyla kaydedildi: txId={}, symbol={}, type={}, amount={}, totalUsdt={}",
                transaction.getId(), cleanSymbol, request.getType(), amount, totalUsdt);

        return TradeResponseDto.builder()
                .transactionId(transaction.getId())
                .type(request.getType())
                .coinSymbol(cleanSymbol)
                .amount(amount)
                .price(executionPrice.setScale(4, RoundingMode.HALF_UP))
                .totalUsdt(totalUsdt)
                .remainingUsdtBalance(wallet.getUsdtBalance())
                .newAveragePrice(newAveragePrice)
                .timestamp(transaction.getTimestamp())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public WalletDetailResponse getWalletDetails(Long userId) {
        log.info("Cüzdan ve portföy detayları alınıyor: userId={}", userId);

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Kullanıcıya ait cüzdan bulunamadı.", HttpStatus.NOT_FOUND));

        List<PortfolioItem> items = portfolioItemRepository.findByWalletId(wallet.getId());

        List<String> symbols = items.stream().map(PortfolioItem::getCoinSymbol).toList();
        Map<String, BigDecimal> currentPrices = binanceService.getPricesForSymbols(symbols);

        List<PortfolioDetailDto> portfolioDetails = new ArrayList<>();
        BigDecimal totalCoinsValue = BigDecimal.ZERO;
        BigDecimal totalInvested = BigDecimal.ZERO;

        for (PortfolioItem item : items) {
            String sym = item.getCoinSymbol();
            BigDecimal currentPrice = currentPrices.getOrDefault(sym, item.getAveragePrice());
            BigDecimal amount = item.getAmount();
            BigDecimal avgPrice = item.getAveragePrice();

            BigDecimal totalCost = amount.multiply(avgPrice).setScale(4, RoundingMode.HALF_UP);
            BigDecimal currentValue = amount.multiply(currentPrice).setScale(4, RoundingMode.HALF_UP);
            BigDecimal profitOrLoss = currentValue.subtract(totalCost).setScale(4, RoundingMode.HALF_UP);

            Double profitOrLossPercent = 0.0;
            if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
                profitOrLossPercent = profitOrLoss.divide(totalCost, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100")).doubleValue();
            }

            totalCoinsValue = totalCoinsValue.add(currentValue);
            totalInvested = totalInvested.add(totalCost);

            portfolioDetails.add(PortfolioDetailDto.builder()
                    .coinSymbol(sym)
                    .pair(sym + "USDT")
                    .coinName(sym)
                    .amount(amount)
                    .averagePrice(avgPrice)
                    .currentPrice(currentPrice)
                    .totalCost(totalCost)
                    .currentValue(currentValue)
                    .profitOrLoss(profitOrLoss)
                    .profitOrLossPercent(profitOrLossPercent)
                    .build());
        }

        BigDecimal totalPortfolioValue = wallet.getUsdtBalance().add(totalCoinsValue).setScale(4, RoundingMode.HALF_UP);
        BigDecimal totalProfitOrLoss = totalCoinsValue.subtract(totalInvested).setScale(4, RoundingMode.HALF_UP);

        Double totalProfitOrLossPercent = 0.0;
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            totalProfitOrLossPercent = totalProfitOrLoss.divide(totalInvested, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")).doubleValue();
        }

        List<Transaction> recentTransactions = transactionRepository.findTop20ByUserIdOrderByTimestampDesc(userId);
        if (recentTransactions.isEmpty()) {
            recentTransactions = transactionRepository.findByWalletIdOrderByTimestampDesc(wallet.getId());
        }

        List<TransactionDto> transactionDtos = recentTransactions.stream()
                .map(t -> TransactionDto.builder()
                        .id(t.getId())
                        .type(t.getType())
                        .coinSymbol(t.getCoinSymbol())
                        .amount(t.getAmount())
                        .price(t.getPrice())
                        .totalUsdt(t.getTotalUsdt())
                        .timestamp(t.getTimestamp())
                        .build())
                .toList();

        return WalletDetailResponse.builder()
                .walletId(wallet.getId())
                .usdtBalance(wallet.getUsdtBalance())
                .totalPortfolioValue(totalPortfolioValue)
                .totalCoinsValue(totalCoinsValue)
                .totalInvested(totalInvested)
                .totalProfitOrLoss(totalProfitOrLoss)
                .totalProfitOrLossPercent(totalProfitOrLossPercent)
                .portfolio(portfolioDetails)
                .recentTransactions(transactionDtos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionDto> getUserTransactions(Long userId) {
        log.info("Kullanıcı işlem geçmişi alınıyor: userId={}", userId);

        List<Transaction> transactions = transactionRepository.findByUserIdOrderByTimestampDesc(userId);

        // Eğer user_id ile henüz bulunamadıysa wallet üzerinden de kontrol et
        if (transactions.isEmpty()) {
            Optional<Wallet> walletOpt = walletRepository.findByUserId(userId);
            if (walletOpt.isPresent()) {
                transactions = transactionRepository.findByWalletIdOrderByTimestampDesc(walletOpt.get().getId());
            }
        }

        return transactions.stream()
                .map(t -> TransactionDto.builder()
                        .id(t.getId())
                        .type(t.getType())
                        .coinSymbol(t.getCoinSymbol())
                        .amount(t.getAmount())
                        .price(t.getPrice())
                        .totalUsdt(t.getTotalUsdt())
                        .timestamp(t.getTimestamp())
                        .build())
                .toList();
    }
}
