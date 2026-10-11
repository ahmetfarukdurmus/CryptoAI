package com.cryptoai.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CryptoAiBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CryptoAiBackendApplication.class, args);
    }
}
