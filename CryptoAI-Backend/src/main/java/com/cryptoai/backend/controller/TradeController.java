package com.cryptoai.backend.controller;

import com.cryptoai.backend.dto.request.TradeRequestDto;
import com.cryptoai.backend.dto.response.ApiResponse;
import com.cryptoai.backend.dto.response.TradeResponseDto;
import com.cryptoai.backend.security.CustomUserDetails;
import com.cryptoai.backend.service.TradeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trade")
public class TradeController {

    private final TradeService tradeService;

    public TradeController(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    @PostMapping("/execute")
    public ResponseEntity<ApiResponse<TradeResponseDto>> executeTrade(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody TradeRequestDto request) {

        TradeResponseDto tradeResponse = tradeService.executeTrade(userDetails.getId(), request);
        String actionName = request.getType().name();
        return ResponseEntity.ok(ApiResponse.success(actionName + " emri başarıyla gerçekleştirildi.", tradeResponse));
    }
}
