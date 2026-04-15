import { Contract, GlobalState, Bytes, type bytes, type uint64 } from '@algorandfoundation/algorand-typescript'
import { abimethod } from '@algorandfoundation/algorand-typescript/arc4'

export class ZkConsent extends Contract {
  public owner = GlobalState<bytes>({ key: 'o' })
  public appName = GlobalState<bytes>({ key: 'a' })
  public proofType = GlobalState<bytes>({ key: 'p' })
  public isActive = GlobalState<uint64>({ key: 's' })

  @abimethod()
  public initialize(owner: bytes, appName: bytes, proofType: bytes): void {
    this.owner.value = owner
    this.appName.value = appName
    this.proofType.value = proofType
    this.isActive.value = 1
  }

  @abimethod()
  public revoke(): void {
    this.isActive.value = 0
  }
}
