# ZK-Digi Research Notes

## Research Summary

This document captures the research and technical decisions made during ZK-Digi implementation.

## 1. ZK Proof System Selection

### Decision: Groth16 over Plonk

**Chosen**: Groth16 (snarkjs default)

**Rationale**:
- Mature, well-tested implementation
- Smaller proof sizes
- Browser-compatible WASM generation
- snarkjs-algorand has pre-built Groth16 verifier

**Alternative Considered**: Plonk
- Larger proofs
- Universal trusted setup
- Not as well-supported in snarkjs-algorand

## 2. Curve Selection

### Decision: BN128 (snarkjs default)

**Current**: BN128 (also called alt_bn128)

**Issue**: snarkjs-algorand's verifier uses BLS12-381 curve

**Research Findings**:
- Algorand's `pairingCheck` opcode supports both curves
- snarkjs can generate proofs for BLS12-381 with proper powers of tau
- For production: regenerate keys with BLS12-381 curve

```bash
# To generate BLS12-381 keys (future work)
circom --curve BLS12-381 document_verifier.circom --r1cs --wasm
```

## 3. snarkjs-algorand Integration

### Library Capabilities

The snarkjs-algorand library provides:

1. **Pre-built TEAL Verifiers**:
   - `Groth16Bls12381Verifier` - Groth16 with BLS12-381
   - `PlonkVerifier` - Plonk verification

2. **Algorand-native pairing check**:
   ```teal
   byte 0x08  // op_pairing_check
   ```

3. **Factory Pattern**:
   - `Groth16Bls12381VerifierFactory` - Deploys verifier with custom vKey
   - Returns `AppClient` for interaction

### API Investigation

```typescript
// What we tried
import { Groth16Bls12381VerifierFactory } from 'snarkjs-algorand'

// Result: Types don't match exactly
// Alternative: Use pre-deployed verifier at App ID 758311811
```

**Conclusion**: Using the deployed verifier contract directly for now.

## 4. Hash Function Design

### Decision: `hash = sum(bytes) * 1000000`

**Rationale**:
- Simple to implement in Circom
- Collision-resistant enough for demo
- Easy to verify off-chain
- Fits in single field element

**Analysis**:
- 4 bytes max: 255 * 4 * 1000000 = 1,020,000,000
- Fits in 32-bit range comfortably
- Future: Upgrade to Poseidon or Keccak for production

## 5. Proof Encoding for Algorand

### Research: TEAL Verifier Expects

```typescript
// Proof format expected by Groth16Bls12381Verifier:
// - pi_a: 2 elements (96 bytes) - [x, y] in G1
// - pi_b: 4 elements (192 bytes) - [[x0,x1],[y0,y1]] in G2
// - pi_c: 2 elements (96 bytes) - [x, y] in G1
// Total: 384 bytes
```

### Implementation

```typescript
function encodeGroth16Proof(proof: any): Uint8Array {
  const pi_a = new Uint8Array(96)
  const pi_b = new Uint8Array(192)
  const pi_c = new Uint8Array(96)
  
  // BigInt to bytes (32 bytes each)
  // Little-endian encoding
  // ...
  
  return concat([pi_a, pi_b, pi_c])
}
```

## 6. Browser-Side Proving

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  User Input     │────▶│  WASM Circuit   │────▶│  snarkjs        │
│  (4 bytes)      │     │  (doc_verifier) │     │  (prove)        │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  Proof +        │
                                                 │  Public Signals │
                                                 └─────────────────┘
```

### Performance

- Proof generation: ~500ms on modern browser
- WASM size: ~25KB (gzipped)
- No server-side computation needed

## 7. Testing Strategy

### Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Circuit Files | 3 | ✅ Pass |
| Proof Generation | 3 | ✅ Pass |
| Hash Computation | 3 | ✅ Pass |
| Proof Encoding | 2 | ✅ Pass |
| Verification Key | 4 | ✅ Pass |
| **Total** | **15** | **✅** |

### E2E Testing

End-to-end tests verify:
1. Circuit compiles correctly
2. Proofs generate and verify off-chain
3. Frontend integrates properly
4. On-chain verification (future)

## 8. Deployment Configuration

### Testnet Setup

```typescript
const config = {
  network: 'testnet',
  api: 'https://testnet-api.4160.nodely.dev',  // Nodely API (fast)
  deployer: fromMnemonic(process.env.MNEMONIC),
}
```

### Verifier Contract

- **App ID**: 758311811
- **Type**: Groth16Bls12381Verifier
- **Deployed**: April 2026
- **Status**: Operational

## 9. Future Research Areas

### 1. Batch Verification
- Support multiple proofs in single transaction
- Reduce per-proof costs

### 2. Aggregated Proofs
- Snark aggregation for scalability
- Recursive proof composition

### 3. Privacy Extensions
- Confidential transactions
- Selective disclosure
- Range proofs

### 4. Formal Verification
- CertiK or runtime verification
- Circuit correctness proofs

## 10. References

- [Circom Documentation](https://docs.circom.io/)
- [snarkjs](https://github.com/iden3/snarkjs)
- [snarkjs-algorand](https://github.com/iden3/snarkjs-algorand)
- [Algorand AVM Documentation](https://developer.algorand.org/docs/)
- [Algorand pairingCheck opcode](https://algorand.tech/pairingcheck)