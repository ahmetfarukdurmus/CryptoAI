package com.cryptoai.backend.service.impl;

import com.cryptoai.backend.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@cryptoai.local}")
    private String fromEmail = "no-reply@cryptoai.local";

    @Autowired
    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
        this.fromEmail = "no-reply@cryptoai.local";
    }

    public EmailServiceImpl(JavaMailSender mailSender, String fromEmail) {
        this.mailSender = mailSender;
        this.fromEmail = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "no-reply@cryptoai.local";
    }

    @Override
    public void sendOtpEmail(String toEmail, String fullName, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            String from = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "no-reply@cryptoai.local";
            helper.setFrom(from);
            helper.setTo(toEmail);
            helper.setSubject("CryptoAI - Doğrulama Kodu");
            helper.setText("<h2>Merhaba " + (fullName != null ? fullName : "") + ",</h2>" +
                    "<p>CryptoAI hesabınızı doğrulamak için tek kullanımlık kodunuz:</p>" +
                    "<h3>" + otpCode + "</h3>", true);
            mailSender.send(message);
            log.info("OTP maili gönderildi: {}", toEmail);
        } catch (Exception e) {
            log.warn("Mail sunucusuna erişilemedi, dev modunda loglanıyor: {}", e.getMessage());
            log.info("==================================================");
            log.info("DEV MODE OTP KODU [{}]: {}", toEmail, otpCode);
            log.info("==================================================");
        }
    }
}