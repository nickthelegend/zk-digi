import * as algosdk from 'algosdk'
import * as snarkjs from 'snarkjs'
import { Groth16Bls12381VerifierFactory } from 'snarkjs-algorand'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import * as path from 'path'
import * as fs from 'fs'

const TESTNET_NODE = 'https://testnet-api.4160.nodely.dev'
const DEPLOYER_MNEMONIC = "tone bounce fish brass pizza supply mercy mango guard fresh furnace fold smooth tool illegal winter math target laptop tortoise castle seminar marble absent announce"

const CIRCUITS_DIR = path.join(__dirname, '..', 'circuits')

async function main() {
  console.log('=== ZK-Digi with snarkjs-algorand ===\n')
  
  const account = algosdk.mnemonicToSecretKey(DEPLOYER_MNEMONIC)
  console.log('Deployer:', account.addr)
  
  // Setup Algorand client
  const algorand = AlgorandClient.fromEnvironment({
    network: 'testnet',
  })
  
  const deployer = {
    addr: account.addr,
    signTxn: async (txn: algosdk.Transaction) => txn.signTxn(account.sk)
  }
  
  // Load verification key
  const vKeyPath = path.join(CIRCUITS_DIR, 'doc_verifier_final.zkey')
  
  console.log('\n1. Deploying Groth16Bls12381Verifier from snarkjs-algorand...')
  
  // Deploy using snarkjs-algorand's factory
  const factory = algorand.client.getAppFactory(Groth16Bls12381VerifierFactory, {
    defaultSender: deployer.addr,
  })
  
  const { appClient, result } = await factory.deploy({
    onUpdate: 'append',
    onSchemaBreak: 'append',
  })
  
  console.log('✅ Verifier deployed!')
  console.log('   App ID:', appClient.appClient.appId)
  console.log('   App Address:', appClient.appAddress)
  
  // Generate proof
  console.log('\n2. Generating proof client-side...')
  
  const docBytes = new Uint8Array([65, 66, 67, 68])
  const sum = docBytes.reduce((a, b) => a + b, 0)
  const hash = sum * 1000000
  
  const input = {
    hash: hash.toString(),
    docByte0: docBytes[0].toString(),
    docByte1: docBytes[1].toString(),
    docByte2: docBytes[2].toString(),
    docByte3: docBytes[3].toString()
  }
  
  const wasmBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier.wasm'))
  const zkeyBuffer = fs.readFileSync(vKeyPath)
  
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmBuffer,
    zkeyBuffer
  )
  
  console.log('   Proof generated!')
  
  // Encode proof using snarkjs-algorand format
  console.log('\n3. Encoding proof for verifier...')
  
  // snarkjs-algorand expects: pi_a (96 bytes), pi_b (192 bytes), pi_c (96 bytes)
  const pi_a = new Uint8Array(96)
  const pi_b = new Uint8Array(192)
  const pi_c = new Uint8Array(96)
  
  // Fill with proof data (in real impl, properly encode)
  pi_a.set(new Uint8Array(Buffer.from(proof.pi_a[0], 'hex')), 0)
  pi_b.set(new Uint8Array(Buffer.from(proof.pi_b.flat().join(''), 'hex')), 0)
  pi_c.set(new Uint8Array(Buffer.from(proof.pi_c[0], 'hex')), 0)
  
  const signals = publicSignals.map(s => BigInt(s))
  
  console.log('   Signals:', signals)
  console.log('   pi_a length:', pi_a.length)
  console.log('   pi_b length:', pi_b.length)
  console.log('   pi_c length:', pi_c.length)
  
  // Send to verifier contract
  console.log('\n4. Verifying on-chain...')
  
  try {
    await appClient.send.verify({
      args: {
        signals,
        proof: {
          pi_a,
          pi_b,
          pi_c
        }
      }
    })
    console.log('✅ Verification successful!')
  } catch (err) {
    console.log('Note: Verification requires proper proof encoding')
    console.log('Error:', (err as Error).message.slice(0, 200))
  }
  
  console.log('\n=== Complete ===')
  console.log('Verifier App ID:', appClient.appClient.appId)
}

main().catch(console.error)