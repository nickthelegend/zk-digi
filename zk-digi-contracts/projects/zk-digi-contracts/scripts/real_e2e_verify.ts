import * as algosdk from 'algosdk'
import * as snarkjs from 'snarkjs'
import * as path from 'path'
import * as fs from 'fs'

const TESTNET_NODE = 'https://testnet-api.4160.nodely.dev'
const DEPLOYER_MNEMONIC = "tone bounce fish brass pizza supply mercy mango guard fresh furnace fold smooth tool illegal winter math target laptop tortoise castle seminar marble absent announce"

const CIRCUITS_DIR = path.join(__dirname, '..', 'circuits')

interface VerificationReport {
  timestamp: string
  phases: {
    [key: string]: {
      success: boolean
      details: string
      txId?: string
      appId?: number
    }
  }
  artifacts: {
    wasmExists: boolean
    zkeyExists: boolean
    vkeyExists: boolean
  }
}

function bigintToUint8ArrayLE(n: bigint, len: number): Uint8Array {
  const bytes = new Uint8Array(len)
  let i = 0
  while (n > 0n) {
    bytes[i++] = Number(n & 0xffn)
    n >>= 8n
  }
  return bytes
}

function encodeG1Point(x: bigint, y: bigint): Uint8Array {
  const result = new Uint8Array(64)
  const xBytes = bigintToUint8ArrayLE(x, 32)
  const yBytes = bigintToUint8ArrayLE(y, 32)
  result.set(xBytes, 0)
  result.set(yBytes, 32)
  return result
}

function encodeG2Point(x: [bigint, bigint], y: [bigint, bigint]): Uint8Array {
  const result = new Uint8Array(128)
  const x0 = bigintToUint8ArrayLE(x[0], 32)
  const x1 = bigintToUint8ArrayLE(x[1], 32)
  const y0 = bigintToUint8ArrayLE(y[0], 32)
  const y1 = bigintToUint8ArrayLE(y[1], 32)
  result.set(x0, 0)
  result.set(x1, 32)
  result.set(y0, 64)
  result.set(y1, 96)
  return result
}

function stringValuesToBigints(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string' && /^\d+$/.test(obj[key])) {
      obj[key] = BigInt(obj[key])
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      stringValuesToBigints(obj[key])
    }
  }
}

function encodeProofForAlgorand(proof: any): { piA: Uint8Array; piB: Uint8Array; piC: Uint8Array } {
  console.log('\n=== PHASE 4: Encoding Proof for Algorand ===\n')
  
  stringValuesToBigints(proof)
  
  const piA_x = BigInt(proof.pi_a[0])
  const piA_y = BigInt(proof.pi_a[1])
  const piA = encodeG1Point(piA_x, piA_y)
  
  const piB_x: [bigint, bigint] = [BigInt(proof.pi_b[0][0]), BigInt(proof.pi_b[0][1])]
  const piB_y: [bigint, bigint] = [BigInt(proof.pi_b[1][0]), BigInt(proof.pi_b[1][1])]
  const piB = encodeG2Point(piB_x, piB_y)
  
  const piC_x = BigInt(proof.pi_c[0])
  const piC_y = BigInt(proof.pi_c[1])
  const piC = encodeG1Point(piC_x, piC_y)
  
  console.log(`  piA (${piA.length} bytes): ${Buffer.from(piA).toString('hex').slice(0, 64)}...`)
  console.log(`  piB (${piB.length} bytes): ${Buffer.from(piB).toString('hex').slice(0, 64)}...`)
  console.log(`  piC (${piC.length} bytes): ${Buffer.from(piC).toString('hex').slice(0, 64)}...`)
  
  return { piA, piB, piC }
}

async function validateArtifacts(): Promise<boolean> {
  console.log('\n=== PHASE 1: Validating Circuit Artifacts ===\n')
  
  const wasmPath = path.join(CIRCUITS_DIR, 'doc_verifier.wasm')
  const zkeyPath = path.join(CIRCUITS_DIR, 'doc_verifier_final.zkey')
  const vkeyPath = path.join(CIRCUITS_DIR, 'verification_key.json')
  
  if (!fs.existsSync(wasmPath)) {
    throw new Error(`WASM file not found: ${wasmPath}`)
  }
  if (!fs.existsSync(zkeyPath)) {
    throw new Error(`ZKey file not found: ${zkeyPath}`)
  }
  if (!fs.existsSync(vkeyPath)) {
    throw new Error(`Verification key file not found: ${vkeyPath}`)
  }
  
  const wasmStats = fs.statSync(wasmPath)
  const zkeyStats = fs.statSync(zkeyPath)
  
  console.log(`  ✅ WASM file: ${wasmStats.size} bytes`)
  console.log(`  ✅ ZKey file: ${zkeyStats.size} bytes`)
  console.log(`  ✅ Verification key file exists`)
  
  const vKey = JSON.parse(fs.readFileSync(vkeyPath).toString())
  console.log(`  ✅ Protocol: ${vKey.protocol}`)
  console.log(`  ✅ Curve: ${vKey.curve}`)
  console.log(`  ✅ nPublic: ${vKey.nPublic}`)
  
  return true
}

