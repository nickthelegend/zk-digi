# ZK-Digi — Technical Context

## 1. What snarkjs-algorand Does
The `snarkjs-algorand` library is a specialized bridge that enables seamless integration between `snarkjs` (a leading Zero-Knowledge toolset) and the Algorand blockchain. It abstracts the complexities of:
- **Proof Encoding:** Properly formatting snarkjs G1/G2 points into Algorand-compatible big-endian byte arrays.
- **On-Chain Verification:** Providing TEALScript-based verifier contracts that utilize Algorand's native elliptic curve opcodes (`pairingCheck`, `scalarMul`, etc.).
- **Client Wrapping:** Offering TypeScript classes (`AppVerifier`, `LsigVerifier`) that handle the full lifecycle of proof generation, contract deployment, and on-chain verification.

## 2. Proof System Options
| Feature | Groth16 (BLS12-381) | Groth16 (BN254) | PLONK (BLS12-381) |
| :--- | :--- | :--- | :--- |
| **Security** | ~128-bit | ~100-bit | ~128-bit |
| **Proof Size** | Small (3 points) | Small (3 points) | Medium (9 points + 6 evals) |
| **Verification Speed** | Fast (Native Opcodes) | Fast (Native Opcodes) | Moderate (Logic-heavy) |
| **Setup** | Per-circuit Trusted Setup | Per-circuit Trusted Setup | Universal Setup |

**Choice for zk-Digi:** **Groth16 (BLS12-381)**. 
We choose BLS12-381 for its superior security (128-bit) and high performance on Algorand. Since our identity circuits (age, kyc) are relatively static, the per-circuit trusted setup is a one-time cost worth paying for the on-chain efficiency.

## 3. How Proof Generation Works (Client Side)
1. **Inputs:** User provides private data (e.g., DOB) and public parameters (e.g., Min Age).
2. **Witness Generation:** The `.wasm` prover calculates the satisfies assignment.
3. **Proof Generation:** `snarkjs.groth16.fullProve(inputs, wasm, zkey)` generates the proof.
   ```typescript
   const { proof, publicSignals } = await snarkjs.groth16.fullProve(
     { dob: "20000101", minAge: 18 },
     "age_check.wasm",
     "age_check_final.zkey"
   );
   ```

## 4. How Proof Encoding Works
The library uses `encodeProof()` to transform the JSON proof into a structured ABI object:
- **G1 Points (`pi_a`, `pi_c`):** 96 bytes (x || y, each 48B big-endian).
- **G2 Point (`pi_b`):** 192 bytes (x0 || x1 || y0 || y1, each 48B big-endian). 
- **Public Signals:** Vector of `uint256` field elements.

These maps directly to the `Groth16Bls12381Proof` and `PublicSignals` types in the verifier contract.

## 5. On-Chain Verifier Contract
- **Method Signature:** `verify(signals: PublicSignals, proof: Groth16Bls12381Proof): void`
- **VKey Injection:** The Verification Key is embedded during deployment using the `VERIFICATION_KEY` template variable. This allows the same base TEAL logic to be re-used for different circuits.
- **Opcode Budget:** Verifying a BLS12-381 proof requires significant opcode budget (~40k-100k). The library uses `OpUp` via inner transactions to increase the budget. Each `verify` call typically requires a fee multiplier to cover these inner transactions.

## 6. zk-Digi Circuits (Planned)

### age_check
- **Proves:** Holder is over a certain age without revealing the exact DOB.
- **Private Inputs:** `birth_year`, `birth_month`, `birth_day`.
- **Public Signals:** `min_age`, `current_year`, `current_month`, `current_day`.
- **System:** Groth16 (BLS12-381).

### kyc_verified
- **Proves:** Holder has a valid signature from a trusted KYC provider.
- **Private Inputs:** `pan_number`, `aadhaar_hash`, `issuer_sig`, `m_pk`.
- **Public Signals:** `kyc_status_hash`, `issuer_pk`.
- **System:** Groth16 (BLS12-381).

### student_status
- **Proves:** Holder is currently enrolled in a recognized institution.
- **Private Inputs:** `student_id`, `expiry_date`, `inst_sig`.
- **Public Signals:** `inst_id_hash`, `is_valid`.

### country_resident
- **Proves:** Holder resides in a specific country.
- **Private Inputs:** `address_blob`, `residency_proof_sig`.
- **Public Signals:** `country_code`.

## 7. Smart Contract Architecture for zk-Digi
1. **Verifier App:** Deployed per circuit. Evaluates the ZKP.
2. **App Registry:** A central contract that maps `CircuitName` -> `AppID`.
3. **Digi-Locker Manager:** The main logic contract that users interact with. It receives proof submissions and calls the appropriate Verifier App via an inner transaction.

## 8. Data Flow
```
[ User ] --(Private Data)--> [ Proof Gen (WASM) ]
                                    |
                                    v
[ App ] <--(Result)-- [ Verifier (TEAL) ] <--(Proof)-- [ encodedProof ]
```

## 9. Key Constants and Parameters
- **Field Modulus (Fr):** `0x73eda753...00000001`
- **G1 Size:** 96 Bytes
- **G2 Size:** 192 Bytes
- **OpUp Budget:** ~6 inner transactions for a standard BLS12-381 Groth16 verify.

## 10. Development Environment Requirements
- **Node:** v18+
- **pnpm:** v8+
- **Circom:** v2.1.0+
- **AlgoKit:** Latest (LocalNet required for testing)
- **Docker:** For running Algorand LocalNet
