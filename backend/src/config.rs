use std::env;
use std::net::SocketAddr;
use std::time::Duration;

#[derive(Clone)]
pub struct Config {
    pub listen_addr: SocketAddr,
    pub database_url: String,
    pub auth_issuer: String,
    pub auth_audience: String,
    pub auth_jwks_url: String,
    pub auth_jwks_refresh_interval: Duration,
}

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("DATABASE_URL must be set")]
    MissingDatabaseUrl,
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        let listen_addr = env::var("LISTEN_ADDR")
            .unwrap_or_else(|_| "0.0.0.0:8080".into())
            .parse()
            .expect("LISTEN_ADDR must be a valid socket address");
        let auth_issuer =
            env::var("AUTH_ISSUER").unwrap_or_else(|_| "https://auth.gbandit.com".into());
        let auth_audience =
            env::var("AUTH_AUDIENCE").unwrap_or_else(|_| "game-backend".into());
        let auth_jwks_url = env::var("AUTH_JWKS_URL")
            .ok()
            .filter(|value| !value.trim().is_empty())
            .unwrap_or_else(|| format!("{}/.well-known/jwks.json", auth_issuer.trim_end_matches('/')));
        let auth_jwks_refresh_interval = Duration::from_secs(
            env::var("AUTH_JWKS_REFRESH_INTERVAL_SECONDS")
                .ok()
                .and_then(|value| value.parse::<u64>().ok())
                .unwrap_or(300),
        );

        Ok(Self {
            listen_addr,
            database_url: env::var("DATABASE_URL").map_err(|_| ConfigError::MissingDatabaseUrl)?,
            auth_issuer,
            auth_audience,
            auth_jwks_url,
            auth_jwks_refresh_interval,
        })
    }
}
