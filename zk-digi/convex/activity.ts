import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logActivity = mutation({
  args: {
    walletAddress: v.string(),
    eventType: v.string(),
    description: v.string(),
    metadata: v.optional(v.string()),
    txId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activity", {
      walletAddress: args.walletAddress,
      eventType: args.eventType,
      description: args.description,
      metadata: args.metadata,
      timestamp: Date.now(),
      txId: args.txId,
    });
  },
});

export const getActivity = query({
  args: { walletAddress: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const q = ctx.db
      .query("activity")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .order("desc");
      
    if (args.limit) {
      return await q.take(args.limit);
    }
    
    return await q.collect();
  },
});
