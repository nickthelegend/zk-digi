// v1.0.1 - Fixed opUp logic to use applicationCall (appl) for budget pooling
import { Contract, GlobalState, itxn, TemplateVar, Global, op, Bytes, OnCompleteAction, type bytes, type uint64 } from '@algorandfoundation/algorand-typescript'
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
   * Internal helper to increase opcode budget using inner application calls.
   * Each ITXN NoOp adds 700 units to the budget pool.
   */
  private increaseBudget(iterations: uint64): void {
    for (let i: uint64 = 0; i < iterations; i++) {
        itxn.applicationCall({
            appId: Global.currentApplicationId,
            onCompletion: OnCompleteAction.NoOp,
            fee: 0,
        }).submit()
    }
  }

  /**
   * External method to increase budget for the group.
   */
  @abimethod()
  public opUp(): void {
    this.increaseBudget(15)
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
    // 1. Manually increase budget for THIS transaction (~60 ITXNs = 42k opcodes)
    // This ensures ec_pairing_check (37.6k) has enough local budget.
    this.increaseBudget(60)

    // 2. Check if verification is active
    if (this.verificationEnabled.value === 0) return false

    // 3. Perform real verification against BN254 curve
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