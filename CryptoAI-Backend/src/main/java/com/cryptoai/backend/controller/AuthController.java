package com.cryptoai.backend.controller;

import com.cryptoai.backend.dto.request.LoginDto;
import com.cryptoai.backend.dto.request.RegisterDto;
import com.cryptoai.backend.dto.request.VerifyOtpDto;
import com.cryptoai.backend.dto.response.ApiResponse;
import com.cryptoai.backend.dto.response.AuthResponse;
import com.cryptoai.backend.dto.response.RegisterResponse;
import com.cryptoai.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterDto registerDto) {
        ApiResponse<RegisterResponse> response = authService.register(registerDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyEmail(@Valid @RequestBody VerifyOtpDto verifyOtpDto) {
        AuthResponse authResponse = authService.verifyEmail(verifyOtpDto);
        return ResponseEntity.ok(ApiResponse.success("E-posta adresi başarıyla doğrulandı. Sanal cüzdanınız aktifleştirildi.", authResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginDto loginDto) {
        AuthResponse authResponse = authService.login(loginDto);
        return ResponseEntity.ok(ApiResponse.success("Giriş başarılı.", authResponse));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<String>> resendOtp(@RequestParam String email) {
        ApiResponse<String> response = authService.resendOtp(email);
        return ResponseEntity.ok(response);
    }
}
