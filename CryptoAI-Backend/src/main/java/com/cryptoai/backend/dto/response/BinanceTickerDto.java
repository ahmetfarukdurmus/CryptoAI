package com.cryptoai.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BinanceTickerDto {

    private String symbol;
    private BigDecimal priceChange;
    private Double priceChangePercent;
    private BigDecimal lastPrice;
    private BigDecimal highPrice;
    private BigDecimal lowPrice;
    private BigDecimal volume;
    private BigDecimal quoteVolume;
    private Long openTime;
    private Long closeTime;

    public BinanceTickerDto() {
    }

    public BinanceTickerDto(String symbol, BigDecimal priceChange, Double priceChangePercent, BigDecimal lastPrice, BigDecimal highPrice, BigDecimal lowPrice, BigDecimal volume, BigDecimal quoteVolume, Long openTime, Long closeTime) {
        this.symbol = symbol;
        this.priceChange = priceChange;
        this.priceChangePercent = priceChangePercent;
        this.lastPrice = lastPrice;
        this.highPrice = highPrice;
        this.lowPrice = lowPrice;
        this.volume = volume;
        this.quoteVolume = quoteVolume;
        this.openTime = openTime;
        this.closeTime = closeTime;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public BigDecimal getPriceChange() {
        return priceChange;
    }

    public void setPriceChange(BigDecimal priceChange) {
        this.priceChange = priceChange;
    }

    public Double getPriceChangePercent() {
        return priceChangePercent;
    }

    public void setPriceChangePercent(Double priceChangePercent) {
        this.priceChangePercent = priceChangePercent;
    }

    public BigDecimal getLastPrice() {
        return lastPrice;
    }

    public void setLastPrice(BigDecimal lastPrice) {
        this.lastPrice = lastPrice;
    }

    public BigDecimal getHighPrice() {
        return highPrice;
    }

    public void setHighPrice(BigDecimal highPrice) {
        this.highPrice = highPrice;
    }

    public BigDecimal getLowPrice() {
        return lowPrice;
    }

    public void setLowPrice(BigDecimal lowPrice) {
        this.lowPrice = lowPrice;
    }

    public BigDecimal getVolume() {
        return volume;
    }

    public void setVolume(BigDecimal volume) {
        this.volume = volume;
    }

    public BigDecimal getQuoteVolume() {
        return quoteVolume;
    }

    public void setQuoteVolume(BigDecimal quoteVolume) {
        this.quoteVolume = quoteVolume;
    }

    public Long getOpenTime() {
        return openTime;
    }

    public void setOpenTime(Long openTime) {
        this.openTime = openTime;
    }

    public Long getCloseTime() {
        return closeTime;
    }

    public void setCloseTime(Long closeTime) {
        this.closeTime = closeTime;
    }
}
