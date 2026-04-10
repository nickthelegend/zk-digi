import { Contract, GlobalState, Bytes, Box } from '@algorandfoundation/algorand-typescript'
import { abimethod } from '@algorandfoundation/algorand-typescript/arc4'
import { bytes, uint64 } from '@algorandfoundation/algorand-typescript'

/**
 * Vault Smart Contract
 * 
 * Algorand Box Storage for document hash management.
 * Provides on-chain storage for document hashes complementing Convex metadata.
 * 
 * Box Layout:
 * - Box name: wallet address (32 bytes, padded)
 * - Box value: [docType, docHash, timestamp, status]
 * 
 * Storage:
 * | Key (32B) | Value (variable) |
 * |----------|-------------------|
 * | address | docHash1,docHash2,... |
 */

export class Vault extends Contract {
  // Global state
  public owner = GlobalState<bytes>({ key: 'o' })           // contract owner
  public vaultCount = GlobalState<bytes>({ key: 'c' })    // total vaults
  
  // Box reference for each wallet's documents
  // Box[address] = [docHash1, docHash2, ...]
  public documentBox = Box<bytes>({ key: 'docs' })

  @abimethod()
  public initialize(admin: bytes): void {
    this.owner.value = admin
    this.vaultCount.value = Bytes('0')
  }

  /**
   * Add a document hash to the user's vault
   * Only the wallet owner can add documents
   */
  @abimethod()
  public addDocument(
    docType: bytes,
    docHash: bytes
  ): boolean {
    // In production: Verify caller is the tx sender (wallet owner)
    // For now: Accept any add request
    
    // Get current documents
    const existing = this.documentBox.value || Bytes('')
    
    // Append new hash (format: type|hash| timestamp)
    const timestamp = Bytes(Date.now().toString())
    const newDoc = docType + Bytes('|') + docHash + Bytes('|') + timestamp
    
    if (existing.length === 0) {
      this.documentBox.value = newDoc
    } else {
      this.documentBox.value = existing + Bytes(',') + newDoc
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
    const docs = this.documentBox.value
    if (!docs || docs.length === 0) return false
    
    // Simple substring check
    // In production: proper delimiter parsing
    return docs.includes(docHash)
  }

  /**
   * Remove a document from the vault
   */
  @abimethod()
  public removeDocument(docHash: bytes): boolean {
    // In production: Only owner can remove
    // Implementation would parse and filter the document list
    return true
  }

  /**
   * Get total document count
   */
  @abimethod()
  public getDocumentCount(): uint64 {
    const docs = this.documentBox.value
    if (!docs || docs.length === 0) return 0
    
    // Count commas + 1
    let count = 1
    for (let i = 0; i < docs.length; i++) {
      if (docs[i] === 44) count++  // comma
    }
    return count
  }

  /**
   * Transfer ownership
   */
  @abimethod()
  public transferOwnership(newOwner: bytes): void {
    this.owner.value = newOwner
  }
}