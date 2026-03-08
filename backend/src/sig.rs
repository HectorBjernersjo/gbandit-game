use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use std::time::{SystemTime, UNIX_EPOCH};

const MAX_TIMESTAMP_DRIFT_SECS: u64 = 30;

/// Build the canonical string for signature verification.
///
/// Format (newline-separated):
/// `<timestamp>\n<method>\n<path_with_query>\n<user_id>\n<user_name>\n<is_anon>\n<prev_anon_user_ids>`
pub fn canonical_string(
    timestamp: u64,
    method: &str,
    path_and_query: &str,
    user_id: &str,
    user_name: &str,
    is_anon: &str,
    prev_anon_user_ids: &str,
) -> String {
    format!(
        "{}\n{}\n{}\n{}\n{}\n{}\n{}",
        timestamp, method, path_and_query, user_id, user_name, is_anon, prev_anon_user_ids
    )
}

/// Verify that the timestamp is within the allowed drift window.
pub fn verify_timestamp(timestamp: u64) -> Result<(), String> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system clock before unix epoch")
        .as_secs();

    let diff = now.abs_diff(timestamp);

    if diff > MAX_TIMESTAMP_DRIFT_SECS {
        return Err(format!(
            "request timestamp expired ({diff}s drift, max {MAX_TIMESTAMP_DRIFT_SECS}s)"
        ));
    }

    Ok(())
}

/// Verify an Ed25519 signature against any of the provided public keys.
/// Returns true if any key successfully verifies the signature.
pub fn verify(keys: &[VerifyingKey], canonical: &str, sig_hex: &str) -> bool {
    let sig_bytes = match hex::decode(sig_hex) {
        Ok(b) => b,
        Err(_) => return false,
    };

    let signature = match Signature::from_slice(&sig_bytes) {
        Ok(s) => s,
        Err(_) => return false,
    };

    for key in keys {
        if key.verify(canonical.as_bytes(), &signature).is_ok() {
            return true;
        }
    }

    false
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::{Signer, SigningKey};

    #[test]
    fn verify_valid_signature() {
        let signing_key = SigningKey::from_bytes(&[1u8; 32]);
        let verifying_key = signing_key.verifying_key();
        let canonical = canonical_string(1700000000, "GET", "/api/me", "42", "Alice", "false", "");

        let sig = signing_key.sign(canonical.as_bytes());
        let sig_hex = hex::encode(sig.to_bytes());

        assert!(verify(&[verifying_key], &canonical, &sig_hex));
    }

    #[test]
    fn verify_wrong_key_fails() {
        let signing_key = SigningKey::from_bytes(&[1u8; 32]);
        let wrong_key = SigningKey::from_bytes(&[2u8; 32]);
        let canonical = canonical_string(1700000000, "GET", "/api/me", "42", "Alice", "false", "");

        let sig = signing_key.sign(canonical.as_bytes());
        let sig_hex = hex::encode(sig.to_bytes());

        assert!(!verify(&[wrong_key.verifying_key()], &canonical, &sig_hex));
    }

    #[test]
    fn verify_multiple_keys_rotation() {
        let old_key = SigningKey::from_bytes(&[1u8; 32]);
        let new_key = SigningKey::from_bytes(&[2u8; 32]);
        let canonical = canonical_string(1700000000, "GET", "/api/me", "42", "Alice", "false", "");

        // Sign with old key
        let sig = old_key.sign(canonical.as_bytes());
        let sig_hex = hex::encode(sig.to_bytes());

        // Verify with [new, old] — should pass because old is still active
        assert!(verify(
            &[new_key.verifying_key(), old_key.verifying_key()],
            &canonical,
            &sig_hex
        ));
    }

    #[test]
    fn verify_timestamp_within_window() {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        assert!(verify_timestamp(now).is_ok());
        assert!(verify_timestamp(now - 15).is_ok());
        assert!(verify_timestamp(now + 15).is_ok());
    }

    #[test]
    fn verify_timestamp_outside_window() {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        assert!(verify_timestamp(now - 60).is_err());
        assert!(verify_timestamp(now + 60).is_err());
    }
}
