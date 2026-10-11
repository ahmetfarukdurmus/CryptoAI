package com.cryptoai.backend.controller;

import com.cryptoai.backend.dto.response.ApiResponse;
import com.cryptoai.backend.dto.response.TransactionDto;
import com.cryptoai.backend.security.CustomUserDetails;
import com.cryptoai.backend.service.TradeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TradeService tradeService;

    public TransactionController(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TransactionDto>>> getTransactions(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<TransactionDto> transactions = tradeService.getUserTransactions(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("İşlem geçmişi başarıyla getirildi.", transactions));
    }
}
