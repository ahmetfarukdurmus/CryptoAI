package com.cryptoai.backend.repository;

import com.cryptoai.backend.entity.User;
import com.cryptoai.backend.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByUserId(Long userId);

    Optional<Wallet> findByUser(User user);

    @Query("SELECT w FROM Wallet w JOIN FETCH w.user u WHERE w.usdtBalance >= :minBalance")
    List<Wallet> findWalletsWithAvailableBalance(@Param("minBalance") BigDecimal minBalance);
}
