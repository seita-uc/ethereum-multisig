require('chai').should();
const WalletFactory = artifacts.require("WalletFactory");
const MultiSig2of2 = artifacts.require("MultiSig2of2");
const ethabi = require("ethereumjs-abi");
const BN = web3.utils.BN;

const deposit = 1000; // wei
const firstSpend = 100;
const secondSpend = 900;

// Expected Error test for a failed require()
const vmExceptionTextRevert = (reasonNum) => {
    return `Returned error: VM Exception while processing transaction: revert ${reasonNum}`;
}
const makeDeposit = (accounts, testContract) => {
    return web3.eth.sendTransaction({from: accounts[0], to: testContract.address, value: deposit});
}
const makeSignature = async (message, signer1, signer2) => {
    try {
        const signature1 = web3.eth.accounts.sign(message, signer1.privateKey);
        const signature2 = web3.eth.accounts.sign(message, signer2.privateKey);

        return {
            v1: signature1.v,
            r1: signature1.r,
            s1: signature1.s,
            v2: signature2.v,
            r2: signature2.r,
            s2: signature2.s,
        };
    } catch(e) {
        throw e;
    }
}
const sendSpendTransaction = async (destination, value, signature, testContract) => {
    try {
        const result = await testContract.spend.sendTransaction(
            destination,
            value,
            signature.v1,
            signature.r1,
            signature.s1,
            signature.v2,
            signature.r2,
            signature.s2
        );
        return result;
    } catch(e) {
        throw e;
    }
}

//mnemonic for test
//execute secret powder segment fit until flame echo steel foot virtual fiscal
const privKeys = [
    "0xd14bcbfe7dc58e6c2c5454584aa4a20a27a4c877961dcbdb97cdb93fa5daeb0f",
    "0xfc91a97a7bd8aea800b05e1b1cc6cd92da5c9df00dfb66c798f1a908f93a007a",
    "0xa5a82535357a7a0f65e416b109dd9d83fc4bdfdf9bb05337d10b2e00e984320d",
    "0x949ff1059082841c1bfd6cba7ed527e49bc0ac22fa2009ab7e3b37c98706e2d5",
    "0x42b435b35784bc6b5a3134a2de12c200126212e33f2023c626b6335cb948a9d1",
    "0x8708cfb3a7c4a72c11c4d02ba75e50bec26533e561b3605a2d03dad15851c4f7",
    "0x69cb946e7020d73bf733289ec05484ddf62831ad6d6bfd94de4e6cf1eeb9354d",
    "0x10384e409af26b8cdc59cdbab68a178f2402e531da27013f16d81f047e6e37f1",
    "0x0ed4f3506d7376c51203eb3f984db92afe4968449efe1f18bcce3cc75d8a3f32",
    "0x3ec7e8cc35d4fcbe2cf7aadab75a938501836f97c5c0c2f071efc8126435f74a",
];

contract("When constructing", async (accounts) => {

    it("does not raise an error without any arguments", async () => {
        try {
            const instance = await WalletFactory.new();
            assert(true);
        } catch(e) {
            assert(false, "Unexpected error in constructor")
        }
    });

    it("raises an error with a argument", async () => {
        try {
            const instance = await WalletFactory.new(accounts[1]);
            assert(false, "expected error in constructor")
        } catch(e) {
            assert.equal(e.message, "Invalid number of parameters for \"undefined\". Got 1 expected 0!");
        }
    });
});

contract.only("When first created", async (accounts) => {

    let testContract;

    beforeEach(async () => {
        try {
            testContract = await WalletFactory.new();
        } catch(e) {
            assert(false, "Unexpected error in constructor: " + e.message);
        }
    });

    it("cannot accept funds", async () => {
        try {
            await makeDeposit(accounts, testContract);
            assert(false, "Expected error")
        } catch(e) {
            assert.equal(e.message, "Returned error: VM Exception while processing transaction: revert");
            const balance = await web3.eth.getBalance(testContract.address);
            assert.equal(balance, 0);
        }
    });

    it("can deploy wallet", async () => {
        try {
            const owner1 = accounts[0];
            const owner2 = accounts[1];
            const receipt = await testContract.createWallet(owner1, owner2);
            assert.equal();
            console.log(receipt);
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    //it("raises an error when using the contract address as a destination in the message to sign", async () => {
        //try {
            //const nonce = await testContract.spendNonce.call();
            //const contractAddress = new BN(testContract.address.slice(2), 16);
            //const value = deposit;
            //const destination = new BN(accounts[4].slice(2), 16);
            //const message = web3.utils.keccak256(
                //ethabi.solidityPack(
                    //[ "uint256", "address", "uint256", "address" ],
                    //[ nonce, contractAddress, value, destination ]
                //)
            //);
            //const messageToSign = await testContract.generateMessageToSign.call(testContract.address, deposit);
            //assert(false, "Expected error");
        //} catch(e) {
            //assert.equal(true, e.message.startsWith(vmExceptionTextRevert(2)));
        //}
    //});
    
});
