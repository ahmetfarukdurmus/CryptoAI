package com.cryptoai.backend.repository;

import com.cryptoai.backend.entity.PortfolioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioItemRepository extends JpaRepository<PortfolioItem, Long> {

    List<PortfolioItem> findByWalletId(Long walletId);

    Optional<PortfolioItem> findByWalletIdAndCoinSymbol(Long walletId, String coinSymbol);

    void deleteByWalletIdAndCoinSymbol(Long walletId, String coinSymbol);

    @Query("SELECT p FROM PortfolioItem p JOIN FETCH p.wallet w JOIN FETCH w.user u WHERE p.amount > 0")
    List<PortfolioItem> findAllActivePositions();
}
