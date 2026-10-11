package com.cryptoai.backend.controller;

import com.cryptoai.backend.dto.request.TradeRequestDto;
import com.cryptoai.backend.dto.response.ApiResponse;
import com.cryptoai.backend.dto.response.TradeResponseDto;
import com.cryptoai.backend.dto.response.WalletDetailResponse;
import com.cryptoai.backend.security.CustomUserDetails;
import com.cryptoai.backend.service.TradeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final TradeService tradeService;

    public WalletController(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<WalletDetailResponse>> getWallet(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        WalletDetailResponse walletResponse = tradeService.getWalletDetails(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Cüzdan bilgileri başarıyla getirildi.", walletResponse));
    }

    @PostMapping("/trade")
    public ResponseEntity<ApiResponse<TradeResponseDto>> trade(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody TradeRequestDto request) {

        TradeResponseDto tradeResponse = tradeService.executeTrade(userDetails.getId(), request);
        String actionName = request.getType().name();
        return ResponseEntity.ok(ApiResponse.success(actionName + " işlemi başarıyla gerçekleştirildi.", tradeResponse));
    }
}
