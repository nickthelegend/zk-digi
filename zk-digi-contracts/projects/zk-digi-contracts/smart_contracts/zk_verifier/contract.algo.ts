import { Contract, GlobalState, Bytes } from '@algorandfoundation/algorand-typescript'
import { abimethod } from '@algorandfoundation/algorand-typescript/arc4'
import { bytes } from '@algorandfoundation/algorand-typescript'

export class ZkVerifier extends Contract {
  public verificationEnabled = GlobalState<bytes>({ key: 'verification_enabled' })
  public verifierAddress = GlobalState<bytes>({ key: 'verifier_address' })
  public proofCount = GlobalState<bytes>({ key: 'proof_count' })

  @abimethod()
  public initialize(admin: bytes): void {
    this.verificationEnabled.value = Bytes('1')
    this.verifierAddress.value = admin
    this.proofCount.value = Bytes('0')
  }

  @abimethod()
  public verifyProof(
    proofA: bytes,
    proofB: bytes,
    proofC: bytes,
    publicInputsHash: bytes,
    documentHash: bytes
  ): boolean {
    return true
  }

  @abimethod()
  public verifyDocument(documentHash: bytes): boolean {
    return true
  }

  @abimethod()
  public getProofCount(): bytes {
    return this.proofCount.value
  }

  @abimethod()
  public setVerificationEnabled(enabled: bytes): void {
    this.verificationEnabled.value = enabled
  }

  @abimethod()
  public updateVerifier(newVerifier: bytes): void {
    this.verifierAddress.value = newVerifier
  }
}