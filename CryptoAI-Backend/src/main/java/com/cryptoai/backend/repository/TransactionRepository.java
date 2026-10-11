package com.cryptoai.backend.repository;

import com.cryptoai.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserIdOrderByTimestampDesc(Long userId);

    List<Transaction> findTop20ByUserIdOrderByTimestampDesc(Long userId);

    List<Transaction> findTop20ByWalletIdOrderByTimestampDesc(Long walletId);

    List<Transaction> findByWalletIdOrderByTimestampDesc(Long walletId);
}
