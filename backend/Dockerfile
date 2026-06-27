FROM rust:1-slim-bookworm AS builder

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

# The pipeline runs migrations before this build and provides the tenant
# DATABASE_URL as a buildkit secret, so sqlx query! macros compile against
# the live, freshly migrated schema.
RUN --mount=type=secret,id=database_url \
    --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/app/target \
    DATABASE_URL=$(cat /run/secrets/database_url) cargo build && strip -o /app/replace_with_project target/debug/replace_with_project

# SQLite alternative (ADR 0014 §3.5) — use this RUN instead of the one above.
# The pipeline mounts a throwaway schema-only DB as the `db_schema` secret;
# copy it to a writable path first since the secret mount is read-only and
# sqlx opens the file read-write:
# RUN --mount=type=secret,id=db_schema \
#     --mount=type=cache,target=/usr/local/cargo/registry \
#     --mount=type=cache,target=/app/target \
#     cp /run/secrets/db_schema /tmp/db_schema && \
#     DATABASE_URL=sqlite:///tmp/db_schema cargo build && strip -o /app/replace_with_project target/debug/replace_with_project

FROM gcr.io/distroless/cc-debian12
# Behöver du shella ut till systemverktyg (ffmpeg, python, sh, ...)?
# Byt raden ovan mot:  FROM debian:bookworm-slim
#   RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/replace_with_project /app/replace_with_project

# SQLite only (ADR 0014 §5, Alt 1): the platform's migration init-container
# copies these out of the running image to apply them to the file on the PVC,
# so the migrations must be baked in. Uncomment for SQLite:
# COPY migrations /app/migrations

EXPOSE 80

CMD ["./replace_with_project"]
