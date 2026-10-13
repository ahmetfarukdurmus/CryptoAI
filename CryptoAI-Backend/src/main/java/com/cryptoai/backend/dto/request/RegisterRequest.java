package com.cryptoai.backend.dto.request;

public class RegisterRequest extends RegisterDto {

    public RegisterRequest() {
        super();
    }

    public RegisterRequest(String email, String password, String fullName) {
        super(email, password, fullName);
    }
}
