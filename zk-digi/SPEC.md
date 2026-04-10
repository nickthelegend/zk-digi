# ZK DigiLocker — Technical Specification

> **Last Updated:** April 2026
> **Status:** In Development — Core features being implemented

## 1. System Overview

ZK DigiLocker is a multi-contract ecosystem on Algorand designed for privacy-preserving identity verification. It uses snarkjs-algorand as its cryptographic backbone.

**Current Implementation:**
- Phase 1: Frontend + Convex Metadata (Complete)
- Phase 2: ZK Circuit Development (In Progress)
- Phase 3: On-Chain Verifier (Planned)

## 2. Proof System

### Current (Phase 1.5)
- **System:** Groth16 (BN254)
- **Rationale:** Working placeholder for proof-of-concept; trusted setup already completed

### Target (Phase 2)
- **System:** Groth16 (BLS12-381)
- **Rationale:** 
  - Direct support in Algorand AVM 10
  - Optimal 128-bit security for identity data
  - Small proof size (3 G1/G2 points)
  - Low on-chain verification cost (~5-10 mAlgos)

## 3. Circuit Specifications

### age_check.circom ⏳ IN PROGRESS
- **Status:** Circuit template exists, trusted setup pending
- **Condition:** `birth_year + 18 <= current_year` (plus month/day logic)
- **Private Inputs:** `birth_year`, `birth_month`, `birth_day`
- **Public Signals:** `min_age`, `current_year`, `current_month`, `current_day`
- **Constraints:** ~500 R1CS constraints

### kyc_verified.circom ❌ NOT STARTED
- **Condition:** `VerifySig(PAN_Hash, Issuer_PK, Signature) == 1`
- **Private Inputs:** `pan_number`, `aadhaar_hash`, `issuer_sig`, `m_pk`
- **Public Signals:** `kyc_status_hash`, `issuer_pk`
- **Constraints:** ~10k+ R1CS constraints

## 4. Smart Contract Specifications

### Verifier Contract (Current)
- **Status:** Mock implementation — returns `true` for all proofs
- **Location:** `zk-digi-contracts/.../smart_contracts/zk_verifier/contract.algo.ts`

### Verifier Contract (Target)
- **Class:** `Groth16Bls12381Verifier`
- **ABI Method:** `verify(signals: PublicSignals, proof: Groth16Bls12381Proof): void`
- **Storage:** No persistent state (stateless verification logic)
- **Fees:** Verifier must be called via transaction group with added opcode budget (`OpUp`)

### Vault Storage (Planned)
- **Storage:** Uses Algorand **Box Storage** to store `Account -> Array<EncryptedDocHash>`
- **Access Control:** Only Account owner can add hashes

### Consent Manager (Planned)
- **Global State:** `AppID -> EnabledStatus`
- **Action:** RecordsConsent on-chain when ZK proof is verified

## 5. Client-Side SDK

### Current
- Basic snarkjs wrapper in `src/types/snarkjs.d.ts`

### Planned
- **`generateProof(inputs: CircuitInputs, circuit: string): ZKProof`** — Wrapper for snarkjs fullProve
- **`encodeProof(rawProof: JSONProof): Groth16Bls12381Proof`** — Format points into big-endian byte arrays
- **`buildVerifyCall(proof: ZKProof, signals: BigInt[]): AtomicTransactionComposer`** — Build ATC call with OpUp

## 6. Security Model

- **Revealed Data:** Only boolean verification result and public signals
- **Hidden Data:** User's exact DOB, ID numbers, or document contents are NEVER uploaded
- **Replay Protection:** Public signals include `nonce` or `user_address`

## 7. Algorand Constraints

- **Opcode Budget:** ~40,000 to 100,000 required for BLS12-381 pairing
- **Transaction Size:** Max 1KB per txn (proofs passed via ApplicationArgs)
- **ARC-4:** Contract methods follow ARC-4 ABI standard

## 8. Testing

- **Unit Tests:** circom-tester for constraint validation
- **Integration:** AlgoKit with Vitest for LocalNet deployment
- **E2E:** Full proof-to-verification pipeline

## 9. Error Codes

- `FAIL_SUBGROUP` — Proof point not in correct subgroup
- `FAIL_FIELD` — Public signal exceeds scalar field modulus
- `FAIL_VERIFY` — Cryptographic verification failed
- `FAIL_BUDGET` — Insufficient opcode budget for pairingCheck

## 10. Glossary

- **Fr:** Scalar field where inputs/outputs live
- **G1/G2:** Elliptic curve groups for proof points
- **OpUp:** Algorand technique to boost opcode budget
- **VKey:** Verification Key — public half of circuit parameters

## Implementation Notes

| Feature | Status | File |
|---------|--------|------|
| Frontend UI | ✅ Complete | `src/app/` |
| Wallet | ✅ Complete | `src/context/WalletContext.tsx` |
| Convex Backend | ✅ Complete | `convex/` |
| Document Hashing | ❌ Mocked | `src/app/documents/page.tsx:35` |
| age_check.circom | ⏳ Template | `circuits/age_check.circom` |
| kyc_verified.circom | ❌ Missing | — |
| On-Chain Verifier | ❌ Mocked | `contract.algo.ts` |
| Box Storage | ❌ Convex Only | `convex/schema.ts` |