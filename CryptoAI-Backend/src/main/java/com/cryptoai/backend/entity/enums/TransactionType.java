package com.cryptoai.backend.entity.enums;

public enum TransactionType {
    BUY,
    SELL,
    AUTO_SELL,
    AUTO_TAKE_PROFIT,
    AUTO_STOP_LOSS,
    AI_AUTO_BUY,
    AI_TREND_EXIT;

    public boolean isBuy() {
        return this == BUY || this == AI_AUTO_BUY;
    }

    public boolean isSell() {
        return this == SELL || this == AUTO_SELL || this == AUTO_TAKE_PROFIT || this == AUTO_STOP_LOSS || this == AI_TREND_EXIT;
    }
}
