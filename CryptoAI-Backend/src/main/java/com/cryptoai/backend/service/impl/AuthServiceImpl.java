package com.cryptoai.backend.service.impl;

import com.cryptoai.backend.dto.request.LoginDto;
import com.cryptoai.backend.dto.request.RegisterDto;
import com.cryptoai.backend.dto.request.VerifyOtpDto;
import com.cryptoai.backend.dto.response.ApiResponse;
import com.cryptoai.backend.dto.response.AuthResponse;
import com.cryptoai.backend.dto.response.RegisterResponse;
import com.cryptoai.backend.entity.User;
import com.cryptoai.backend.entity.Wallet;
import com.cryptoai.backend.exception.ApiException;
import com.cryptoai.backend.repository.UserRepository;
import com.cryptoai.backend.repository.WalletRepository;
import com.cryptoai.backend.security.JwtTokenProvider;
import com.cryptoai.backend.service.AuthService;
import com.cryptoai.backend.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    private static final int OTP_EXPIRATION_MINUTES = 10;
    private static final BigDecimal INITIAL_WALLET_BALANCE = new BigDecimal("10000.0000");
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthServiceImpl(
            UserRepository userRepository,
            WalletRepository walletRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public ApiResponse<RegisterResponse> register(RegisterDto registerDto) {
        String normalizedEmail = registerDto.getEmail().trim().toLowerCase();
        log.info("Yeni kullanıcı kaydı başlatılıyor: {}", normalizedEmail);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ApiException("Bu e-posta adresi ile kayıtlı bir kullanıcı zaten mevcut", HttpStatus.CONFLICT);
        }

        String otp = generateOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);

        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(registerDto.getPassword()))
                .fullName(registerDto.getFullName().trim())
                .isVerified(false)
                .verificationOtp(otp)
                .otpExpiresAt(expiresAt)
                .build();

        userRepository.save(user);

        // E-posta ile 6 haneli OTP kodu gönder (bağlantı hatası olsa bile kullanıcı kaydedilmiş olur)
        try {
            emailService.sendOtpEmail(user.getEmail(), user.getFullName(), otp);
        } catch (Exception ex) {
            log.warn("E-posta gönderiminde beklenmeyen hata yakalandı, kayıt işlemi devam ediyor: {}", ex.getMessage());
        }

        log.info("Kullanıcı kaydı başarıyla tamamlandı: {}", normalizedEmail);

        RegisterResponse registerResponse = RegisterResponse.builder()
                .message("Kayıt başarılı. Lütfen e-posta adresinize gönderilen 6 haneli doğrulama kodunu giriniz.")
                .email(user.getEmail())
                .debugOtp(otp)
                .build();

        return ApiResponse.success("Kayıt başarılı.", registerResponse);
    }

    @Override
    @Transactional
    public AuthResponse verifyEmail(VerifyOtpDto verifyOtpDto) {
        String normalizedEmail = verifyOtpDto.getEmail().trim().toLowerCase();
        log.info("E-posta doğrulama talebi: {}", normalizedEmail);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ApiException("Kayıtlı kullanıcı bulunamadı", HttpStatus.NOT_FOUND));

        if (user.isVerified()) {
            throw new ApiException("Bu hesap zaten doğrulanmış. Lütfen giriş yapınız.", HttpStatus.BAD_REQUEST);
        }

        if (user.getVerificationOtp() == null || !user.getVerificationOtp().equals(verifyOtpDto.getOtp())) {
            throw new ApiException("Girdiğiniz doğrulama kodu hatalıdır", HttpStatus.BAD_REQUEST);
        }

        if (user.getOtpExpiresAt() == null || LocalDateTime.now().isAfter(user.getOtpExpiresAt())) {
            throw new ApiException("Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod talep ediniz.", HttpStatus.BAD_REQUEST);
        }

        // Kullanıcıyı onayla ve OTP bilgilerini sıfırla
        user.setVerified(true);
        user.setVerificationOtp(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        // Kullanıcıya 10.000 USDT sanal cüzdan tanımla
        Wallet wallet = walletRepository.findByUser(user).orElseGet(() -> {
            Wallet newWallet = Wallet.builder()
                    .user(user)
                    .usdtBalance(INITIAL_WALLET_BALANCE)
                    .build();
            return walletRepository.save(newWallet);
        });

        // JWT token oluştur
        String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getFullName());

        log.info("Hesap başarıyla doğrulandı ve cüzdan açıldı: {}", normalizedEmail);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .isVerified(true)
                .walletId(wallet.getId())
                .usdtBalance(wallet.getUsdtBalance())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginDto loginDto) {
        String normalizedEmail = loginDto.getEmail().trim().toLowerCase();
        log.info("Kullanıcı giriş talebi: {}", normalizedEmail);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ApiException("E-posta veya şifre hatalı", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(loginDto.getPassword(), user.getPasswordHash())) {
            throw new ApiException("E-posta veya şifre hatalı", HttpStatus.UNAUTHORIZED);
        }

        // Kullanıcı onaylanmamışsa 403 Forbidden fırlat
        if (!user.isVerified()) {
            throw new ApiException("Hesabınız henüz doğrulanmamış. Lütfen e-postanıza gönderilen OTP kodunu onaylayın.", HttpStatus.FORBIDDEN);
        }

        Wallet wallet = walletRepository.findByUser(user)
                .orElseGet(() -> {
                    Wallet newWallet = Wallet.builder()
                            .user(user)
                            .usdtBalance(INITIAL_WALLET_BALANCE)
                            .build();
                    return walletRepository.save(newWallet);
                });

        String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getFullName());

        log.info("Kullanıcı başarıyla giriş yaptı: {}", normalizedEmail);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .isVerified(true)
                .walletId(wallet.getId())
                .usdtBalance(wallet.getUsdtBalance())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<String> resendOtp(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        log.info("Yeniden OTP kodu gönderme talebi: {}", normalizedEmail);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND));

        if (user.isVerified()) {
            throw new ApiException("Bu hesap zaten doğrulanmıştır", HttpStatus.BAD_REQUEST);
        }

        String otp = generateOtp();
        user.setVerificationOtp(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES));
        userRepository.save(user);

        try {
            emailService.sendOtpEmail(user.getEmail(), user.getFullName(), otp);
        } catch (Exception ex) {
            log.warn("Yeniden OTP e-postası gönderilirken hata oluştu: {}", ex.getMessage());
        }

        return ApiResponse.success("Yeni doğrulama kodu e-posta adresinize gönderildi. (Geliştirme Kodu: " + otp + ")");
    }

    private String generateOtp() {
        int code = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(code);
    }
}
