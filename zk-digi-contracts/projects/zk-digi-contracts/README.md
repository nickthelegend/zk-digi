# ZK-Digi

Zero-knowledge proof document verification system on Algorand.

## Quick Start

```bash
# Install dependencies
npm install

# Build circuits
npm run build:circuits

# Deploy to testnet
npm run deploy:testnet

# Run tests
npm test
```

## Project Structure

```
zk-digi-contracts/
├── zk-circuits/         # Circom ZK circuits
├── circuits/            # Compiled circuit artifacts
├── smart_contracts/      # Algorand smart contracts
├── frontend/             # React frontend
├── tests/                # Integration & E2E tests
└── scripts/              # Deployment & utility scripts
```

## Documentation

- [Context](./context.md) - Project context and architecture
- [Specification](./spec.md) - Technical specification
- [Roadmap](./roadmap.md) - Project roadmap
- [Documentation](./documentation.md) - Implementation details
- [Research](./research.md) - Research notes and decisions

## Testnet

- **Network**: Algorand Testnet
- **API**: https://testnet-api.4160.nodely.dev
- **Verifier App**: 758311811

## Tech Stack

- Circom + snarkjs for ZK proofs
- Puya/TypeScript for smart contracts
- React + Vite for frontend
- snarkjs-algorand for on-chain verification