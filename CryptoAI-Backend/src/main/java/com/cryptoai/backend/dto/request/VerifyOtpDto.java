package com.cryptoai.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VerifyOtpDto {

    @NotBlank(message = "E-posta adresi boş bırakılamaz")
    @Email(message = "Lütfen geçerli bir e-posta adresi giriniz")
    private String email;

    @NotBlank(message = "Doğrulama kodu boş bırakılamaz")
    @Pattern(regexp = "^[0-9]{6}$", message = "Doğrulama kodu 6 haneli rakamlardan oluşmalıdır")
    private String otp;

    public VerifyOtpDto() {
    }

    public VerifyOtpDto(String email, String otp) {
        this.email = email;
        this.otp = otp;
    }

    public static VerifyOtpDtoBuilder builder() {
        return new VerifyOtpDtoBuilder();
    }

    public static class VerifyOtpDtoBuilder {
        private String email;
        private String otp;

        VerifyOtpDtoBuilder() {
        }

        public VerifyOtpDtoBuilder email(String email) {
            this.email = email;
            return this;
        }

        public VerifyOtpDtoBuilder otp(String otp) {
            this.otp = otp;
            return this;
        }

        public VerifyOtpDto build() {
            return new VerifyOtpDto(email, otp);
        }
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
