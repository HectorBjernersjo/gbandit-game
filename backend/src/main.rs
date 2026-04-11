use sqlx::postgres::PgPoolOptions;
use std::error::Error;
use tokio::net::TcpListener;

use basegame_api::{AppState, app, auth::AuthVerifier, config::Config};

#[tokio::main]
async fn main() {
    let _ = dotenvy::from_filename("../.env");
    println!("Heeejaar");

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "basegame_api=debug,tower_http=debug".into()),
        )
        .init();

    if let Err(error) = run().await {
        tracing::error!(error = %error, "backend failed to start");
        std::process::exit(1);
    }
}

async fn run() -> Result<(), Box<dyn Error + Send + Sync>> {
    let config = Config::from_env().map_err(log_startup_error("failed to load config"))?;
    let auth_verifier = AuthVerifier::from_jwks_url(
        config.auth_issuer.clone(),
        config.auth_audience.clone(),
        config.auth_jwks_url.clone(),
        reqwest::Client::new(),
        config.auth_jwks_refresh_interval,
    )
    .await
    .map_err(|error| {
        tracing::error!(jwks_url = %config.auth_jwks_url, error = %error, "failed to initialize auth verifier");
        std::io::Error::other(error)
    })
    .map_err(log_startup_error("failed to initialize auth verifier"))?;

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&config.database_url)
        .await
        .map_err(log_startup_error("failed to connect to database"))?;

    tracing::info!("running database migrations");
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .map_err(log_startup_error("failed to run migrations"))?;

    let state = AppState {
        pool,
        config: config.clone(),
        auth_verifier,
    };

    let app = app(state);

    let addr = config.listen_addr;

    tracing::info!("listening on {addr}");

    let listener = TcpListener::bind(addr)
        .await
        .map_err(log_startup_error("failed to bind listener"))?;

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .map_err(log_startup_error("server error"))?;

    Ok(())
}

fn log_startup_error<E>(message: &'static str) -> impl FnOnce(E) -> Box<dyn Error + Send + Sync>
where
    E: Error + Send + Sync + 'static,
{
    move |error| {
        tracing::error!(error = %error, "{message}");
        Box::new(error)
    }
}

async fn shutdown_signal() {
    let ctrl_c = tokio::signal::ctrl_c();
    let mut sigterm = match tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
    {
        Ok(sigterm) => sigterm,
        Err(error) => {
            tracing::error!(error = %error, "failed to install SIGTERM handler");
            return;
        }
    };

    tokio::select! {
        _ = ctrl_c => tracing::info!("received SIGINT, shutting down"),
        _ = sigterm.recv() => tracing::info!("received SIGTERM, shutting down"),
    }
}
