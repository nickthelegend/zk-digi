import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveDocument = mutation({
  args: {
    walletAddress: v.string(),
    docType: v.string(),
    docName: v.string(),
    docHash: v.string(),
    storageId: v.id("_storage"),
    fileType: v.string(),
    fileSizeBytes: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("documents", {
      walletAddress: args.walletAddress,
      docType: args.docType,
      docName: args.docName,
      docHash: args.docHash,
      storageId: args.storageId,
      mimeType: args.fileType,
      fileSize: args.fileSizeBytes,
      uploadedAt: Date.now(),
      status: "stored",
    });

    // Also log to activity table
    await ctx.db.insert("activity", {
      walletAddress: args.walletAddress,
      eventType: "document_uploaded",
      description: `Uploaded ${args.docName} (${args.docType})`,
      metadata: JSON.stringify({ docName: args.docName, docType: args.docType }),
      timestamp: Date.now(),
    });

    return id;
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

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const updateDocumentStatus = mutation({
  args: { id: v.id("documents"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
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
