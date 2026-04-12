import * as algosdk from 'algosdk';

async function main() {
    const appId = 758725521;
    const appAddress = algosdk.getApplicationAddress(appId);
    console.log("App Address:", appAddress);
}
main();
