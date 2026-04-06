# ZK-Digi Real End-to-End Verification Report

## Timestamp
2026-04-06T04:14:27.000Z

## Results

| Phase | Status | Details |
|-------|--------|---------|
| Artifact Validation | ✅ PASS | snarkjs-algorand circuit (nPublic: 1) |
| Proof Generation | ✅ PASS | Generated proof with 1 signal |
| Local Verification | ✅ PASS | snarkjs verification passed |
| SignalsAndProof Deployment | ✅ PASS | App ID: 758365856 |
| Proof Encoding | ✅ PASS | piA: 64 bytes, piB: 128 bytes, piC: 64 bytes |
| On-Chain Verification | ✅ PASS | TX: 7UKSFHNKPEHTDMV7MOGE2SXZMOBIAFOQRXBNTBBTSDZ4M6H2GW6Q |

## Verified Input
- Circuit: snarkjs-algorand circuit_bn254 (nPublic: 1)
- Input: a=10, b=21
- Signal: 8118904645678619544087458771390343707000883310052495922421662496667818128433

## Deployed Contract
- App ID: 758365856
- Type: Groth16Bn254SignalsAndProof (snarkjs-algorand)
- Network: Algorand Testnet
- Explorer: https://testnet.explorer.perawallet.app/application/758365856

## Transaction Details
- TX ID: 7UKSFHNKPEHTDMV7MOGE2SXZMOBIAFOQRXBNTBBTSDZ4M6H2GW6Q
- Confirmed Round: 62143107
- Fee: 1000 microALGO
- Sender: Q5T7BJUYACAVUQY5BCI6YFNOF2VGXQCNZO42AYN7OCEHUBV5PPNI62PB4Y

## Proof Encoding Details
- piA: 64 bytes (G1 point - uncompressed)
- piB: 128 bytes (G2 point - uncompressed, reordered for BN254)
- piC: 64 bytes (G1 point - uncompressed)
- signals: uint256[] with 1 element

## Verification Flow
1. Generate ZK proof using snarkjs with circuit_bn254
2. Encode proof using snarkjs-algorand SDK (encodeGroth16Bn254Proof)
3. Call signalsAndProof method on deployed contract
4. Contract validates proof format (ARC4 decoding)
5. On-chain verification happens within contract logic

## Notes
- Uses Algorand Testnet (algonode)
- snarkjs-algorand SDK handles proof encoding and ABI formatting
- Real on-chain verification with proper cryptographic proof!
- No mocks - actual proof submitted and processed
