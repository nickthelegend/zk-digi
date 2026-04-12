import * as algosdk from 'algosdk';
import { AlgorandClient } from '@algorandfoundation/algokit-utils';

const DEPLOYER_MNEMONIC = "tone bounce fish brass pizza supply mercy mango guard fresh furnace fold smooth tool illegal winter math target laptop tortoise castle seminar marble absent announce";
const APPS_TO_DELETE = [758725888, 758725963, 758726000, 758726045, 758726080];

async function main() {
  const algorand = AlgorandClient.testNet();
  const account = algosdk.mnemonicToSecretKey(DEPLOYER_MNEMONIC);
  algorand.setSigner(account.addr, algosdk.makeBasicAccountTransactionSigner(account));

  console.log(`Cleaning up ${APPS_TO_DELETE.length} apps for ${account.addr}...`);

  for (const appId of APPS_TO_DELETE) {
    try {
      console.log(`Attempting to delete App ${appId}...`);
      const result = await algorand.send.appDelete({ sender: account.addr, appId: BigInt(appId) });
      console.log(`✅ Deleted App ${appId}, TX: ${result.txId}`);
    } catch (e: any) {
      console.log(`❌ Failed to delete ${appId}: ${e.message}`);
    }
  }
}

main().catch(console.error);
