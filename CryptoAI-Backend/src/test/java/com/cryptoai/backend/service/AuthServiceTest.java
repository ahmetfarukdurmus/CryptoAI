package com.cryptoai.backend.service;

import com.cryptoai.backend.dto.request.GoogleAuthRequestDto;
import com.cryptoai.backend.dto.request.LoginDto;
import com.cryptoai.backend.dto.request.RegisterDto;
import com.cryptoai.backend.dto.request.VerifyOtpDto;
import com.cryptoai.backend.dto.response.ApiResponse;
import com.cryptoai.backend.dto.response.AuthResponse;
import com.cryptoai.backend.dto.response.AuthResponseDto;
import com.cryptoai.backend.dto.response.RegisterResponse;
import com.cryptoai.backend.entity.User;
import com.cryptoai.backend.entity.Wallet;
import com.cryptoai.backend.exception.ApiException;
import com.cryptoai.backend.repository.UserRepository;
import com.cryptoai.backend.repository.WalletRepository;
import com.cryptoai.backend.security.JwtTokenProvider;
import com.cryptoai.backend.service.impl.AuthServiceImpl;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private EmailService emailService;

    @Mock
    private GoogleIdTokenVerifier googleIdTokenVerifier;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("test@cryptoai.com")
                .passwordHash("encodedPassword")
                .fullName("Test User")
                .isVerified(false)
                .verificationOtp("123456")
                .otpExpiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
    }

    @Test
    @DisplayName("Kayıt olma başarılı senaryosu ve debugOtp kontrolü")
    void testRegisterSuccess() {
        RegisterDto dto = new RegisterDto("test@cryptoai.com", "password123", "Test User");

        when(userRepository.existsByEmail("test@cryptoai.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        ApiResponse<RegisterResponse> response = authService.register(dto);

        assertTrue(response.isSuccess());
        assertNotNull(response.getData());
        assertNotNull(response.getData().getDebugOtp());
        assertEquals(6, response.getData().getDebugOtp().length());
        verify(emailService, times(1)).sendOtpEmail(eq("test@cryptoai.com"), eq("Test User"), anyString());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("E-posta gönderimi hata verse bile kayıt başarılı olmalı")
    void testRegisterSuccessEvenIfEmailFails() {
        RegisterDto dto = new RegisterDto("test@cryptoai.com", "password123", "Test User");

        when(userRepository.existsByEmail("test@cryptoai.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        doThrow(new RuntimeException("SMTP Server not reachable"))
                .when(emailService).sendOtpEmail(anyString(), anyString(), anyString());

        ApiResponse<RegisterResponse> response = authService.register(dto);

        assertTrue(response.isSuccess());
        assertNotNull(response.getData());
        assertNotNull(response.getData().getDebugOtp());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Var olan e-posta ile kayıt olunamamalı")
    void testRegisterConflict() {
        RegisterDto dto = new RegisterDto("test@cryptoai.com", "password123", "Test User");
        when(userRepository.existsByEmail("test@cryptoai.com")).thenReturn(true);

        ApiException ex = assertThrows(ApiException.class, () -> authService.register(dto));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    @DisplayName("OTP doğrulama başarılı olmalı ve 10.000 USDT sanal cüzdan tanımlanmalı")
    void testVerifyEmailSuccess() {
        VerifyOtpDto dto = new VerifyOtpDto("test@cryptoai.com", "123456");

        when(userRepository.findByEmail("test@cryptoai.com")).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        Wallet wallet = Wallet.builder()
                .id(10L)
                .user(sampleUser)
                .usdtBalance(new BigDecimal("10000.0000"))
                .build();

        when(walletRepository.findByUser(sampleUser)).thenReturn(Optional.empty());
        when(walletRepository.save(any(Wallet.class))).thenReturn(wallet);
        when(jwtTokenProvider.generateToken(any(), any(), any())).thenReturn("mock-jwt-token");

        AuthResponse authResponse = authService.verifyEmail(dto);

        assertNotNull(authResponse);
        assertEquals("mock-jwt-token", authResponse.getAccessToken());
        assertEquals("test@cryptoai.com", authResponse.getEmail());
        assertTrue(authResponse.isVerified());
        assertEquals(new BigDecimal("10000.0000"), authResponse.getUsdtBalance());
        assertTrue(sampleUser.isVerified());
        assertNull(sampleUser.getVerificationOtp());
    }

    @Test
    @DisplayName("Hatalı OTP girildiğinde hata fırlatılmalı")
    void testVerifyEmailWrongOtp() {
        VerifyOtpDto dto = new VerifyOtpDto("test@cryptoai.com", "999999");
        when(userRepository.findByEmail("test@cryptoai.com")).thenReturn(Optional.of(sampleUser));

        ApiException ex = assertThrows(ApiException.class, () -> authService.verifyEmail(dto));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("Girdiğiniz doğrulama kodu hatalıdır", ex.getMessage());
    }

    @Test
    @DisplayName("Giriş yaparken hesap doğrulanmamışsa 403 Forbidden fırlatılmalı")
    void testLoginUnverifiedUserForbidden() {
        LoginDto dto = new LoginDto("test@cryptoai.com", "password123");
        sampleUser.setVerified(false);

        when(userRepository.findByEmail("test@cryptoai.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);

        ApiException ex = assertThrows(ApiException.class, () -> authService.login(dto));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }

    @Test
    @DisplayName("Doğrulanmış kullanıcı giriş yaptığında JWT token dönmeli")
    void testLoginVerifiedUserSuccess() {
        LoginDto dto = new LoginDto("test@cryptoai.com", "password123");
        sampleUser.setVerified(true);

        Wallet wallet = Wallet.builder()
                .id(10L)
                .user(sampleUser)
                .usdtBalance(new BigDecimal("10000.0000"))
                .build();

        when(userRepository.findByEmail("test@cryptoai.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(walletRepository.findByUser(sampleUser)).thenReturn(Optional.of(wallet));
        when(jwtTokenProvider.generateToken(any(), any(), any())).thenReturn("mock-jwt-token");

        AuthResponse authResponse = authService.login(dto);

        assertNotNull(authResponse);
        assertEquals("mock-jwt-token", authResponse.getAccessToken());
        assertEquals(new BigDecimal("10000.0000"), authResponse.getUsdtBalance());
        assertTrue(authResponse.isVerified());
    }

    @Test
    @DisplayName("Google ile yeni kullanıcı ilk kez giriş yaptığında kayıt olmalı ve cüzdan oluşturulmalı")
    void testGoogleLoginNewUserSuccess() throws Exception {
        GoogleAuthRequestDto request = new GoogleAuthRequestDto("valid-google-token");

        GoogleIdToken googleIdToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail("newuser@cryptoai.com");
        payload.set("name", "New Google User");

        when(googleIdTokenVerifier.verify("valid-google-token")).thenReturn(googleIdToken);
        when(googleIdToken.getPayload()).thenReturn(payload);
        when(userRepository.findByEmail("newuser@cryptoai.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedRandomPassword");

        User savedUser = User.builder()
                .id(2L)
                .email("newuser@cryptoai.com")
                .fullName("New Google User")
                .passwordHash("encodedRandomPassword")
                .isVerified(true)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        Wallet wallet = Wallet.builder()
                .id(20L)
                .user(savedUser)
                .usdtBalance(new BigDecimal("10000.0000"))
                .build();
        when(walletRepository.findByUser(savedUser)).thenReturn(Optional.empty());
        when(walletRepository.save(any(Wallet.class))).thenReturn(wallet);

        when(jwtTokenProvider.generateToken(2L, "newuser@cryptoai.com", "New Google User")).thenReturn("jwt-for-new-google-user");

        AuthResponseDto response = authService.googleLogin(request);

        assertNotNull(response);
        assertEquals("jwt-for-new-google-user", response.getAccessToken());
        assertEquals("newuser@cryptoai.com", response.getEmail());
        assertEquals("New Google User", response.getFullName());
        assertTrue(response.isVerified());
        assertEquals(20L, response.getWalletId());
        assertEquals(new BigDecimal("10000.0000"), response.getUsdtBalance());
        verify(userRepository, times(1)).save(any(User.class));
        verify(walletRepository, times(1)).save(any(Wallet.class));
    }

    @Test
    @DisplayName("Google ile kayıtlı kullanıcı giriş yaptığında mevcut bilgilerle JWT dönmeli")
    void testGoogleLoginExistingUserSuccess() throws Exception {
        GoogleAuthRequestDto request = new GoogleAuthRequestDto("valid-google-token");

        GoogleIdToken googleIdToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail("test@cryptoai.com");
        payload.set("name", "Test User");

        sampleUser.setVerified(true);
        Wallet wallet = Wallet.builder()
                .id(10L)
                .user(sampleUser)
                .usdtBalance(new BigDecimal("10000.0000"))
                .build();

        when(googleIdTokenVerifier.verify("valid-google-token")).thenReturn(googleIdToken);
        when(googleIdToken.getPayload()).thenReturn(payload);
        when(userRepository.findByEmail("test@cryptoai.com")).thenReturn(Optional.of(sampleUser));
        when(walletRepository.findByUser(sampleUser)).thenReturn(Optional.of(wallet));
        when(jwtTokenProvider.generateToken(1L, "test@cryptoai.com", "Test User")).thenReturn("jwt-for-existing-user");

        AuthResponseDto response = authService.googleLogin(request);

        assertNotNull(response);
        assertEquals("jwt-for-existing-user", response.getAccessToken());
        assertEquals("test@cryptoai.com", response.getEmail());
        assertEquals("Test User", response.getFullName());
        assertTrue(response.isVerified());
        assertEquals(10L, response.getWalletId());
    }

    @Test
    @DisplayName("Daha önceden onaysız olan kullanıcı Google ile girdiğinde doğrulanmış duruma geçmeli")
    void testGoogleLoginExistingUnverifiedUserBecomesVerified() throws Exception {
        GoogleAuthRequestDto request = new GoogleAuthRequestDto("valid-google-token");

        GoogleIdToken googleIdToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail("test@cryptoai.com");
        payload.set("name", "Test User");

        sampleUser.setVerified(false);
        Wallet wallet = Wallet.builder()
                .id(10L)
                .user(sampleUser)
                .usdtBalance(new BigDecimal("10000.0000"))
                .build();

        when(googleIdTokenVerifier.verify("valid-google-token")).thenReturn(googleIdToken);
        when(googleIdToken.getPayload()).thenReturn(payload);
        when(userRepository.findByEmail("test@cryptoai.com")).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(walletRepository.findByUser(sampleUser)).thenReturn(Optional.of(wallet));
        when(jwtTokenProvider.generateToken(any(), any(), any())).thenReturn("jwt-token");

        AuthResponseDto response = authService.googleLogin(request);

        assertNotNull(response);
        assertTrue(response.isVerified());
        assertTrue(sampleUser.isVerified());
        verify(userRepository, times(1)).save(sampleUser);
    }

    @Test
    @DisplayName("Geçersiz Google ID Token durumunda 401 UNAUTHORIZED fırlatılmalı")
    void testGoogleLoginInvalidTokenThrowsUnauthorized() throws Exception {
        GoogleAuthRequestDto request = new GoogleAuthRequestDto("invalid-token");

        when(googleIdTokenVerifier.verify("invalid-token")).thenReturn(null);

        ApiException ex = assertThrows(ApiException.class, () -> authService.googleLogin(request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        assertEquals("Geçersiz veya süresi dolmuş Google ID Token", ex.getMessage());
    }

    @Test
    @DisplayName("Google Verifier doğrulama hatası verdiğinde 401 UNAUTHORIZED fırlatılmalı")
    void testGoogleLoginVerifierThrowsException() throws Exception {
        GoogleAuthRequestDto request = new GoogleAuthRequestDto("corrupt-token");

        when(googleIdTokenVerifier.verify("corrupt-token")).thenThrow(new RuntimeException("Signature verification failed"));

        ApiException ex = assertThrows(ApiException.class, () -> authService.googleLogin(request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        assertTrue(ex.getMessage().contains("Google kimlik doğrulama hatası"));
    }

    @Test
    @DisplayName("Boş token gönderildiğinde 400 BAD_REQUEST fırlatılmalı")
    void testGoogleLoginBlankTokenThrowsBadRequest() {
        GoogleAuthRequestDto request = new GoogleAuthRequestDto("");

        ApiException ex = assertThrows(ApiException.class, () -> authService.googleLogin(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }
}
