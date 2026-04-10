import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const uploadDocument = mutation({
  args: {
    walletAddress: v.string(),
    docType: v.string(),
    docName: v.string(),
    docHash: v.string(),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      walletAddress: args.walletAddress,
      docType: args.docType,
      docName: args.docName,
      docHash: args.docHash,
fileSize: args.fileSize ?? undefined,
    mimeType: args.mimeType ?? undefined,
      uploadedAt: Date.now(),
      status: "stored",
    });
  },
});

export const getDocuments = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .order("desc")
      .collect();
  },
});

export const getDocumentCount = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .collect();
    return docs.length;
  },
});

export const updateDocumentStatus = mutation({
  args: { id: v.id("documents"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
