# ZK-Digi Real End-to-End Verification Report

## Timestamp
2026-04-05T21:26:15.423Z

## Results

| Phase | Status | Details |
|-------|--------|---------|
| Artifact Validation | ✅ PASS | All artifacts valid |
| Proof Generation | ✅ PASS | Generated proof with 5 signals |
| Local Verification | ✅ PASS | snarkjs verification passed |
| Verifier Deployment | ✅ PASS | App ID: 758352227, TX: ASLH7MN56M6J5X2KKC6MIMB4JF6CM3XHDDWXEAP6JSMXFIMZY76A |
| Valid Proof Verification | ✅ PASS | TX: NPT4GVXM2IQ3OGULGZSQRHQNPUEYAZJTQ3NOVEHONG6ANFRGV5ZA |
| Invalid Proof Rejection | ✅ PASS | Invalid proof correctly rejected |

## Verified Document
- Input: [65, 66, 67, 68] (ASCII: "ABCD")
- Hash: 266000000

## Deployed Contract
- App ID: 758352227
- Type: Groth16Bn254SignalsAndProof (snarkjs-algorand)
- Network: Algorand Testnet
- Explorer: https://testnet.explorer.perawallet.app/application/758352227

## Proof Encoding
- piA: 64 bytes (G1 point)
- piB: 128 bytes (G2 point)
- piC: 64 bytes (G1 point)

## Notes
- Uses Algorand Testnet (nodely)
- SignalsAndProof contract validates proof encoding correctly
- No mocks - real on-chain verification working!
