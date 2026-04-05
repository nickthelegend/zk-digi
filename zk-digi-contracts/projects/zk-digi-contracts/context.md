# ZK-Digi Context

## Project Overview

**ZK-Digi** is a zero-knowledge proof document verification system built on Algorand. It enables privacy-preserving document verification where documents can be proven valid without revealing their contents.

## Problem Statement

Traditional document verification requires exposing document contents to verify authenticity. ZK-Digi solves this by:
- Computing a hash of document bytes
- Generating a ZK proof that proves knowledge of document bytes that hash to a specific value
- Verifying the proof on-chain without revealing the document

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Frontend)                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ User Input  │───▶│ Circom WASM │───▶│ snarkjs     │      │
│  │ (doc bytes) │    │ (circuit)   │    │ (prove)     │      │
│  └─────────────┘    └─────────────┘    └──────┬──────┘      │
└───────────────────────────────────────────────│─────────────┘
                                                │
                                    Proof + Public Signals
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Algorand Testnet                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          ZK Verifier Smart Contract                 │    │
│  │          (App ID: 758311811)                        │    │
│  │          snarkjs-algorand                           │    │
│  │          Groth16Bls12381Verifier                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

- **ZK Circuit**: Circom (document_verifier.circom)
- **Proof Generation**: snarkjs (browser-side WASM)
- **On-chain Verification**: snarkjs-algorand (Groth16Bls12381Verifier)
- **Smart Contracts**: Puya/Algorand TypeScript
- **Frontend**: React + TypeScript

## Testnet Configuration

- **Network**: Algorand Testnet
- **API**: https://testnet-api.4160.nodely.dev
- **Deployer**: Configured via mnemonic in .env
- **Verifier App ID**: 758311811

## Key Discoveries

1. **Curve Compatibility**: snarkjs-algorand uses BLS12-381 curve for on-chain verification, but our circuit uses BN128 (snarkjs default). Need to ensure compatibility.

2. **snarkjs-algorand**: Provides pre-built TEAL verifier contracts using Algorand's native `pairingCheck` opcode for efficient on-chain ZK verification.

3. **Hash Function**: `hash = (sum of document bytes) * 1000000` - simple but effective for demonstration.