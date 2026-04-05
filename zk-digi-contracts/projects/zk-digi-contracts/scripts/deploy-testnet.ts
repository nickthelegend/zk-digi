import * as algosdk from 'algosdk'

const DEPLOYER_MNEMONIC = "tone bounce fish brass pizza supply mercy mango guard fresh furnace fold smooth tool illegal winter math target laptop tortoise castle seminar marble absent announce"

async function deploy() {
  console.log('=== Deploying ZK Document Verifier to TestNet ===')
  
  const account = algosdk.mnemonicToSecretKey(DEPLOYER_MNEMONIC)
  console.log('Deployer address:', account.addr)
  
  const client = new algosdk.Algodv2('', 'https://testnet-api.4160.nodely.dev', '443')
  
  const params = await client.getTransactionParams().do()
  
  console.log('firstValid:', params.firstValid.toString())
  console.log('lastValid:', params.lastValid.toString())
  
  const approvalProgramSource = `#pragma version 2
int 1`

  const clearProgramSource = `#pragma version 2
int 1`

  const approvalProgram = await client.compile(approvalProgramSource).do()
  const approvalBinary = algosdk.base64ToBytes(approvalProgram.result)
  
  const clearProgram = await client.compile(clearProgramSource).do()
  const clearBinary = algosdk.base64ToBytes(clearProgram.result)

  console.log('Creating transaction...')
  
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

  console.log('Signing transaction...')
  const signedTxn = txn.signTxn(account.sk)
  
  console.log('Submitting transaction...')
  const txInfo = await client.sendRawTransaction(signedTxn).do()
  console.log('Transaction ID:', txInfo.txid)
  console.log('Response:', JSON.stringify(txInfo))
  
  // Wait for confirmation
  console.log('Waiting for confirmation...')
  await new Promise(resolve => setTimeout(resolve, 8000))
  
  // Check the transaction status
  const txDetails = await client.pendingTransactionInformation(txInfo.txid).do()
  console.log('Transaction confirmed')
  console.log('txDetails keys:', Object.keys(txDetails))
  
  // Look for app ID
  let appId: any = null
  
  // Try different paths to find the app ID
  if (txDetails.applicationIndex) {
    appId = txDetails.applicationIndex
  } else if (txDetails['application-index']) {
    appId = txDetails['application-index']
  } else if (txDetails.txn && txDetails.txn.txn && txDetails.txn.txn.apid) {
    appId = txDetails.txn.txn.apid
  } else if (txDetails.txn && txDetails.txn.txn && txDetails.txn.txn.applications) {
    appId = txDetails.txn.txn.applications[0]
  }
  
  console.log('Found appId:', appId)
  
  if (!appId) {
    console.log('Full txDetails:', JSON.stringify(txDetails, (k, v) => {
      if (typeof v === 'bigint') return v.toString()
      return v
    }, 2))
    throw new Error('App ID not found - transaction may have failed')
  }
  
  const appIdNum = Number(appId)
  
  console.log(`\n=== DEPLOYMENT SUCCESSFUL ===`)
  console.log(`ZK Verifier App ID: ${appIdNum}`)
  console.log(`Network: testnet`)
  console.log(`Transaction ID: ${txInfo.txid}`)
  console.log(`\nNote: App Address can be computed as: algosdk.getApplicationAddress(${appIdNum})`)
  
  return { appId: appIdNum }
}

deploy().catch(console.error)