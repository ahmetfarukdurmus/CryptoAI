package com.cryptoai.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "crypto_assets")
public class CryptoAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "symbol", unique = true, nullable = false, length = 20)
    private String symbol;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "current_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal currentPrice;

    @Column(name = "change_24h")
    private Double change24h;

    @Column(name = "high_24h", precision = 19, scale = 4)
    private BigDecimal high24h;

    @Column(name = "low_24h", precision = 19, scale = 4)
    private BigDecimal low24h;

    public CryptoAsset() {
    }

    public CryptoAsset(Long id, String symbol, String name, BigDecimal currentPrice, Double change24h, BigDecimal high24h, BigDecimal low24h) {
        this.id = id;
        this.symbol = symbol;
        this.name = name;
        this.currentPrice = currentPrice;
        this.change24h = change24h;
        this.high24h = high24h;
        this.low24h = low24h;
    }

    public static CryptoAssetBuilder builder() {
        return new CryptoAssetBuilder();
    }

    public static class CryptoAssetBuilder {
        private Long id;
        private String symbol;
        private String name;
        private BigDecimal currentPrice;
        private Double change24h;
        private BigDecimal high24h;
        private BigDecimal low24h;

        CryptoAssetBuilder() {
        }

        public CryptoAssetBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CryptoAssetBuilder symbol(String symbol) {
            this.symbol = symbol;
            return this;
        }

        public CryptoAssetBuilder name(String name) {
            this.name = name;
            return this;
        }

        public CryptoAssetBuilder currentPrice(BigDecimal currentPrice) {
            this.currentPrice = currentPrice;
            return this;
        }

        public CryptoAssetBuilder change24h(Double change24h) {
            this.change24h = change24h;
            return this;
        }

        public CryptoAssetBuilder high24h(BigDecimal high24h) {
            this.high24h = high24h;
            return this;
        }

        public CryptoAssetBuilder low24h(BigDecimal low24h) {
            this.low24h = low24h;
            return this;
        }

        public CryptoAsset build() {
            return new CryptoAsset(id, symbol, name, currentPrice, change24h, high24h, low24h);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CryptoAsset that = (CryptoAsset) o;
        return Objects.equals(id, that.id) || Objects.equals(symbol, that.symbol);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, symbol);
    }
}
