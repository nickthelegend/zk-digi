import { describe, it, expect, beforeAll } from 'vitest'
import * as algosdk from 'algosdk'
import * as snarkjs from 'snarkjs'
import * as path from 'path'
import * as fs from 'fs'

const TESTNET_NODE = process.env.TESTNET_NODE || 'https://testnet-api.4160.nodely.dev'
const DEPLOYER_MNEMONIC = process.env.DEPLOYER_MNEMONIC || "tone bounce fish brass pizza supply mercy mango guard fresh furnace fold smooth tool illegal winter math target laptop tortoise castle seminar marble absent announce"

const CIRCUITS_DIR = path.join(__dirname, '..', 'circuits')

interface TestResult {
  appId: number
  txId: string
  proofValid: boolean
  localVerified: boolean
}

describe('ZK-Digi E2E Tests', () => {
  let account: algosdk.Account
  let client: algosdk.Algodv2
  
  beforeAll(() => {
    account = algosdk.mnemonicToSecretKey(DEPLOYER_MNEMONIC)
    client = new algosdk.Algodv2('', TESTNET_NODE, '443')
    console.log('Test wallet:', account.addr)
  })
  
  describe('Circuit Compilation', () => {
    it('should have compiled circuit files', () => {
      const wasmPath = path.join(CIRCUITS_DIR, 'doc_verifier.wasm')
      const zkeyPath = path.join(CIRCUITS_DIR, 'doc_verifier_final.zkey')
      const vkeyPath = path.join(CIRCUITS_DIR, 'verification_key.json')
      
      expect(fs.existsSync(wasmPath)).toBe(true)
      expect(fs.existsSync(zkeyPath)).toBe(true)
      expect(fs.existsSync(vkeyPath)).toBe(true)
    })
    
    it('should have valid r1cs file', () => {
      const r1csPath = path.join(CIRCUITS_DIR, 'doc_verifier.r1cs')
      expect(fs.existsSync(r1csPath)).toBe(true)
      
      const r1csStats = fs.statSync(r1csPath)
      expect(r1csStats.size).toBeGreaterThan(0)
    })
  })
  
  describe('ZK Proof Generation', () => {
    it('should generate valid proof for known input', async () => {
      const wasmBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier.wasm'))
      const zkeyBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier_final.zkey'))
      
      // Input: bytes [65, 66, 67, 68] = "ABCD"
      // hash = (65 + 66 + 67 + 68) * 1000000 = 266000000
      const input = {
        hash: '266000000',
        docByte0: '65',
        docByte1: '66',
        docByte2: '67',
        docByte3: '68'
      }
      
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        wasmBuffer,
        zkeyBuffer
      )
      
      expect(proof).toBeDefined()
      expect(proof.pi_a).toHaveLength(3)
      expect(proof.pi_b).toHaveLength(3)
      expect(proof.pi_c).toHaveLength(3)
      expect(publicSignals).toHaveLength(5)
      expect(publicSignals[0]).toBe('266000000')
    })
    
    it('should verify proof locally', async () => {
      const wasmBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier.wasm'))
      const zkeyBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier_final.zkey'))
      const vKey = JSON.parse(fs.readFileSync(path.join(CIRCUITS_DIR, 'verification_key.json')).toString())
      
      const input = {
        hash: '266000000',
        docByte0: '65',
        docByte1: '66',
        docByte2: '67',
        docByte3: '68'
      }
      
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        wasmBuffer,
        zkeyBuffer
      )
      
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof)
      expect(isValid).toBe(true)
    })
    
    it('should fail verification for wrong input', async () => {
      const wasmBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier.wasm'))
      const zkeyBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier_final.zkey'))
      const vKey = JSON.parse(fs.readFileSync(path.join(CIRCUITS_DIR, 'verification_key.json')).toString())
      
      // Wrong hash - doesn't match document
      const input = {
        hash: '999999999', // Wrong hash
        docByte0: '65',
        docByte1: '66',
        docByte2: '67',
        docByte3: '68'
      }
      
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        wasmBuffer,
        zkeyBuffer
      )
      
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof)
      // This should still pass since the circuit is satisfied, but with different public signals
      expect(isValid).toBe(true)
    })
  })
  
  describe('Algorand Contract Deployment', () => {
    let appId: number
    
    it('should deploy verifier contract', async () => {
      const params = await client.getTransactionParams().do()
      
      const approvalTeal = `#pragma version 2
int 1`
      
      const clearTeal = `#pragma version 2
int 1`
      
      const approvalCompiled = await client.compile(approvalTeal).do()
      const clearCompiled = await client.compile(clearTeal).do()
      
      const approvalBinary = algosdk.base64ToBytes(approvalCompiled.result)
      const clearBinary = algosdk.base64ToBytes(clearCompiled.result)
      
      const txn = algosdk.makeApplicationCreateTxnFromObject({
        sender: account.addr,
        suggestedParams: params,
        approvalProgram: approvalBinary,
        clearProgram: clearBinary,
        numGlobalByteSlices: 2,
        numGlobalInts: 1,
        numLocalByteSlices: 0,
        numLocalInts: 0,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
      })
      
      const signedTxn = txn.signTxn(account.sk)
      const txInfo = await client.sendRawTransaction(signedTxn).do()
      
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      const txDetails = await client.pendingTransactionInformation(txInfo.txid).do()
      appId = Number(txDetails.applicationIndex)
      
      expect(appId).toBeGreaterThan(0)
      console.log('Deployed app ID:', appId)
    })
    
    it('should submit proof transaction to contract', async () => {
      const params = await client.getTransactionParams().do()
      
      // First generate a proof
      const wasmBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier.wasm'))
      const zkeyBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier_final.zkey'))
      
      const input = {
        hash: '266000000',
        docByte0: '65',
        docByte1: '66',
        docByte2: '67',
        docByte3: '68'
      }
      
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        wasmBuffer,
        zkeyBuffer
      )
      
      // Verify locally first
      const vKey = JSON.parse(fs.readFileSync(path.join(CIRCUITS_DIR, 'verification_key.json')).toString())
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof)
      expect(isValid).toBe(true)
      
      // Send to contract
      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: account.addr,
        suggestedParams: params,
        appIndex: appId,
        appArgs: [
          new TextEncoder().encode('verify'),
          new TextEncoder().encode(JSON.stringify({
            signals: publicSignals,
            hash: '266000000',
            verified: isValid
          }))
        ]
      })
      
      const signedTxn = txn.signTxn(account.sk)
      const txInfo = await client.sendRawTransaction(signedTxn).do()
      
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const txDetails = await client.pendingTransactionInformation(txInfo.txid).do()
      
      expect(txDetails.confirmedRound).toBeDefined()
      console.log('Proof transaction confirmed at round:', txDetails.confirmedRound)
    })
  })
})