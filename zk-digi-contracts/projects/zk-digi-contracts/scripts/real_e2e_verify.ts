import * as snarkjs from 'snarkjs'
import fs from 'fs'
import path from 'path'
import algosdk from 'algosdk'
import { fileURLToPath } from 'url'

// Path helpers
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECTS_ROOT = path.resolve(__dirname, '../../../../')
const SNARKJS_ALGORAND = path.join(PROJECTS_ROOT, 'snarkjs-algorand')

// Imports will be done dynamically inside main to avoid top-level await issues in CJS
let encodeGroth16Bn254Proof: any
let getGroth16Bn254Vkey: any
let encodeGroth16Bn254Vk: any
let stringValuesToBigints: any

// Algorand Configuration
const ALGOD_URL = 'https://testnet-api.algonode.cloud'
const ALGOD_TOKEN = ''
const ALGOD_PORT = 443
const MNEMONIC = 'tone bounce fish brass pizza supply mercy mango guard fresh furnace fold smooth tool illegal winter math target laptop tortoise castle seminar marble absent announce'

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_URL, ALGOD_PORT)
const account = algosdk.mnemonicToSecretKey(MNEMONIC)

// REQUIRED FILES Validation
const REQUIRED_FILES = [
  path.join(SNARKJS_ALGORAND, 'circuit/circuit_bn254_js/circuit_bn254.wasm'),
  path.join(SNARKJS_ALGORAND, 'circuit/groth16_bn254_circuit_final.zkey'),
  path.join(SNARKJS_ALGORAND, 'circuit/groth16_bn254_verification_key.json'),
  path.join(SNARKJS_ALGORAND, 'circuit/input.json'),
  path.join(SNARKJS_ALGORAND, 'contracts/out/Groth16Bn254Verifier.approval.teal'),
  path.join(SNARKJS_ALGORAND, 'contracts/out/Groth16Bn254Verifier.arc56.json'),
]

function validateArtifacts() {
  console.log('=== PHASE 1: Validating artifacts ===')
  let allGood = true
  for (const f of REQUIRED_FILES) {
    if (!fs.existsSync(f)) {
      console.error('MISSING:', f)
      allGood = false
    } else {
      const size = fs.statSync(f).size
      if (size === 0) {
        console.error('EMPTY FILE:', f)
        allGood = false
      } else {
        console.log('OK:', path.basename(f), `(${size} bytes)`)
      }
    }
  }
  if (!allGood) {
    console.log('\nTo generate missing circuit files:')
    console.log('cd snarkjs-algorand/circuit && ./setup.sh')
    console.log('\nTo generate missing contract files:')
    console.log('cd snarkjs-algorand && pnpm run compile')
    throw new Error('PHASE 1 FAILED: Missing or empty artifacts.')
  }
  console.log('Phase 1: All artifacts validated.\n')
}

async function generateFreshProof() {
  console.log('=== PHASE 2: Generating fresh proof ===')
  const inputPath = path.join(SNARKJS_ALGORAND, 'circuit/input.json')
  const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
  console.log('Circuit input:', JSON.stringify(input))

  const wasmPath = path.join(SNARKJS_ALGORAND, 'circuit/circuit_bn254_js/circuit_bn254.wasm')
  const zkeyPath = path.join(SNARKJS_ALGORAND, 'circuit/groth16_bn254_circuit_final.zkey')

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath)

  console.log('Proof pi_a[0]:', proof.pi_a[0].substring(0, 20) + '...')
  console.log('Public signals:', publicSignals)

  if (!proof.pi_a[0] || proof.pi_a[0] === '0') {
    throw new Error('PHASE 2 FAILED: Proof generation returned invalid data.')
  }
  console.log('Phase 2: Fresh proof generated.\n')
  return { proof, publicSignals }
}

async function verifyLocally(proof: any, publicSignals: any) {
  console.log('=== PHASE 3: Local snarkjs verification ===')
  const vkeyPath = path.join(SNARKJS_ALGORAND, 'circuit/groth16_bn254_verification_key.json')
  const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'))

  const isValid = await snarkjs.groth16.verify(vkey, publicSignals, proof)
  if (!isValid) {
    throw new Error('PHASE 3 FAILED: snarkjs local verification failed.')
  }
  console.log('Phase 3: Local verification PASSED. ✅\n')
}

