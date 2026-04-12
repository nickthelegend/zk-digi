import * as algosdk from 'algosdk';
import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { ZkVerifierFactory } from '../smart_contracts/artifacts/zk_verifier/ZkVerifierClient';
import fs from 'fs';
import * as snarkjs from 'snarkjs';

const DEPLOYER_MNEMONIC = "tone bounce fish brass pizza supply mercy mango guard fresh furnace fold smooth tool illegal winter math target laptop tortoise castle seminar marble absent announce";
const APP_ID = 758726165;

// Helper to reorder G2 points (from snarkjs-algorand)
function reorderG2UncompressedBN254(uncompressed: Uint8Array): Uint8Array {
  const x1 = uncompressed.subarray(0, 32);
  const x0 = uncompressed.subarray(32, 64);
  const y1 = uncompressed.subarray(64, 96);
  const y0 = uncompressed.subarray(96, 128);

  const reordered = new Uint8Array(128);
  reordered.set(x0, 0);
  reordered.set(x1, 32);
  reordered.set(y0, 64);
  reordered.set(y1, 96);

  return reordered;
}

async function main() {
  console.log("=== FINAL Optimized Verification Test (TestNet) ===");
  
  const algorand = AlgorandClient.testNet();
  const account = algosdk.mnemonicToSecretKey(DEPLOYER_MNEMONIC);
  algorand.setSigner(account.addr, algosdk.makeBasicAccountTransactionSigner(account));

  // 1. Get client
  const factory = algorand.client.getTypedAppFactory(ZkVerifierFactory, {
    defaultSender: account.addr,
  });
  const appClient = factory.getAppClientById({ appId: APP_ID });

  // 2. Prepare Proof and Signals
  console.log("Loading proof artifacts...");
  const proofJson = JSON.parse(fs.readFileSync('./circuits/proof.json', 'utf8'));
  const publicJson = JSON.parse(fs.readFileSync('./circuits/public.json', 'utf8'));

  // @ts-ignore
  const curve = await snarkjs.curves.getCurveFromName("bn128");
  
  // Encode Proof points
  const encodeG1 = (p: any) => {
    for (let i = 0; i < p.length; i++) p[i] = BigInt(p[i]);
    return curve.G1.toUncompressed(curve.G1.fromObject(p));
  };
  const encodeG2 = (p: any) => {
    for (let i = 0; i < p.length; i++) {
        for (let j = 0; j < p[i].length; j++) p[i][j] = BigInt(p[i][j]);
    }
    const uncompressed = curve.G2.toUncompressed(curve.G2.fromObject(p));
    return reorderG2UncompressedBN254(uncompressed);
  };

  const proof = {
    piA: encodeG1(proofJson.pi_a),
    piB: encodeG2(proofJson.pi_b),
    piC: encodeG1(proofJson.pi_c),
  };

  const signals = publicJson.map((s: string) => BigInt(s));

  console.log("Building Balanced Multi-Call Group (15 OpUp x 15 itxns)...");
  
  const composer = appClient.newGroup();

  // Call opUp 15 times. Each adds 15*1000 = 15,000 budget.
  // 15 * 15,000 = 225,000 pooled budget.
  // Group size will be 16 (MAX).
  for (let i = 0; i < 15; i++) {
    composer.opUp({
        extraFee: (17_000).microAlgos(), 
        note: `opup-optimized-${i}-${Date.now()}`
    });
  }

  console.log("Adding verifyProof call to group...");
  composer.verifyProof({
    args: {
        proof: proof,
        publicSignals: signals
    }
  });

  try {
    const response = await composer.send();

    const result = response.returns[response.returns.length - 1];
    console.log("\n✅ TRANSACTION SUCCESSFUL!");
    console.log("Verification Return Value:", result);
    console.log("TX ID:", response.txId);
    
    if (result === true) {
        console.log("🏆 MATH VERIFIED: Real-world ZK success on Algorand Testnet!");
    } else {
        console.log("⚠️ WARNING: The contract returned false. Check VK/Proof alignment.");
    }
  } catch (err: any) {
    console.error("❌ ERROR during verification:", err.message);
    if (err.ui) console.log("Trace:", err.ui);
  }
}

main().catch(console.error);
