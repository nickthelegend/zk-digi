# ZK DigiLocker — Privacy-First Identity on Algorand

## What Is This?
ZK DigiLocker is a decentralized identity and electronic locker platform built on Algorand. It utilizes Zero-Knowledge Proofs (ZKP) to enable users to selectively disclose their identity attributes (like age, KYC status, student enrollment, and nationality) without revealing any underlying sensitive data or document copies.

## How It Works
The platform separates the **Proof of Identity** from the **Data Storage**.
1. **User Side:** Holder generates a ZKP locally in their browser using `snarkjs` and the `zk-digi` SDK.
2. **On-Chain:** The proof is submitted to an Algorand smart contract verifier.
3. **Verifier App:** The verifier (implemented in TEALScript via `snarkjs-algorand`) cryptographically confirms the proof is valid against a registered public key from a trusted source.
4. **Consent:** If valid, the verifier app issues a "Consent Token" that external applications can use to satisfy requirements (e.g., "Must be 18+").

### Architecture Diagram
```
[ Holder / Browser ]
  |-- (1) Generate Proof (snarkjs)
  |-- (2) Encode (zk-digi-sdk)
  v
[ Algorand Smart Contract (Verifier) ]
  |-- (3) OpUp for Opcode Budget
  |-- (4) pairingCheck(G1, G2)
  |-- (5) Boolean (Pass/Fail)
  v
[ Verifier App / DApp ]
  |-- (6) Satisfy Business Logic
```

## Proof Types Supported
- **Age (>18):** Proves minimum age without revealing DOB.
- **KYC Status:** Proves a valid KYC process was completed.
- **Enrollment:** Proves student status for a given academic year.
- **Residency:** Proves country of residence for regulatory compliance.

## Quick Start

### Prerequisites
- Node.js v18+
- [AlgoKit](https://github.com/algorandfoundation/algokit-cli)
- [Circom](https://docs.circom.io/getting-started/installation/)
- [snarkjs](https://github.com/iden3/snarkjs)

### Install
```bash
cd zk-digi
npm install
```

### Run LocalNet
```bash
algokit localnet start
```

### Generate a Proof (Example with Age Circuit)
```bash
# Setup circuit (one-time)
snarkjs groth16 setup age_check.r1cs pot12_final.ptau age_check_0000.zkey
# Generate proof
snarkjs groth16 fullProve input.json age_check_js/age_check.wasm age_check_final.zkey proof.json public.json
```

### Deploy Verifier
```typescript
import { Groth16Bls12381AppVerifier } from "snarkjs-algorand";
const verifier = new Groth16Bls12381AppVerifier({
  algorand,
  zKey: "age_check_final.zkey",
  wasmProver: "age_check.wasm"
});
await verifier.deploy({ defaultSender });
```

### Verify Proof On-Chain
```typescript
const result = await verifier.callVerify({ birthYear: 2000, currentYear: 2024 });
console.log("Verified:", result);
```

## Project Structure
- `circuits/`: `.circom` source files for ZK circuits.
- `contracts/`: TEALScript smart contracts for verification and registry.
- `sdk/`: Client-side library for proof generation and encoding.
- `tests/`: Integration tests using AlgoKit and LocalNet.

## ZK Proof Flow
The project relies on the **Groth16 (BLS12-381)** proof system for its optimal balance of proof size and verification speed on the Algorand blockchain.

## Contributing
We welcome contributions to circuit design and contract optimization! Please see our [ROADMAP.md](ROADMAP.md) for current focus areas.

## License
MIT