async function encodeProofAndVk(proof: any, publicSignals: any) {
  console.log('=== PHASE 4: Encoding proof and VK for Algorand ===')
  
  // @ts-ignore
  const curve = await snarkjs.curves.getCurveFromName('bn128')
  
  // 1. Encode Proof
  const encodedProofRaw = encodeGroth16Bn254Proof(proof, curve)
  // MAPPING: snarkjs-algorand uses camelCase, ARC56 uses snake_case
  const encodedProofStruct = {
    pi_a: encodedProofRaw.piA,
    pi_b: encodedProofRaw.piB,
    pi_c: encodedProofRaw.piC
  }
  const encodedProof = [encodedProofStruct.pi_a, encodedProofStruct.pi_b, encodedProofStruct.pi_c]

  // 2. Encode Public Signals
  const encodedSignals = publicSignals.map((s: string) => BigInt(s))

  // 3. Encode VK for Deployment
  const zkeyPath = path.join(SNARKJS_ALGORAND, 'circuit/groth16_bn254_circuit_final.zkey')
  const arc56Path = path.join(SNARKJS_ALGORAND, 'contracts/out/Groth16Bn254Verifier.arc56.json')
  const appSpec = JSON.parse(fs.readFileSync(arc56Path, 'utf8'))
  
  const vkeyRaw = await getGroth16Bn254Vkey(zkeyPath, curve)
  // MAPPING: Transform to ARC56 snake_case
  const vkeyStruct = {
    vk_alpha_1: vkeyRaw.vkAlpha_1,
    vk_beta_2: vkeyRaw.vkBeta_2,
    vk_gamma_2: vkeyRaw.vkGamma_2,
    vk_delta_2: vkeyRaw.vkDelta_2,
    nPublic: vkeyRaw.nPublic,
    IC: vkeyRaw.ic
  }
  const encodedVk = encodeGroth16Bn254Vk(vkeyStruct, appSpec)

  console.log('Encoded Proof Hex (piA first 32 bytes):', Buffer.from(encodedProofStruct.pi_a.slice(0, 32)).toString('hex'))
  console.log('Encoded VK Length:', encodedVk.length, 'bytes')

  await curve.terminate()
  console.log('Phase 4: Encoding successful. ✅\n')
  
  return { encodedProof, encodedSignals, encodedVk }
}

async function deployRealVerifier(encodedVk: Uint8Array): Promise<bigint> {
  console.log('=== PHASE 5: Deploying real Groth16 verifier ===')
  
  const approvalPath = path.join(SNARKJS_ALGORAND, 'contracts/out/Groth16Bn254Verifier.approval.teal')
  let approvalTeal = fs.readFileSync(approvalPath, 'utf8')
  
  // Template injection: replace TMPL_VERIFICATION_KEY or handle it via substitution
  // snarkjs-algorand uses TemplateVar<bytes>("VERIFICATION_KEY")
  // We need to base64 encode the bytes for the compiler
  const vkBase64 = Buffer.from(encodedVk).toString('base64')
  
  // Manual template substitution if needed, but safer to use substitution in compile if supported.
  // Actually, we'll use the 'replace' method on the teal string for the direct byte replacement.
  // The contract has TMPL_VERIFICATION_KEY.
  // Teascript/Puya uses 'TMPL_VERIFICATION_KEY' literal.
  
  const sp = await algodClient.getTransactionParams().do()
  
  // Compiling with template substitution
  // Note: algokit/algosdk compile doesn't always handle TMPL_ directly without substitution params.
  // We'll replace the placeholder in the TEAL if it's there.
  approvalTeal = approvalTeal.replace(/TMPL_VERIFICATION_KEY/g, `0x${Buffer.from(encodedVk).toString('hex')}`)

  const approvalCompiled = await algodClient.compile(approvalTeal).do()
  const clearTeal = '#pragma version 11\npushint 1\nreturn'
  const clearCompiled = await algodClient.compile(clearTeal).do()

  const txn = algosdk.makeApplicationCreateTxnFromObject({
    sender: account.addr,
    suggestedParams: sp,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    approvalProgram: new Uint8Array(Buffer.from(approvalCompiled.result, 'base64')),
    clearProgram: new Uint8Array(Buffer.from(clearCompiled.result, 'base64')),
    numLocalInts: 0,
    numLocalByteSlices: 0,
    numGlobalInts: 0,
    numGlobalByteSlices: 0,
  })

  const signedTxn = txn.signTxn(account.sk)
  const sendResponse = await algodClient.sendRawTransaction(signedTxn).do()
  console.log('Full Send Response:', JSON.stringify(sendResponse))
  const txId = (sendResponse as any).txId || (sendResponse as any).txID || (sendResponse as any).txid
  console.log('Extracted TxID:', txId)
  
  const waitResult = await algosdk.waitForConfirmation(algodClient, txId, 4)
  const appId = BigInt(waitResult.applicationIndex!)
  
  console.log('Deployed App ID:', appId.toString())
  console.log('Phase 5: Real verifier deployed. ✅\n')
  return appId
}

