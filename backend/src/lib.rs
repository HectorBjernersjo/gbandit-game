pub mod auth;
pub mod config;
pub mod db;
pub mod errors;
pub mod extractors;
pub mod models;
pub mod routes;

use axum::Router;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing::get;
use sqlx::PgPool;
use tower_http::trace::TraceLayer;

use auth::{AuthVerifier, HasAuthVerifier};
use config::Config;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub config: Config,
    pub auth_verifier: AuthVerifier,
}

impl axum::extract::FromRef<AppState> for PgPool {
    fn from_ref(state: &AppState) -> Self {
        state.pool.clone()
    }
}

impl axum::extract::FromRef<AppState> for Config {
    fn from_ref(state: &AppState) -> Self {
        state.config.clone()
    }
}

impl HasAuthVerifier for AppState {
    fn auth_verifier(&self) -> &AuthVerifier {
        &self.auth_verifier
    }
}

async fn fallback() -> impl IntoResponse {
    (
        StatusCode::NOT_FOUND,
        axum::Json(serde_json::json!({ "error": "not found" })),
    )
}

pub fn app(state: AppState) -> Router {
    Router::new()
        .route("/", get(|| async { "running" }))
        .route("/api/me", get(routes::me::get_me))
        .fallback(fallback)
        .layer(TraceLayer::new_for_http())
        .route("/api/health", get(routes::health::health))
        .with_state(state)
}
