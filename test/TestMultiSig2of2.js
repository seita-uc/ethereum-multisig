const MultiSig2of2 = artifacts.require("MultiSig2of2");

const deposit = 1000; // wei
const firstSpend = 100;
const secondSpend = 900;

// Expected Error test for a failed require()
const vmExceptionTextRevert = (reasonNum) => {
    return `Returned error: VM Exception while processing transaction: revert ${reasonNum} -- Reason given: ${reasonNum}.`;
}
const makeDeposit = (accounts, testContract) => {
    return web3.eth.sendTransaction({from: accounts[0], to: testContract.address, value: deposit});
}
const firstInvocation = (accounts) => {
    const currentNonce = web3.eth.getTransactionCount(accounts[0]);
    return (currentNonce == 4); // why 4?
}

contract('When constructing', async (accounts) => {

    it("raises an error without any arguments", async () => {
        try {
            const instance = await MultiSig2of2.new();
            return assert(false, "Expected error in constructor")
        } catch(e) {
            return assert.equal(e.message, "Invalid number of parameters for \"undefined\". Got 0 expected 2!");
        }
    });

    it("raises an error with a single argument", async () => {
        try {
            const instance = await MultiSig2of2.new(accounts[1]);
            return assert(false, "Expected error in constructor")
        } catch(e) {
            return assert.equal(e.message, "Invalid number of parameters for \"undefined\". Got 1 expected 2!");
        }
    });

    it("raises an error with two arguments when the two are duplicates", async () => {
        try {
            const instance = await MultiSig2of2.new(accounts[1], accounts[1]);
            return assert(false, "Expected error in constructor");
        } catch(e) {
            return assert.equal(e.message, vmExceptionTextRevert(1));
        }
    });

    it("does not raise error with two distinct arguments", async () => {
        try {
            const instance = await MultiSig2of2.new(accounts[1], accounts[2]);
            return assert(true);
        } catch(e) {
            assert(false, "Unexpected error in constructor")
        }
    });
});

//contract('When first created', (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(accounts[1], accounts[2], accounts[3]).then((instance) {
            //testContract = instance;
        //});
    //});

    //it("has a zero spendNonce value", () => {
        //return testContract.spendNonce.call().then((nonce) {
            //assert.equal(nonce, 0);
        //});
    //});

    //it("has a correct Major Version value", () => {
        //return testContract.unchainedMultisigVersionMajor.call().then((major) {
            //assert.equal(major, 2);
        //});
    //});

    //it("has a correct Minor Version value", () => {
        //return testContract.unchainedMultisigVersionMinor.call().then((minor) {
            //assert.equal(minor, 0);
        //});
    //});

    //it("can accept funds", () => {
        //makeDeposit(accounts, testContract);
        //return assert.equal(web3.eth.getBalance(testContract.address).toNumber(), deposit);
    //});

    //it("emits a 'Funded' event when accepting funds", () => {
        //return testContract.sendTransaction({ from: accounts[0], to: testContract.address, value: deposit}).then((result) {
            //assert.equal(result.logs[0].event, "Funded");
            //assert.equal(result.logs[0].args.newBalance.toString(), deposit.toString());
        //});
    //});

//});


//contract('When first created', (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(address1, address2, address3).then((instance) {
            //testContract = instance;
        //});
    //});

    //// Values for this test:
    //// spendNonce - 0000000000000000000000000000000000000000000000000000000000000000
    //// contact - 0x1b95e1c82765f1b410499214939fb0afd2da9328
    //// value - 0000000000000000000000000000000000000000000000000000000000000064 (100 wei in hex)
    //// dest - 0xe6398f0330aa3e501f873237051ec82eecc74cd5
    //// message prehash - 0000000000000000000000000000000000000000000000000000000000000000e6398f0330aa3e501f873237051ec82eecc74cd500000000000000000000000000000000000000000000000000000000000000001b95e1c82765f1b410499214939fb0afd2da9328
    //if (firstInvocation(accounts)) {
        //it("returns the expected message to sign", () => {
            //return testContract.generateMessageToSign.call(accounts[4], firstSpend).then((message) {
                //assert.equal(message,"0x142e6535b34535af988d6fe022dba9100dabc41fa9de26962f4e5b6e79e9d041");
            //});
        //});
    //}

    //if (firstInvocation(accounts)) {
        //it("raises an error when using the contract address as a destination in the message to sign", () => {
            //return testContract.generateMessageToSign.call(contractAddress, firstSpend).then((instance) {assert(false, vmExceptionTextRevert)}).catch((e) => {
                //return assert.equal(e.message, vmExceptionTextRevert);
            //});
        //});
    //}

//});


//contract('When already funded', (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(address1, address2, address3).then((instance) {
            //testContract = instance;
            //makeDeposit(accounts, testContract)	    
        //});
    //});

    //if (firstInvocation(accounts)) {
        //it("can be killed by signed messages from the 1st & 2nd owners", () => {
            //const startingDestinationBalance = web3.eth.getBalance(accounts[4])

            //return testContract.spend.sendTransaction(accounts[4], 100, V1, R1, S1, V2, R2, S2).then(() => {
                //assert.equal(web3.eth.getBalance(testContract.address).toString(), "900");
            //});
        //});
    //}
//});


