package com.cryptoai.backend.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class GoogleAuthConfigTest {

    @Test
    @DisplayName("GoogleAuthConfig varsayılan Web Client ID ile GoogleIdTokenVerifier oluşturmalı")
    void testGoogleAuthConfigDefaultClientId() {
        GoogleAuthConfig config = new GoogleAuthConfig();
        GoogleIdTokenVerifier verifier = config.googleIdTokenVerifier();

        assertNotNull(verifier);
        assertNotNull(verifier.getAudience());
        assertTrue(verifier.getAudience().contains(GoogleAuthConfig.DEFAULT_CLIENT_ID));
        assertEquals("136078967221-i10ltkk78iplnbmgooelmu0ehqbhtmmu.apps.googleusercontent.com", GoogleAuthConfig.DEFAULT_CLIENT_ID);
    }

    @Test
    @DisplayName("GoogleAuthConfig özel Client ID verildiğinde onu audience olarak yapılandırmalı")
    void testGoogleAuthConfigCustomClientId() {
        GoogleAuthConfig config = new GoogleAuthConfig();
        ReflectionTestUtils.setField(config, "googleClientId", "custom-client-id.apps.googleusercontent.com");
        GoogleIdTokenVerifier verifier = config.googleIdTokenVerifier();

        assertNotNull(verifier);
        assertNotNull(verifier.getAudience());
        assertTrue(verifier.getAudience().contains("custom-client-id.apps.googleusercontent.com"));
    }
}
