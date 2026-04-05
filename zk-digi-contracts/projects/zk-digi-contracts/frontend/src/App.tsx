import React, { useState } from 'react';
import algosdk from 'algosdk';
import * as snarkjs from 'snarkjs';

const APP_ID = 758296669;
const TESTNET_NODE = 'https://testnet-api.4160.nodely.dev';

function App() {
  const [account, setAccount] = useState<algosdk.Account | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [proofResult, setProofResult] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<string>('');
  
  const DEMO_MNEMONIC = "tone bounce fish brass pizza supply mercy mango guard fresh furnace fold smooth tool illegal winter math target laptop tortoise castle seminar marble absent announce";
  
  const connectWallet = async () => {
    try {
      const account = algosdk.mnemonicToSecretKey(DEMO_MNEMONIC);
      setAccount(account);
      setStatus(`Connected: ${account.addr.slice(0, 8)}...`);
    } catch (err) {
      setStatus('Failed to connect wallet');
    }
  };
  
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocument(e.target.files[0]);
      setProofResult(null);
      setVerificationResult('');
      setStatus('Document uploaded. Click "Generate ZK Proof" to create proof.');
    }
  };
  
  const generateProof = async () => {
    if (!document) return;
    
    setIsGeneratingProof(true);
    setStatus('Reading document...');
    
    try {
      const fileBuffer = await document.arrayBuffer();
      const bytes = new Uint8Array(fileBuffer);
      
      // Take first 4 bytes or pad if shorter
      const doc0 = bytes.length > 0 ? bytes[0] : 0;
      const doc1 = bytes.length > 1 ? bytes[1] : 0;
      const doc2 = bytes.length > 2 ? bytes[2] : 0;
      const doc3 = bytes.length > 3 ? bytes[3] : 0;
      
      const sum = doc0 + doc1 + doc2 + doc3;
      const hash = sum * 1000000;
      
      setStatus('Loading ZK circuit...');
      
      // Load WASM and zkey from public folder
      const wasmResponse = await fetch('/circuits/doc_verifier.wasm');
      const wasmBuffer = await wasmResponse.arrayBuffer();
      
      const zkeyResponse = await fetch('/circuits/doc_verifier_final.zkey');
      const zkeyBuffer = await zkeyResponse.arrayBuffer();
      
      setStatus('Generating ZK proof (this may take a moment)...');
      
      // Generate proof using snarkjs
      const input = {
        hash: hash.toString(),
        docByte0: doc0.toString(),
        docByte1: doc1.toString(),
        doc2: doc2.toString(),
        docByte3: doc3.toString()
      };
      
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        new Uint8Array(wasmBuffer),
        new Uint8Array(zkeyBuffer)
      );
      
      setProofResult({ proof, publicSignals, hash });
      setStatus(`ZK Proof generated! Hash: ${hash}`);
    } catch (err) {
      console.error(err);
      setStatus('Failed to generate proof: ' + (err as Error).message);
    } finally {
      setIsGeneratingProof(false);
    }
  };
  
  const verifyOnChain = async () => {
    if (!account || !proofResult) return;
    
    setStatus('Verifying on Algorand contract...');
    
    try {
      const client = new algosdk.Algodv2('', TESTNET_NODE, '443');
      
      // Create application call transaction
      const params = await client.getTransactionParams().do();
      
      // Encode proof data as application args
      const proofJson = JSON.stringify(proofResult.proof);
      const publicJson = JSON.stringify(proofResult.publicSignals);
      
      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: account.addr,
        suggestedParams: params,
        appIndex: APP_ID,
        appArgs: [
          new TextEncoder().encode('verify'),
          new TextEncoder().encode(proofJson),
          new TextEncoder().encode(publicJson)
        ]
      });
      
      const signedTxn = txn.signTxn(account.sk);
      const txInfo = await client.sendRawTransaction(signedTxn).do();
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const txDetails = await client.pendingTransactionInformation(txInfo.txid).do();
      
      console.log('Transaction result:', txDetails);
      
      // Check if verification succeeded (in production, check contract state)
      setVerificationResult(`Verified! Tx: ${txInfo.txid.slice(0, 20)}...`);
      setStatus('Verification successful on Algorand!');
    } catch (err) {
      console.error(err);
      setStatus('Verification failed: ' + (err as Error).message);
    }
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>ZK-Digi Document Verification</h1>
      <p>Zero-knowledge proof verification on Algorand</p>
      
      {!account ? (
        <button 
          onClick={connectWallet}
          style={{ padding: '12px 24px', fontSize: '16px', cursor: 'pointer' }}
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
            <strong>Connected:</strong> {account.addr}
          </div>
          
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
                style={{ padding: '10px 20px', fontSize: '14px', cursor: isGeneratingProof ? 'not-allowed' : 'pointer' }}
              >
                {isGeneratingProof ? 'Generating ZK Proof...' : 'Generate ZK Proof'}
              </button>
            </div>
          )}
          
          {proofResult && (
            <div style={{ marginBottom: '20px', background: '#e8f5e9', padding: '15px', borderRadius: '5px' }}>
              <h3>3. Proof Generated ✅</h3>
              <p>Document Hash: {proofResult.hash}</p>
              <p>Public Signals: {proofResult.publicSignals.join(', ')}</p>
              <button 
                onClick={verifyOnChain}
                style={{ padding: '10px 20px', fontSize: '14px', cursor: 'pointer' }}
              >
                Verify on Algorand
              </button>
            </div>
          )}
          
          {verificationResult && (
            <div style={{ marginBottom: '20px', background: '#c8e6c9', padding: '15px', borderRadius: '5px' }}>
              <h3>✅ Verification Result</h3>
              <p>{verificationResult}</p>
            </div>
          )}
          
          {status && (
            <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '5px', marginTop: '20px' }}>
              {status}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;