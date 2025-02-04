const WalletFactory = artifacts.require('WalletFactory'); 
const MultiSig2of2 = artifacts.require('MultiSig2of2'); 
const Forwarder = artifacts.require('Forwarder'); 
const ethutil = require('ethereumjs-util');
const ethabi = require('ethereumjs-abi');

function logEvents(receipt) {
    if(receipt.logs.length == 0) return;
    console.log("\n------------------Events------------------\n");
    for(let i = 0; i < receipt.logs.length; i++) {
        console.log(receipt.logs[i].event + ": " + JSON.stringify(receipt.logs[i].args) + "\n");
    }
    console.log("------------------------------------------\n");
}

module.exports = async (callback) => {
    try {
        const accounts = await web3.eth.getAccounts();
        const netId = await web3.eth.net.getId();

        let privKeys = [];
        //develop環境
        if(netId == 5777) {
            privKeys.push("0x29c26a0b39614c5a98bcd65a8f13039102c51d0e9e0058ff918d105202c83426");
            privKeys.push("0x30d7497ac8065286e30d2ef0abde7ad270b1621b173d5a50b236d9a2bb53844c");
            privKeys.push("0x0e70d2d612c986a50cce5fdfdac4e1c018d65b765e4ac9673eec946d3715aa99");
        } else {
            privKeys.push("0x" + web3.currentProvider.wallets[accounts[0].toLowerCase()]._privKey.toString("hex"));
            privKeys.push("0x" + web3.currentProvider.wallets[accounts[1].toLowerCase()]._privKey.toString("hex"));
        }

        console.log("setting up accounts");
        const owner1 = web3.eth.accounts.privateKeyToAccount(privKeys[0]);
        const owner2 = web3.eth.accounts.privateKeyToAccount(privKeys[1]);

        console.log("accounts: " + accounts);
        console.log("signer1: " + owner1.address);
        console.log("signer2: " + owner2.address);

        console.log("deploying WalletFactory");
        const factory = await WalletFactory.new({ from: accounts[0] })
            .once('transactionHash', (hash) => {
                console.log('transactionHash: ' + hash);
            })
            .once('receipt', (receipt) => {
                console.log('status: ' + receipt.status);
                logEvents(receipt);
            });

        console.log("deploying Wallet");
        const walletReceipt = await factory.deployWallet(owner1.address, owner2.address)
            .once('transactionHash', (hash) => {
                console.log('transactionHash: ' + hash);
            })
            .once('receipt', (receipt) => {
                console.log('status: ' + receipt.status);
                logEvents(receipt);
            });
        console.log("instantiating Wallet");
        const wallet = await MultiSig2of2.at(walletReceipt.logs[0].args.wallet);
        console.log("sending ether to Wallet");
        await wallet.send(web3.utils.toWei("0.01", "ether"))
            .once('transactionHash', (hash) => {
                console.log('transactionHash: ' + hash);
            })
            .once('receipt', (receipt) => {
                console.log('status: ' + receipt.status);
                logEvents(receipt);
            });

        console.log("deploying Forwarder");
        const forwarderReceipt = await wallet.createForwarder()
            .once('transactionHash', (hash) => {
                console.log('transactionHash: ' + hash);
            })
            .once('receipt', (receipt) => {
                console.log('status: ' + receipt.status);
                logEvents(receipt);
            });
        console.log("instantiating Forwarder");
        const forwarder = await Forwarder.at(forwarderReceipt.logs[0].args.forwarder);
        console.log("sending ether to Forwarder");
        await forwarder.send(web3.utils.toWei("0.01", "ether"))
            .once('transactionHash', (hash) => {
                console.log('transactionHash: ' + hash);
            })
            .once('receipt', (receipt) => {
                console.log('status: ' + receipt.status);
                logEvents(receipt);
            });

        const destination = accounts[2];
        const value = 100;

        console.log("generating message");
        const message = await wallet.generateMessageToSign(destination, value);
        const hashedMessage = web3.eth.accounts.hashMessage(message);

        console.log("message: " + message);
        console.log("message length: " + web3.utils.hexToBytes(message).length);
        console.log("hashedMessage: " + hashedMessage.toString('hex'));

        const signature1 = web3.eth.accounts.sign(message, owner1.privateKey);
        const signature2 = web3.eth.accounts.sign(message, owner2.privateKey);

        const v1 = signature1.v;
        const r1 = signature1.r;
        const s1 = signature1.s;
        const v2 = signature2.v;
        const r2 = signature2.r;
        const s2 = signature2.s;

        console.log("v1: " + v1);
        console.log("r1: " + r1);
        console.log("s1: " + s1);
        console.log("v2: " + v2);
        console.log("r2: " + r2);
        console.log("s2: " + s2);

        await wallet.spend.sendTransaction(
            destination,
            value,
            v1,
            r1,
            s1,
            v2,
            r2,
            s2,
        ).once('receipt', (receipt) => {
            logEvents(receipt);
        });

        //interface
        //function spend(
        //  address destination,
        //  uint256 value,
        //  uint8 v1,
        //  bytes32 r1,
        //  bytes32 s1,
        //  uint8 v2,
        //  bytes32 r2,
        //  bytes32 s2
        //)
    
    } catch(err) {
        console.error(err);
    }
    return callback();
}
