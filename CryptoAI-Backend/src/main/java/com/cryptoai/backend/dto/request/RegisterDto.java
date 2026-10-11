package com.cryptoai.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterDto {

    @NotBlank(message = "E-posta adresi boş bırakılamaz")
    @Email(message = "Lütfen geçerli bir e-posta adresi giriniz")
    private String email;

    @NotBlank(message = "Şifre alanı boş bırakılamaz")
    @Size(min = 6, message = "Şifre en az 6 karakter olmalıdır")
    private String password;

    @NotBlank(message = "Ad ve soyad alanı boş bırakılamaz")
    private String fullName;

    public RegisterDto() {
    }

    public RegisterDto(String email, String password, String fullName) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
    }

    public static RegisterDtoBuilder builder() {
        return new RegisterDtoBuilder();
    }

    public static class RegisterDtoBuilder {
        private String email;
        private String password;
        private String fullName;

        RegisterDtoBuilder() {
        }

        public RegisterDtoBuilder email(String email) {
            this.email = email;
            return this;
        }

        public RegisterDtoBuilder password(String password) {
            this.password = password;
            return this;
        }

        public RegisterDtoBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public RegisterDto build() {
            return new RegisterDto(email, password, fullName);
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}
