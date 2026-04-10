import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .collect();

    const proofs = await ctx.db
      .query("proofs")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .collect();

    const consents = await ctx.db
      .query("consents")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const recentActivity = await ctx.db
      .query("activity")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .order("desc")
      .take(5);

    const verifiedProofs = proofs.filter((p) => p.status === "verified").length;

    return {
      documentCount: documents.length,
      proofCount: proofs.length,
      activeConsents: consents.length,
      recentActivity,
      verifiedProofs,
    };
  },
});
