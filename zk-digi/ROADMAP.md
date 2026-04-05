# ZK DigiLocker — Roadmap

## Phase 0 — Foundation (Current)
Initial integration with the `snarkjs-algorand` library and study of the Algorand AVM 10+ ZK capabilities.
- [x] snarkjs-algorand integration study
- [x] Initial documentation (README, CONTEXT, SPEC)
- [ ] Circuit design for age, KYC, student, country proofs
- [ ] Trusted setup for each circuit (LocalNet only)
- [ ] Preliminary Verifier contract deployment on Algorand LocalNet

## Phase 1 — Core Protocol
Focus on the primary identity proof: Age Check.
- [ ] age_check circuit (circom)
- [ ] age_check verifier contract (TEALScript via snarkjs-algorand)
- [ ] Proof generation script (TypeScript, client-side SDK)
- [ ] End-to-end test: generate proof → verify on Algorand LocalNet
- [ ] Testnet deployment for age_check

## Phase 2 — Vault & Consent Manager
Building the business logic layer for identity sharing.
- [ ] Document vault contract (stores encrypted document hashes using Algorand Box storage)
- [ ] Consent manager contract (tracks which apps have access to which proofs)
- [ ] App registry (verifier apps register their proof requirements for easy discovery)
- [ ] Activity audit log (on-chain event emission for granular transparency)
- [ ] Holder frontend (basic React UI for managing proofs)

## Phase 3 — Multi-Circuit Support
Expanding the identity suite.
- [ ] kyc_verified circuit (signature verification over field elements)
- [ ] student_status circuit (validating enrollment status)
- [ ] country_resident circuit (geo-fencing and compliance)
- [ ] Batch proof verification (using inner transactions to verify multiple claims)

## Phase 4 — Integration & Ecosystem
- [ ] SDK for verifier apps (npm package) to easily request proofs from the zk-digi locker
- [ ] zk-digi frontend integration (full dashboard for identity holders)
- [ ] Testnet public deployment (stable identity registry)
- [ ] Security audit (CIRCOM constraints and TEAL logic)

## Phase 5 — Mainnet
- [ ] Final trusted setup (multi-party ceremony for production circuits)
- [ ] Mainnet deployment on Algorand
- [ ] DigiLocker API integration (connecting with real-world identity providers)
- [ ] Partnerships with DeFi and RWA protocols for ZK-KYC
