# ZK DigiLocker — Privacy-First Identity on Algorand

> **Status:** In Development — Q2 2026

## What Is This?

ZK DigiLocker is a decentralized identity platform on Algorand using Zero-Knowledge Proofs (ZKP) to enable selective disclosure of identity attributes (age, KYC, enrollment, nationality) without revealing sensitive data.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Next.js Frontend (Material Design 3)        │
├─────────────────────────────────────────────┤
│  Convex Backend (Metadata & Activity Logs)   │
├─────────────────────────────────────────────┤
│  snarkjs (Client-Side Proof Generation)     │
├─────────────────────────────────────────────┤
│  Algorand (On-Chain Verification)          │
└─────────────────────────────────────────────┘
```

## Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Frontend UI** | ✅ Working | Next.js 14, dark mode dashboard |
| **Wallet Integration** | ✅ Working | Pera, Defly via @txnlab/use-wallet |
| **Convex Backend** | ✅ Working | Documents, proofs, consents, activity |
| **ZK Proof Gen** | ⚠️ Partial | BN254 placeholder circuit |
| **On-Chain Verifier** | ❌ Mocked | Returns `true` for all proofs |
| ** Circuits** | ⚠️ In Progress | age_check template exists |
| **Box Storage** | ❌ Not Started | Using Convex metadata only |

## Proof Types (Planned)

- **Age (>18):** Proves minimum age without revealing DOB
- **KYC Status:** Proves valid KYC from trusted provider
- **Enrollment:** Proves student status for institution
- **Residency:** Proves country of residence

## Quick Start

```bash
# Install dependencies
cd zk-digi
npm install

# Start Convex dev server (separate terminal)
npx convex dev

# Start frontend
npm run dev
```

## Connect Wallet

- Install Pera Wallet or Defly Wallet browser extension
- Click "Connect Wallet" in the UI
- Grant permission for address access

## Document Onboarding

1. Go to Documents page
2. Select document type (Aadhaar, PAN, Passport, etc.)
3. Enter document name
4. Click "Anchor to Vault"
5. Document metadata stored in Convex

> **Note:** Document hashing currently uses placeholder (see MEMORY.md)

## Generate Proof

```typescript
import { groth16 } from "snarkjs";

// Current BN254 placeholder
const { proof, publicSignals } = await groth16.fullProve(
  { in: 15 },
  "/circuits/circuit_bn254.wasm",
  "/circuits/groth16_bn254_circuit_final.zkey"
);
```

## Project Structure

```
zk-digi/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # Reusable UI components
│   ├── context/         # Wallet context
│   └── types/          # TypeScript definitions
├── convex/             # Convex backend
├── public/
│   └── circuits/       # ZK proof artifacts (BN254)
├── SPEC.md            # Technical specification
├── CONTEXT.md         # Technical context
└── MEMORY.md         # Implementation status
```

## Technical Details

### Current Proof System
- **System:** Groth16 (BN254)
- **Curve:** alt_bn128
- **Security:** ~100-bit

### Target Proof System (Phase 2)
- **System:** Groth16 (BLS12-381)
- **Curve:** bls12_381
- **Security:** ~128-bit

### Dependencies

- **snarkjs:** ^0.7.6 — ZK proof library
- **@txnlab/use-wallet-react:** Wallet connection
- **convex:** Backend & real-time database
- **algorand:** Blockchain interaction
- **circom:** Circuit compilation

## Roadmap

### Phase 1 (Current)
- [x] Frontend UI
- [x] Wallet integration
- [x] Convex backend
- [x] Document upload UI
- [x] Proof generation UI

### Phase 2 (Q2 2026)
- [ ] Real document hashing (SHA-256)
- [ ] age_check.circom with trusted setup
- [ ] kyc_verified.circom circuit
- [ ] Real on-chain verifier

### Phase 3 (Q3 2026)
- [ ] BLS12-381 migration
- [ ] Algorand Box Storage
- [ ] Consent manager
- [ ] App registry

## Known Issues

1. **Document hashing is mocked** — Uses `docName + timestamp` instead of real file content
2. **Verifier is mocked** — Always returns `true`, not real cryptographic verification
3. **BN254 curve** — Target is BLS12-381 per specification
4. **No Algorand Box Storage** — Metadata stored in Convex only

See [MEMORY.md](MEMORY.md) for implementation details.

## Contributing

Contributions welcome! Please see [ROADMAP.md](ROADMAP.md) for current focus areas.

## License

MIT