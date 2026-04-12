# Build stage
FROM rust:1-bookworm AS builder

WORKDIR /app

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Copy source code and sqlx cache
COPY src ./src

# Build for release (use .sqlx cache, no live DB needed)
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/basegame-api /app/basegame-api

EXPOSE 80

CMD ["/app/basegame-api"]
