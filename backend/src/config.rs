use std::env;

use ed25519_dalek::VerifyingKey;
use thiserror::Error;

#[derive(Clone)]
pub struct Config {
    pub database_url: String,
    /// Ed25519 public keys for verifying gateway signatures. Accepts any active key during rotation.
    pub verifying_keys: Vec<VerifyingKey>,
}

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("SIGNING_PUBLIC_KEY must be set")]
    MissingSigningPublicKey,

    #[error("SIGNING_PUBLIC_KEY must be valid hex")]
    InvalidSigningPublicKeyHex(#[from] hex::FromHexError),

    #[error("SIGNING_PUBLIC_KEY must be 32 bytes")]
    InvalidSigningPublicKeyLength,

    #[error("invalid Ed25519 public key")]
    InvalidSigningPublicKey(#[from] ed25519_dalek::SignatureError),

    #[error("DATABASE_URL must be set")]
    MissingDatabaseUrl,
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        let verifying_keys: Vec<VerifyingKey> = env::var("SIGNING_PUBLIC_KEY")
            .map_err(|_| ConfigError::MissingSigningPublicKey)?
            .split(',')
            .map(|k| {
                let bytes: [u8; 32] = hex::decode(k.trim())?
                    .try_into()
                    .map_err(|_| ConfigError::InvalidSigningPublicKeyLength)?;
                VerifyingKey::from_bytes(&bytes).map_err(ConfigError::from)
            })
            .collect::<Result<Vec<_>, ConfigError>>()?;

        Ok(Self {
            database_url: env::var("DATABASE_URL").map_err(|_| ConfigError::MissingDatabaseUrl)?,
            verifying_keys,
        })
    }
}
