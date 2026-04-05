# ZK-Digi Specification

## Overview

ZK-Digi enables privacy-preserving document verification on Algorand using zero-knowledge proofs.

## Functionality Specification

### 1. ZK Circuit (document_verifier.circom)

**Purpose**: Verify that the prover knows document bytes that hash to a specific value.

**Inputs**:
- `hash`: The expected hash value (public input)
- `docByte0`, `docByte1`, `docByte2`, `docByte3`: Four document bytes (private inputs)

**Logic**:
1. Compute `computedHash = (docByte0 + docByte1 + docByte2 + docByte3) * 1000000`
2. Assert `computedHash == hash`

**Output**: 
- Single public output: the hash value

### 2. Smart Contract (zk_verifier)

**Purpose**: On-chain verification of ZK proofs using snarkjs-algorand.

**Features**:
- Uses `Groth16Bls12381Verifier` from snarkjs-algorand
- Implements Algorand's native `pairingCheck` opcode for efficient verification
- Accepts proof and public signals as transaction arguments

**ABI Methods**:
- `verify(proof, publicSignals)`: Verify a ZK proof

### 3. Frontend (React)

**Purpose**: Browser-side proof generation and interaction with verifier contract.

**Features**:
- Document input field (accepts up to 4 bytes)
- Computes hash from document bytes
- Generates ZK proof using snarkjs + WASM
- Calls verifier contract on testnet

## Technical Parameters

- **Circuit**: Groth16 proof system
- **Curve**: BN128 (snarkjs default)
- **Public Inputs**: 5 (1 hash + 4 doc bytes)
- **Private Inputs**: 0 (all inputs can be private)
- **Constraints**: ~10 (very lightweight)

## File Structure

```
zk-digi-contracts/
├── zk-circuits/
│   └── document_verifier.circom    # ZK circuit source
├── circuits/
│   ├── doc_verifier.wasm           # Compiled WASM
│   ├── doc_verifier.r1cs           # Circuit constraints
│   ├── doc_verifier_final.zkey     # Proving key
│   └── verification_key.json       # Verification key
├── smart_contracts/
│   └── zk_verifier/
│       └── contract.algo.ts        # PuyaTS contract
├── frontend/
│   └── src/App.tsx                 # React frontend
├── tests/
│   ├── e2e/zk-digi.spec.ts         # E2E tests
│   └── integration/zk-digi.spec.ts # Integration tests
└── scripts/
    └── full-e2e.ts                 # E2E script
```

## Acceptance Criteria

1. ✅ Circuit compiles to WASM and generates valid proving/verification keys
2. ✅ Browser can generate valid ZK proofs for known documents
3. ✅ Proofs verify correctly using snarkjs (off-chain)
4. ✅ Verifier contract deploys to testnet (App ID 758311811)
5. ✅ Integration tests pass (15/15)
6. ⏳ On-chain verification works (next step)

## Testing Strategy

- **Unit Tests**: Circuit constraint verification
- **Integration Tests**: Proof generation, encoding, verification key validation
- **E2E Tests**: Full flow from document to on-chain verification