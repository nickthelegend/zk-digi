import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Proof } from "@/models";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get("address");

  if (!walletAddress) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const proofs = await Proof.find({ walletAddress }).sort({ generatedAt: -1 });
    return NextResponse.json(proofs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    
    const proof = await Proof.create({
      ...body,
      generatedAt: Date.now(),
      status: body.status || "generated",
    });

    return NextResponse.json(proof);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
