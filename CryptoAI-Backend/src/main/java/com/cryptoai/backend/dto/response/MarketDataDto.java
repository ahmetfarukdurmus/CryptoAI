package com.cryptoai.backend.dto.response;

import java.math.BigDecimal;

public class MarketDataDto {

    private String symbol;
    private String pair;
    private String name;
    private BigDecimal currentPrice;
    private Double change24h;
    private BigDecimal high24h;
    private BigDecimal low24h;
    private BigDecimal volume24h;

    public MarketDataDto() {
    }

    public MarketDataDto(String symbol, String pair, String name, BigDecimal currentPrice, Double change24h, BigDecimal high24h, BigDecimal low24h, BigDecimal volume24h) {
        this.symbol = symbol;
        this.pair = pair;
        this.name = name;
        this.currentPrice = currentPrice;
        this.change24h = change24h;
        this.high24h = high24h;
        this.low24h = low24h;
        this.volume24h = volume24h;
    }

    public static MarketDataDtoBuilder builder() {
        return new MarketDataDtoBuilder();
    }

    public static class MarketDataDtoBuilder {
        private String symbol;
        private String pair;
        private String name;
        private BigDecimal currentPrice;
        private Double change24h;
        private BigDecimal high24h;
        private BigDecimal low24h;
        private BigDecimal volume24h;

        MarketDataDtoBuilder() {
        }

        public MarketDataDtoBuilder symbol(String symbol) {
            this.symbol = symbol;
            return this;
        }

        public MarketDataDtoBuilder pair(String pair) {
            this.pair = pair;
            return this;
        }

        public MarketDataDtoBuilder name(String name) {
            this.name = name;
            return this;
        }

        public MarketDataDtoBuilder currentPrice(BigDecimal currentPrice) {
            this.currentPrice = currentPrice;
            return this;
        }

        public MarketDataDtoBuilder change24h(Double change24h) {
            this.change24h = change24h;
            return this;
        }

        public MarketDataDtoBuilder high24h(BigDecimal high24h) {
            this.high24h = high24h;
            return this;
        }

        public MarketDataDtoBuilder low24h(BigDecimal low24h) {
            this.low24h = low24h;
            return this;
        }

        public MarketDataDtoBuilder volume24h(BigDecimal volume24h) {
            this.volume24h = volume24h;
            return this;
        }

        public MarketDataDto build() {
            return new MarketDataDto(symbol, pair, name, currentPrice, change24h, high24h, low24h, volume24h);
        }
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getPair() {
        return pair;
    }

    public void setPair(String pair) {
        this.pair = pair;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public Double getChange24h() {
        return change24h;
    }

    public void setChange24h(Double change24h) {
        this.change24h = change24h;
    }

    public BigDecimal getHigh24h() {
        return high24h;
    }

    public void setHigh24h(BigDecimal high24h) {
        this.high24h = high24h;
    }

    public BigDecimal getLow24h() {
        return low24h;
    }

    public void setLow24h(BigDecimal low24h) {
        this.low24h = low24h;
    }

    public BigDecimal getVolume24h() {
        return volume24h;
    }

    public void setVolume24h(BigDecimal volume24h) {
        this.volume24h = volume24h;
    }
}
