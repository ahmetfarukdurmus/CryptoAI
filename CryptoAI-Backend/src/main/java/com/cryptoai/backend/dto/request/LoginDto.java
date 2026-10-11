package com.cryptoai.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginDto {

    @NotBlank(message = "E-posta adresi boş bırakılamaz")
    @Email(message = "Lütfen geçerli bir e-posta adresi giriniz")
    private String email;

    @NotBlank(message = "Şifre alanı boş bırakılamaz")
    private String password;

    public LoginDto() {
    }

    public LoginDto(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public static LoginDtoBuilder builder() {
        return new LoginDtoBuilder();
    }

    public static class LoginDtoBuilder {
        private String email;
        private String password;

        LoginDtoBuilder() {
        }

        public LoginDtoBuilder email(String email) {
            this.email = email;
            return this;
        }

        public LoginDtoBuilder password(String password) {
            this.password = password;
            return this;
        }

        public LoginDto build() {
            return new LoginDto(email, password);
        }
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
