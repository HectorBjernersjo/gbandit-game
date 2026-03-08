use axum::extract::{FromRef, FromRequestParts};
use axum::http::request::Parts;
use serde::Serialize;

use crate::config::Config;
use crate::errors::AppError;

/// User identity from trusted gateway headers.
/// The gateway validates the JWT and passes identity via X-Kognito-* headers.
/// The gateway's Ed25519 signature is verified first.
#[derive(Debug, Clone, Serialize)]
pub struct SessionUser {
    pub id: i64,
    pub name: String,
    pub is_anon: bool,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub prev_anon_user_ids: Vec<i64>,
}

impl<S> FromRequestParts<S> for SessionUser
where
    S: Send + Sync,
    Config: FromRef<S>,
{
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let config = Config::from_ref(state);

        // Read raw header string values (used for both signature verification and parsing)
        let user_id_str = parts
            .headers
            .get("x-kognito-user-id")
            .and_then(|v| v.to_str().ok())
            .ok_or_else(|| AppError::Unauthorized("missing or invalid X-Kognito-User-Id".into()))?;

        let user_name_str = parts
            .headers
            .get("x-kognito-user-name")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("");

        let is_anon_str = parts
            .headers
            .get("x-kognito-is-anon")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("false");

        let prev_anon_str = parts
            .headers
            .get("x-kognito-prev-anon-user-ids")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("");

        // Verify Ed25519 signature from gateway
        let sig = parts
            .headers
            .get("x-kognito-sig")
            .and_then(|v| v.to_str().ok())
            .ok_or_else(|| AppError::Unauthorized("missing X-Kognito-Sig".into()))?;

        let timestamp_str = parts
            .headers
            .get("x-kognito-timestamp")
            .and_then(|v| v.to_str().ok())
            .ok_or_else(|| AppError::Unauthorized("missing X-Kognito-Timestamp".into()))?;

        let timestamp: u64 = timestamp_str
            .parse()
            .map_err(|_| AppError::Unauthorized("invalid X-Kognito-Timestamp".into()))?;

        crate::sig::verify_timestamp(timestamp)
            .map_err(AppError::Unauthorized)?;

        let method = parts.method.as_str();
        let path_and_query = parts
            .uri
            .path_and_query()
            .map(|pq| pq.as_str())
            .unwrap_or("/");

        let canonical = crate::sig::canonical_string(
            timestamp,
            method,
            path_and_query,
            user_id_str,
            user_name_str,
            is_anon_str,
            prev_anon_str,
        );

        if !crate::sig::verify(&config.verifying_keys, &canonical, sig) {
            return Err(AppError::Unauthorized("invalid X-Kognito-Sig".into()));
        }

        // Parse typed values
        let id: i64 = user_id_str
            .parse()
            .map_err(|_| AppError::Unauthorized("invalid X-Kognito-User-Id".into()))?;

        let is_anon = is_anon_str == "true";

        let prev_anon_user_ids: Vec<i64> = if prev_anon_str.is_empty() {
            vec![]
        } else {
            prev_anon_str
                .split(',')
                .filter_map(|s| s.trim().parse().ok())
                .collect()
        };

        Ok(SessionUser {
            id,
            name: user_name_str.to_string(),
            is_anon,
            prev_anon_user_ids,
        })
    }
}
