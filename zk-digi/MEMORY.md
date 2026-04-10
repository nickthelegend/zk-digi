# ZK-Digi Implementation Memory

## Current Audit State (April 2026)

### What's ACTUALLY Working ✅

| Component | Status | Implementation |
|-----------|--------|---------------|
| Frontend UI | Working | Next.js 14 with Material Design 3 |
| Wallet Integration | Working | @txnlab/use-wallet-react with Pera/Defly |
| Convex Backend | Working | Full schema with documents, proofs, consents, activity |
| Activity Logging | Working | Real Convex mutations |
| Document Metadata Storage | Working | Convex table storage |
| snarkjs Proof Gen | Partial | BN254 placeholder circuit works |

### What's MOCKED or MISSING ❌

| Component | Status | Issue |
|-----------|--------|-------|
| Document Hashing | **MOCKED** | Uses `docName + timestamp` instead of real file content |
| kyc_verified Circuit | **MISSING** | No circom file exists |
| age_check Circuit | **PARTIAL** | Exists but no trusted setup artifacts |
| On-Chain Verifier | **MOCKED** | Always returns `true` |
| Vault Storage (Algorand Box) | **MISSING** | Only Convex metadata |
| BLS12-381 Curves | **WRONG** | Using BN254, spec says BLS12-381 |

---

## FIX PRIORITY LIST

### P0 - Critical (Blocks functionality)

1. **Fix Document Hashing** - `zk-digi/src/app/documents/page.tsx`
   - Current: `const mockContent = `${docName}-${Date.now()}``
   - Need: Read actual file and hash with SHA-256

2. **Add kyc_verified.circom** - Create in `zk-digi-contracts/`
   - Missing circuit referenced in SPEC.md
   - Private: PAN number, Aadhaar hash, issuer sig
   - Public: kyc_status_hash, issuer_pk

### P1 - High (Core features)

3. **Fix On-Chain Verifier** - `contract.algo.ts`
   - Current: Mock returns `true`
   - Need: Real `Groth16Bls12381Verifier` integration

4. **Add age_check Trusted Setup**
   - Need: Compile `age_check.circom` to wasm
   - Need: Generate zkey with proper trusted setup
   - Need: Generate verification_key.json

### P2 - Medium (Tech debt)

5. **Switch to BLS12-381** - Update circuit artifacts
   - Current: BN254 in public/circuits/
   - Need: BLS12-381 per SPEC.md

6. **Add Algorand Box Storage**
   - Need: Implement vault contract with Box Storage

---

## Key Files Reference

- **Document hashing**: `zk-digi/src/app/documents/page.tsx:35-40`
- **Verifier contract**: `zk-digi-contracts/.../smart_contracts/zk_verifier/contract.algo.ts`
- **Circuit source**: `zk-digi-contracts/.../circuits/age_check.circom`
- **Circuit artifacts**: `zk-digi/public/circuits/` (BN254)
- **Convex schema**: `zk-digi/convex/schema.ts`

---

## Dependencies

- snarkjs: ^0.7.6
- snarkjs-algorand: ^0.11.0
- @algorandfoundation/algorand-typescript (for TEAL contracts)
- circom: 2.1.x (for circuits)

---

## Notes

- BN254 is currently used because BLS12-381 trusted setup is expensive
- Convex is used for metadata, Algorand for on-chain verification
- All zkey/wasm files should be served from public/circuits/