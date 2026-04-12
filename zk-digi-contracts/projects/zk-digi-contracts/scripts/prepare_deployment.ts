import fs from 'fs';
import * as snarkjs from 'snarkjs';
import { getABIEncodedValue } from "@algorandfoundation/algokit-utils/types/app-arc56";
// @ts-ignore
import APP_SPEC from '../smart_contracts/artifacts/zk_verifier/ZkVerifier.arc56.json';

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

function stringValuesToBigints(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = BigInt(obj[key]);
    } else if (Array.isArray(obj[key])) {
      obj[key].forEach((v: any) => stringValuesToBigints(v));
    } else if (typeof obj[key] === "object") {
      stringValuesToBigints(obj[key]);
    }
  }
}

async function main() {
  console.log("Encoding Verification Key...");
  const vkeyJson = JSON.parse(fs.readFileSync('./circuits/verification_key.json', 'utf8'));
  
  // snarkjs uses "bn128" for BN254
  // @ts-ignore
  const curve = await snarkjs.curves.getCurveFromName("bn128");

  // Format G1 Points
  const IC: Uint8Array[] = [];
  for (let i = 0; i <= vkeyJson.nPublic; i++) {
    const icPoint = vkeyJson.IC[i];
    stringValuesToBigints(icPoint);
    const point = curve.G1.fromObject(icPoint);
    IC.push(curve.G1.toUncompressed(point));
  }

  stringValuesToBigints(vkeyJson.vk_alpha_1);
  const alpha1Point = curve.G1.fromObject(vkeyJson.vk_alpha_1);
  const vk_alpha_1 = curve.G1.toUncompressed(alpha1Point);

  // Format G2 Points
  const g2Points = ["vk_beta_2", "vk_gamma_2", "vk_delta_2"];
  const g2Bytes: Record<string, Uint8Array> = {};

  for (const pointName of g2Points) {
    stringValuesToBigints(vkeyJson[pointName]);
    const point = curve.G2.fromObject(vkeyJson[pointName]);
    const uncompressed = curve.G2.toUncompressed(point);
    g2Bytes[pointName] = reorderG2UncompressedBN254(uncompressed);
  }

  console.log("APP_SPEC structs:", Object.keys(APP_SPEC.structs));

  const vkStruct = {
    vk_alpha_1: vk_alpha_1,
    vk_beta_2: g2Bytes.vk_beta_2,
    vk_gamma_2: g2Bytes.vk_gamma_2,
    vk_delta_2: g2Bytes.vk_delta_2,
    nPublic: BigInt(vkeyJson.nPublic),
    IC: IC,
  };

  console.log("Encoding VK struct with ARC-56...");
  
  // ABI Encoding using ARC-56 metadata
  const vkBytes = getABIEncodedValue(
    vkStruct,
    "Groth16Bn254VerificationKey",
    // @ts-ignore
    APP_SPEC.structs
  );

  const base64Vk = Buffer.from(vkBytes).toString('base64');
  fs.writeFileSync('vk_encoded.txt', base64Vk);
  console.log("Encoded VK saved to scripts/vk_encoded.txt");
  console.log("Base64 VK (first 50 chars):", base64Vk.substring(0, 50) + "...");
}

main().catch(console.error);
