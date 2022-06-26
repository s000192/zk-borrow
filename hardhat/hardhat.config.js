require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");

// Replace this private key with your Harmony account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const accounts = {
    mnemonic: process.env.MNEMONIC,
};

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.5.16",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.6.12",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.7.6",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.8.4",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        hardhat: {
            chainId: 1337,
            forking: {
                enabled: true,
                // TODO: Fork from Rinkeby for now.
                url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
            },
            gas: 2100000,
            gasPrice: 8000000000,
            live: false,
            saveDeployments: true,
            allowUnlimitedContractSize: true
        },
        // testnet: {
        //     url: "https://api.s0.b.hmny.io",
        //     chainId: 1666700000,
        //     accounts
        // },
        // mainnet: {
        //     url: "https://api.s0.t.hmny.io",
        //     chainId: 1666600000,
        //     accounts
        // },
    },
    namedAccounts: {
        deployer: 0,
    },
    paths: {
        deploy: "deploy",
        deployments: "deployments",
    },
    mocha: {
        timeout: 1000000
    },
    external: {
        contracts: [
            {
                artifacts: "additional-artifacts",
            }
        ],
    }
};
