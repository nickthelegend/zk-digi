import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { ZkDocument, Proof, Consent, Activity } from "@/models";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get("address");

  if (!walletAddress) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const [documents, proofs, consents, recentActivity] = await Promise.all([
      ZkDocument.find({ walletAddress }),
      Proof.find({ walletAddress }),
      Consent.find({ walletAddress, status: "active" }),
      Activity.find({ walletAddress }).sort({ timestamp: -1 }).limit(5),
    ]);

    const verifiedProofs = proofs.filter((p) => p.status === "verified").length;

    return NextResponse.json({
      documentCount: documents.length,
      proofCount: proofs.length,
      activeConsents: consents.length,
      recentActivity,
      verifiedProofs,
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
