package com.cryptoai.backend.dto.response;

public class RegisterResponse {

    private String message;
    private String email;
    private String debugOtp;

    public RegisterResponse() {
    }

    public RegisterResponse(String message, String email, String debugOtp) {
        this.message = message;
        this.email = email;
        this.debugOtp = debugOtp;
    }

    public static RegisterResponseBuilder builder() {
        return new RegisterResponseBuilder();
    }

    public static class RegisterResponseBuilder {
        private String message;
        private String email;
        private String debugOtp;

        RegisterResponseBuilder() {
        }

        public RegisterResponseBuilder message(String message) {
            this.message = message;
            return this;
        }

        public RegisterResponseBuilder email(String email) {
            this.email = email;
            return this;
        }

        public RegisterResponseBuilder debugOtp(String debugOtp) {
            this.debugOtp = debugOtp;
            return this;
        }

        public RegisterResponse build() {
            return new RegisterResponse(message, email, debugOtp);
        }
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDebugOtp() {
        return debugOtp;
    }

    public void setDebugOtp(String debugOtp) {
        this.debugOtp = debugOtp;
    }
}
