package com.cryptoai.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "wallets")
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true, nullable = false)
    private User user;

    @Column(name = "usdt_balance", nullable = false, precision = 19, scale = 4)
    private BigDecimal usdtBalance = new BigDecimal("10000.0000");

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Wallet() {
    }

    public Wallet(Long id, User user, BigDecimal usdtBalance, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.usdtBalance = usdtBalance != null ? usdtBalance : new BigDecimal("10000.0000");
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        this.updatedAt = now;
        if (this.usdtBalance == null) {
            this.usdtBalance = new BigDecimal("10000.0000");
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public static WalletBuilder builder() {
        return new WalletBuilder();
    }

    public static class WalletBuilder {
        private Long id;
        private User user;
        private BigDecimal usdtBalance = new BigDecimal("10000.0000");
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        WalletBuilder() {
        }

        public WalletBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public WalletBuilder user(User user) {
            this.user = user;
            return this;
        }

        public WalletBuilder usdtBalance(BigDecimal usdtBalance) {
            this.usdtBalance = usdtBalance;
            return this;
        }

        public WalletBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public WalletBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Wallet build() {
            return new Wallet(id, user, usdtBalance, createdAt, updatedAt);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public BigDecimal getUsdtBalance() {
        return usdtBalance;
    }

    public void setUsdtBalance(BigDecimal usdtBalance) {
        this.usdtBalance = usdtBalance;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Wallet wallet = (Wallet) o;
        return Objects.equals(id, wallet.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
