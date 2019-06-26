const MultiSig2of3 = artifacts.require("./MultiSig2of3.sol");
const WalletFactory = artifacts.require("./WalletFactory.sol");

module.exports = function(deployer, network, accounts) {
    //deployer.deploy(MultiSig2of3, accounts[0], accounts[1], accounts[2]);
    deployer.deploy(WalletFactory);
};
