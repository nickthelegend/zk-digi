"use client"; // This runs in the browser only

import * as snarkjs from "snarkjs";

// Circuit files are served from /public/circuits/
const WASM_PATH = "/circuits/circuit_bn254.wasm";
const ZKEY_PATH = "/circuits/groth16_bn254_circuit_final.zkey";
const VKEY_PATH = "/circuits/groth16_bn254_verification_key.json";

export interface SnarkProof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  curve: string;
}

export interface ProofResult {
  proof: SnarkProof;
  publicSignals: string[];
  vkeyHash: string;
  locallyValid: boolean;
}

// Compute SHA-256 of any string/object (used for vkey hash)
async function sha256(data: string): Promise<string> {
  const bytes = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Service to handle client-side Zero-Knowledge proof generation and verification
 * for ZK-Digi identity proofs.
 */
export async function generateProof(
  proofType: string,
  userInput: Record<string, string | number>
): Promise<ProofResult> {
  
  // Build circuit input based on proofType
  // The circuit_bn254 is a multiplier — inputs are { a: number, b: number }
  let circuitInput: Record<string, number>;

  if (proofType === "age_verification" || proofType === "Age Verification (> 18)") {
    const currentYear = new Date().getFullYear();
    const age = currentYear - Number(userInput.birthYear);
    // age * 1 = age (public output)
    circuitInput = { a: age, b: 1 };
  } else if (proofType === "document_hash") {
    // For document hash proof: we use part of the hash as a field element
    const hashNum = BigInt("0x" + String(userInput.docHash).substring(0, 16));
    circuitInput = { a: Number(hashNum % BigInt(2**32)), b: 1 };
  } else {
    // Default: simple multiplier logic
    circuitInput = { a: 1, b: 1 };
  }

  console.log("Generating proof with type:", proofType, "inputs:", circuitInput);

  // Generate proof using snarkjs
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    circuitInput,
    WASM_PATH,
    ZKEY_PATH
  );

  // Verify locally
  const vkeyResponse = await fetch(VKEY_PATH);
  const vkey = await vkeyResponse.json();
  const locallyValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

  // Hash the vkey for metadata storage
  const vkeyHash = await sha256(JSON.stringify(vkey));

  return {
    proof: proof as SnarkProof,
    publicSignals,
    vkeyHash,
    locallyValid,
  };
}

// Export a legacy class-like structure if needed for backward compatibility, 
// though the new page logic should use the exported function.
export class ZKProofService {
  static async generateAgeProof(birthYear: number, minAge: number = 18) {
     return generateProof("age_verification", { birthYear });
  }

  static async verifyAgeProof(proof: any, publicSignals: string[]) {
    const vkeyResponse = await fetch(VKEY_PATH);
    const vkey = await vkeyResponse.json();
    return await snarkjs.groth16.verify(vkey, publicSignals, proof);
  }

  static formatProof(proof: any, publicSignals: string[]) {
    return {
      proofJson: JSON.stringify(proof),
      publicSignals: JSON.stringify(publicSignals)
    };
  }
}
