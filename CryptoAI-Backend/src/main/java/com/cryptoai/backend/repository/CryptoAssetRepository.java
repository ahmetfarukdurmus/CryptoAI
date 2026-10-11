package com.cryptoai.backend.repository;

import com.cryptoai.backend.entity.CryptoAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CryptoAssetRepository extends JpaRepository<CryptoAsset, Long> {

    Optional<CryptoAsset> findBySymbol(String symbol);

    boolean existsBySymbol(String symbol);
}
