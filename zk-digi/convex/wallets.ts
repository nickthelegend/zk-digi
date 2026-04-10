import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const connectWallet = mutation({
  args: { address: v.string(), network: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("wallets")
      .withIndex("by_address", q => q.eq("address", args.address))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, { connectedAt: Date.now() });
      return existing._id;
    }

    return await ctx.db.insert("wallets", {
      address: args.address,
      connectedAt: Date.now(),
      network: args.network,
    });
  },
});

export const getWallet = query({
  args: { address: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wallets")
      .withIndex("by_address", q => q.eq("address", args.address))
      .first();
  },
});
