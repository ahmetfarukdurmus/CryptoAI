package com.cryptoai.backend.entity;

import com.cryptoai.backend.entity.enums.TransactionType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private TransactionType type;

    @Column(name = "coin_symbol", nullable = false, length = 20)
    private String coinSymbol;

    @Column(name = "amount", nullable = false, precision = 19, scale = 8)
    private BigDecimal amount;

    @Column(name = "price", nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(name = "total_usdt", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalUsdt;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    public Transaction() {
    }

    public Transaction(Long id, User user, Wallet wallet, TransactionType type, String coinSymbol, BigDecimal amount, BigDecimal price, BigDecimal totalUsdt, LocalDateTime timestamp) {
        this.id = id;
        this.user = user;
        this.wallet = wallet;
        this.type = type;
        this.coinSymbol = coinSymbol;
        this.amount = amount;
        this.price = price;
        this.totalUsdt = totalUsdt;
        this.timestamp = timestamp;
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    public static TransactionBuilder builder() {
        return new TransactionBuilder();
    }

    public static class TransactionBuilder {
        private Long id;
        private User user;
        private Wallet wallet;
        private TransactionType type;
        private String coinSymbol;
        private BigDecimal amount;
        private BigDecimal price;
        private BigDecimal totalUsdt;
        private LocalDateTime timestamp;

        TransactionBuilder() {
        }

        public TransactionBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public TransactionBuilder user(User user) {
            this.user = user;
            return this;
        }

        public TransactionBuilder wallet(Wallet wallet) {
            this.wallet = wallet;
            return this;
        }

        public TransactionBuilder type(TransactionType type) {
            this.type = type;
            return this;
        }

        public TransactionBuilder coinSymbol(String coinSymbol) {
            this.coinSymbol = coinSymbol;
            return this;
        }

        public TransactionBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public TransactionBuilder price(BigDecimal price) {
            this.price = price;
            return this;
        }

        public TransactionBuilder totalUsdt(BigDecimal totalUsdt) {
            this.totalUsdt = totalUsdt;
            return this;
        }

        public TransactionBuilder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Transaction build() {
            return new Transaction(id, user, wallet, type, coinSymbol, amount, price, totalUsdt, timestamp);
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

    public Wallet getWallet() {
        return wallet;
    }

    public void setWallet(Wallet wallet) {
        this.wallet = wallet;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Transaction that = (Transaction) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
