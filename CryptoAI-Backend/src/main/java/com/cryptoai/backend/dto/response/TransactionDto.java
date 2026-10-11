package com.cryptoai.backend.dto.response;

import com.cryptoai.backend.entity.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionDto {

    private Long id;
    private TransactionType type;
    private String coinSymbol;
    private BigDecimal amount;
    private BigDecimal price;
    private BigDecimal totalUsdt;
    private LocalDateTime timestamp;

    public TransactionDto() {
    }

    public TransactionDto(Long id, TransactionType type, String coinSymbol, BigDecimal amount, BigDecimal price, BigDecimal totalUsdt, LocalDateTime timestamp) {
        this.id = id;
        this.type = type;
        this.coinSymbol = coinSymbol;
        this.amount = amount;
        this.price = price;
        this.totalUsdt = totalUsdt;
        this.timestamp = timestamp;
    }

    public static TransactionDtoBuilder builder() {
        return new TransactionDtoBuilder();
    }

    public static class TransactionDtoBuilder {
        private Long id;
        private TransactionType type;
        private String coinSymbol;
        private BigDecimal amount;
        private BigDecimal price;
        private BigDecimal totalUsdt;
        private LocalDateTime timestamp;

        TransactionDtoBuilder() {
        }

        public TransactionDtoBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public TransactionDtoBuilder type(TransactionType type) {
            this.type = type;
            return this;
        }

        public TransactionDtoBuilder coinSymbol(String coinSymbol) {
            this.coinSymbol = coinSymbol;
            return this;
        }

        public TransactionDtoBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public TransactionDtoBuilder price(BigDecimal price) {
            this.price = price;
            return this;
        }

        public TransactionDtoBuilder totalUsdt(BigDecimal totalUsdt) {
            this.totalUsdt = totalUsdt;
            return this;
        }

        public TransactionDtoBuilder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public TransactionDto build() {
            return new TransactionDto(id, type, coinSymbol, amount, price, totalUsdt, timestamp);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
