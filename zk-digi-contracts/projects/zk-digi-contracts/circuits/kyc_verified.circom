pragma circom 2.0.0;

include "../../../../snarkjs-algorand/circuit/node_modules/circomlib/circuits/bitify.circom";
include "../../../../snarkjs-algorand/circuit/node_modules/circomlib/circuits/switcher.circom";

// Proves that:
// 1. Holder has a valid identity document
// 2. The document was issued by a trusted provider
// 3. The document is not expired

template KycVerified() {
    // Private inputs
    signal input doc_number;       // Document identifier (e.g., hashed PAN)
    signal input expiry_date;      // Expiry timestamp
    signal input issuer_secret;    // Secret known only to issuer
    
    // Public inputs
    signal input min_expiry;      // Minimum valid expiry (e.g., now)
    signal input issuer_pubkey;   // Expected issuer public key
    signal input nonce;           // Anti-replay
    
    signal output valid;         // 1 if all checks pass

    // Check 1: Document not expired
    component notExpired = GreaterThan(64);
    notExpired.in[0] <== expiry_date;
    notExpired.in[1] <== min_expiry;

    // Check 2: Issuer is trusted (simple hash check)
    // In production: proper EdDSA/BLS signature verification
    component isTrustedIssuer = IsEqual();
    isTrustedIssuer.in[0] <== issuer_secret;
    isTrustedIssuer.in[1] <== issuer_pubkey;

    // Check 3: Document is valid (has a valid number)
    component isValidDoc = GreaterThan(64);
    isValidDoc.in[0] <== doc_number;
    isValidDoc.in[1] <== 0;

    // All checks must pass
    component check1 = AND();
    check1.a <== notExpired.out;
    check1.b <== isTrustedIssuer.out;

    component finalCheck = AND();
    finalCheck.a <== check1.out;
    finalCheck.b <== isValidDoc.out;

    valid <== finalCheck.out;
    
    // Force valid output
    valid === 1;
}

component main { public [min_expiry, issuer_pubkey, nonce] } = KycVerified();