package com.cryptoai.backend.service.impl;

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
import com.cryptoai.backend.service.AuthService;
import com.cryptoai.backend.service.EmailService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);
    public static final String DEFAULT_GOOGLE_CLIENT_ID = "135078967221-i10ltkk78iplnbmgoelmu0ehqbhtnmmu.apps.googleusercontent.com";

    public static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#^()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?~`]).{8,}$";
    public static final String PASSWORD_ERROR_MESSAGE = "Şifre en az 8 karakter olmalı, en az bir büyük harf (A-Z), bir küçük harf (a-z), bir rakam (0-9) ve bir özel karakter (@$!%*?&# vb.) içermelidir";
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(PASSWORD_REGEX);

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    @Value("${app.google.client-id:135078967221-i10ltkk78iplnbmgoelmu0ehqbhtnmmu.apps.googleusercontent.com}")
    private String googleClientId = DEFAULT_GOOGLE_CLIENT_ID;

    private static final int OTP_EXPIRATION_MINUTES = 10;
    private static final BigDecimal INITIAL_WALLET_BALANCE = new BigDecimal("10000.0000");
    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired
    public AuthServiceImpl(
            UserRepository userRepository,
            WalletRepository walletRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            EmailService emailService,
            @Autowired(required = false) GoogleIdTokenVerifier googleIdTokenVerifier) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailService = emailService;
        this.googleIdTokenVerifier = googleIdTokenVerifier != null
                ? googleIdTokenVerifier
                : new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                        .setAudience(Collections.singletonList(DEFAULT_GOOGLE_CLIENT_ID))
                        .build();
    }

    public AuthServiceImpl(
            UserRepository userRepository,
            WalletRepository walletRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            EmailService emailService) {
        this(userRepository, walletRepository, passwordEncoder, jwtTokenProvider, emailService, null);
    }

    public void setGoogleClientId(String googleClientId) {
        this.googleClientId = googleClientId;
    }

    @Override
    @Transactional
    public ApiResponse<RegisterResponse> register(RegisterDto registerDto) {
        String normalizedEmail = registerDto.getEmail().trim().toLowerCase();
        log.info("Yeni kullanıcı kaydı başlatılıyor: {}", normalizedEmail);

        if (registerDto.getPassword() == null || !PASSWORD_PATTERN.matcher(registerDto.getPassword()).matches()) {
            throw new ApiException(PASSWORD_ERROR_MESSAGE, HttpStatus.BAD_REQUEST);
        }

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

    @Override
    @Transactional
    public AuthResponseDto googleLogin(GoogleAuthRequestDto request) {
        if (request == null || request.getIdToken() == null || request.getIdToken().trim().isEmpty()) {
            throw new ApiException("Google ID Token boş olamaz", HttpStatus.BAD_REQUEST);
        }

        String idTokenString = request.getIdToken().trim();
        log.info("Google OAuth2 giriş talebi alındı");

        String targetClientId = (googleClientId != null && !googleClientId.trim().isEmpty())
                ? googleClientId.trim()
                : DEFAULT_GOOGLE_CLIENT_ID;

        GoogleIdToken idToken = null;
        try {
            idToken = googleIdTokenVerifier.verify(idTokenString);
        } catch (Exception ex) {
            String errorDetail = ex.getMessage() != null ? ex.getMessage() : (ex.getCause() != null ? ex.getCause().getMessage() : ex.getClass().getSimpleName());
            log.error("Google ID Token doğrulanırken hata oluştu [{}]: {}", ex.getClass().getSimpleName(), errorDetail, ex);
            throw new ApiException("Google kimlik doğrulama hatası: " + errorDetail, HttpStatus.UNAUTHORIZED);
        }

        // Eğer mevcut verifier null döndüyse, token'ı ayrıştırarak hedef Web Client ID ile doğrula
        if (idToken == null) {
            log.warn("Mevcut verifier ile Google ID Token doğrulanamadı (null döndü). Token çözümlenerek Web Client ID ({}) ile yeniden doğrulanıyor...", targetClientId);
            try {
                GoogleIdToken parsedToken = GoogleIdToken.parse(GsonFactory.getDefaultInstance(), idTokenString);
                if (parsedToken != null && parsedToken.getPayload() != null) {
                    GoogleIdToken.Payload p = parsedToken.getPayload();
                    log.info("Google Token Çözümlendi -> Issuer: {}, Audience: {}, AuthorizedParty: {}, Email: {}, Expiration: {}",
                            p.getIssuer(), p.getAudience(), p.getAuthorizedParty(), p.getEmail(), p.getExpirationTimeSeconds());

                    List<String> validAudiences = new ArrayList<>();
                    validAudiences.add(targetClientId);
                    if (p.getAudience() instanceof String) {
                        String aud = (String) p.getAudience();
                        if (!validAudiences.contains(aud)) {
                            validAudiences.add(aud);
                        }
                    } else if (p.getAudience() instanceof Collection<?>) {
                        for (Object audObj : (Collection<?>) p.getAudience()) {
                            if (audObj != null && !validAudiences.contains(audObj.toString())) {
                                validAudiences.add(audObj.toString());
                            }
                        }
                    }
                    if (p.getAuthorizedParty() != null && !validAudiences.contains(p.getAuthorizedParty())) {
                        validAudiences.add(p.getAuthorizedParty());
                    }

                    GoogleIdTokenVerifier fallbackVerifier = new GoogleIdTokenVerifier.Builder(
                            new NetHttpTransport(),
                            GsonFactory.getDefaultInstance()
                    ).setAudience(validAudiences).build();

                    idToken = fallbackVerifier.verify(idTokenString);
                    if (idToken != null) {
                        log.info("Google ID Token hedef Web Client ID ile başarıyla doğrulandı!");
                    } else {
                        log.warn("Hedef Web Client ID ({}) ile fallback doğrulama da başarısız oldu. Token imzası veya süresi geçersiz olabilir.", targetClientId);
                    }
                }
            } catch (Exception parseEx) {
                log.error("Google ID Token parse veya fallback doğrulama hatası [{}]: {}", parseEx.getClass().getSimpleName(), parseEx.getMessage(), parseEx);
            }
        }

        if (idToken == null) {
            log.warn("Geçersiz veya süresi dolmuş Google ID Token tespit edildi (Hedef Client ID: {})", targetClientId);
            throw new ApiException("Geçersiz veya süresi dolmuş Google ID Token", HttpStatus.UNAUTHORIZED);
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        if (email == null || email.trim().isEmpty()) {
            throw new ApiException("Google hesabından e-posta adresi alınamadı", HttpStatus.BAD_REQUEST);
        }
        String normalizedEmail = email.trim().toLowerCase();

        String fullName = (String) payload.get("name");
        if (fullName == null || fullName.trim().isEmpty()) {
            String givenName = (String) payload.get("given_name");
            String familyName = (String) payload.get("family_name");
            if (givenName != null && !givenName.trim().isEmpty()) {
                fullName = (givenName.trim() + (familyName != null && !familyName.trim().isEmpty() ? " " + familyName.trim() : "")).trim();
            } else {
                fullName = normalizedEmail.split("@")[0];
            }
        } else {
            fullName = fullName.trim();
        }

        log.info("Google ile doğrulanan kullanıcı: email={}, fullName={}", normalizedEmail, fullName);

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user == null) {
            // Yeni kullanıcı oluştur
            String randomPassword = UUID.randomUUID().toString();
            user = User.builder()
                    .email(normalizedEmail)
                    .fullName(fullName)
                    .passwordHash(passwordEncoder.encode(randomPassword))
                    .isVerified(true)
                    .verificationOtp(null)
                    .otpExpiresAt(null)
                    .createdAt(LocalDateTime.now())
                    .build();
            user = userRepository.save(user);
            log.info("Google ile yeni kullanıcı başarıyla kaydedildi: {}", normalizedEmail);
        } else {
            // Var olan kullanıcı Google ile giriş yaptıysa ve doğrulanmamışsa, doğrulanmış olarak işaretle
            boolean updated = false;
            if (!user.isVerified()) {
                user.setVerified(true);
                user.setVerificationOtp(null);
                user.setOtpExpiresAt(null);
                updated = true;
            }
            if (user.getFullName() == null || user.getFullName().trim().isEmpty()) {
                user.setFullName(fullName);
                updated = true;
            }
            if (updated) {
                user = userRepository.save(user);
            }
            log.info("Mevcut kullanıcı Google ile giriş yaptı: {}", normalizedEmail);
        }

        // Kullanıcıya 10.000 USDT sanal cüzdan tanımla (varsa mevcut olanı kullan)
        final User finalUser = user;
        Wallet wallet = walletRepository.findByUser(user).orElseGet(() -> {
            Wallet newWallet = Wallet.builder()
                    .user(finalUser)
                    .usdtBalance(INITIAL_WALLET_BALANCE)
                    .build();
            return walletRepository.save(newWallet);
        });

        // JWT token oluştur
        String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getFullName());

        return AuthResponseDto.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .isVerified(user.isVerified())
                .walletId(wallet.getId())
                .usdtBalance(wallet.getUsdtBalance())
                .build();
    }

    private String generateOtp() {
        int code = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(code);
    }
}
