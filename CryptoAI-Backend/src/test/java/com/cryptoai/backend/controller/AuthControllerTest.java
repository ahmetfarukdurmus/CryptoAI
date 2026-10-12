package com.cryptoai.backend.controller;

import com.cryptoai.backend.dto.request.GoogleAuthRequestDto;
import com.cryptoai.backend.dto.response.AuthResponseDto;
import com.cryptoai.backend.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    @DisplayName("POST /api/auth/google geçerli istek aldığında 200 OK ve JWT dönmeli")
    void testGoogleLoginEndpointApiAuthSuccess() throws Exception {
        GoogleAuthRequestDto request = new GoogleAuthRequestDto("mock-valid-google-id-token");

        AuthResponseDto mockResponse = AuthResponseDto.builder()
                .accessToken("mock-jwt-token")
                .tokenType("Bearer")
                .userId(1L)
                .email("googleuser@cryptoai.com")
                .fullName("Google User")
                .isVerified(true)
                .walletId(10L)
                .usdtBalance(new BigDecimal("10000.0000"))
                .build();

        when(authService.googleLogin(any(GoogleAuthRequestDto.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Google ile giriş başarılı."))
                .andExpect(jsonPath("$.data.accessToken").value("mock-jwt-token"))
                .andExpect(jsonPath("$.data.email").value("googleuser@cryptoai.com"))
                .andExpect(jsonPath("$.data.fullName").value("Google User"))
                .andExpect(jsonPath("$.data.verified").value(true))
                .andExpect(jsonPath("$.data.walletId").value(10))
                .andExpect(jsonPath("$.data.usdtBalance").value(10000.0000));
    }

    @Test
    @DisplayName("POST /api/v1/auth/google endpointi de başarıyla çalışmalı")
    void testGoogleLoginEndpointApiV1AuthSuccess() throws Exception {
        GoogleAuthRequestDto request = new GoogleAuthRequestDto("mock-valid-google-id-token");

        AuthResponseDto mockResponse = AuthResponseDto.builder()
                .accessToken("mock-jwt-token")
                .tokenType("Bearer")
                .userId(1L)
                .email("googleuser@cryptoai.com")
                .fullName("Google User")
                .isVerified(true)
                .walletId(10L)
                .usdtBalance(new BigDecimal("10000.0000"))
                .build();

        when(authService.googleLogin(any(GoogleAuthRequestDto.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock-jwt-token"));
    }

    @Test
    @DisplayName("POST /api/auth/google boş idToken aldığında 400 Bad Request dönmeli")
    void testGoogleLoginEndpointEmptyIdTokenBadRequest() throws Exception {
        GoogleAuthRequestDto request = new GoogleAuthRequestDto("");

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
