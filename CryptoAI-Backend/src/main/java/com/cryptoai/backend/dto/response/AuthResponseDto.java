package com.cryptoai.backend.dto.response;

import java.math.BigDecimal;

public class AuthResponseDto {

    private String accessToken;
    private String tokenType = "Bearer";
    private Long userId;
    private String email;
    private String fullName;
    private boolean isVerified;
    private Long walletId;
    private BigDecimal usdtBalance;

    public AuthResponseDto() {
    }

    public AuthResponseDto(String accessToken, String tokenType, Long userId, String email, String fullName, boolean isVerified, Long walletId, BigDecimal usdtBalance) {
        this.accessToken = accessToken;
        this.tokenType = tokenType != null ? tokenType : "Bearer";
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.isVerified = isVerified;
        this.walletId = walletId;
        this.usdtBalance = usdtBalance;
    }

    public static AuthResponseDtoBuilder builder() {
        return new AuthResponseDtoBuilder();
    }

    public static class AuthResponseDtoBuilder {
        private String accessToken;
        private String tokenType = "Bearer";
        private Long userId;
        private String email;
        private String fullName;
        private boolean isVerified;
        private Long walletId;
        private BigDecimal usdtBalance;

        AuthResponseDtoBuilder() {
        }

        public AuthResponseDtoBuilder accessToken(String accessToken) {
            this.accessToken = accessToken;
            return this;
        }

        public AuthResponseDtoBuilder tokenType(String tokenType) {
            this.tokenType = tokenType;
            return this;
        }

        public AuthResponseDtoBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public AuthResponseDtoBuilder email(String email) {
            this.email = email;
            return this;
        }

        public AuthResponseDtoBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public AuthResponseDtoBuilder isVerified(boolean isVerified) {
            this.isVerified = isVerified;
            return this;
        }

        public AuthResponseDtoBuilder walletId(Long walletId) {
            this.walletId = walletId;
            return this;
        }

        public AuthResponseDtoBuilder usdtBalance(BigDecimal usdtBalance) {
            this.usdtBalance = usdtBalance;
            return this;
        }

        public AuthResponseDto build() {
            return new AuthResponseDto(accessToken, tokenType, userId, email, fullName, isVerified, walletId, usdtBalance);
        }
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean verified) {
        isVerified = verified;
    }

    public Long getWalletId() {
        return walletId;
    }

    public void setWalletId(Long walletId) {
        this.walletId = walletId;
    }

    public BigDecimal getUsdtBalance() {
        return usdtBalance;
    }

    public void setUsdtBalance(BigDecimal usdtBalance) {
        this.usdtBalance = usdtBalance;
    }
}
