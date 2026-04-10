import * as snarkjs from "snarkjs";

export interface ZKProofResult {
  proof: any;
  publicSignals: string[];
}

/**
 * Service to handle client-side Zero-Knowledge proof generation and verification
 * for ZK-Digi identity proofs.
 * 
 * Uses BN254 (alt_bn128) curve with pre-built circuit artifacts.
 * The circuit is a simple multiplier for demonstration.
 */
export class ZKProofService {
  private static WASM_PATH = "/circuits/circuit_bn254.wasm";
  private static ZKEY_PATH = "/circuits/groth16_bn254_circuit_final.zkey";
  private static VKEY_PATH = "/circuits/groth16_bn254_verification_key.json";

  /**
   * Generates an age-check proof (proving user is over a certain age without revealing birth year)
   * 
   * NOTE: The current circuit is a placeholder (multiplier), not actual age check.
   * The proof demonstrates the flow works - real age_check circuit needs trusted setup.
   * 
   * @param birthYear The user's birth year (private input)
   * @param minAge The minimum age to prove (e.g., 18) - public signal
   * @returns Proof and public signals
   */
  static async generateAgeProof(
    birthYear: number,
    minAge: number = 18,
    currentYear: number = new Date().getFullYear()
  ): Promise<ZKProofResult> {
    try {
      console.log("Generating age proof for birth year:", birthYear, "minAge:", minAge);
      
      // The BN254 circuit is a multiplier: input a * input b = output
      // We use this as a placeholder to demonstrate the flow
      const age = currentYear - birthYear;
      
      // For the proof to verify, a * b must equal the public output
      // We'll set a = age and b = 1 (so output = age)
      // Then the public signal is the result
      const inputs = {
        a: age.toString(),     // Private input
        b: "1"                // Public coefficient
      };

      console.log("Circuit inputs:", inputs);

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        this.WASM_PATH,
        this.ZKEY_PATH
      );

      console.log("Proof generated successfully");
      return { proof, publicSignals };
    } catch (error) {
      console.error("Error generating ZK proof:", error);
      throw new Error("Failed to generate Zero-Knowledge proof: " + (error as Error).message);
    }
  }

  /**
   * Verifies a generated proof client-side
   * 
   * @param proof The generated proof
   * @param publicSignals The public signals associated with the proof
   * @returns boolean indicating verification status
   */
  static async verifyAgeProof(proof: any, publicSignals: string[]): Promise<boolean> {
    try {
      const vkeyResponse = await fetch(this.VKEY_PATH);
      const vkey = await vkeyResponse.json();
      
      const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
      return res === true;
    } catch (error) {
      console.error("Error verifying ZK proof:", error);
      return false;
    }
  }

  /**
   * Generates a KYC proof (placeholder)
   */
  static async generateKYCProof(
    docHash: string,
    issuerPublicKey: string
  ): Promise<ZKProofResult> {
    try {
      console.log("Generating KYC proof for doc hash:", docHash.substring(0, 16) + "...");
      
      // Placeholder inputs for the multiplier circuit
      const inputs = {
        a: "1",  // doc exists (non-zero)
        b: "1"   // issuer is valid
      };

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        this.WASM_PATH,
        this.ZKEY_PATH
      );

      return { proof, publicSignals };
    } catch (error) {
      console.error("Error generating KYC proof:", error);
      throw new Error("Failed to generate KYC proof: " + (error as Error).message);
    }
  }

  /**
   * Formats proof for storage in Convex/Algorand
   */
  static formatProof(proof: any, publicSignals: string[]) {
    return {
      proofJson: JSON.stringify(proof),
      publicSignals: JSON.stringify(publicSignals)
    };
  }
}
