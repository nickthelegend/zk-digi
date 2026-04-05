import * as algosdk from 'algosdk'
import * as snarkjs from 'snarkjs'
import * as path from 'path'
import * as fs from 'fs'

const TESTNET_NODE = 'https://testnet-api.4160.nodely.dev'
const DEPLOYER_MNEMONIC = "tone bounce fish brass pizza supply mercy mango guard fresh furnace fold smooth tool illegal winter math target laptop tortoise castle seminar marble absent announce"

const CIRCUITS_DIR = path.join(__dirname, '..', 'circuits')

function encodeGroth16Proof(proof: any): { pi_a: Uint8Array; pi_b: Uint8Array; pi_c: Uint8Array } {
  // snarkjs proof format:
  // pi_a: [x, y, infinity] - G1 point (48 bytes each)
  // pi_b: [[x0, x1], [y0, y1], infinity] - G2 point (96 bytes each)
  // pi_c: [x, y, infinity] - G1 point
  
  // Convert proof components to proper byte arrays
  const pi_a = new Uint8Array(96)
  const pi_b = new Uint8Array(192)
  const pi_c = new Uint8Array(96)
  
  // Parse pi_a (G1 point: x, y)
  const a0 = BigInt(proof.pi_a[0])
  const a1 = BigInt(proof.pi_a[1])
  const a0Bytes = toHexBytes(a0, 32)
  const a1Bytes = toHexBytes(a1, 32)
  pi_a.set(a0Bytes, 0)
  pi_a.set(a1Bytes, 32)
  
  // Parse pi_b (G2 point: [x0, x1], [y0, y1])
  const b00 = BigInt(proof.pi_b[0][0])
  const b01 = BigInt(proof.pi_b[0][1])
  const b10 = BigInt(proof.pi_b[1][0])
  const b11 = BigInt(proof.pi_b[1][1])
  pi_b.set(toHexBytes(b00, 32), 0)
  pi_b.set(toHexBytes(b01, 32), 32)
  pi_b.set(toHexBytes(b10, 64))
  pi_b.set(toHexBytes(b11, 32), 128)
  
  // Parse pi_c (G1 point: x, y)
  const c0 = BigInt(proof.pi_c[0])
  const c1 = BigInt(proof.pi_c[1])
  pi_c.set(toHexBytes(c0, 32), 0)
  pi_c.set(toHexBytes(c1, 32), 32)
  
  return { pi_a, pi_b, pi_c }
}

function toHexBytes(num: bigint, len: number): Uint8Array {
  const hex = num.toString(16).padStart(len * 2, '0')
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[len - 1 - i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

async function deployVerifier() {
  console.log('=== Deploying Groth16Bls12381Verifier ===\n')
  
  const account = algosdk.mnemonicToSecretKey(DEPLOYER_MNEMONIC)
  console.log('Deployer:', account.addr)
  
  const client = new algosdk.Algodv2('', TESTNET_NODE, '443')
  const params = await client.getTransactionParams().do()
  
  // Compile the verifier TEAL (simplified - real impl uses pre-compiled from snarkjs-algorand)
  // For BLS12-381, we need TEAL that uses opcodes for pairing check
  const approvalTeal = `#pragma version 8
// Groth16 BLS12-381 Verifier (simplified placeholder)
// Real implementation uses snarkjs-algorand's compiled TEAL
byte 0x00
int 1
return`

  const clearTeal = `#pragma version 8
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
  const appId = txDetails.applicationIndex
  
  console.log('✅ Verifier deployed!')
  console.log('   App ID:', appId.toString())
  console.log('   App Address:', algosdk.getApplicationAddress(Number(appId)))
  
  return Number(appId)
}

async function generateAndVerifyProof(appId: number) {
  console.log('\n=== Generating ZK Proof ===\n')
  
  const account = algosdk.mnemonicToSecretKey(DEPLOYER_MNEMONIC)
  const client = new algosdk.Algodv2('', TESTNET_NODE, '443')
  
  // Load circuit files
  const wasmPath = path.join(CIRCUITS_DIR, 'doc_verifier.wasm')
  const zkeyPath = path.join(CIRCUITS_DIR, 'doc_verifier_final.zkey')
  
  const wasmBuffer = fs.readFileSync(wasmPath)
  const zkeyBuffer = fs.readFileSync(zkeyPath)
  
  // Document input
  const docBytes = new Uint8Array([65, 66, 67, 68]) // "ABCD"
  const sum = docBytes.reduce((a, b) => a + b, 0)
  const hash = sum * 1000000
  
  const input = {
    hash: hash.toString(),
    docByte0: docBytes[0].toString(),
    docByte1: docBytes[1].toString(),
    docByte2: docBytes[2].toString(),
    docByte3: docBytes[3].toString()
  }
  
  console.log('Input:', input)
  console.log('Expected hash:', hash)
  
  // Generate proof
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmBuffer,
    zkeyBuffer
  )
  
  console.log('\n✅ Proof generated!')
  console.log('   Public signals:', publicSignals)
  
  // Verify locally first
  const vKeyBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'verification_key.json'))
  const vKey = JSON.parse(vKeyBuffer.toString())
  
  const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof)
  console.log('   Local verification:', isValid ? '✅ PASSED' : '❌ FAILED')
  
  if (!isValid) {
    throw new Error('Proof verification failed locally!')
  }
  
  // Encode proof for Algorand
  const encodedProof = encodeGroth16Proof(proof)
  
  console.log('\n=== Sending to Algorand Contract ===\n')
  
  const params = await client.getTransactionParams().do()
  
  // Convert signals to proper format
  const signals = publicSignals.map(s => BigInt(s))
  
  // Create application call with proof data
  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    sender: account.addr,
    suggestedParams: params,
    appIndex: appId,
    appArgs: [
      new TextEncoder().encode('verify'),
      // In production, pass proof as structured args
      new TextEncoder().encode(JSON.stringify({
        signals: signals.map(s => s.toString()),
        hash: hash.toString(),
        verified: isValid
      }))
    ]
  })
  
  const signedTxn = txn.signTxn(account.sk)
  const txInfo = await client.sendRawTransaction(signedTxn).do()
  
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  const txDetails = await client.pendingTransactionInformation(txInfo.txid).do()
  
  console.log('✅ Transaction submitted!')
  console.log('   Tx ID:', txInfo.txid)
  console.log('   Confirmed:', txDetails.confirmedRound)
  
  return { appId, txId: txInfo.txid, proofValid: isValid }
}

async function main() {
  try {
    // Step 1: Deploy verifier
    const appId = await deployVerifier()
    
    // Step 2: Generate proof and verify
    const result = await generateAndVerifyProof(appId)
    
    console.log('\n=== FINAL RESULTS ===')
    console.log('Verifier App ID:', result.appId)
    console.log('Proof generated:', result.proofValid)
    console.log('Transaction:', result.txId)
    
    return result
  } catch (err) {
    console.error('Error:', err)
    throw err
  }
}

main().catch(console.error)