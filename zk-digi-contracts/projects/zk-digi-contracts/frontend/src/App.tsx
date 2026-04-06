import React, { useState, useEffect, useCallback } from 'react';
import algosdk, { Account } from 'algosdk';
// @ts-ignore - snarkjs types
import * as snarkjs from 'snarkjs';

const APP_ID = 758365856;
const TESTNET_ALGOD = 'https://testnet-api.algonode.cloud';
const TESTNET_INDEXER = 'https://testnet-idx.algonode.cloud';

const DEMO_MNEMONIC = "tone bounce fish brass pizza supply mercy mango guard fresh furnace fold smooth tool illegal winter math target laptop tortoise castle seminar marble absent announce";

function App() {
  const [account, setAccount] = useState<Account | null>(null);
  const [accountAddr, setAccountAddr] = useState<string>('');
  const [document, setDocument] = useState<File | null>(null);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<string>('Connect wallet to begin verification');
  const [proofResult, setProofResult] = useState<{
    proof: any;
    publicSignals: string[];
    input: { a: number; b: number };
    encodedProof: { piA: Uint8Array; piB: Uint8Array; piC: Uint8Array };
  } | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    txId: string;
    confirmed: boolean;
    round?: number;
  } | null>(null);
  const [accountBalance, setAccountBalance] = useState<string>('');

  const connectWallet = useCallback(async () => {
    try {
      const acc = algosdk.mnemonicToSecretKey(DEMO_MNEMONIC);
      setAccount(acc);
      const addrBytes = acc.addr as unknown as Uint8Array;
      const addrStr = algosdk.encodeAddress(addrBytes);
      setAccountAddr(addrStr);
      
      const client = new algosdk.Algodv2('', TESTNET_ALGOD, 443);
      const info = await client.accountInformation(addrStr).do();
      const balance = (Number(info.amount) / 1_000_000).toFixed(4);
      setAccountBalance(balance);
      
      setStatus(`Connected: ${addrStr.slice(0, 8)}... (${balance} ALGO)`);
    } catch (err) {
      setStatus('Failed to connect wallet');
    }
  }, []);

  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocument(e.target.files[0]);
      setProofResult(null);
      setVerificationResult(null);
      setStatus('Document uploaded. Click "Generate ZK Proof" to create proof.');
    }
  };

  const encodeGroth16Bn254Proof = (proof: any, curve: any): { piA: Uint8Array; piB: Uint8Array; piC: Uint8Array } => {
    const convertStringsToBigints = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(convertStringsToBigints);
      }
      if (typeof obj === 'object' && obj !== null) {
        const result: any = {};
        for (const key of Object.keys(obj)) {
          result[key] = convertStringsToBigints(obj[key]);
        }
        return result;
      }
      if (typeof obj === 'string') {
        return BigInt(obj);
      }
      return obj;
    };

    const reorderG2UncompressedBN254 = (uncompressed: Uint8Array): Uint8Array => {
      const reordered = new Uint8Array(128);
      reordered.set(uncompressed.subarray(0, 32), 0);
      reordered.set(uncompressed.subarray(32, 64), 32);
      reordered.set(uncompressed.subarray(64, 96), 64);
      reordered.set(uncompressed.subarray(96, 128), 96);
      return reordered;
    };

    convertStringsToBigints(proof);
    
    const piAPoint = curve.G1.fromObject(proof.pi_a);
    const piABytes = curve.G1.toUncompressed(piAPoint);
    
    const piBPoint = curve.G2.fromObject(proof.pi_b);
    const piBUncompressed = curve.G2.toUncompressed(piBPoint);
    const piBBytes = reorderG2UncompressedBN254(piBUncompressed);
    
    const piCPoint = curve.G1.fromObject(proof.pi_c);
    const piCBytes = curve.G1.toUncompressed(piCPoint);
    
    return {
      piA: piABytes,
      piB: piBBytes,
      piC: piCBytes,
    };
  };

  const generateProof = async () => {
    if (!document) return;
    
    setIsGeneratingProof(true);
    setStatus('Reading document...');
    
    try {
      const fileBuffer = await document.arrayBuffer();
      const bytes = new Uint8Array(fileBuffer);
      
      const doc0 = bytes.length > 0 ? bytes[0] : 0;
      const doc1 = bytes.length > 1 ? bytes[1] : 0;
      const doc2 = bytes.length > 2 ? bytes[2] : 0;
      const doc3 = bytes.length > 3 ? bytes[3] : 0;
      
      const sum = doc0 + doc1 + doc2 + doc3;
      const a = sum || 10;
      const b = a * 2 + 1 || 21;
      
      setStatus('Loading ZK circuit (BN254)...');
      
      const wasmResponse = await fetch('/circuits/circuit_bn254.wasm');
      const wasmBuffer = await wasmResponse.arrayBuffer();
      
      const zkeyResponse = await fetch('/circuits/groth16_bn254_circuit_final.zkey');
      const zkeyBuffer = await zkeyResponse.arrayBuffer();
      
      setStatus('Generating ZK proof (this may take a moment)...');
      
      const input = { a, b };
      
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        new Uint8Array(wasmBuffer),
        new Uint8Array(zkeyBuffer)
      );
      
      const curve = await snarkjs.curves.getCurveFromName('bn128');
      const encodedProof = encodeGroth16Bn254Proof(proof, curve);
      await curve.terminate();
      
      setProofResult({ proof, publicSignals, input, encodedProof });
      setStatus(`ZK Proof generated! Input: a=${a}, b=${b}, Signal: ${publicSignals[0]}`);
    } catch (err) {
      console.error(err);
      setStatus('Failed to generate proof: ' + (err as Error).message);
    } finally {
      setIsGeneratingProof(false);
    }
  };

  const waitForConfirmation = async (txId: string, maxAttempts = 40): Promise<any> => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`${TESTNET_INDEXER}/v2/transactions/${txId}`);
        const result = await response.json();
        if (result.transaction?.['confirmed-round']) {
          return result;
        }
      } catch (e) {
        // ignore
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    throw new Error('Confirmation timeout');
  };

  const verifyOnChain = async () => {
    if (!account || !proofResult) return;
    
    setIsVerifying(true);
    setStatus('Verifying on Algorand contract...');
    
    try {
      const client = new algosdk.Algodv2('', TESTNET_ALGOD, 443);
      const params = await client.getTransactionParams().do();
      
      const signals = proofResult.publicSignals.map((s: string) => BigInt(s));
      
      const proofArg = Buffer.from(proofResult.encodedProof.piA).toString('base64') + ',' +
        Buffer.from(proofResult.encodedProof.piB).toString('base64') + ',' +
        Buffer.from(proofResult.encodedProof.piC).toString('base64');
      
      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: accountAddr,
        suggestedParams: params,
        appIndex: APP_ID,
        appArgs: [
          new TextEncoder().encode('signalsAndProof'),
          new TextEncoder().encode(JSON.stringify(signals)),
          new TextEncoder().encode(proofArg)
        ]
      });
      
      const signedTxn = txn.signTxn(account.sk);
      const txInfo = await client.sendRawTransaction(signedTxn).do();
      
      setStatus('Waiting for confirmation...');
      const confirmed = await waitForConfirmation(txInfo.txid);
      
      setVerificationResult({
        txId: txInfo.txid,
        confirmed: true,
        round: confirmed.transaction['confirmed-round']
      });
      
      setStatus(`Verification successful! TX: ${txInfo.txid.slice(0, 20)}... (Round: ${confirmed.transaction['confirmed-round']})`);
    } catch (err) {
      console.error(err);
      setStatus('Verification failed: ' + (err as Error).message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>ZK-Digi Document Verification</h1>
      <p>Zero-knowledge proof verification on Algorand (BN254 Groth16)</p>
      
      {accountAddr && (
        <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
          <strong>Wallet:</strong> {accountAddr.slice(0, 12)}... | <strong>Balance:</strong> {accountBalance} ALGO
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <h3>1. Upload Document</h3>
        <input 
          type="file" 
          onChange={handleDocumentUpload}
          accept=".pdf,.doc,.docx,.txt"
        />
      </div>
      
      {document && (
        <div style={{ marginBottom: '20px' }}>
          <h3>2. Generate ZK Proof (Client-side)</h3>
          <p>File: {document.name} ({(document.size / 1024).toFixed(2)} KB)</p>
          <button 
            onClick={generateProof}
            disabled={isGeneratingProof}
            style={{ padding: '10px 20px', fontSize: '14px', cursor: isGeneratingProof ? 'not-allowed' : 'pointer', marginRight: '10px' }}
          >
            {isGeneratingProof ? 'Generating ZK Proof...' : 'Generate ZK Proof'}
          </button>
        </div>
      )}
      
      {proofResult && (
        <div style={{ marginBottom: '20px', background: '#e8f5e9', padding: '15px', borderRadius: '5px' }}>
          <h3>3. Proof Generated ✅</h3>
          <p><strong>Input:</strong> a={proofResult.input.a}, b={proofResult.input.b}</p>
          <p><strong>Signal:</strong> {proofResult.publicSignals[0]}</p>
          <p><strong>Proof:</strong> piA={proofResult.encodedProof.piA.length} bytes, piB={proofResult.encodedProof.piB.length} bytes, piC={proofResult.encodedProof.piC.length} bytes</p>
          <p><strong>Contract:</strong> App ID {APP_ID}</p>
          <button 
            onClick={verifyOnChain}
            disabled={isVerifying}
            style={{ padding: '10px 20px', fontSize: '14px', cursor: isVerifying ? 'not-allowed' : 'pointer' }}
          >
            {isVerifying ? 'Verifying on Algorand...' : 'Verify on Algorand'}
          </button>
        </div>
      )}
      
      {verificationResult && (
        <div style={{ marginBottom: '20px', background: '#c8e6c9', padding: '15px', borderRadius: '5px' }}>
          <h3>✅ Verification Complete!</h3>
          <p><strong>TX ID:</strong> {verificationResult.txId}</p>
          <p><strong>Confirmed Round:</strong> {verificationResult.round}</p>
          <p><strong>Status:</strong> Verified on-chain</p>
          <a 
            href={`https://testnet.explorer.perawallet.app/transaction/${verificationResult.txId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1976d2' }}
          >
            View in Explorer ↗
          </a>
        </div>
      )}
      
      {status && (
        <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '5px', marginTop: '20px' }}>
          {status}
        </div>
      )}
    </div>
  );
}

export default App;
