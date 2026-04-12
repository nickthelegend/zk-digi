import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { ZkVerifierFactory } from '../artifacts/zk_verifier/ZkVerifierClient'
import * as algosdk from 'algosdk'
import fs from 'fs'
import path from 'path'

const DEPLOYER_MNEMONIC = "tone bounce fish brass pizza supply mercy mango guard fresh furnace fold smooth tool illegal winter math target laptop tortoise castle seminar marble absent announce"

export async function deploy() {
  console.log('=== Deploying Real ZK Verifier to TestNet ===')

  const algorand = AlgorandClient.testNet()
  
  const account = algosdk.mnemonicToSecretKey(DEPLOYER_MNEMONIC)
  algorand.setSigner(account.addr, algosdk.makeBasicAccountTransactionSigner(account))
  const deployer = account.addr
  
  console.log('Deployer address:', deployer)

  // Load encoded verification key
  const vkBase64 = fs.readFileSync(path.join(process.cwd(), 'vk_encoded.txt'), 'utf8').trim()
  const vkBytes = Buffer.from(vkBase64, 'base64')
  console.log('Loaded Verification Key (length:', vkBytes.length, 'bytes)')

  const factory = algorand.client.getTypedAppFactory(ZkVerifierFactory, {
    defaultSender: deployer,
  })

  // Pass VERIFICATION_KEY as a deploy-time template variable
  const { appClient, result } = await factory.deploy({
    onUpdate: 'append',
    onSchemaBreak: 'append',
    deployTimeParams: {
      VERIFICATION_KEY: vkBytes,
    }
  })

  console.log('Deployment result:', result.operationPerformed)

  if (['create', 'replace'].includes(result.operationPerformed)) {
    // Call initialize after creation
    console.log('Initializing contract state...')
    await appClient.send.initialize({
        args: {
            circuit: Buffer.from("multiplier")
        }
    })

    // Fund the app account for OpUp inner transactions
    await algorand.send.payment({
      amount: (1).algo(),
      sender: deployer.addr,
      receiver: appClient.appAddress,
    })
    console.log('Funded app account with 1 ALGO for OpUp budget')
  }

  console.log(`\n=== DEPLOYMENT SUCCESSFUL ===`)
  console.log(`ZK Verifier App ID: ${appClient.appId}`)
  console.log(`App Address: ${appClient.appAddress}`)
  console.log(`Network: testnet`)
  
  return {
    appId: appClient.appId,
    appAddress: appClient.appAddress,
  }
}