package com.cryptoai.backend.dto.request;

import com.cryptoai.backend.entity.enums.TransactionType;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TradeRequestDto {

    @JsonAlias({"coinSymbol"})
    private String symbol;

    @NotNull(message = "İşlem tipi belirtilmelidir (BUY, SELL veya AUTO_SELL)")
    private TransactionType type;

    private BigDecimal amount;

    private BigDecimal price;

    private BigDecimal totalUsdt;

    private BigDecimal takeProfit;

    private BigDecimal stopLoss;

    public TradeRequestDto() {
    }

    public TradeRequestDto(String symbol, TransactionType type, BigDecimal amount, BigDecimal price) {
        this(symbol, type, amount, price, null, null, null);
    }

    public TradeRequestDto(String symbol, TransactionType type, BigDecimal amount, BigDecimal price, BigDecimal totalUsdt) {
        this(symbol, type, amount, price, totalUsdt, null, null);
    }

    public TradeRequestDto(String symbol, TransactionType type, BigDecimal amount, BigDecimal price, BigDecimal totalUsdt, BigDecimal takeProfit, BigDecimal stopLoss) {
        this.symbol = symbol;
        this.type = type;
        this.amount = amount;
        this.price = price;
        this.totalUsdt = totalUsdt;
        this.takeProfit = takeProfit;
        this.stopLoss = stopLoss;
    }

    public static TradeRequestDtoBuilder builder() {
        return new TradeRequestDtoBuilder();
    }

    public static class TradeRequestDtoBuilder {
        private String symbol;
        private TransactionType type;
        private BigDecimal amount;
        private BigDecimal price;
        private BigDecimal totalUsdt;
        private BigDecimal takeProfit;
        private BigDecimal stopLoss;

        TradeRequestDtoBuilder() {
        }

        public TradeRequestDtoBuilder symbol(String symbol) {
            this.symbol = symbol;
            return this;
        }

        public TradeRequestDtoBuilder coinSymbol(String coinSymbol) {
            this.symbol = coinSymbol;
            return this;
        }

        public TradeRequestDtoBuilder type(TransactionType type) {
            this.type = type;
            return this;
        }

        public TradeRequestDtoBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public TradeRequestDtoBuilder price(BigDecimal price) {
            this.price = price;
            return this;
        }

        public TradeRequestDtoBuilder totalUsdt(BigDecimal totalUsdt) {
            this.totalUsdt = totalUsdt;
            return this;
        }

        public TradeRequestDtoBuilder takeProfit(BigDecimal takeProfit) {
            this.takeProfit = takeProfit;
            return this;
        }

        public TradeRequestDtoBuilder stopLoss(BigDecimal stopLoss) {
            this.stopLoss = stopLoss;
            return this;
        }

        public TradeRequestDto build() {
            return new TradeRequestDto(symbol, type, amount, price, totalUsdt, takeProfit, stopLoss);
        }
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    // Geriye dönük uyumluluk için coinSymbol takma adı
    public String getCoinSymbol() {
        return symbol;
    }

    public void setCoinSymbol(String coinSymbol) {
        this.symbol = coinSymbol;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
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

    public BigDecimal getTakeProfit() {
        return takeProfit;
    }

    public void setTakeProfit(BigDecimal takeProfit) {
        this.takeProfit = takeProfit;
    }

    public BigDecimal getStopLoss() {
        return stopLoss;
    }

    public void setStopLoss(BigDecimal stopLoss) {
        this.stopLoss = stopLoss;
    }
}
