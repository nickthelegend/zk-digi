import algosdk from 'algosdk';

const MNEMONIC = 'tone bounce fish brass pizza supply mercy mango guard fresh furnace fold smooth tool illegal winter math target laptop tortoise castle seminar marble absent announce';
const account = algosdk.mnemonicToSecretKey(MNEMONIC);
const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);

async function check() {
    try {
        const info = await algodClient.accountInformation(account.addr).do();
        console.log(`Address: ${account.addr}`);
        console.log(`Balance: ${info.amount / 1_000_000} ALGO`);
    } catch (e) {
        console.error(e);
    }
}

check();
