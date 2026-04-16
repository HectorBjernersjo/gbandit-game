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
    // For important env variables it's better to not use fallbacks and panic when missing
    // so that bad configuration can be fixed immediately
    pub fn from_env() -> Result<Self, ConfigError> {
        let auth_issuer = env::var("AUTH_ISSUER").expect("AUTH_ISSUER must be set");
        let auth_audience = env::var("AUTH_AUDIENCE").expect("AUTH_AUDIENCE must be set");
        let auth_jwks_url = env::var("AUTH_JWKS_URL").expect("AUTH_JWKS_URL must be set");
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        let listen_addr = String::from("0.0.0.0:8080")
            .parse()
            .expect("Must use a valid listen address");
        let auth_jwks_refresh_interval = Duration::from_secs(
            env::var("AUTH_JWKS_REFRESH_INTERVAL_SECONDS")
                .ok()
                .and_then(|value| value.parse::<u64>().ok())
                .unwrap_or(300),
        );

        Ok(Self {
            listen_addr,
            database_url,
            auth_issuer,
            auth_audience,
            auth_jwks_url,
            auth_jwks_refresh_interval,
        })
    }
}
