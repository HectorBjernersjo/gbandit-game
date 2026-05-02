FROM rust:1-slim-bookworm AS builder

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/app/target \
    cargo build && strip -o /app/replace_with_project target/debug/replace_with_project

FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates curl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/replace_with_project /app/replace_with_project

EXPOSE 80

CMD ["sh", "-c", "exec ./replace_with_project"]
