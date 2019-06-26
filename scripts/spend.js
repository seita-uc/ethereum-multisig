const WalletFactory = artifacts.require('WalletFactory'); 
const MultiSig2of2 = artifacts.require('MultiSig2of2'); 
const ethutil = require('ethereumjs-util');
const ethabi = require('ethereumjs-abi');

module.exports = async (callback) => {
    try {
        const privKeys = [
            "0x29c26a0b39614c5a98bcd65a8f13039102c51d0e9e0058ff918d105202c83426",
            "0x30d7497ac8065286e30d2ef0abde7ad270b1621b173d5a50b236d9a2bb53844c",
            "0x0e70d2d612c986a50cce5fdfdac4e1c018d65b765e4ac9673eec946d3715aa99",
            "0x3bae1fa8e89eff4a2dbe264ce380a64ad4d526323ad257c4b88e098a58919109",
            "0xced8ef84a263ff5778ecb499bf5652817e08efdf876ab88d23ffc88487136908",
            "0x280fe362db574cfd60af0662443c8197c164d53b1e23d177c1df18b372af33a5",
            "0x90e91ee6d17825ac24e3c830da170f4f145eb5c36c68a4e6177fd41aca88910b",
            "0x1be76960d2e575b681f209e7f9bf3a2e62a8a24d1a04753cfde453117d780fdf",
            "0xbce0f6baa6dcdae896c30c48bf24c1bfa4bb6a6e15e3b0d8edc16ed5de8b130e",
            "0x3a8ecb169ff80d1a28dadb031c7a96c2f8a4498de488c8321cb4d8dd5ec5aa70",
        ];
        const accounts = await web3.eth.getAccounts();
        const factory = await WalletFactory.new({ from: accounts[0] });
        const receipt = await factory.deployWallet(accounts[0], accounts[1]);
        const owner1 = web3.eth.accounts.privateKeyToAccount(privKeys[0]);
        const owner2 = web3.eth.accounts.privateKeyToAccount(privKeys[1]);

        const wallet = await MultiSig2of2.at(receipt.logs[0].args.wallet);
        await wallet.send(web3.utils.toWei("0.01", "ether"));

        const destination = accounts[2];
        const value = 100;

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

        console.log("signer1: " + accounts[0]);
        console.log("signer2: " + accounts[1]);

        console.log("v1: " + v1);
        console.log("r1: " + r1);
        console.log("s1: " + s1);
        console.log("v2: " + v2);
        console.log("r2: " + r2);
        console.log("s2: " + s2);

        const result = await wallet.spend.sendTransaction(
            destination,
            value,
            v1,
            r1,
            s1,
            v2,
            r2,
            s2,
        );
        console.log("\nevents\n");
        for(let i = 0; i < result.logs.length; i++) {
            console.log(result.logs[i].event + ": " + JSON.stringify(result.logs[i].args));
        }

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
