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
const firstInvocation = (accounts) => {
    const currentNonce = web3.eth.getTransactionCount(accounts[0]);
    return (currentNonce == 4); // why 4?
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

    it("raises an error without any arguments", async () => {
        try {
            const instance = await MultiSig2of2.new();
            assert(false, "Expected error in constructor")
        } catch(e) {
            assert.equal(e.message, "Invalid number of parameters for \"undefined\". Got 0 expected 2!");
        }
    });

    it("raises an error with a single argument", async () => {
        try {
            const instance = await MultiSig2of2.new(accounts[1]);
            assert(false, "Expected error in constructor")
        } catch(e) {
            assert.equal(e.message, "Invalid number of parameters for \"undefined\". Got 1 expected 2!");
        }
    });

    it("raises an error with two arguments when the two are duplicates", async () => {
        try {
            const instance = await MultiSig2of2.new(accounts[1], accounts[1]);
            assert(false, "Expected error in constructor");
        } catch(e) {
            assert.equal(true, e.message.startsWith(vmExceptionTextRevert(1)));
        }
    });

    it("does not raise error with two distinct arguments", async () => {
        try {
            const instance = await MultiSig2of2.new(accounts[1], accounts[2]);
            assert(true);
        } catch(e) {
            assert(false, "Unexpected error in constructor: " + e.message);
        }
    });
});

