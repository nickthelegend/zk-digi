import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Wallet } from "@/models";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { address, network } = await req.json();
    
    const wallet = await Wallet.findOneAndUpdate(
      { address },
      { address, network, connectedAt: Date.now() },
      { upsert: true, new: true }
    );

    return NextResponse.json(wallet);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
