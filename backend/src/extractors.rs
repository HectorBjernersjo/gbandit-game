use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use serde::Serialize;

use crate::auth::{AuthenticatedUser, HasAuthVerifier};
use crate::errors::AppError;

#[derive(Debug, Clone, Serialize)]
pub struct SessionUser {
    pub id: String,
    pub name: String,
    pub is_anon: bool,
}

impl<S> FromRequestParts<S> for SessionUser
where
    S: Send + Sync + HasAuthVerifier,
{
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let auth_user = AuthenticatedUser::from_request_parts(parts, state)
            .await
            .map_err(|(_, message)| AppError::Unauthorized(message))?;

        Ok(SessionUser {
            id: auth_user.claims.sub,
            name: auth_user.claims.name.unwrap_or_else(|| "Player".into()),
            is_anon: auth_user.claims.is_anon,
        })
    }
}
