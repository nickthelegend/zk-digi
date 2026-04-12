import { Contract, GlobalState, itxn, TemplateVar, Global, op, Bytes, type bytes, type uint64 } from '@algorandfoundation/algorand-typescript'
import { abimethod, decodeArc4 } from '@algorandfoundation/algorand-typescript/arc4'
import { verify, type Groth16Bn254Proof, type Groth16Bn254VerificationKey } from './groth16_bn254.algo'
import { type PublicSignals } from './bn254_common.algo'

/**
 * ZK-Verifier Smart Contract
 * 
 * Handles zero-knowledge proof verification using native Algorand AVM opcodes.
 * Integrates with snarkjs-algorand patterns for Groth16 BN254.
 */
export class ZkVerifier extends Contract {
  // Global state
  public verificationEnabled = GlobalState<uint64>({ key: 'v' })    // 1 = enabled
  public proofCount = GlobalState<uint64>({ key: 'c' })            // total proofs verified
  public circuitType = GlobalState<bytes>({ key: 't' })           // metadata: e.g. "multiplier"
  
  /**
   * Initialize the verifier
   */
  @abimethod()
  public initialize(circuit: bytes): void {
    this.verificationEnabled.value = 1
    this.proofCount.value = 0
    this.circuitType.value = circuit
  }

  /**
   * Internal helper to increase opcode budget.
   * We now make this public so the client can call it multiple times in a group
   * to "pool" a massive budget.
   */
  @abimethod()
  public opUp(): void {
    // 15 iterations is the industry standard for stable multi-call pooling
    for (let i: uint64 = 0; i < 15; i++) {
        itxn.payment({
            receiver: Global.currentApplicationAddress,
            amount: 0
        }).submit()
    }
  }

  /**
   * Get the Verification Key from Template Variable.
   * This VK is baked into the contract at compile time.
   */
  private getVerificationKey(): Groth16Bn254VerificationKey {
    const vkBytes = TemplateVar<bytes>("VERIFICATION_KEY")
    return decodeArc4<Groth16Bn254VerificationKey>(vkBytes)
  }

  /**
   * Verify a ZK proof (Groth16 BN254) using the hardcoded template VK.
   * 
   * @param proof - The Groth16 proof points (pi_a, pi_b, pi_c)
   * @param publicSignals - Public signals array
   * @returns boolean - proof validity
   */
  @abimethod()
  public verifyProof(
    proof: Groth16Bn254Proof,
    publicSignals: PublicSignals
  ): boolean {
    // 1. Check if verification is active
    if (this.verificationEnabled.value === 0) return false

    // 2. Perform real verification against BN254 curve
    // NOTE: Budget must be pooled by calling opUp() multiple times in the group.
    const isValid = verify(
        this.getVerificationKey(), 
        publicSignals, 
        proof
    )

    // 3. Record success in global state
    if (isValid) {
      this.proofCount.value = this.proofCount.value + 1
    }

    return isValid
  }

  /**
   * Dummy function to include VerificationKey type in ARC-56
   */
  @abimethod({ allowActions: 'CloseOut' })
  public _dummy(vk: Groth16Bn254VerificationKey): void {}

  /**
   * Admin: Enable or disable verification
   */
  @abimethod()
  public setVerificationEnabled(enabled: uint64): void {
    this.verificationEnabled.value = enabled
  }
}