import mongoose, { Schema, Document, model, models } from "mongoose";

// Wallets Model
export interface IWallet extends Document {
  address: string;
  connectedAt: number;
  network: string;
}

const WalletSchema = new Schema<IWallet>({
  address: { type: String, required: true, unique: true },
  connectedAt: { type: Number, required: true },
  network: { type: String, required: true },
});

// Documents Model
export interface IDocument extends Document {
  walletAddress: string;
  docType: string;
  docName: string;
  docHash: string;
  fileSize?: number;
  mimeType?: string;
  storageUrl?: string; // Replaces storageId for generic MongoDB usage
  uploadedAt: number;
  status: string;
}

const DocumentSchema = new Schema<IDocument>({
  walletAddress: { type: String, required: true, index: true },
  docType: { type: String, required: true },
  docName: { type: String, required: true },
  docHash: { type: String, required: true },
  fileSize: { type: Number },
  mimeType: { type: String },
  storageUrl: { type: String },
  uploadedAt: { type: Number, required: true },
  status: { type: String, required: true },
});

// Proofs Model
export interface IProof extends Document {
  walletAddress: string;
  proofType: string;
  circuitName: string;
  proofJson: string;
  publicSignals: string;
  vkeyHash?: string;
  sourceDocumentId?: string;
  status: string;
  txId?: string;
  appId?: number;
  generatedAt: number;
  verifiedAt?: number;
}

const ProofSchema = new Schema<IProof>({
  walletAddress: { type: String, required: true, index: true },
  proofType: { type: String, required: true },
  circuitName: { type: String, required: true },
  proofJson: { type: String, required: true },
  publicSignals: { type: String, required: true },
  vkeyHash: { type: String },
  sourceDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' },
  status: { type: String, required: true },
  txId: { type: String },
  appId: { type: Number },
  generatedAt: { type: Number, required: true },
  verifiedAt: { type: Number },
});

// Consents Model
export interface IConsent extends Document {
  walletAddress: string;
  appName: string;
  appId: string;
  proofId?: string;
  proofTypes: string[];
  grantedAt: number;
  expiresAt?: number;
  status: string;
}

const ConsentSchema = new Schema<IConsent>({
  walletAddress: { type: String, required: true, index: true },
  appName: { type: String, required: true },
  appId: { type: String, required: true },
  proofId: { type: Schema.Types.ObjectId, ref: 'Proof' },
  proofTypes: [{ type: String }],
  grantedAt: { type: Number, required: true },
  expiresAt: { type: Number },
  status: { type: String, required: true },
});

// Activity Model
export interface IActivity extends Document {
  walletAddress: string;
  eventType: string;
  description: string;
  metadata?: string;
  timestamp: number;
  txId?: string;
}

const ActivitySchema = new Schema<IActivity>({
  walletAddress: { type: String, required: true, index: true },
  eventType: { type: String, required: true },
  description: { type: String, required: true },
  metadata: { type: String },
  timestamp: { type: Number, required: true },
  txId: { type: String },
});

// Export Models
export const Wallet = models.Wallet || model<IWallet>("Wallet", WalletSchema);
export const ZkDocument = models.Document || model<IDocument>("Document", DocumentSchema);
export const Proof = models.Proof || model<IProof>("Proof", ProofSchema);
export const Consent = models.Consent || model<IConsent>("Consent", ConsentSchema);
export const Activity = models.Activity || model<IActivity>("Activity", ActivitySchema);
