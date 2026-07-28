FROM rust:1-slim-bookworm AS builder

WORKDIR /app

COPY . .

# The pipeline runs migrations before this build and provides the tenant
# DATABASE_URL as a buildkit secret, so sqlx query! macros compile against
# the live, freshly migrated schema.
#
# The binary is copied, not stripped: /app/target is a cache mount, so it has to
# leave that path either way, and the symbol table it keeps is what turns a panic
# backtrace from bare addresses into named frames (see RUST_BACKTRACE below).
# Costs ~9 MB in the image.
RUN --mount=type=secret,id=database_url \
    --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/app/target \
    DATABASE_URL=$(cat /run/secrets/database_url) cargo build && cp target/debug/replace_with_project /app/replace_with_project

# SQLite alternative (ADR 0014 §3.5) — use this RUN instead of the one above.
# The pipeline mounts a throwaway schema-only DB as the `db_schema` secret;
# copy it to a writable path first since the secret mount is read-only and
# sqlx opens the file read-write:
# RUN --mount=type=secret,id=db_schema \
#     --mount=type=cache,target=/usr/local/cargo/registry \
#     --mount=type=cache,target=/app/target \
#     cp /run/secrets/db_schema /tmp/db_schema && \
#     DATABASE_URL=sqlite:///tmp/db_schema cargo build && cp target/debug/replace_with_project /app/replace_with_project

FROM scratch
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

# Without this a panic logs its message and location but no stack at all, which
# is the half that tells you how you got there. Costs nothing until something
# panics. Set it to `full` if you want the runtime's own frames too.
ENV RUST_BACKTRACE=1

CMD ["./replace_with_project"]
