import * as algosdk from 'algosdk';

const DEPLOYER_MNEMONIC = "tone bounce fish brass pizza supply mercy mango guard fresh furnace fold smooth tool illegal winter math target laptop tortoise castle seminar marble absent announce";

async function main() {
    const account = algosdk.mnemonicToSecretKey(DEPLOYER_MNEMONIC);
    console.log("Address:", account.addr);
    
    // Check balance on Testnet
    const client = new algosdk.Algodv2('', "https://testnet-api.algonode.cloud", '');
    const accountInfo = await client.accountInformation(account.addr).do();
    console.log("Balance:", Number(accountInfo.amount) / 1_000_000, "ALGO");
}

main().catch(console.error);
