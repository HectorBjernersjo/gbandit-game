fn main() {
    // `sqlx::migrate!()` bakes the migrations into the binary, but cargo does not
    // know a .sql file is an input to the build. Without this, a deploy that adds
    // a migration and changes no Rust reuses the cached binary, and the migration
    // never runs.
    if std::path::Path::new("migrations").is_dir() {
        println!("cargo:rerun-if-changed=migrations");
    }
}
