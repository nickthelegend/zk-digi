import * as snarkjs from 'snarkjs';
import * as fs from 'fs';
import * as path from 'path';

const CIRCUIT_DIR = path.join(__dirname, '..', 'circuits');

async function setup() {
  console.log('Starting ZK circuit setup...');
  
  const r1csFile = path.join(CIRCUIT_DIR, 'document_verifier.r1cs');
  const ptauFile = path.join(CIRCUIT_DIR, 'pot12_0000.ptau');
  
  // Check files exist
  if (!fs.existsSync(r1csFile)) {
    throw new Error('R1CS file not found: ' + r1csFile);
  }
  if (!fs.existsSync(ptauFile)) {
    throw new Error('PTAU file not found: ' + ptauFile);
  }
  
  console.log('Step 1: Load PTAU and contribute...');
  
  // Load existing PTAU
  const ptauData = fs.readFileSync(ptauFile);
  const ptau = ptauData;
  
  // Contribute to the ceremony
  console.log('Contributing...');
  const ptauContrib = await snarkjs.powersOfTau.contribute(
    ptau,
    'first-contributor',
    { entropy: 'zk-digi-test-entropy' }
  );
  
  // Prepare phase 2
  console.log('Preparing phase 2...');
  const ptauFile2 = path.join(CIRCUIT_DIR, 'pot12_phase2.ptau');
  const { finalPtau } = await snarkjs.powersOfTau.preparePhase2(ptauContrib, ptauFile2);
  
  console.log('Step 2: Generate zkey...');
  
  const zkeyFile = path.join(CIRCUIT_DIR, 'document_verifier_0000.zkey');
  
  const { zkey } = await snarkjs.groth16.setup(r1csFile, finalPtau, zkeyFile);
  console.log('ZKey generated');
  
  console.log('Step 3: Contribute to zkey...');
  
  const finalZKey = await snarkjs.zKey.contribute(
    zkey,
    'contributor-1',
    { entropy: 'zk-digi-contributor-entropy' }
  );
  
  const zkeyFinal = path.join(CIRCUIT_DIR, 'document_verifier_final.zkey');
  fs.writeFileSync(zkeyFinal, finalZKey);
  console.log('Final zkey exported to:', zkeyFinal);
  
  console.log('Step 4: Generate Solidity verifier...');
  
  const vKey = snarkjs.zKey.exportVerificationKey(finalZKey);
  const verifierSolidity = snarkjs.zKey.exportSolidityVerifier(vKey);
  
  fs.writeFileSync(
    path.join(CIRCUIT_DIR, 'Verifier.sol'),
    verifierSolidity
  );
  console.log('Solidity verifier generated');
  
  // Export verification key for JS
  fs.writeFileSync(
    path.join(CIRCUIT_DIR, 'verification_key.json'),
    JSON.stringify(vKey, null, 2)
  );
  console.log('Verification key exported');
  
  console.log('\n=== Setup Complete ===');
}

setup().catch(console.error);