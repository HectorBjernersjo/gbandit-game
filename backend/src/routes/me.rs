use axum::Json;

use crate::errors::AppError;
use crate::extractors::SessionUser;

pub async fn get_me(user: SessionUser) -> Result<Json<SessionUser>, AppError> {
    Ok(Json(user))
}
