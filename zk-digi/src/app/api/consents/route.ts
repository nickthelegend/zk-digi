import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Consent } from "@/models";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get("address");

  if (!walletAddress) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const consents = await Consent.find({ walletAddress }).sort({ grantedAt: -1 });
    return NextResponse.json(consents);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { walletAddress, appName, appId, proofId, proofTypes } = body;

    const newConsent = await Consent.create({
      walletAddress,
      appName,
      appId,
      proofId,
      proofTypes,
      grantedAt: Date.now(),
      lastUpdated: Date.now(),
      status: "active",
    });

    return NextResponse.json(newConsent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
   // Simplified revoke
   try {
    await connectToDatabase();
    const { id } = await req.json();
    const consent = await Consent.findByIdAndUpdate(id, { status: "revoked", lastUpdated: Date.now() }, { new: true });
    return NextResponse.json(consent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
