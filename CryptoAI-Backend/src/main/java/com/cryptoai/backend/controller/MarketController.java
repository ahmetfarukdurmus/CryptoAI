package com.cryptoai.backend.controller;

import com.cryptoai.backend.dto.response.ApiResponse;
import com.cryptoai.backend.dto.response.KlineDto;
import com.cryptoai.backend.dto.response.MarketDataDto;
import com.cryptoai.backend.service.BinanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    private final BinanceService binanceService;

    public MarketController(BinanceService binanceService) {
        this.binanceService = binanceService;
    }

    @GetMapping("/tickers")
    public ResponseEntity<ApiResponse<List<MarketDataDto>>> getTickers() {
        List<MarketDataDto> tickers = binanceService.getPopularTickers();
        return ResponseEntity.ok(ApiResponse.success("Canlı piyasa verileri başarıyla getirildi.", tickers));
    }

    @GetMapping("/klines")
    public ResponseEntity<ApiResponse<List<KlineDto>>> getKlines(
            @RequestParam(defaultValue = "BTCUSDT") String symbol,
            @RequestParam(defaultValue = "1h") String interval,
            @RequestParam(defaultValue = "50") int limit) {

        List<KlineDto> klines = binanceService.getKlines(symbol, interval, limit);
        return ResponseEntity.ok(ApiResponse.success(symbol + " mum verileri başarıyla getirildi.", klines));
    }
}
