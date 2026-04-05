# ZK DigiLocker — Technical Specification

## 1. System Overview
ZK DigiLocker is a multi-contract ecosystem on Algorand designed for privacy-preserving identity verification. It uses snarkjs-algorand as its cryptographic backbone.

## 2. Proof System Selection & Rationale
- **System:** Groth16 (BLS12-381)
- **Rationale:** 
  - Direct support in Algorand AVM 10.
  - Optimal 128-bit security for identity data.
  - Small proof size (3 G1/G2 points).
  - Low on-chain verification cost (~5-10 mAlgos).

## 3. Circuit Specifications

### age_check.circom
- **Condition:** `birth_year + 18 <= current_year` (plus month/day logic).
- **Private Inputs:** `birth_year`, `birth_month`, `birth_day`.
- **Public Signals:** `min_age`, `current_year`, `current_month`, `current_day`.
- **Constraints:** ~500 R1CS constraints.

### kyc_verified.circom
- **Condition:** `VerifySig(PAN_Hash, Issuer_PK, Signature) == 1`.
- **Private Inputs:** `pan_number`, `aadhaar_hash`, `issuer_sig`, `m_pk`.
- **Public Signals:** `kyc_status_hash`, `issuer_pk`.
- **Constraints:** ~10k+ R1CS constraints (due to hash/signature logic).

## 4. Smart Contract Specifications

### Verifier Contracts
- **Class:** `Groth16Bls12381Verifier`
- **ABI Method:** `verify(signals: PublicSignals, proof: Groth16Bls12381Proof): void`
- **Storage:** No persistent state (stateless verification logic).
- **Fees:** Verifier must be called via an transaction group with added opcode budget (`OpUp`). Each verification app call requires ~0.005 - 0.01 ALGO fee for inner transactions.

### Vault Contract
- **Storage:** Uses **Box Storage** to store `Account -> Array<EncryptedDocHash>`.
- **Access Control:** Only the Account owner can add hashes. Reading is permitted only with valid ZK proof validation.

### Consent Manager
- **Global State:** `AppID -> EnabledStatus`.
- **Action:** Records a `ConsentRecord` on-chain (as an event/log) whenever a ZK proof is verified for a specific app.

## 5. Client-Side SDK Specification
- **`generateProof(inputs: CircuitInputs, circuit: string): ZKProof`**: High-level wrapper for snarkjs `fullProve`.
- **`encodeProof(rawProof: JSONProof): Groth16Bls12381Proof`**: Library call to format points into big-endian byte arrays.
- **`buildVerifyCall(proof: ZKProof, signals: BigInt[]): AtomicTransactionComposer`**: Helper to build the Algorand ATC call with necessary `OpUp` budget.

## 6. Security Model
- **Revealed Data:** Only the boolean verification result and specific public signals (e.g., `min_age`) are visible.
- **Hidden Data:** The prover's exact DOB, ID numbers, or document contents are NEVER uploaded or revealed.
- **Replay Protection:** Public signals should include a `nonce` or `user_address` to prevent re-using a proof generated for one user by another.

## 7. Algorand-Specific Constraints
- **Opcode Budget:** ~40,000 to 100,000 budget required for BLS12-381 pairing verification.
- **Transaction Size:** Restricted to 1 KB per txn, so proofs and public inputs are passed via `ApplicationArgs`.
- **ARC-4:** All contract methods MUST follow the ARC-4 ABI standard.

## 8. Testing Strategy
- **Unit Tests:** `circom-tester` for constraint validation.
- **Integration Tests:** `AlgoKit` with `vitest` for LocalNet contract deployment and verification.
- **Stress Tests:** Verifying opcode budget limits via simulation before sending mainnet transactions.

## 9. Error Codes & Failure Modes
- `FAIL_SUBGROUP`: Proof point not in correct G1/G2 subgroup.
- `FAIL_FIELD`: Public signal exceeds scalar field modulus Fr.
- `FAIL_VERIFY`: Cryptographic verification equation did not balance.
- `FAIL_BUDGET`: Insufficient opcode budget for the `pairingCheck`.

## 10. Glossary
- **Fr:** The scalar field where inputs and outputs live.
- **G1/G2:** Elliptic curve groups where commitments (parts of the proof) live.
- **OpUp:** Algorand technique to boost opcode budget by calling a dummy app or generating inner transactions.
- **VKey:** Verification Key—the "public" half of the circuit parameters required for on-chain verification.
