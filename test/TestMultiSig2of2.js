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

    it("raises an error without any arguments", async () => {
        try {
            const instance = await MultiSig2of2.new();
            assert(false, "expected error in constructor")
        } catch(e) {
            assert.equal(e.message, "Invalid number of parameters for \"undefined\". Got 0 expected 2!");
        }
    });

    it("raises an error with a single argument", async () => {
        try {
            const instance = await MultiSig2of2.new(accounts[1]);
            assert(false, "expected error in constructor")
        } catch(e) {
            assert.equal(e.message, "Invalid number of parameters for \"undefined\". Got 1 expected 2!");
        }
    });

    it("raises an error with two arguments when the two are duplicates", async () => {
        try {
            const instance = await MultiSig2of2.new(accounts[1], accounts[1]);
            assert(false, "expected error in constructor");
        } catch(e) {
            assert.equal(true, e.message.startsWith(vmExceptionTextRevert(1)));
        }
    });

    it("does not raise error with two distinct arguments", async () => {
        try {
            const instance = await MultiSig2of2.new(accounts[1], accounts[2]);
            assert(true);
        } catch(e) {
            assert(false, "unexpected error in constructor: " + e.message);
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

    it("has a zero spendnonce value", async () => {
        try {
            const nonce = await testContract.spendNonce.call();
            assert.equal(nonce, 0);
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("has a correct major version value", async () => {
        try {
            const major = await testContract.unchainedMultisigVersionMajor.call();
            assert.equal(major, 2);
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("has a correct minor version value", async () => {
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
            assert(false, "unexpected error: " + e.message);
        }
    });

    it("emits a 'funded' event when accepting funds", async () => {
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
            assert(false, "unexpected error in constructor: " + e.message);
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
            assert(false, "unexpected error in constructor: " + e.message);
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
            assert(false, "expected error");
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
            assert(false, "unexpected error in constructor: " + e.message);
        }
    });

    it("can accept funds", async () => {
        try {
            await makeDeposit(accounts, testContract);
            const balance = await web3.eth.getBalance(testContract.address);
            assert.equal(balance, deposit * 2);
        } catch(e) {
            assert(false, "unexpected error: " + e.message);
        }
    });

    it("emits a 'funded' event when accepting funds", async () => {
        try {
            const result = await testContract.sendTransaction({ 
                from: accounts[0],
                to: testContract.address,
                value: deposit
            });
            assert.equal(result.logs[0].event, "Funded");
            assert.equal(result.logs[0].args.newBalance.toString(), (deposit * 2).toString());
        } catch(e) {
            assert(false, "unexpected error: " + e.message);
        }
    });
});

contract("when already funded", async (accounts) =>  {

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
            const expectedContractBalance = new BN(beforeContractBalance).sub(new BN(value));

            const message = await testContract.generateMessageToSign(destination, value);
            const signature = await makeSignature(message, signer1, signer2);
            const result = await sendSpendTransaction(destination, value, signature, testContract);

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
        try {
            const destination = accounts[4];
            const value = firstSpend;
            const message = await testContract.generateMessageToSign(destination, value);
            const signature = await makeSignature(message, signer1, signer2);
            const result = await sendSpendTransaction(destination, value, signature, testContract);

            assert.equal(result.logs[0].event, "Spent");
            assert.equal(result.logs[0].args.to, destination);
            assert.equal(result.logs[0].args.transfer.toString(), firstSpend.toString());
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
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

            let signature = await makeSignature(message, signer1, signer2);
            //making invalid signature
            signature.s2 = signature.s2.replace("a", "b");
            const result = await sendSpendTransaction(destination, value, signature, testContract);

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
            const signature = await makeSignature(message, signer1, signer2);
            const invalidValue = 101; //Supposed to be 100 
            const result = await sendSpendTransaction(destination, invalidValue, signature, testContract);

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


contract("When already funded", async (accounts) => {

    let testContract;
    let destination;
    let beforeDestinationBalance;
    const owner1 = web3.eth.accounts.privateKeyToAccount(privKeys[0]);
    const owner2 = web3.eth.accounts.privateKeyToAccount(privKeys[1]);
    const nonOwner = web3.eth.accounts.privateKeyToAccount(privKeys[2]);

    beforeEach(async () => {
        try {
            testContract = await MultiSig2of2.new(owner1.address, owner2.address);
            await makeDeposit(accounts, testContract);	    
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("throws an error when correct message signed by wrong account was sent", async () => {
        try {
            destination = accounts[4];
            beforeDestinationBalance = new BN(await web3.eth.getBalance(destination));
            const value = firstSpend;

            const message = await testContract.generateMessageToSign(destination, value);
            const signature = await makeSignature(message, owner1, nonOwner);
            const result = await sendSpendTransaction(destination, value, signature, testContract);

            assert(false, "Expected error when correct message signed by wrong account was sent"); 
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

    it("throws error when wrong destination was given", async () => {
        try {
            destination = accounts[4];
            beforeDestinationBalance = new BN(await web3.eth.getBalance(destination));
            const value = firstSpend;

            const message = await testContract.generateMessageToSign(destination, value);
            const signature = await makeSignature(message, signer1, signer2);
            const wrongDestination = accounts[5]; 
            const result = await sendSpendTransaction(wrongDestination, value, signature, testContract);

            assert(false, "Expected error when wrong destination was given"); 
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

contract("When already spent once", async (accounts) => {

    let testContract;
    let destination;
    const signer1 = web3.eth.accounts.privateKeyToAccount(privKeys[0]);
    const signer2 = web3.eth.accounts.privateKeyToAccount(privKeys[1]);

    beforeEach(async () => {
        try {
            testContract = await MultiSig2of2.new(signer1.address, signer2.address);
            await makeDeposit(accounts, testContract);	    

            destination = accounts[4];
            const value = firstSpend;
            const message = await testContract.generateMessageToSign(destination, value);
            const signature = await makeSignature(message, signer1, signer2);
            const result = await sendSpendTransaction(destination, value, signature, testContract);
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("has an incremented spendNonce value", async () => {
        try {
            const nonce = await testContract.spendNonce.call();
            assert.equal(nonce, 1);
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });
});

contract("When already spent once", async (accounts) => {

    let testContract;
    let destination;
    const signer1 = web3.eth.accounts.privateKeyToAccount(privKeys[0]);
    const signer2 = web3.eth.accounts.privateKeyToAccount(privKeys[1]);

    beforeEach(async () => {
        try {
            testContract = await MultiSig2of2.new(signer1.address, signer2.address);
            await makeDeposit(accounts, testContract);	    

            destination = accounts[4];
            const value = firstSpend;
            const message = await testContract.generateMessageToSign(destination, value);
            const signature = await makeSignature(message, signer1, signer2);
            const result = await sendSpendTransaction(destination, value, signature, testContract);
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("returns the expected message to sign", async () => {
        try {
            const value = secondSpend;
            const nonce = await testContract.spendNonce.call();
            const contractAddress = new BN(testContract.address.slice(2), 16);
            const dest = new BN(accounts[4].slice(2), 16);
            const message = web3.utils.keccak256(
                ethabi.solidityPack(
                    [ "uint256", "address", "uint256", "address" ],
                    [ nonce, contractAddress, value, destination ]
                )
            );
            const messageToSign = await testContract.generateMessageToSign(destination, secondSpend);
            assert.equal(message, messageToSign);
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });
});

contract("When already spent once", async (accounts) => {

    let testContract;
    let destination;
    const signer1 = web3.eth.accounts.privateKeyToAccount(privKeys[0]);
    const signer2 = web3.eth.accounts.privateKeyToAccount(privKeys[1]);

    beforeEach(async () => {
        try {
            testContract = await MultiSig2of2.new(signer1.address, signer2.address);
            await makeDeposit(accounts, testContract);	    

            destination = accounts[4];
            const value = firstSpend;
            const message = await testContract.generateMessageToSign(destination, value);
            const signature = await makeSignature(message, signer1, signer2);
            const result = await sendSpendTransaction(destination, value, signature, testContract);
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("can be spent by signed messages from the 1st & 2nd owners", async () => {
        try {
            value = secondSpend;
            const beforeDestinationBalance = new BN(await web3.eth.getBalance(destination));
            const beforeContractBalance = new BN(await web3.eth.getBalance(testContract.address));
            const expectedContractBalance = new BN(beforeContractBalance).sub(new BN(value));

            const message = await testContract.generateMessageToSign(destination, value);
            const signature = await makeSignature(message, signer1, signer2);
            const result = await sendSpendTransaction(destination, value, signature, testContract);

            const afterContractBalance = new BN(await web3.eth.getBalance(testContract.address));
            assert.equal(afterContractBalance.toString(), expectedContractBalance.toString());

            const expectedValueSpent = new BN(value);
            const expectedDestinationBalance = beforeDestinationBalance.add(expectedValueSpent);
            const afterDestinationBalance = new BN(await web3.eth.getBalance(destination));
            assert.equal(afterDestinationBalance.toString(), expectedDestinationBalance.toString());
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });
});

contract("When already spent once", async (accounts) => {

    let testContract;
    let beforeDestinationBalance;
    let beforeContractBalance;
    let destination;
    let value;
    let signature;

    const signer1 = web3.eth.accounts.privateKeyToAccount(privKeys[0]);
    const signer2 = web3.eth.accounts.privateKeyToAccount(privKeys[1]);

    beforeEach(async () => {
        try {
            testContract = await MultiSig2of2.new(signer1.address, signer2.address);
            await makeDeposit(accounts, testContract);	    

            destination = accounts[4];
            const value = firstSpend;
            const message = await testContract.generateMessageToSign(destination, value);
            signature = await makeSignature(message, signer1, signer2);
            const result = await sendSpendTransaction(destination, value, signature, testContract);
        } catch(e) {
            assert(false, "Unexpected error: " + e.message);
        }
    });

    it("cannot be spent by previously used messages signed by the 1st & 2nd owners", async () => {
        try {
            beforeDestinationBalance = new BN(await web3.eth.getBalance(destination));
            beforeContractBalance = new BN(await web3.eth.getBalance(testContract.address));
            const result = await sendSpendTransaction(destination, value, signature, testContract);

            assert(false, "Expected error when previously used message was given"); 
        } catch(e) {
            const afterContractBalance = new BN(await web3.eth.getBalance(testContract.address));
            assert.equal(afterContractBalance.toString(), beforeContractBalance.toString());

            const expectedValueSpent = new BN(0);
            const afterDestinationBalance = new BN(await web3.eth.getBalance(destination));
            assert.equal(afterDestinationBalance.toString(), beforeDestinationBalance.toString());
        }
    });
});