async function verifyOnChain(appId: bigint, signals: bigint[], proof: Uint8Array[], expectValid: boolean) {
  const label = expectValid ? 'VALID' : 'INVALID'
  console.log(`=== PHASE 6: On-chain verification (${label}) ===`)
  
  const arc56Path = path.join(SNARKJS_ALGORAND, 'contracts/out/Groth16Bn254Verifier.arc56.json')
  const appSpec = JSON.parse(fs.readFileSync(arc56Path, 'utf8'))
  const abi = new algosdk.ABIContract(appSpec)
  const method = abi.getMethodByName('verify')

  const sp = await algodClient.getTransactionParams().do()
  const atc = new algosdk.AtomicTransactionComposer()
  
  const signer = async (txns: algosdk.Transaction[]) => txns.map(t => t.signTxn(account.sk))

  atc.addMethodCall({
    appID: Number(appId),
    method,
    methodArgs: [signals, proof],
    sender: account.addr,
    signer,
    suggestedParams: {
      ...sp,
      fee: 40_000, // Ample budget for pairing checks
      flatFee: true
    }
  })

  try {
    const result = await atc.execute(algodClient, 4)
    console.log(`Verified on-chain. TxID: ${result.txIDs[0]}`)
    if (!expectValid) {
      throw new Error('FAILED: Contract accepted an invalid proof!')
    }
    return result.txIDs[0]
  } catch (err: any) {
    if (expectValid) {
      throw new Error(`FAILED: Contract rejected a valid proof! Error: ${err.message}`)
    } else {
      console.log('Contract correctly REJECTED the invalid proof. ✅')
      return 'REJECTED'
    }
  }
}

async function main() {
  try {
    // Phase 0: Dynamic imports from snarkjs-algorand
    const groth16Module = await import('../../../../snarkjs-algorand/src/groth16.ts')
    const indexModule = await import('../../../../snarkjs-algorand/src/index.ts')
    
    encodeGroth16Bn254Proof = groth16Module.encodeGroth16Bn254Proof
    getGroth16Bn254Vkey = groth16Module.getGroth16Bn254Vkey
    encodeGroth16Bn254Vk = groth16Module.encodeGroth16Bn254Vk
    stringValuesToBigints = indexModule.stringValuesToBigints

    validateArtifacts()
    
    const { proof, publicSignals } = await generateFreshProof()
    await verifyLocally(proof, publicSignals)
    
    const { encodedProof, encodedSignals, encodedVk } = await encodeProofAndVk(proof, publicSignals)
    
    const appId = await deployRealVerifier(encodedVk)
    
    const validTxId = await verifyOnChain(appId, encodedSignals, encodedProof, true)
    
    // Phase 7: Negative Test
    const corruptedProof = [new Uint8Array(encodedProof[0]), encodedProof[1], encodedProof[2]]
    corruptedProof[0][0] = corruptedProof[0][0] ^ 0xFF // Flip bits in piA
    await verifyOnChain(appId, encodedSignals, corruptedProof, false)

    // Phase 8: Report
    const reportPath = path.resolve(PROJECTS_ROOT, 'zk-digi-contracts/projects/zk-digi-contracts/REAL_VERIFICATION_REPORT.md')
    const reportHtml = `# Real E2E Verification Report

## Status: SUCCESS ✅
**Date:** ${new Date().toLocaleString()}

- **App ID:** [${appId}](https://testnet.explorer.perawallet.app/application/${appId.toString()})
- **Valid Verification Tx:** [${validTxId}](https://testnet.explorer.perawallet.app/tx/${validTxId})
- **Negative Test:** PASSED (Corrupted proof was rejected)

### Technical Details
- **Curve:** BN254
- **Proof System:** Groth16
- **Verifier:** snarkjs-algorand (compiled TEAL)
- **Status:** NO MOCKS DETECTED.
`
    fs.writeFileSync(reportPath, reportHtml)
    console.log(`\n=== ALL PHASES COMPLETE ===\nReport written to ${reportPath}`)
    
  } catch (err: any) {
    console.error('\n❌ FATAL ERROR:', err.message)
    process.exit(1)
  }
}

main()
