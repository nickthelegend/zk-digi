import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveProof = mutation({
  args: {
    walletAddress: v.string(),
    proofType: v.string(),
    circuitName: v.string(),
    proofJson: v.string(),
    publicSignals: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("proofs", {
      walletAddress: args.walletAddress,
      proofType: args.proofType,
      circuitName: args.circuitName,
      proofJson: args.proofJson,
      publicSignals: args.publicSignals,
      status: "generated",
      generatedAt: Date.now(),
    });
  },
});

export const updateProofStatus = mutation({
  args: {
    id: v.id("proofs"),
    status: v.string(),
    txId: v.optional(v.string()),
    appId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const patch: any = { status: args.status };
    if (args.txId) patch.txId = args.txId;
    if (args.appId) patch.appId = args.appId;
    if (args.status === "verified") patch.verifiedAt = Date.now();
    await ctx.db.patch(args.id, patch);
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
