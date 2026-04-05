import algosdk from 'algosdk';
import * as snarkjs from 'snarkjs';
import fs from 'fs';
import path from 'path';
import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { 
    Groth16Bn254AppVerifier,
    getGroth16Bn254Proof
} from '../../../../snarkjs-algorand/src/groth16';

// Network & Account
const ALGOD_URL = 'https://testnet-api.algonode.cloud';
const ALGOD_TOKEN = '';
const ALGOD_PORT = 443;
const MNEMONIC = 'tone bounce fish brass pizza supply mercy mango guard fresh furnace fold smooth tool illegal winter math target laptop tortoise castle seminar marble absent announce';

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_URL, ALGOD_PORT);
const algorand = AlgorandClient.testNet(); // Use built-in testnet config
const account = algosdk.mnemonicToSecretKey(MNEMONIC);

// Paths
const SNARKJS_ALGO_DIR = path.resolve(__dirname, '../../../../snarkjs-algorand');
const CIRCUIT_DIR = path.join(SNARKJS_ALGO_DIR, 'circuit');

async function checkBalance() {
    const info = await algodClient.accountInformation(account.addr).do();
    const balance = Number(info.amount) / 1_000_000;
    console.log(`Address: ${account.addr}`);
    console.log(`Balance: ${balance} ALGO`);
    if (balance < 1.0) {
        throw new Error('Insufficient balance. Fund at https://bank.testnet.algorand.network/');
    }
}

async function main() {
    console.log('=== ZK DigiLocker — Testnet Deployment & Verification ===\n');

    await checkBalance();

    // 1. Verify locally with snarkjs
    console.log('--- Step 1: Local Verification ---');
    const vkeyPath = path.join(CIRCUIT_DIR, 'groth16_bn254_verification_key.json');
    const proofPath = path.join(CIRCUIT_DIR, 'groth16_bn254_proof.json');
    const publicPath = path.join(CIRCUIT_DIR, 'public_bn254.json');

    const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));
    const proofJson = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
    const publicSignals = JSON.parse(fs.readFileSync(publicPath, 'utf8'));

    const localValid = await snarkjs.groth16.verify(vkey, publicSignals, proofJson);
    console.log(`Local snarkjs verification: ${localValid ? '✅ VALID' : '❌ INVALID'}`);
    if (!localValid) throw new Error('Proof invalid locally.');

    // 2. Setup App Verifier
    console.log('\n--- Step 2: Deploying Verifier Contract ---');
    
    // We use the account derived from mnemonic as the default sender
    algorand.setSigner(account.addr, algosdk.makeBasicAccountTransactionSigner(account));

    const verifier = new Groth16Bn254AppVerifier({
        algorand,
        zKey: path.join(CIRCUIT_DIR, 'groth16_bn254_circuit_final.zkey'),
        wasmProver: path.join(CIRCUIT_DIR, 'circuit_bn254_js/circuit_bn254.wasm'),
    });

    const deployResult = await verifier.deploy({
        appName: `Groth16Bn254Verifier-${Date.now()}`,
        defaultSender: account.addr,
    });

    const appId = Number(deployResult.appClient.appId);
    console.log(`Deployed Verifier App ID: ${appId}`);
    console.log(`Explorer: https://testnet.explorer.perawallet.app/application/${appId}`);

    // 3. Encode and Verify On-Chain
    console.log('\n--- Step 3: On-Chain Verification ---');
    
    // snarkjs uses "bn128" for BN254
    // @ts-expect-error curves not typed
    const curve = await snarkjs.curves.getCurveFromName('bn128');
    
    const proof = await getGroth16Bn254Proof(proofPath, curve);
    
    // The public signal from public_bn254.json needs to be bigint
    const signals = publicSignals.map((s: string) => BigInt(s));

    console.log('Sending verification transaction...');
    
    // BN254 requires significant budget. extraOpcodeBudget adds inner txns.
    // Each inner txn adds 700 opcodes. 320,000 / 700 = ~457.
    // Wait, the library might handle this via extraOpcodeBudget.
    
    try {
        const verifyResult = await verifier.simulateVerificationWithProofAndSignals(
            { signals, proof },
            {
                extraOpcodeBudget: 320000, 
                allowMoreLogging: true,
            }
        );
        
        console.log('Simulation Passed!');
        
        // Actually call it
        // We use newGroup to ensure the composer is correctly initialized
        const callResult = await (verifier.appClient!.newGroup() as any)
            .verify({ 
                args: { signals: signals as any, proof: proof as any },
                extraOpcodeBudget: 500000 
            })
            .send();
        
        console.log('✅ PROOF VERIFIED ON ALGORAND TESTNET');
        console.log('Transaction ID:', callResult.txIds[0]);
    } catch (e: any) {
        console.error('❌ ON-CHAIN VERIFICATION FAILED');
        console.error(e.message);
        if (e.pc) console.error('Error at PC:', e.pc);
    }

    await curve.terminate();
    console.log('\n=== Done ===');
}

main().catch(console.error);