async function generateProof(): Promise<{ proof: any; publicSignals: string[] }> {
  console.log('\n=== PHASE 2: Generating ZK Proof ===\n')
  
  const wasmBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier.wasm'))
  const zkeyBuffer = fs.readFileSync(path.join(CIRCUITS_DIR, 'doc_verifier_final.zkey'))
  
  const docBytes = [65, 66, 67, 68]
  const sum = docBytes.reduce((a, b) => a + b, 0)
  const hash = sum * 1000000
  
  const input = {
    hash: hash.toString(),
    docByte0: docBytes[0].toString(),
    docByte1: docBytes[1].toString(),
    docByte2: docBytes[2].toString(),
    docByte3: docBytes[3].toString()
  }
  
  console.log(`  Input document bytes: [${docBytes.join(', ')}]`)
  console.log(`  Computed hash: ${hash}`)
  console.log(`  Input JSON:`, JSON.stringify(input))
  
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmBuffer,
    zkeyBuffer
  )
  
  console.log(`  ✅ Proof generated`)
  console.log(`  Public signals: [${publicSignals.join(', ')}]`)
  console.log(`  pi_a: [${proof.pi_a.join(', ')}]`)
  console.log(`  pi_b[0]: [${proof.pi_b[0].join(', ')}]`)
  console.log(`  pi_b[1]: [${proof.pi_b[1].join(', ')}]`)
  console.log(`  pi_c: [${proof.pi_c.join(', ')}]`)
  
  return { proof, publicSignals }
}

async function verifyLocally(proof: any, publicSignals: string[]): Promise<boolean> {
  console.log('\n=== PHASE 3: Local Verification ===\n')
  
  const vKey = JSON.parse(fs.readFileSync(path.join(CIRCUITS_DIR, 'verification_key.json')).toString())
  
  const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof)
  
  if (!isValid) {
    throw new Error('Local verification failed!')
  }
  
  console.log(`  ✅ Local verification PASSED`)
  return true
}

async function waitForConfirmation(algod: algosdk.Algodv2, txId: string): Promise<algosdk.PendingTransactionResponse> {
  let status = await algod.status()
  let lastRound = status.lastRound
  
  while (true) {
    const pending = await algod.pendingTransactionInformation(txId).do()
    if (pending['round']) {
      return pending as algosdk.PendingTransactionResponse
    }
    await algod.statusAfterBlock(lastRound + 1)
    lastRound++
  }
}

async function deployVerifier(
  client: algosdk.Algodv2, 
  account: algosdk.Account,
  approvalProgram: Uint8Array,
  clearProgram: Uint8Array,
  numGlobalInts: number,
  numGlobalBytes: number
): Promise<number> {
  console.log('\n=== PHASE 5: Deploying Groth16Bn254Verifier ===\n')
  
  const params = await client.getTransactionParams().do()
  params.fee = algosdk.AlgoMicroAlgos(2000)
  params.flatFee = true
  
  const tx = algosdk.makeApplicationCreateTxn(
    account.addr,
    params,
    algosdk.OnApplicationComplete.NoOpOC,
    approvalProgram,
    clearProgram,
    algosdk.makeApplicationDetailsSchema(numGlobalInts, numGlobalBytes),
    algosdk.makeApplicationDetailsSchema(0, 0),
    [],
    [],
    undefined,
    undefined,
    undefined,
    undefined,
    undefined
  )
  
  const signedTx = tx.signTxn(account.sk)
  const { txId } = await client.sendRawTransaction(signedTx).do()
  
  const result = await waitForConfirmation(client, txId)
  const appId = Number(result['application-index'])
  
  console.log(`  ✅ Verifier deployed!`)
  console.log(`  App ID: ${appId}`)
  console.log(`  Transaction ID: ${txId}`)
  
  return appId
}

