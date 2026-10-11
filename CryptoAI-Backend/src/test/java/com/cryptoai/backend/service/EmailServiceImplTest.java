package com.cryptoai.backend.service;

import com.cryptoai.backend.service.impl.EmailServiceImpl;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceImplTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailServiceImpl emailService;

    @BeforeEach
    void setUp() {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        emailService = new EmailServiceImpl(mailSender, "no-reply@cryptoai.local");
    }

    @Test
    @DisplayName("SMTP bağlantı hatası durumunda istisna fırlatılmamalı ve loglanmalıdır")
    void testSendOtpEmailHandlesExceptionGracefully() {
        doThrow(new MailSendException("SMTP connection refused"))
                .when(mailSender).send(any(MimeMessage.class));

        // Metot çağrısının hata fırlatmadığı doğrulanır (503 dönmez)
        assertDoesNotThrow(() ->
                emailService.sendOtpEmail("user@cryptoai.com", "Test User", "654321")
        );

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }
}
