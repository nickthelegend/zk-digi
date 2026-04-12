import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveProof = mutation({
  args: {
    walletAddress: v.string(),
    proofType: v.string(),
    circuitName: v.string(),
    proofJson: v.string(),
    publicSignals: v.string(),
    vkeyHash: v.string(),
    sourceDocumentId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("proofs", {
      walletAddress: args.walletAddress,
      proofType: args.proofType,
      circuitName: args.circuitName,
      proofJson: args.proofJson,
      publicSignals: args.publicSignals,
      vkeyHash: args.vkeyHash,
      sourceDocumentId: args.sourceDocumentId,
      status: "generated",
      generatedAt: Date.now(),
    });

    await ctx.db.insert("activity", {
      walletAddress: args.walletAddress,
      eventType: "proof_generated",
      description: `Generated ${args.proofType} proof`,
      metadata: JSON.stringify({ proofType: args.proofType, circuitName: args.circuitName }),
      timestamp: Date.now(),
    });

    return id;
  },
});

export const updateProofStatus = mutation({
  args: {
    proofId: v.id("proofs"),
    status: v.string(),
    txId: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { proofId, ...updates } = args;
    await ctx.db.patch(proofId, updates);
  },
});

export const getProofs = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("proofs")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .order("desc")
      .collect();
  },
});

export const getProofCount = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    const proofs = await ctx.db
      .query("proofs")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .collect();
    return proofs.length;
  },
});

export const getProofByType = query({
  args: { walletAddress: v.string(), proofType: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("proofs")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .filter((q) => q.eq(q.field("proofType"), args.proofType))
      .first();
  },
});
