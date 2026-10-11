package com.cryptoai.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(
    name = "portfolio_items",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"wallet_id", "coin_symbol"})
    }
)
public class PortfolioItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @Column(name = "coin_symbol", nullable = false, length = 20)
    private String coinSymbol;

    @Column(name = "amount", nullable = false, precision = 19, scale = 8)
    private BigDecimal amount;

    @Column(name = "average_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal averagePrice;

    @Column(name = "take_profit", precision = 19, scale = 4)
    private BigDecimal takeProfit;

    @Column(name = "stop_loss", precision = 19, scale = 4)
    private BigDecimal stopLoss;

    public PortfolioItem() {
    }

    public PortfolioItem(Long id, Wallet wallet, String coinSymbol, BigDecimal amount, BigDecimal averagePrice) {
        this(id, wallet, coinSymbol, amount, averagePrice, null, null);
    }

    public PortfolioItem(Long id, Wallet wallet, String coinSymbol, BigDecimal amount, BigDecimal averagePrice, BigDecimal takeProfit, BigDecimal stopLoss) {
        this.id = id;
        this.wallet = wallet;
        this.coinSymbol = coinSymbol;
        this.amount = amount != null ? amount : BigDecimal.ZERO;
        this.averagePrice = averagePrice != null ? averagePrice : BigDecimal.ZERO;
        this.takeProfit = takeProfit;
        this.stopLoss = stopLoss;
    }

    public static PortfolioItemBuilder builder() {
        return new PortfolioItemBuilder();
    }

    public static class PortfolioItemBuilder {
        private Long id;
        private Wallet wallet;
        private String coinSymbol;
        private BigDecimal amount = BigDecimal.ZERO;
        private BigDecimal averagePrice = BigDecimal.ZERO;
        private BigDecimal takeProfit;
        private BigDecimal stopLoss;

        PortfolioItemBuilder() {
        }

        public PortfolioItemBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PortfolioItemBuilder wallet(Wallet wallet) {
            this.wallet = wallet;
            return this;
        }

        public PortfolioItemBuilder coinSymbol(String coinSymbol) {
            this.coinSymbol = coinSymbol;
            return this;
        }

        public PortfolioItemBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public PortfolioItemBuilder averagePrice(BigDecimal averagePrice) {
            this.averagePrice = averagePrice;
            return this;
        }

        public PortfolioItemBuilder takeProfit(BigDecimal takeProfit) {
            this.takeProfit = takeProfit;
            return this;
        }

        public PortfolioItemBuilder stopLoss(BigDecimal stopLoss) {
            this.stopLoss = stopLoss;
            return this;
        }

        public PortfolioItem build() {
            return new PortfolioItem(id, wallet, coinSymbol, amount, averagePrice, takeProfit, stopLoss);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Wallet getWallet() {
        return wallet;
    }

    public void setWallet(Wallet wallet) {
        this.wallet = wallet;
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

    public BigDecimal getAveragePrice() {
        return averagePrice;
    }

    public void setAveragePrice(BigDecimal averagePrice) {
        this.averagePrice = averagePrice;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PortfolioItem that = (PortfolioItem) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
