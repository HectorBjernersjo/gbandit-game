FROM rust:1-slim-bookworm AS builder

WORKDIR /app

# SQLite alternative — uncomment this apt layer plus the SQLite RUN below and
# remove the postgres RUN. Placed before COPY so the layer survives source
# changes.
# RUN apt-get update && apt-get install -y --no-install-recommends sqlite3 && \
#     rm -rf /var/lib/apt/lists/*

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

# SQLite alternative — use this RUN instead of the one above (and uncomment the
# apt layer up top). The build is self-contained: the migrations are applied to
# a throwaway file so query! macros compile against the migrated schema. No
# secrets involved — the same `docker build` works locally.
# RUN --mount=type=cache,target=/usr/local/cargo/registry \
#     --mount=type=cache,target=/app/target \
#     for f in migrations/*.up.sql; do [ -e "$f" ] || continue; sqlite3 -bail /tmp/db_schema < "$f" || exit 1; done && \
#     DATABASE_URL=sqlite:///tmp/db_schema cargo build && cp target/debug/replace_with_project /app/replace_with_project

# :debug carries a busybox shell, which the platform's db-migrate
# init-container needs to copy /app/migrations out of this image (ADR 0019).
FROM gcr.io/distroless/cc-debian12:debug

WORKDIR /app

COPY --from=builder /app/replace_with_project /app/replace_with_project

# The platform's db-migrate init-container applies these to the live SQLite
# file before the app starts — the image is the single source of migrations.
COPY --from=builder /app/migrations /app/migrations

EXPOSE 8080

ENV RUST_BACKTRACE=1

CMD ["./replace_with_project"]
