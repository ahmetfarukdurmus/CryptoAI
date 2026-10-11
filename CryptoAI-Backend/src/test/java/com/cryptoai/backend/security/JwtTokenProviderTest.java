package com.cryptoai.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secretKey = "c4b1d6f8e2a39158c70d4957e62a0487b92f39c4d8123e4f7a1b9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f";
    private final long expirationMs = 86400000L;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secretKey, expirationMs);
    }

    @Test
    @DisplayName("JWT Token üretimi ve doğrulama testi")
    void testGenerateAndValidateToken() {
        Long userId = 100L;
        String email = "investor@cryptoai.com";
        String fullName = "Ahmet Yatırımcı";

        String token = jwtTokenProvider.generateToken(userId, email, fullName);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(email, jwtTokenProvider.getEmailFromToken(token));
        assertEquals(userId, jwtTokenProvider.getUserIdFromToken(token));
    }

    @Test
    @DisplayName("Geçersiz JWT Token doğrulama testi")
    void testInvalidToken() {
        String invalidToken = "invalid.token.signature";
        assertFalse(jwtTokenProvider.validateToken(invalidToken));
    }
}
