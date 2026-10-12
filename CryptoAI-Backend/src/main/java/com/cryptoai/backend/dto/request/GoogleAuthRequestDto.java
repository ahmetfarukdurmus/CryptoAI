package com.cryptoai.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleAuthRequestDto {

    @NotBlank(message = "Google ID Token boş olamaz")
    private String idToken;

    public GoogleAuthRequestDto() {
    }

    public GoogleAuthRequestDto(String idToken) {
        this.idToken = idToken;
    }

    public static GoogleAuthRequestDtoBuilder builder() {
        return new GoogleAuthRequestDtoBuilder();
    }

    public static class GoogleAuthRequestDtoBuilder {
        private String idToken;

        GoogleAuthRequestDtoBuilder() {
        }

        public GoogleAuthRequestDtoBuilder idToken(String idToken) {
            this.idToken = idToken;
            return this;
        }

        public GoogleAuthRequestDto build() {
            return new GoogleAuthRequestDto(idToken);
        }
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
