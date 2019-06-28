const HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic = process.env.ROPSTEN_MNEMONIC_1;
const ropsten_endpoint = process.env.GINCO_ROPSTEN_ENDPOINT;
const infura_endpoint = "https://ropsten.infura.io/v3" + process.env.INFURA_ACCESS_TOKEN;
const DEFAULT_TESTRPC_HOST = "localhost";
const DEFAULT_TESTRPC_PORT = 8545;
const TESTRPC_HOST = (process.env.TESTRPC_HOST || DEFAULT_TESTRPC_HOST);
const TESTRPC_PORT = (process.env.TESTRPC_PORT || DEFAULT_TESTRPC_PORT);
require('babel-polyfill')

module.exports = {
    compilers: {
        solc: {
            version: "^0.5.6",
            //version: "^0.4.24",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 1000, // Optimize for how many times you intend to run the code
                },
                evmVersion: "constantinople" // Default: "byzantium"
            }
        }
    },
    networks: {
        ropsten: {
            provider: () => new HDWalletProvider(mnemonic, ropsten_endpoint, 0, 5),
            network_id: "3",
            websockets: true,
        },
        infura: {
            provider: () => new HDWalletProvider(mnemonic, infura_endpoint),
            network_id: "3",
        },
        development: {
            host:       TESTRPC_HOST,
            port:       TESTRPC_PORT,
            network_id: "*", // Match any network id
            gas:        4600000
        }
    },
    license: "MIT"
};
