# Multi-stage Dockerfile for CryptoAI-Backend (Apple Silicon ARM64 & AMD64 compatible)

# Stage 1: Build
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /build

# Install Maven on Debian/Ubuntu base
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Copy project definition and source code
COPY pom.xml .
COPY src ./src

# Build production jar without running tests
RUN mvn clean package -DskipTests -B

# Stage 2: Production Runtime
FROM eclipse-temurin:17-jre

WORKDIR /app

# Run as non-root user for security best practices (Debian/Ubuntu syntax)
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser:appgroup

# Copy built JAR from builder stage
COPY --from=builder --chown=appuser:appgroup /build/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
