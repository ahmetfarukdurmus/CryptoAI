package com.cryptoai.backend.service;

public interface EmailService {

    void sendOtpEmail(String toEmail, String fullName, String otpCode);
}
