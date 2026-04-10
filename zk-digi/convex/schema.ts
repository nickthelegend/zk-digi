import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  // Stores connected wallet sessions
  wallets: defineTable({
    address: v.string(),
    connectedAt: v.number(),
    network: v.string(), // "testnet" | "localnet" | "mainnet"
  }).index("by_address", ["address"]),

  // Stores document metadata (NOT the document itself — only hash + type)
  documents: defineTable({
    walletAddress: v.string(),
    docType: v.string(),       // "aadhaar" | "pan" | "university_id" | "passport" | "custom"
    docName: v.string(),
    docHash: v.string(),       // SHA-256 of the document
    uploadedAt: v.number(),
    status: v.string(),        // "stored" | "proof_generated" | "verified"
  }).index("by_wallet", ["walletAddress"]),

  // Stores generated ZK proofs
  proofs: defineTable({
    walletAddress: v.string(),
    proofType: v.string(),     // "age_check" | "kyc_verified" | "student_status" | "country_resident"
    circuitName: v.string(),   // "circuit_bn254"
    proofJson: v.string(),     // JSON.stringify(proof)
    publicSignals: v.string(), // JSON.stringify(publicSignals)
    status: v.string(),        // "generated" | "submitted" | "verified" | "failed"
    txId: v.optional(v.string()),
    appId: v.optional(v.number()),
    generatedAt: v.number(),
    verifiedAt: v.optional(v.number()),
  }).index("by_wallet", ["walletAddress"]),

  // Consent grants — which apps can see which proof types
  consents: defineTable({
    walletAddress: v.string(),
    appName: v.string(),
    appId: v.string(),
    proofTypes: v.array(v.string()),
    grantedAt: v.number(),
    expiresAt: v.optional(v.number()),
    status: v.string(),        // "active" | "revoked"
  }).index("by_wallet", ["walletAddress"]),

  // Activity audit log
  activity: defineTable({
    walletAddress: v.string(),
    eventType: v.string(),     // "proof_generated" | "proof_verified" | "document_uploaded" | "consent_granted" | "consent_revoked" | "wallet_connected"
    description: v.string(),
    metadata: v.optional(v.string()), // JSON string for extra data
    timestamp: v.number(),
    txId: v.optional(v.string()),
  }).index("by_wallet", ["walletAddress"]),

  // App registry — verifier apps that can request proofs
  apps: defineTable({
    appName: v.string(),
    appId: v.string(),
    description: v.string(),
    requiredProofs: v.array(v.string()),
    registeredAt: v.number(),
    status: v.string(),        // "active" | "inactive"
  }),

});
