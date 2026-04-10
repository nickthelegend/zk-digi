# ZK-Digi — Technical Context

> **Last Updated:** April 2026

## 1. What snarkjs-algorand Does

The `snarkjs-algorand` library bridges `snarkjs` and Algorand:
- **Proof Encoding:** Formats G1/G2 points into big-endian byte arrays
- **On-Chain Verification:** TEALScript verifier contracts using native opcodes
- **Client Wrappers:** TypeScript classes for full proof lifecycle

## 2. Proof System Options

| Feature | Groth16 (BLS12-381) | Groth16 (BN254) | PLONK |
| :--- | :---: | :---: | :---: |
| **Security** | ~128-bit | ~100-bit | ~128-bit |
| **Proof Size** | 3 points | 3 points | 9+ points |
| **Verification** | Native Opcodes | Native Opcodes | Logic-heavy |
| **Setup** | Per-circuit | Per-circuit | Universal |
| **Current** | ❌ Planned | ✅ Working | ❌ No |

**Current Choice:** Groth16 (BN254) — placeholder working  
**Target Choice:** Groth16 (BLS12-381) — Phase 2 migration

## 3. How Proof Generation Works (Client)

```typescript
// Current (BN254 placeholder)
const { proof, publicSignals } = await snarkjs.groth16.fullProve(
  { dob: "20000101", minAge: 18 },
  "circuit_bn254.wasm",
  "groth16_bn254_circuit_final.zkey"
);
```

## 4. How Proof Encoding Works

- **G1 Points:** 96 bytes (x || y, big-endian)
- **G2 Point:** 192 bytes (x0 || x1 || y0 || y1)
- **Public Signals:** uint256 vector

## 5. On-Chain Verifier

**Current Status:** Mock implementation
- Located: `smart_contracts/zk_verifier/contract.algo.ts`
- Always returns `true` — not real cryptographic verification

**Target:**
- BLS12-381 Groth16 verifier using `pairingCheck` opcode
- Requires ~40k-100k opcode budget via OpUp

## 6. ZK Circuits

| Circuit | Status | Location |
|---------|--------|----------|
| age_check | ⏳ Template | `circuits/age_check.circom` |
| kyc_verified | ❌ Missing | — |
| document_verifier | ⏳ Basic | `zk-circuits/document_verifier.circom` |

### age_check (Template)
- Proves: Holder is over a minimum age
- Private: birth_year, birth_month, birth_day
- Public: min_age, current_year, etc.

### kyc_verified (Planned)
- Proves: Valid signature from KYC provider
- Private: pan_number, aadhaar_hash, issuer_sig
- Public: kyc_status_hash, issuer_pk

## 7. Contract Architecture

```
┌─────────────────────────────────────┐
│  Digi-Locker Manager (TEALScript)      │
├─────────────────────────────────────┤
│  Verifier App (ZK Verification)      │
├─────────────────────────────────────┤
│  App Registry (CircuitName → AppID)  │
├─────────────────────────────────────┤
│  Vault Storage (Box API)              │
└─────────────────────────────────────┘
```

## 8. Data Flow

```
[User Browser]
    │
    ▼ (1) Local proof generation (snarkjs)
[Encoded Proof]
    │
    ▼ (2) ATC Group → Verifier App
[Algorand On-Chain]
    │
    ▼ (3) pairingCheck (G1, G2)
[Verification Result]
    │
    ▼ (4) Consent Token minted
[External App]
```

## 9. Key Constants

- **BN254 Field Modulus:** 0x218aejj...000001
- **BLS12-381 Field Modulus:** 0x73eda753...000001
- **G1 Size:** 96 Bytes
- **G2 Size:** 192 Bytes
- **OpUp Budget:** ~6 inner txs for BLS12-381 verify

## 10. Dev Environment

- Node: v18+
- pnpm: v8+
- Circom: 2.1.0+
- AlgoKit: Latest (LocalNet)
- Docker: For LocalNet

## 11. Implementation Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| Mock document hashing | Privacy risk | P0 |
| Missing kyc_verified circuit | Can't do KYC proofs | P0 |
| Mock verifier contract | No real verification | P1 |
| BN254 (not BLS12-381) | 100-bit vs 128-bit security | P2 |
| No Box Storage | Metadata only in Convex | P2 |

## 12. Reference

- Circuit artifacts: `public/circuits/` (BN254)
- Types: `src/types/snarkjs.d.ts`
- Convex: `convex/schema.ts`