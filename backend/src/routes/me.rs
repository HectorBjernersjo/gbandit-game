use axum::Json;
use serde::Serialize;

use crate::auth::AuthenticatedUser;

#[derive(Debug, Serialize)]
pub struct MeResponse {
    pub id: String,
    pub name: String,
    pub is_anon: bool,
}

pub async fn get_me(user: AuthenticatedUser) -> Json<MeResponse> {
    Json(MeResponse {
        id: user.id().to_string(),
        name: user.name().to_string(),
        is_anon: user.is_anon(),
    })
}
