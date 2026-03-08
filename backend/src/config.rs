use std::env;

use ed25519_dalek::VerifyingKey;

#[derive(Clone)]
pub struct Config {
    pub database_url: String,
    /// Ed25519 public keys for verifying gateway signatures. Accepts any active key during rotation.
    pub verifying_keys: Vec<VerifyingKey>,
}

impl Config {
    pub fn from_env() -> Self {
        let verifying_keys: Vec<VerifyingKey> = env::var("SIGNING_PUBLIC_KEY")
            .expect("SIGNING_PUBLIC_KEY must be set")
            .split(',')
            .map(|k| {
                let bytes: [u8; 32] = hex::decode(k.trim())
                    .expect("SIGNING_PUBLIC_KEY must be valid hex")
                    .try_into()
                    .expect("SIGNING_PUBLIC_KEY must be 32 bytes");
                VerifyingKey::from_bytes(&bytes).expect("invalid Ed25519 public key")
            })
            .collect();

        Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            verifying_keys,
        }
    }
}
