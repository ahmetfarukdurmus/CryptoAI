package com.cryptoai.backend.service;

import com.cryptoai.backend.dto.request.TradeRequestDto;
import com.cryptoai.backend.dto.response.TradeResponseDto;
import com.cryptoai.backend.dto.response.TransactionDto;
import com.cryptoai.backend.dto.response.WalletDetailResponse;

import java.util.List;

public interface TradeService {

    TradeResponseDto executeTrade(Long userId, TradeRequestDto request);

    WalletDetailResponse getWalletDetails(Long userId);

    List<TransactionDto> getUserTransactions(Long userId);
}