contract("When first created", async (accounts) => {

    let testContract;

    beforeEach(async () => {
        try {
            testContract = await MultiSig2of2.new(accounts[1], accounts[2]);
        } catch(e) {
            assert(false, "Unexpected error in constructor: " + e.message);
        }
    });

    it("has a zero spendNonce value", async () => {
        try {
            const nonce = await testContract.spendNonce.call();
            assert.equal(nonce, 0);
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("has a correct Major Version value", async () => {
        try {
            const major = await testContract.unchainedMultisigVersionMajor.call();
            assert.equal(major, 2);
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("has a correct Minor Version value", async () => {
        try {
            const minor = await testContract.unchainedMultisigVersionMinor.call();
            assert.equal(minor, 0);
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("can accept funds", async () => {
        try {
            await makeDeposit(accounts, testContract);
            const balance = await web3.eth.getBalance(testContract.address);
            assert.equal(balance, deposit);
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("emits a 'Funded' event when accepting funds", async () => {
        try {
            const result = await testContract.sendTransaction({
                from: accounts[0],
                to: testContract.address,
                value: deposit
            });
            assert.equal(result.logs[0].event, "Funded");
            return assert.equal(result.logs[0].args.newBalance.toString(), deposit.toString());
        } catch(e) {
            return assert(false, "Unexpected error: " + e.message);
        }
    });

});

contract("When first created", async (accounts) => {

    let testContract;

    beforeEach(async () => {
        try {
            testContract = await MultiSig2of2.new(accounts[1], accounts[2]);
        } catch(e) {
            assert(false, "Unexpected error in constructor: " + e.message);
        }
    });

    it("returns the expected message to sign", async () => {
        try {
            const nonce = await testContract.spendNonce.call();
            const contractAddress = new BN(testContract.address.slice(2), 16);
            const value = deposit;
            const destination = new BN(accounts[4].slice(2), 16);
            const message = web3.utils.keccak256(
                ethabi.solidityPack(
                    [ "uint256", "address", "uint256", "address" ],
                    [ nonce, contractAddress, value, destination ]
                )
            );
            const messageToSign = await testContract.generateMessageToSign.call(accounts[4], deposit);
            assert.equal(message, messageToSign);
        } catch(e) {
            assert(false, "Unexpected error in constructor: " + e.message);
        }
    });

    it("raises an error when using the contract address as a destination in the message to sign", async () => {
        try {
            const nonce = await testContract.spendNonce.call();
            const contractAddress = new BN(testContract.address.slice(2), 16);
            const value = deposit;
            const destination = new BN(accounts[4].slice(2), 16);
            const message = web3.utils.keccak256(
                ethabi.solidityPack(
                    [ "uint256", "address", "uint256", "address" ],
                    [ nonce, contractAddress, value, destination ]
                )
            );
            const messageToSign = await testContract.generateMessageToSign.call(testContract.address, deposit);
            assert(false, "Expected error");
        } catch(e) {
            assert.equal(true, e.message.startsWith(vmExceptionTextRevert(2)));
        }
    });

});

contract("When already funded", async (accounts) => {

    let testContract;

    beforeEach(async () => {
        try {
            testContract = await MultiSig2of2.new(accounts[0], accounts[1]);
            await makeDeposit(accounts, testContract)	    
        } catch(e) {
            assert(false, "Unexpected error in constructor: " + e.message);
        }
    });

    it("can accept funds", async () => {
        try {
            await makeDeposit(accounts, testContract);
            const balance = await web3.eth.getBalance(testContract.address);
            assert.equal(balance, deposit * 2);
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("emits a 'Funded' event when accepting funds", async () => {
        try {
            const result = await testContract.sendTransaction({ 
                from: accounts[0],
                to: testContract.address,
                value: deposit
            });
            assert.equal(result.logs[0].event, "Funded");
            assert.equal(result.logs[0].args.newBalance.toString(), (deposit * 2).toString());
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });
});

contract("When already funded", async (accounts) =>  {

    let testContract;
    const signer1 = web3.eth.accounts.privateKeyToAccount(privKeys[0]);
    const signer2 = web3.eth.accounts.privateKeyToAccount(privKeys[1]);

    beforeEach(async () => {
        try {
            testContract = await MultiSig2of2.new(signer1.address, signer2.address);
            await makeDeposit(accounts, testContract);	    
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("can be spent by signed messages from the 1st & 2nd owners", async () => {
        try {
            const destination = accounts[4];
            const value = firstSpend;
            const beforeDestinationBalance = new BN(await web3.eth.getBalance(destination));
            const beforeContractBalance = new BN(await web3.eth.getBalance(testContract.address));
            const expectedContractBalance = new BN(beforeContractBalance).sub(new BN(firstSpend));

            const message = await testContract.generateMessageToSign(destination, value);
            const signature1 = web3.eth.accounts.sign(message, signer1.privateKey);
            const signature2 = web3.eth.accounts.sign(message, signer2.privateKey);

            const v1 = signature1.v;
            const r1 = signature1.r;
            const s1 = signature1.s;
            const v2 = signature2.v;
            const r2 = signature2.r;
            const s2 = signature2.s;

            const result = await testContract.spend.sendTransaction(
                destination,
                value,
                v1,
                r1,
                s1,
                v2,
                r2,
                s2
            );
            const afterContractBalance = new BN(await web3.eth.getBalance(testContract.address));
            assert.equal(afterContractBalance.toString(), expectedContractBalance.toString());

            const expectedValueSpent = new BN(firstSpend);
            const expectedDestinationBalance = beforeDestinationBalance.add(expectedValueSpent);
            const afterDestinationBalance = new BN(await web3.eth.getBalance(destination));
            assert.equal(afterDestinationBalance.toString(), expectedDestinationBalance.toString());
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });
});

contract("When already funded", async (accounts) => {

    let testContract;
    const signer1 = web3.eth.accounts.privateKeyToAccount(privKeys[0]);
    const signer2 = web3.eth.accounts.privateKeyToAccount(privKeys[1]);

    beforeEach(async () => {
        try {
            testContract = await MultiSig2of2.new(signer1.address, signer2.address);
            await makeDeposit(accounts, testContract);	    
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("emits a 'Spent' event when it is correctly spent", async () => {
        const destination = accounts[4];
        const value = firstSpend;
        const message = await testContract.generateMessageToSign(destination, value);
        const signature1 = web3.eth.accounts.sign(message, signer1.privateKey);
        const signature2 = web3.eth.accounts.sign(message, signer2.privateKey);

        const v1 = signature1.v;
        const r1 = signature1.r;
        const s1 = signature1.s;
        const v2 = signature2.v;
        const r2 = signature2.r;
        const s2 = signature2.s;

        const result = await testContract.spend.sendTransaction(
            destination,
            value,
            v1,
            r1,
            s1,
            v2,
            r2,
            s2
        );
        assert.equal(result.logs[0].event, "Spent");
        assert.equal(result.logs[0].args.to, destination);
        assert.equal(result.logs[0].args.transfer.toString(), firstSpend.toString());
    });
});

contract("When already funded", async (accounts) => {

    let testContract;
    let destination;
    let beforeDestinationBalance;
    const signer1 = web3.eth.accounts.privateKeyToAccount(privKeys[0]);
    const signer2 = web3.eth.accounts.privateKeyToAccount(privKeys[1]);

    beforeEach(async () => {
        try {
            testContract = await MultiSig2of2.new(signer1.address, signer2.address);
            await makeDeposit(accounts, testContract);	    
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("throws an error when invalid messages are sent", async () => {
        try {
            destination = accounts[4];
            beforeDestinationBalance = new BN(await web3.eth.getBalance(destination));
            const value = firstSpend;

            const message = await testContract.generateMessageToSign(destination, value);
            const signature1 = web3.eth.accounts.sign(message, signer1.privateKey);
            const signature2 = web3.eth.accounts.sign(message, signer2.privateKey);

            const v1 = signature1.v;
            const r1 = signature1.r;
            const s1 = signature1.s;
            const v2 = signature2.v;
            const r2 = signature2.r;
            const badS2 = signature2.s.replace("a", "b");

            const result = await testContract.spend.sendTransaction(
                destination,
                value,
                v1,
                r1,
                s1,
                v2,
                r2,
                badS2
            );
            assert(false, "Expected error when invalid messages were sent"); 
        } catch(e) {
            assert.equal(true, e.message.startsWith(vmExceptionTextRevert(5)));

            const afterContractBalance = await web3.eth.getBalance(testContract.address);
            assert.equal(afterContractBalance, deposit.toString());

            const expectedValueSpent = new BN(0);
            const expectedDestinationBalance = beforeDestinationBalance.add(expectedValueSpent);
            const afterDestinationBalance = new BN(await web3.eth.getBalance(destination));
            assert.equal(afterDestinationBalance.toString(), expectedDestinationBalance.toString());
        };
    });
});

contract("When already funded", async (accounts) => {

    let testContract;
    let destination;
    let beforeDestinationBalance;
    const signer1 = web3.eth.accounts.privateKeyToAccount(privKeys[0]);
    const signer2 = web3.eth.accounts.privateKeyToAccount(privKeys[1]);

    beforeEach(async () => {
        try {
            testContract = await MultiSig2of2.new(signer1.address, signer2.address);
            await makeDeposit(accounts, testContract);	    
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("throws an error when message was sent with invalid value", async () => {
        try {
            destination = accounts[4];
            beforeDestinationBalance = new BN(await web3.eth.getBalance(destination));
            const value = firstSpend;

            const message = await testContract.generateMessageToSign(destination, value);
            const signature1 = web3.eth.accounts.sign(message, signer1.privateKey);
            const signature2 = web3.eth.accounts.sign(message, signer2.privateKey);

            const v1 = signature1.v;
            const r1 = signature1.r;
            const s1 = signature1.s;
            const v2 = signature2.v;
            const r2 = signature2.r;
            const badS2 = signature2.s.replace("a", "b");

            const invalidValue = 101; //Supposed to be 100 
            const result = await testContract.spend.sendTransaction(
                destination,
                invalidValue,
                v1,
                r1,
                s1,
                v2,
                r2,
                badS2
            );
            assert(false, "Expected error when message was sent with invalid value"); 
        } catch(e) {
            assert.equal(true, e.message.startsWith(vmExceptionTextRevert(5)));

            const afterContractBalance = await web3.eth.getBalance(testContract.address);
            assert.equal(afterContractBalance, deposit.toString());
            const expectedValueSpent = new BN(0);
            const expectedDestinationBalance = beforeDestinationBalance.add(expectedValueSpent);
            const afterDestinationBalance = new BN(await web3.eth.getBalance(destination));
            assert.equal(afterDestinationBalance.toString(), expectedDestinationBalance.toString());
        }
    });
});


//contract("When already funded", (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(address1, address2, address3).then((instance) {
            //testContract = instance;
            //makeDeposit(accounts, testContract)
        //});
    //});

    //if (firstInvocation(accounts)) {
        //it("throws an error when killed with correct message signed by wrong account", () => {
            //const startingDestinationBalance = web3.eth.getBalance(accounts[4])

            //// TODO: re-sign this
            //// correct message, signed with m/44"/6266"/1"/0/0
            //wrongR3 = 0xf1eb55bb4bd6602ebab1c927e0f24807a6703767965f3394ba772ae7166702bf;
            //wrongS3 = 0x5e3d5bdf9e7243ba3683918360b6939f38ed2ee87684e5c36022e01b58152363;
            //wrongV3 = 0x01;
            //return testContract.spend.sendTransaction(accounts[4], firstSpend, V1, R1, S1,  wrongV3, wrongR3, wrongS3).then((instance) { 
                //assert(false, "Expected error when killing"); 
            //}).catch((e) => {
                //assert.equal(e.message, vmExceptionTextRevert);
                //assert.equal(web3.eth.getBalance(testContract.address).toString(), deposit.toString());
                //const expectedTransfer = new web3.BigNumber(0)
                //const increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
                //assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
            //});
        //});
    //}
//});

//contract("When already funded", (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(address1, address2, address3).then((instance) {
            //testContract = instance;
            //makeDeposit(accounts, testContract)
        //});
    //});

    //if (firstInvocation(accounts)) {
        //it("throws error when killed with wrong destination", () => {
            //const startingDestinationBalance = web3.eth.getBalance(accounts[4])

            //badDestination = accounts[5]

            //return testContract.spend.sendTransaction(badDestination, firstSpend, V1, R1, S1, V3, R3, S3).then((instance) { 
                //assert(false, "Expected error when killing"); 
            //}).catch((e) => {
                //assert.equal(e.message, vmExceptionTextRevert);
                //assert.equal(web3.eth.getBalance(testContract.address).toString(), deposit.toString());
                //const expectedTransfer = new web3.BigNumber(0)
                //const increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
                //assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
            //});
        //});
    //}
//});


//contract("When already spent once", (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(address1, address2, address3).then((instance) {
            //testContract = instance;
            //makeDeposit(accounts, testContract);
        //});
    //});

    //if (firstInvocation(accounts)) {
        //it("has an incremented spendNonce value", () => {
            //return testContract.spend.sendTransaction(accounts[4],
                //firstSpend,
                //V1,
                //R1,
                //S1,
                //V3,
                //R3,
                //S3)
                //.then((instance) {
                    //return testContract.spendNonce.call().then((nonce) {
                        //assert.equal(nonce, 1);
                    //});
                //});
        //});
    //}
//});

//contract("When already spent once", (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(address1, address2, address3).then((instance) {
            //testContract = instance;
            //makeDeposit(accounts, testContract);
        //});
    //});

    //if (firstInvocation(accounts)) {
        //it("returns the expected message to sign", () => {
            //return testContract.spend.sendTransaction(accounts[4],
                //firstSpend,
                //V1,
                //R1,
                //S1,
                //V3,
                //R3,
                //S3)
                //.then((instance) {	    
                    //return testContract.generateMessageToSign.call(accounts[5], secondSpend).then((message) {
                        //assert.equal(message,"0x9bd9f4b563191943c9008219a2279fccf4d38eafe5e01e6fdfcf4097a2a2d727");
                    //});
                //});
        //});
    //}
//});

//contract("When already spent once", (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(address1, address2, address3).then((instance) {
            //testContract = instance;
            //makeDeposit(accounts, testContract);
            //testContract.spend.sendTransaction(accounts[4], firstSpend, V1, R1, S1, V3, R3, S3).then((instance) {
                //return true;
            //});
        //});
    //});

    //if (firstInvocation(accounts)) {
        //it("can be spent by signed messages from the 1st & 2nd owners", () => {
            //const startingDestinationBalance = web3.eth.getBalance(accounts[5])	    

            //return testContract.spend.sendTransaction(accounts[5], secondSpend, V1_1, R1_1, S1_1, V2_1, R2_1, S2_1).then(() => {
                //assert.equal(web3.eth.getBalance(testContract.address).toString(), "0");
                //const expectedTransfer = new web3.BigNumber(secondSpend)
                //const increaseInDestination = web3.eth.getBalance(accounts[5]).minus(startingDestinationBalance);
                //assert.equal(increaseInDestination.toString(), secondSpend.toString());
            //});
        //});
    //}
//});

//contract("When already spent once", (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(address1, address2, address3).then((instance) {
            //testContract = instance;
            //makeDeposit(accounts, testContract);
            //testContract.spend.sendTransaction(accounts[4], firstSpend, V1, R1, S1, V3, R3, S3).then((instance) {
                //return true;
            //});
        //});
    //});

    //if (firstInvocation(accounts)) {
        //it("cannot be spent by previously valid signed messages from the 1st & 2nd owners", () => {
            //const startingDestinationBalance = web3.eth.getBalance(accounts[4])
            //const expectedContractBalance = deposit - firstSpend


            //return testContract.spend.sendTransaction(accounts[4], firstSpend, V1, R1, S1, V2, R2, S2).then(() => {
                //assert(false, "Expected error when spending"); 
            //}).catch((e) => {
                //assert.equal(e.message, vmExceptionTextRevert);
                //assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedContractBalance.toString());
                //const expectedTransfer = new web3.BigNumber(firstSpend)
                //const increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
                //assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
            //});
        //});
    //}
//});
