var DEFAULT_TESTRPC_HOST = "localhost";
var DEFAULT_TESTRPC_PORT = 8545;
var TESTRPC_HOST         = (process.env.TESTRPC_HOST || DEFAULT_TESTRPC_HOST);
var TESTRPC_PORT         = (process.env.TESTRPC_PORT || DEFAULT_TESTRPC_PORT);

console.log("Truffle using network at " + TESTRPC_HOST + ":" + TESTRPC_PORT);

require('babel-polyfill')

module.exports = {
    compilers: {
        solc: {
            version: "^0.4.24", // A version or constraint - Ex. "^0.5.0"
            // Can also be set to "native" to use a native solc
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 1000, // Optimize for how many times you intend to run the code
                },
                evmVersion: "byzantium" // Default: "byzantium"
            }
        }
    },
    networks: {
        development: {
            host:       TESTRPC_HOST,
            port:       TESTRPC_PORT,
            network_id: "*", // Match any network id
            gas:        4600000
        }
    },
    description: "A multisig Ethereum address with spending authorized by Trezors.",
    authors: [
        "Destry Saul <destry@unchained-capital.com>",
        "Dhruv Bansal <dhruv@unchained-capital.com>"
    ],
    keywords: [
        "ethereum",
        "multisig",
        "trezor"
    ],
    license: "MIT"
};
