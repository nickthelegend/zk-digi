import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const grantConsent = mutation({
  args: {
    walletAddress: v.string(),
    appName: v.string(),
    appId: v.string(),
    proofTypes: v.array(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("consents", {
      walletAddress: args.walletAddress,
      appName: args.appName,
      appId: args.appId,
      proofTypes: args.proofTypes,
      grantedAt: Date.now(),
      expiresAt: args.expiresAt,
      status: "active",
    });
  },
});

export const revokeConsent = mutation({
  args: { id: v.id("consents") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "revoked" });
  },
});

export const getConsents = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("consents")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .filter((q) => q.eq(q.field("status"), "active"))
      .order("desc")
      .collect();
  },
});

export const getConsentCount = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    const consents = await ctx.db
      .query("consents")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    return consents.length;
  },
});
