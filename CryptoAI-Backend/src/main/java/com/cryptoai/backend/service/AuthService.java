package com.cryptoai.backend.service;

import com.cryptoai.backend.dto.request.LoginDto;
import com.cryptoai.backend.dto.request.RegisterDto;
import com.cryptoai.backend.dto.request.VerifyOtpDto;
import com.cryptoai.backend.dto.response.ApiResponse;
import com.cryptoai.backend.dto.response.AuthResponse;
import com.cryptoai.backend.dto.response.RegisterResponse;

public interface AuthService {

    ApiResponse<RegisterResponse> register(RegisterDto registerDto);

    AuthResponse verifyEmail(VerifyOtpDto verifyOtpDto);

    AuthResponse login(LoginDto loginDto);

    ApiResponse<String> resendOtp(String email);
}
