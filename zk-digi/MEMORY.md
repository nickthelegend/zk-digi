# ZK-Digi Implementation Memory

## Current Audit State (April 2026)

### What's FIXED ✅

| Component | Status | Notes |
|-----------|--------|-------|
| Document Hashing | ✅ Fixed | Real file hashing with SHA-256 |
| kyc_verified.circom | ✅ Added | New circuit in circuits/ |
| On-Chain Verifier | ✅ Updated | Added documentation, TODOs marked |
| age_check.circom | ✅ Fixed | Syntax errors corrected |
| Box Storage | ✅ Added | New vault contract in contracts/ |

### Before vs After

| Feature | Before | After |
|---------|--------|-------|
| Document Hashing | `docName + timestamp` | Real file SHA-256 |
| kyc_verified | ❌ Missing | ✅ Added |
| age_check | ⚠️ Syntax error | ✅ Fixed |
| Verifier | ⚠️ Mocked | ⚠️ Mocked + docs |
| Box Storage | ❌ Convex only | ✅ Algorand Box |

### Remaining Items

| Component | Status | Priority |
|------------|--------|----------|
| Real ZK Verification | ❌ Needs snarkjs-algorand integration | P1 |
| BLS12-381 Migration | ❌ Still BN254 | P2 |
| Trusted Setup | ❌ Not completed | P2 |

---

## FIX PRIORITY LIST

### P0 - Critical (DONE ✅)

1. ✅ **Document Hashing** - Fixed to use real file content
2. ✅ **kyc_verified.circom** - Circuit added

### P1 - High (In Progress/Planned)

3. ⏳ **Real On-Chain Verifier** - Needs snarkjs-algorand Groth16Bls12381Verifier
4. ⏳ **Trusted Setup** - Need to compile circuits and generate zkeys

### P2 - Medium (Tech debt)

5. ⏳ **Switch to BLS12-381** - Migration from BN254
6. ⏳ **Box Storage Integration** - Connect vault contract to frontend

---

## Key Files

- **Document Hashing**: `zk-digi/src/app/documents/page.tsx` (lines 35-100)
- **Verifier**: `zk-digi-contracts/.../smart_contracts/zk_verifier/contract.algo.ts`
- **Box Storage**: `zk-digi-contracts/.../smart_contracts/vault/contract.algo.ts`
- **age_check**: `zk-digi-contracts/.../circuits/age_check.circom`
- **kyc_verified**: `zk-digi-contracts/.../circuits/kyc_verified.circom`
- **Schema**: `zk-digi/convex/schema.ts`

---

## Dependencies

- snarkjs: ^0.7.6
- snarkjs-algorand: ^0.11.0
- @algorandfoundation/algorand-typescript
- circom: 2.1.x

---

## Implementation Notes

- BN254 currently used (works with snarkjs)
- BLS12-381 is target curve for production
- Convex handles metadata, Algorand handles on-chain verification