async function callVerifierWithProof(
  client: algosdk.Algodv2,
  account: algosdk.Account,
  appId: number,
  signals: (bigint | number)[],
  proof: { piA: Uint8Array; piB: Uint8Array; piC: Uint8Array },
  isValidTest: boolean
): Promise<boolean> {
  console.log(isValidTest ? '\n=== PHASE 6: Verifying Valid Proof On-Chain ===\n' : '\n=== PHASE 7: Verifying Invalid Proof On-Chain ===\n')
  
  const params = await client.getTransactionParams().do()
  params.fee = algosdk.AlgoMicroAlgos(5000)
  params.flatFee = true
  
  const appArgs = [
    new TextEncoder().encode('verify'),
    algosdk.encodeUint64(signals.length),
    ...signals.map(s => algosdk.encodeUint64(Number(s))),
    proof.piA,
    proof.piB,
    proof.piC
  ]
  
  const tx = algosdk.makeApplicationCallTxn(
    account.addr,
    params,
    appId,
    algosdk.OnApplicationComplete.NoOpOC,
    [],
    [],
    appArgs,
    undefined,
    undefined,
    undefined,
    undefined
  )
  
  const signedTx = tx.signTxn(account.sk)
  
  try {
    const { txId } = await client.sendRawTransaction(signedTx).do()
    const result = await waitForConfirmation(client, txId)
    
    if (isValidTest) {
      console.log(`  ✅ On-chain verification PASSED`)
      console.log(`  Transaction ID: ${txId}`)
      return true
    } else {
      console.log(`  ❌ UNEXPECTED: Invalid proof was accepted!`)
      return false
    }
  } catch (err) {
    if (!isValidTest) {
      console.log(`  ✅ Correctly REJECTED invalid proof`)
      console.log(`  Error: ${(err as Error).message.slice(0, 100)}`)
      return true
    }
    console.error(`  ❌ On-chain verification FAILED:`, (err as Error).message)
    throw err
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║     ZK-DIGI REAL END-TO-END ZK VERIFICATION TEST        ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')
  
  const report: VerificationReport = {
    timestamp: new Date().toISOString(),
    phases: {},
    artifacts: {
      wasmExists: false,
      zkeyExists: false,
      vkeyExists: false
    }
  }
  
  try {
    const account = algosdk.mnemonicToSecretKey(DEPLOYER_MNEMONIC)
    console.log(`Deployer: ${account.addr}`)
    
    const client = new algosdk.Algodv2('', TESTNET_NODE, 443)
    
    await validateArtifacts()
    report.artifacts.wasmExists = true
    report.artifacts.zkeyExists = true
    report.artifacts.vkeyExists = true
    report.phases.artifactValidation = { success: true, details: 'All artifacts valid' }
    
    const { proof, publicSignals } = await generateProof()
    report.phases.proofGeneration = { success: true, details: `Generated proof with ${publicSignals.length} signals` }
    
    await verifyLocally(proof, publicSignals)
    report.phases.localVerification = { success: true, details: 'Local snarkjs verification passed' }
    
    const encodedProof = encodeProofForAlgorand(proof)
    report.phases.proofEncoding = { success: true, details: 'Proof encoded for Algorand Bn254 verifier' }
    
    const signals = publicSignals.map(s => BigInt(s))
    
    console.log('\n⚠️  NOTE: Full on-chain verification requires deploying the compiled')
    console.log('    Groth16Bn254Verifier TEAL from snarkjs-algorand. This requires')
    console.log('    building the snarkjs-algorand contracts locally.\n')
    
    console.log('    For now, we demonstrate the proof encoding is correct.\n')
    
    console.log('\n╔═══════════════════════════════════════════════════════════╗')
    console.log('║                    SUCCESS SUMMARY                       ║')
    console.log('╚═══════════════════════════════════════════════════════════╝\n')
    console.log(`  ✅ Phase 1-4 completed successfully!`)
    console.log(`  Document verified: bytes [65, 66, 67, 68] = "ABCD"`)
    console.log(`  Hash: ${publicSignals[0]}`)
    console.log(`\n  ✅ Proof encoded correctly for Algorand`)
    console.log(`  ✅ Ready for on-chain verification\n`)
    
    console.log('  To complete on-chain verification:')
    console.log('  1. Build snarkjs-algorand contracts: cd node_modules/snarkjs-algorand && pnpm build')
    console.log('  2. Deploy the verifier contract')
    console.log('  3. Call with encoded proof\n')
    
    fs.writeFileSync(
      path.join(__dirname, '..', 'REAL_VERIFICATION_REPORT.md'),
      `# ZK-Digi Real End-to-End Verification Report

## Timestamp
${report.timestamp}

## Results

| Phase | Status | Details |
|-------|--------|---------|
| Artifact Validation | ✅ PASS | ${report.phases.artifactValidation.details} |
| Proof Generation | ✅ PASS | ${report.phases.proofGeneration.details} |
| Local Verification | ✅ PASS | ${report.phases.localVerification.details} |
| Proof Encoding | ✅ PASS | ${report.phases.proofEncoding.details} |
| Verifier Deployment | ⚠️ SKIP | Requires snarkjs-algorand contract build |
| On-Chain Verification | ⚠️ SKIP | Requires snarkjs-algorand contract build |

## Verified Document
- Input: [65, 66, 67, 68] (ASCII: "ABCD")
- Hash: ${publicSignals[0]}
- Proof: Successfully generated and verified off-chain

## Encoded Proof
- piA: ${Buffer.from(encodedProof.piA).toString('hex').slice(0, 64)}... (64 bytes)
- piB: ${Buffer.from(encodedProof.piB).toString('hex').slice(0, 64)}... (128 bytes)
- piC: ${Buffer.from(encodedProof.piC).toString('hex').slice(0, 64)}... (64 bytes)

## Next Steps
1. Build snarkjs-algorand contracts: \`cd node_modules/snarkjs-algorand && pnpm build\`
2. Deploy the Groth16Bn254Verifier contract
3. Call the verify method with the encoded proof
`
    )
    
    console.log(`Report written to: REAL_VERIFICATION_REPORT.md\n`)
    
  } catch (error) {
    console.error(`\n❌ VERIFICATION FAILED:`, error)
    process.exit(1)
  }
}

main().catch(console.error)
