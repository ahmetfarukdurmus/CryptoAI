package com.cryptoai.backend.dto.response;

import java.math.BigDecimal;

public class PortfolioDetailDto {

    private String coinSymbol;
    private String pair;
    private String coinName;
    private BigDecimal amount;
    private BigDecimal averagePrice;
    private BigDecimal currentPrice;
    private BigDecimal totalCost;
    private BigDecimal currentValue;
    private BigDecimal profitOrLoss;
    private Double profitOrLossPercent;

    public PortfolioDetailDto() {
    }

    public PortfolioDetailDto(String coinSymbol, String pair, String coinName, BigDecimal amount, BigDecimal averagePrice, BigDecimal currentPrice, BigDecimal totalCost, BigDecimal currentValue, BigDecimal profitOrLoss, Double profitOrLossPercent) {
        this.coinSymbol = coinSymbol;
        this.pair = pair;
        this.coinName = coinName;
        this.amount = amount;
        this.averagePrice = averagePrice;
        this.currentPrice = currentPrice;
        this.totalCost = totalCost;
        this.currentValue = currentValue;
        this.profitOrLoss = profitOrLoss;
        this.profitOrLossPercent = profitOrLossPercent;
    }

    public static PortfolioDetailDtoBuilder builder() {
        return new PortfolioDetailDtoBuilder();
    }

    public static class PortfolioDetailDtoBuilder {
        private String coinSymbol;
        private String pair;
        private String coinName;
        private BigDecimal amount;
        private BigDecimal averagePrice;
        private BigDecimal currentPrice;
        private BigDecimal totalCost;
        private BigDecimal currentValue;
        private BigDecimal profitOrLoss;
        private Double profitOrLossPercent;

        PortfolioDetailDtoBuilder() {
        }

        public PortfolioDetailDtoBuilder coinSymbol(String coinSymbol) {
            this.coinSymbol = coinSymbol;
            return this;
        }

        public PortfolioDetailDtoBuilder pair(String pair) {
            this.pair = pair;
            return this;
        }

        public PortfolioDetailDtoBuilder coinName(String coinName) {
            this.coinName = coinName;
            return this;
        }

        public PortfolioDetailDtoBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public PortfolioDetailDtoBuilder averagePrice(BigDecimal averagePrice) {
            this.averagePrice = averagePrice;
            return this;
        }

        public PortfolioDetailDtoBuilder currentPrice(BigDecimal currentPrice) {
            this.currentPrice = currentPrice;
            return this;
        }

        public PortfolioDetailDtoBuilder totalCost(BigDecimal totalCost) {
            this.totalCost = totalCost;
            return this;
        }

        public PortfolioDetailDtoBuilder currentValue(BigDecimal currentValue) {
            this.currentValue = currentValue;
            return this;
        }

        public PortfolioDetailDtoBuilder profitOrLoss(BigDecimal profitOrLoss) {
            this.profitOrLoss = profitOrLoss;
            return this;
        }

        public PortfolioDetailDtoBuilder profitOrLossPercent(Double profitOrLossPercent) {
            this.profitOrLossPercent = profitOrLossPercent;
            return this;
        }

        public PortfolioDetailDto build() {
            return new PortfolioDetailDto(coinSymbol, pair, coinName, amount, averagePrice, currentPrice, totalCost, currentValue, profitOrLoss, profitOrLossPercent);
        }
    }

    public String getCoinSymbol() {
        return coinSymbol;
    }

    public void setCoinSymbol(String coinSymbol) {
        this.coinSymbol = coinSymbol;
    }

    public String getPair() {
        return pair;
    }

    public void setPair(String pair) {
        this.pair = pair;
    }

    public String getCoinName() {
        return coinName;
    }

    public void setCoinName(String coinName) {
        this.coinName = coinName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getAveragePrice() {
        return averagePrice;
    }

    public void setAveragePrice(BigDecimal averagePrice) {
        this.averagePrice = averagePrice;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }

    public BigDecimal getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(BigDecimal currentValue) {
        this.currentValue = currentValue;
    }

    public BigDecimal getProfitOrLoss() {
        return profitOrLoss;
    }

    public void setProfitOrLoss(BigDecimal profitOrLoss) {
        this.profitOrLoss = profitOrLoss;
    }

    public Double getProfitOrLossPercent() {
        return profitOrLossPercent;
    }

    public void setProfitOrLossPercent(Double profitOrLossPercent) {
        this.profitOrLossPercent = profitOrLossPercent;
    }
}
