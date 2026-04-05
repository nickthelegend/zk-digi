# ZK-Digi Roadmap

## Completed ✅

### Phase 1: Circuit Development
- [x] Create Circom circuit (document_verifier.circom)
- [x] Compile circuit to WASM
- [x] Generate proving key (zkey)
- [x] Generate verification key
- [x] Verify circuit constraints

### Phase 2: Smart Contract
- [x] Create PuyaTS verifier contract
- [x] Deploy to Algorand testnet
- [x] App ID: 758311811
- [x] Configure testnet API

### Phase 3: Frontend
- [x] Create React app with proof generation
- [x] Integrate snarkjs for browser-side proving
- [x] Connect to testnet verifier

### Phase 4: Testing
- [x] Create integration tests (15 passing)
- [x] Create E2E tests
- [x] Fix test issues (variable scope)

## In Progress 🔄

### Phase 5: On-Chain Verification Integration
- [ ] Integrate snarkjs-algorand's Groth16Bls12381VerifierFactory
- [ ] Fix curve compatibility (BN128 → BLS12-381)
- [ ] Ensure proof encoding matches verifier expectations
- [ ] Run E2E tests against testnet

## Future Work 🚀

### Phase 6: Production Readiness
- [ ] Support more than 4 document bytes
- [ ] Add multiple document verification modes
- [ ] Optimize gas/byte costs
- [ ] Add more robust error handling

### Phase 7: Advanced Features
- [ ] Batch verification support
- [ ] Time-limited proofs
- [ ] Revocation lists
- [ ] Multi-document proofs

### Phase 8: Security & Auditing
- [ ] Formal verification of circuit
- [ ] Security audit of smart contract
- [ ] Penetration testing
- [ ] Bug bounty program

## Dependencies & Blockers

### Current Blocker
- **Curve Mismatch**: Our circuit uses BN128, but snarkjs-algorand verifier uses BLS12-381. Need to either:
  - Recompile circuit with BLS12-381 curve, or
  - Use a compatible verifier implementation

### Known Issues
1. snarkjs-algorand API differences (Groth16Bls12381VerifierFactory not found)
2. TypeScript version conflicts between packages
3. Proof encoding format must match TEAL verifier expectations

## Next Immediate Steps

1. Fix curve compatibility by regenerating circuit keys
2. Integrate proper snarkjs-algorand verifier factory
3. Complete E2E test against testnet
4. Document final implementation in research.md