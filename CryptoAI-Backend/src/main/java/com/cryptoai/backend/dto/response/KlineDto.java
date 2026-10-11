package com.cryptoai.backend.dto.response;

import java.math.BigDecimal;

public class KlineDto {

    private Long openTime;
    private BigDecimal open;
    private BigDecimal high;
    private BigDecimal low;
    private BigDecimal close;
    private BigDecimal volume;
    private Long closeTime;

    public KlineDto() {
    }

    public KlineDto(Long openTime, BigDecimal open, BigDecimal high, BigDecimal low, BigDecimal close, BigDecimal volume, Long closeTime) {
        this.openTime = openTime;
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
        this.volume = volume;
        this.closeTime = closeTime;
    }

    public static KlineDtoBuilder builder() {
        return new KlineDtoBuilder();
    }

    public static class KlineDtoBuilder {
        private Long openTime;
        private BigDecimal open;
        private BigDecimal high;
        private BigDecimal low;
        private BigDecimal close;
        private BigDecimal volume;
        private Long closeTime;

        KlineDtoBuilder() {
        }

        public KlineDtoBuilder openTime(Long openTime) {
            this.openTime = openTime;
            return this;
        }

        public KlineDtoBuilder open(BigDecimal open) {
            this.open = open;
            return this;
        }

        public KlineDtoBuilder high(BigDecimal high) {
            this.high = high;
            return this;
        }

        public KlineDtoBuilder low(BigDecimal low) {
            this.low = low;
            return this;
        }

        public KlineDtoBuilder close(BigDecimal close) {
            this.close = close;
            return this;
        }

        public KlineDtoBuilder volume(BigDecimal volume) {
            this.volume = volume;
            return this;
        }

        public KlineDtoBuilder closeTime(Long closeTime) {
            this.closeTime = closeTime;
            return this;
        }

        public KlineDto build() {
            return new KlineDto(openTime, open, high, low, close, volume, closeTime);
        }
    }

    public Long getOpenTime() {
        return openTime;
    }

    public void setOpenTime(Long openTime) {
        this.openTime = openTime;
    }

    public BigDecimal getOpen() {
        return open;
    }

    public void setOpen(BigDecimal open) {
        this.open = open;
    }

    public BigDecimal getHigh() {
        return high;
    }

    public void setHigh(BigDecimal high24h) {
        this.high = high24h;
    }

    public BigDecimal getLow() {
        return low;
    }

    public void setLow(BigDecimal low) {
        this.low = low;
    }

    public BigDecimal getClose() {
        return close;
    }

    public void setClose(BigDecimal close) {
        this.close = close;
    }

    public BigDecimal getVolume() {
        return volume;
    }

    public void setVolume(BigDecimal volume) {
        this.volume = volume;
    }

    public Long getCloseTime() {
        return closeTime;
    }

    public void setCloseTime(Long closeTime) {
        this.closeTime = closeTime;
    }
}