//contract('When already funded', (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(accounts[1], accounts[2], accounts[3]).then((instance) {
            //testContract = instance;
            //makeDeposit(accounts, testContract)
        //});
    //});

    //it("can accept funds", () => {
        //makeDeposit(accounts, testContract);
        //return assert.equal(web3.eth.getBalance(testContract.address).toNumber(), deposit * 2);
    //});

    //it("emits a 'Funded' event when accepting funds", () => {
        //return testContract.sendTransaction({ from: accounts[0], to: testContract.address, value: deposit}).then((result) {
            //assert.equal(result.logs[0].event, "Funded");
            //assert.equal(result.logs[0].args.newBalance.toString(), (deposit * 2).toString());
        //});
    //});

//});

//contract('When already funded', (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(address1, address2, address3).then((instance) {
            //testContract = instance;
            //makeDeposit(accounts, testContract)
        //});
    //});

    //if (firstInvocation(accounts)) {
        //it("can be spent by signed messages from the 1st & 2nd owners", () => {
            //const startingDestinationBalance = web3.eth.getBalance(accounts[4])
            //const expectedBalance = deposit - firstSpend

            //return testContract.spend.sendTransaction(accounts[4], firstSpend, V1, R1, S1, V2, R2, S2).then(() => {
                //assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedBalance.toString());
                //const expectedTransfer = new web3.BigNumber(firstSpend)
                //const increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
                //assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
            //});
        //});
    //}
//});

//contract('When already funded', (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(address1, address2, address3).then((instance) {
            //testContract = instance;
            //makeDeposit(accounts, testContract)
        //});
    //});

    //if (firstInvocation(accounts)) {
        //it("can be killed by signed messages from the 2nd & 3rd owners", () => {
            //const startingDestinationBalance = web3.eth.getBalance(accounts[4])
            //const expectedBalance = deposit - firstSpend

            //return testContract.spend.sendTransaction(accounts[4], firstSpend, V2, R2, S2, V3, R3, S3).then(() => {
                //assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedBalance.toString());
                //const expectedTransfer = new web3.BigNumber(firstSpend)
                //const increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
                //assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
            //});
        //});
    //}
//});

//contract('When already funded', (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(address1, address2, address3).then((instance) {
            //testContract = instance;
            //makeDeposit(accounts, testContract)
        //});
    //});

    //if (firstInvocation(accounts)) {
        //it("can be killed by signed messages from the 1st & 3rd owners", () => {
            //const startingDestinationBalance = web3.eth.getBalance(accounts[4])
            //const expectedBalance = deposit - firstSpend

            //return testContract.spend.sendTransaction(accounts[4], firstSpend, V1, R1, S1, V3, R3, S3).then(() => {
                //assert.equal(web3.eth.getBalance(testContract.address).toString(), expectedBalance.toString());
                //const expectedTransfer = new web3.BigNumber(firstSpend)
                //const increaseInDestination = web3.eth.getBalance(accounts[4]).minus(startingDestinationBalance)
                //assert.equal(increaseInDestination.toString(), expectedTransfer.toString());
            //});
        //});
    //}
//});


//contract('When already funded', (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(address1, address2, address3).then((instance) {
            //testContract = instance;
            //makeDeposit(accounts, testContract)
        //});
    //});

    //if (firstInvocation(accounts)) {
        //it("emits a 'Spent' event when it is correctly spent", () => {
            //const startingDestinationBalance = web3.eth.getBalance(accounts[4])

            //return testContract.spend(accounts[4], firstSpend, V1, R1, S1, V3, R3, S3).then((result) {
                //assert.equal(result.logs[0].event, "Spent");
                //assert.equal(result.logs[0].args.to, accounts[4]);
                //assert.equal(result.logs[0].args.transfer.toString(), firstSpend.toString());
            //});
        //});
    //}
//});

//contract('When already funded', (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(address1, address2, address3).then((instance) {
            //testContract = instance;
            //makeDeposit(accounts, testContract)
        //});
    //});

    //if (firstInvocation(accounts)) {
        //it("throws an error when killed with invalid messages", () => {
            //const startingDestinationBalance = web3.eth.getBalance(accounts[4])

            //badR3 = R3.replace('a', 'b');

            //return testContract.spend.sendTransaction(accounts[4], firstSpend, V1, R1, S1, V3, badR3, S3).then((instance) { 
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


//contract('When already funded', (accounts) {

    //const testContract;

    //beforeEach(() => {
        //return MultiSig2of2.new(address1, address2, address3).then((instance) {
            //testContract = instance;
            //makeDeposit(accounts, testContract)
        //});
    //});

    //if (firstInvocation(accounts)) {
        //it("throws an error when killed with invalid value", () => {
            //const startingDestinationBalance = web3.eth.getBalance(accounts[4])
            //const transferAmount = 101; //(expects 100)	    

            //return testContract.spend.sendTransaction(accounts[4], transferAmount, V1, R1, S1, V3, R3, S3).then((instance) { 
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


//contract('When already funded', (accounts) {

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
            //// correct message, signed with m/44'/6266'/1'/0/0
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

//contract('When already funded', (accounts) {

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


//contract('When already spent once', (accounts) {

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

//contract('When already spent once', (accounts) {

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

//contract('When already spent once', (accounts) {

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

//contract('When already spent once', (accounts) {

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
