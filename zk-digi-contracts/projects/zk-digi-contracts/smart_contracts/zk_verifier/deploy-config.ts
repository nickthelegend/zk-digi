import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { ZkVerifierFactory } from '../artifacts/zk_verifier/ZkVerifierClient'
import * as algosdk from 'algosdk'

const DEPLOYER_MNEMONIC = "tone bounce fish brass pizza supply mercy mango guard fresh furnace fold smooth tool illegal winter math target laptop tortoise castle seminar marble absent announce"

export async function deploy() {
  console.log('=== Deploying ZK Document Verifier to TestNet ===')

  const algorand = AlgorandClient.fromEnvironment({
    network: 'testnet',
  })
  
  const account = algosdk.mnemonicToSecretKey(DEPLOYER_MNEMONIC)
  const deployer = {
    addr: account.addr,
    signTxn: async (txn: algosdk.Transaction) => {
      return txn.signTxn(account.sk)
    }
  }
  
  console.log('Deployer address:', deployer.addr)

  const factory = algorand.client.getTypedAppFactory(ZkVerifierFactory, {
    defaultSender: deployer.addr,
  })

  const { appClient, result } = await factory.deploy({
    onUpdate: 'append',
    onSchemaBreak: 'append',
  })

  console.log('Deployment result:', result)

  if (['create', 'replace'].includes(result.operationPerformed)) {
    await algorand.send.payment({
      amount: (1).algo(),
      sender: deployer.addr,
      receiver: appClient.appAddress,
    })
    console.log('Funded app account')
  }

  console.log(`\n=== DEPLOYMENT SUCCESSFUL ===`)
  console.log(`ZK Verifier App ID: ${appClient.appClient.appId}`)
  console.log(`App Address: ${appClient.appAddress}`)
  console.log(`Network: testnet`)
  
  return {
    appId: appClient.appClient.appId,
    appAddress: appClient.appAddress,
  }
}