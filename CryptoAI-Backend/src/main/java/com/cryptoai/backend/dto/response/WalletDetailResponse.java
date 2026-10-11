package com.cryptoai.backend.dto.response;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class WalletDetailResponse {

    private Long walletId;
    private BigDecimal usdtBalance;
    private BigDecimal totalPortfolioValue;
    private BigDecimal totalCoinsValue;
    private BigDecimal totalInvested;
    private BigDecimal totalProfitOrLoss;
    private Double totalProfitOrLossPercent;
    private List<PortfolioDetailDto> portfolio = new ArrayList<>();
    private List<TransactionDto> recentTransactions = new ArrayList<>();

    public WalletDetailResponse() {
    }

    public WalletDetailResponse(Long walletId, BigDecimal usdtBalance, BigDecimal totalPortfolioValue, BigDecimal totalCoinsValue, BigDecimal totalInvested, BigDecimal totalProfitOrLoss, Double totalProfitOrLossPercent, List<PortfolioDetailDto> portfolio, List<TransactionDto> recentTransactions) {
        this.walletId = walletId;
        this.usdtBalance = usdtBalance;
        this.totalPortfolioValue = totalPortfolioValue;
        this.totalCoinsValue = totalCoinsValue;
        this.totalInvested = totalInvested;
        this.totalProfitOrLoss = totalProfitOrLoss;
        this.totalProfitOrLossPercent = totalProfitOrLossPercent;
        this.portfolio = portfolio != null ? portfolio : new ArrayList<>();
        this.recentTransactions = recentTransactions != null ? recentTransactions : new ArrayList<>();
    }

    public static WalletDetailResponseBuilder builder() {
        return new WalletDetailResponseBuilder();
    }

    public static class WalletDetailResponseBuilder {
        private Long walletId;
        private BigDecimal usdtBalance;
        private BigDecimal totalPortfolioValue;
        private BigDecimal totalCoinsValue;
        private BigDecimal totalInvested;
        private BigDecimal totalProfitOrLoss;
        private Double totalProfitOrLossPercent;
        private List<PortfolioDetailDto> portfolio = new ArrayList<>();
        private List<TransactionDto> recentTransactions = new ArrayList<>();

        WalletDetailResponseBuilder() {
        }

        public WalletDetailResponseBuilder walletId(Long walletId) {
            this.walletId = walletId;
            return this;
        }

        public WalletDetailResponseBuilder usdtBalance(BigDecimal usdtBalance) {
            this.usdtBalance = usdtBalance;
            return this;
        }

        public WalletDetailResponseBuilder totalPortfolioValue(BigDecimal totalPortfolioValue) {
            this.totalPortfolioValue = totalPortfolioValue;
            return this;
        }

        public WalletDetailResponseBuilder totalCoinsValue(BigDecimal totalCoinsValue) {
            this.totalCoinsValue = totalCoinsValue;
            return this;
        }

        public WalletDetailResponseBuilder totalInvested(BigDecimal totalInvested) {
            this.totalInvested = totalInvested;
            return this;
        }

        public WalletDetailResponseBuilder totalProfitOrLoss(BigDecimal totalProfitOrLoss) {
            this.totalProfitOrLoss = totalProfitOrLoss;
            return this;
        }

        public WalletDetailResponseBuilder totalProfitOrLossPercent(Double totalProfitOrLossPercent) {
            this.totalProfitOrLossPercent = totalProfitOrLossPercent;
            return this;
        }

        public WalletDetailResponseBuilder portfolio(List<PortfolioDetailDto> portfolio) {
            this.portfolio = portfolio;
            return this;
        }

        public WalletDetailResponseBuilder recentTransactions(List<TransactionDto> recentTransactions) {
            this.recentTransactions = recentTransactions;
            return this;
        }

        public WalletDetailResponse build() {
            return new WalletDetailResponse(walletId, usdtBalance, totalPortfolioValue, totalCoinsValue, totalInvested, totalProfitOrLoss, totalProfitOrLossPercent, portfolio, recentTransactions);
        }
    }

    public Long getWalletId() {
        return walletId;
    }

    public void setWalletId(Long walletId) {
        this.walletId = walletId;
    }

    public BigDecimal getUsdtBalance() {
        return usdtBalance;
    }

    public void setUsdtBalance(BigDecimal usdtBalance) {
        this.usdtBalance = usdtBalance;
    }

    public BigDecimal getTotalPortfolioValue() {
        return totalPortfolioValue;
    }

    public void setTotalPortfolioValue(BigDecimal totalPortfolioValue) {
        this.totalPortfolioValue = totalPortfolioValue;
    }

    public BigDecimal getTotalCoinsValue() {
        return totalCoinsValue;
    }

    public void setTotalCoinsValue(BigDecimal totalCoinsValue) {
        this.totalCoinsValue = totalCoinsValue;
    }

    public BigDecimal getTotalInvested() {
        return totalInvested;
    }

    public void setTotalInvested(BigDecimal totalInvested) {
        this.totalInvested = totalInvested;
    }

    public BigDecimal getTotalProfitOrLoss() {
        return totalProfitOrLoss;
    }

    public void setTotalProfitOrLoss(BigDecimal totalProfitOrLoss) {
        this.totalProfitOrLoss = totalProfitOrLoss;
    }

    public Double getTotalProfitOrLossPercent() {
        return totalProfitOrLossPercent;
    }

    public void setTotalProfitOrLossPercent(Double totalProfitOrLossPercent) {
        this.totalProfitOrLossPercent = totalProfitOrLossPercent;
    }

    public List<PortfolioDetailDto> getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(List<PortfolioDetailDto> portfolio) {
        this.portfolio = portfolio;
    }

    public List<TransactionDto> getRecentTransactions() {
        return recentTransactions;
    }

    public void setRecentTransactions(List<TransactionDto> recentTransactions) {
        this.recentTransactions = recentTransactions;
    }
}
