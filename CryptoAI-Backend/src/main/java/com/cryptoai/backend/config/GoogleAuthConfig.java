package com.cryptoai.backend.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;

@Configuration
public class GoogleAuthConfig {

    public static final String DEFAULT_CLIENT_ID = "135078967221-i10ltkk78iplnbmgoelmu0ehqbhtnmmu.apps.googleusercontent.com";

    @Value("${app.google.client-id:135078967221-i10ltkk78iplnbmgoelmu0ehqbhtnmmu.apps.googleusercontent.com}")
    private String googleClientId;

    @Bean
    public GoogleIdTokenVerifier googleIdTokenVerifier() {
        GoogleIdTokenVerifier.Builder builder = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        );
        String clientId = (googleClientId != null && !googleClientId.trim().isEmpty())
                ? googleClientId.trim()
                : DEFAULT_CLIENT_ID;
        builder.setAudience(Collections.singletonList(clientId));
        return builder.build();
    }
}
