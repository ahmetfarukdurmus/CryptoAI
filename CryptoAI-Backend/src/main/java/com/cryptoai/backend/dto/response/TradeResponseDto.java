package com.cryptoai.backend.dto.response;

import com.cryptoai.backend.entity.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TradeResponseDto {

    private Long transactionId;
    private TransactionType type;
    private String coinSymbol;
    private BigDecimal amount;
    private BigDecimal price;
    private BigDecimal totalUsdt;
    private BigDecimal remainingUsdtBalance;
    private BigDecimal newAveragePrice;
    private LocalDateTime timestamp;

    public TradeResponseDto() {
    }

    public TradeResponseDto(Long transactionId, TransactionType type, String coinSymbol, BigDecimal amount, BigDecimal price, BigDecimal totalUsdt, BigDecimal remainingUsdtBalance, BigDecimal newAveragePrice, LocalDateTime timestamp) {
        this.transactionId = transactionId;
        this.type = type;
        this.coinSymbol = coinSymbol;
        this.amount = amount;
        this.price = price;
        this.totalUsdt = totalUsdt;
        this.remainingUsdtBalance = remainingUsdtBalance;
        this.newAveragePrice = newAveragePrice;
        this.timestamp = timestamp;
    }

    public static TradeResponseDtoBuilder builder() {
        return new TradeResponseDtoBuilder();
    }

    public static class TradeResponseDtoBuilder {
        private Long transactionId;
        private TransactionType type;
        private String coinSymbol;
        private BigDecimal amount;
        private BigDecimal price;
        private BigDecimal totalUsdt;
        private BigDecimal remainingUsdtBalance;
        private BigDecimal newAveragePrice;
        private LocalDateTime timestamp;

        TradeResponseDtoBuilder() {
        }

        public TradeResponseDtoBuilder transactionId(Long transactionId) {
            this.transactionId = transactionId;
            return this;
        }

        public TradeResponseDtoBuilder type(TransactionType type) {
            this.type = type;
            return this;
        }

        public TradeResponseDtoBuilder coinSymbol(String coinSymbol) {
            this.coinSymbol = coinSymbol;
            return this;
        }

        public TradeResponseDtoBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public TradeResponseDtoBuilder price(BigDecimal price) {
            this.price = price;
            return this;
        }

        public TradeResponseDtoBuilder totalUsdt(BigDecimal totalUsdt) {
            this.totalUsdt = totalUsdt;
            return this;
        }

        public TradeResponseDtoBuilder remainingUsdtBalance(BigDecimal remainingUsdtBalance) {
            this.remainingUsdtBalance = remainingUsdtBalance;
            return this;
        }

        public TradeResponseDtoBuilder newAveragePrice(BigDecimal newAveragePrice) {
            this.newAveragePrice = newAveragePrice;
            return this;
        }

        public TradeResponseDtoBuilder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public TradeResponseDto build() {
            return new TradeResponseDto(transactionId, type, coinSymbol, amount, price, totalUsdt, remainingUsdtBalance, newAveragePrice, timestamp);
        }
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public String getCoinSymbol() {
        return coinSymbol;
    }

    public void setCoinSymbol(String coinSymbol) {
        this.coinSymbol = coinSymbol;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getTotalUsdt() {
        return totalUsdt;
    }

    public void setTotalUsdt(BigDecimal totalUsdt) {
        this.totalUsdt = totalUsdt;
    }

    public BigDecimal getRemainingUsdtBalance() {
        return remainingUsdtBalance;
    }

    public void setRemainingUsdtBalance(BigDecimal remainingUsdtBalance) {
        this.remainingUsdtBalance = remainingUsdtBalance;
    }

    public BigDecimal getNewAveragePrice() {
        return newAveragePrice;
    }

    public void setNewAveragePrice(BigDecimal newAveragePrice) {
        this.newAveragePrice = newAveragePrice;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
