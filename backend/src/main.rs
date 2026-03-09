use std::net::SocketAddr

use sqlx::postgres::PgPoolOptions;
use tokio::net::TcpListener;

use basegame_api::{AppState, app, config::Config};

#[tokio::main]
async fn main() {
    let _ = dotenvy::from_filename("../.env");

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "basegame_api=debug,tower_http=debug".into()),
        )
        .init();

    let config = Config::from_env();

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&config.database_url)
        .await
        .expect("failed to connect to database");

    tracing::info!("running database migrations");
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("failed to run migrations");

    let state = AppState {
        pool,
        config: config.clone(),
    };

    let app = app(state);

    let addr: SocketAddr = ([0, 0, 0, 0], 80).into();

    tracing::info!("listening on {addr}");

    let listener = TcpListener::bind(addr).await.expect("failed to bind");
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("server error");
}

async fn shutdown_signal() {
    let ctrl_c = tokio::signal::ctrl_c();
    let mut sigterm = tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
        .expect("failed to install SIGTERM handler");

    tokio::select! {
        _ = ctrl_c => tracing::info!("received SIGINT, shutting down"),
        _ = sigterm.recv() => tracing::info!("received SIGTERM, shutting down"),
    }
}
