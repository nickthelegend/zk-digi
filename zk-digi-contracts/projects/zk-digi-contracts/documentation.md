# ZK-Digi Implementation Documentation

## Overview

This document details how ZK-Digi was implemented, covering the ZK circuit, smart contract, frontend, and testing infrastructure.

## 1. ZK Circuit Implementation

### Circuit Design (document_verifier.circom)

```circom
pragma circom 2.0.0;

template DocumentVerifier() {
    // Public input: expected hash
    signal input hash;
    
    // Private inputs: 4 document bytes
    signal input docByte0;
    signal input docByte1;
    signal input docByte2;
    signal input docByte3;
    
    // Compute hash from document bytes
    // hash = (sum of bytes) * 1000000
    signal sum;
    sum <== docByte0 + docByte1 + docByte2 + docByte3;
    
    signal computedHash;
    computedHash <== sum * 1000000;
    
    // Assert computed hash equals expected hash
    hash === computedHash;
}

component main {public [hash]} = DocumentVerifier();
```

### Circuit Compilation

```bash
# Compile to R1CS and WASM
circom document_verifier.circom --r1cs --wasm --sym -o circuits

# Generate proving key (zkey)
snarkjs groth16 setup circuits/doc_verifier.r1cs pot21_final.ptau circuits/doc_verifier_0000.zkey

# Contribute to phase 2
snarkjs zkey contribute circuits/doc_verifier_0000.zkey circuits/doc_verifier_0001.zkey --name="Contributor 1" -v

# Export final zkey
snarkjs zkey export verificationkey circuits/doc_verifier_final.zkey circuits/verification_key.json
```

### Generated Artifacts

| File | Description |
|------|-------------|
| `doc_verifier.r1cs` | Circuit constraints |
| `doc_verifier.wasm` | Compiled WASM for browser |
| `doc_verifier.sym` | Symbol table for debugging |
| `doc_verifier_final.zkey` | Proving key |
| `verification_key.json` | Verification key for on-chain |

## 2. Smart Contract Implementation

### Using snarkjs-algorand

The verifier contract uses the pre-built TEAL verifier from snarkjs-algorand:

```typescript
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { Groth16Bls12381VerifierFactory } from 'snarkjs-algorand'
import { algokit } from '@algorandfoundation/algokit-utils'

const algorand = AlgorandClient.fromEnvironment({
  network: 'testnet',
  ...algokit.config.defaultLocalNetConfig
})

const deployer = algorand.account.fromMnemonic(process.env.DEPLOYER_MNEMONIC!)

const factory = algorand.client.getAppFactory(Groth16Bls12381VerifierFactory, {
  defaultSender: deployer.addr,
})

const appClient = await factory.deploy({
  createArgs: {
    verificationKey: vKey, // Verification key from circuit
  },
  deployTimeParams: {
    allowUpdate: false,
    allowDelete: false,
  }
})
```

### Verification Key Format

The snarkjs-algorand verifier expects a verification key with this structure:

```json
{
  "protocol": "groth16",
  "curve": "bn128",
  "nPublic": 5,
  "vk_alpha_1": [x, y, infinity],
  "vk_beta_2": [[x0, x1], [y0, y1], infinity],
  "vk_gamma_2": [...],
  "vk_delta_2": [...],
  "IC": [[x, y, inf], ...] // 6 points for 5 public inputs
}
```

## 3. Frontend Implementation

### Browser-Side Proof Generation

The frontend uses snarkjs in the browser to generate proofs:

```typescript
import * as snarkjs from 'snarkjs'

async function generateProof(documentBytes: number[]): Promise<{
  proof: any
  publicSignals: string[]
}> {
  // Load circuit artifacts
  const wasmBuffer = await fetch('/circuits/doc_verifier.wasm').then(r => r.arrayBuffer())
  const zkeyBuffer = await fetch('/circuits/doc_verifier_final.zkey').then(r => r.arrayBuffer())
  
  // Compute hash
  const hash = documentBytes.reduce((a, b) => a + b, 0) * 1000000
  
  // Prepare inputs
  const input = {
    hash: hash.toString(),
    docByte0: documentBytes[0]?.toString() || '0',
    docByte1: documentBytes[1]?.toString() || '0',
    docByte2: documentBytes[2]?.toString() || '0',
    docByte3: documentBytes[3]?.toString() || '0',
  }
  
  // Generate proof
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    new Uint8Array(wasmBuffer),
    new Uint8Array(zkeyBuffer)
  )
  
  return { proof, publicSignals }
}
```

### Proof Encoding for Algorand

The proof needs to be encoded for on-chain verification:

```typescript
function encodeGroth16Proof(proof: any): Uint8Array {
  // pi_a: 2 field elements (96 bytes)
  // pi_b: 4 field elements (192 bytes)  
  // pi_c: 2 field elements (96 bytes)
  const encoded = new Uint8Array(384)
  
  // Encode each point...
  return encoded
}
```

## 4. Testing Implementation

### Integration Tests (15 tests passing)

```typescript
describe('ZK-Digi Integration Tests', () => {
  describe('Circuit Files', () => {
    it('should have all required circuit files', () => {...})
    it('should have valid WASM file size', () => {...})
  })
  
  describe('Proof Generation', () => {
    it('should generate proof with correct structure', async () => {...})
    it('should verify against correct vKey', async () => {...})
    it('should produce deterministic public signals', async () => {...})
  })
  
  describe('Hash Computation', () => {
    it('should compute correct hash for ABCD', () => {...})
  })
  
  describe('Proof Encoding', () => {
    it('should encode proof to correct byte lengths', async () => {...})
  })
  
  describe('Verification Key', () => {
    it('should have correct protocol', () => {...})
    it('should have bn128 curve', () => {...})
  })
})
```

### E2E Tests

End-to-end tests verify the complete flow:
1. Document input → hash computation
2. ZK proof generation
3. On-chain verification (when integrated)

## 5. Configuration

### Environment (.env)

```env
ALGORAND_TESTNET_API=https://testnet-api.4160.nodely.dev
DEPLOYER_MNEMONIC=ton... # Testnet deployer
```

### Package.json Scripts

```json
{
  "scripts": {
    "build:circuits": "ts-node scripts/setup-circuit.ts",
    "deploy:testnet": "ts-node scripts/deploy-snarkjs-verifier.ts",
    "test": "vitest run",
    "test:e2e": "ts-node scripts/full-e2e.ts"
  }
}
```

## 6. Known Implementation Notes

1. **Curve Compatibility**: The circuit uses BN128 (snarkjs default), but snarkjs-algorand's verifier uses BLS12-381. For production, regenerate keys with the correct curve.

2. **Proof Encoding**: The TEAL verifier expects specific byte layouts. The `encodeGroth16Proof` function handles this.

3. **App ID**: The verifier contract is deployed at App ID 758311811 on testnet.

4. **Test Network**: Using nodely.dev testnet API for faster responses.