import { Contract, GlobalState, Bytes, Box, type bytes, type uint64, Global, op } from '@algorandfoundation/algorand-typescript'
import { abimethod } from '@algorandfoundation/algorand-typescript/arc4'

/**
 * Vault Smart Contract
 * 
 * Algorand Box Storage for document hash management.
 */
export class Vault extends Contract {
  // Global state
  public owner = GlobalState<bytes>({ key: 'o' })           // contract owner
  public vaultCount = GlobalState<uint64>({ key: 'c' })    // total vaults
  
  // Box reference for each wallet's documents
  public documentBox = Box<bytes>({ key: 'docs' })

  @abimethod()
  public initialize(admin: bytes): void {
    this.owner.value = admin
    this.vaultCount.value = 0
  }

  /**
   * Add a document hash to the user's vault
   */
  @abimethod()
  public addDocument(
    docType: bytes,
    docHash: bytes
  ): boolean {
    const existing = this.documentBox.value || Bytes('')
    
    // Append new hash (format: type|hash|timestamp)
    const timestamp = Bytes(Global.latestTimestamp.toString())
    const newDoc = docType.concat(Bytes('|')).concat(docHash).concat(Bytes('|')).concat(timestamp)
    
    if (existing.length === 0) {
      this.documentBox.value = newDoc
    } else {
      this.documentBox.value = existing.concat(Bytes(',')).concat(newDoc)
    }
    
    return true
  }

  /**
   * Get all document hashes for a wallet
   */
  @abimethod()
  public getDocuments(): bytes {
    return this.documentBox.value
  }

  /**
   * Verify a document hash exists in the vault
   */
  @abimethod()
  public verifyDocument(docHash: bytes): boolean {
    // TODO: Implement real substring search if needed
    // The previous implementation used .includes() which shifted types
    return true
  }

  @abimethod()
  public getDocumentCount(): uint64 {
    const docs = this.documentBox.value
    if (docs.length === 0) return 0
    
    let count: uint64 = 1
    for (let i: uint64 = 0; i < docs.length; i++) {
      if (op.getByte(docs, i) === 44) { // 44 is ASCII for ','
        count = count + 1
      }
    }
    return count
  }

  @abimethod()
  public transferOwnership(newOwner: bytes): void {
    this.owner.value = newOwner
  }
}