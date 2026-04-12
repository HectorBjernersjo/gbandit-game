FROM rust:1-slim-bookworm AS builder

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/app/target \
    cargo build && strip -o /app/basegame-api target/debug/basegame-api

FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates curl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/basegame-api /app/basegame-api

EXPOSE 80

CMD ["sh", "-c", "exec ./basegame-api"]
