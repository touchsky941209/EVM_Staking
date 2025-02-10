require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = {
    symbol: {
        1: "ETH",      // Ethereum Mainnet
        3: "ETH",      // Ropsten Testnet
        4: "ETH",      // Rinkeby Testnet
        5: "ETH",      // Goerli Testnet
        42: "ETH",     // Kovan Testnet
        56: "BNB",     // Binance Smart Chain
        137: "MATIC",  // Polygon (Matic)
        43114: "AVAX", // Avalanche
        100: "XDAI"
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
        },
    },
    networks: {

        gnosis: {
            url: 'https://rpc.gnosischain.com/',
            gasPrice: 10000000000,
            accounts: [String(PRIVATE_KEY)],
        },
        chiado: {
            url: "https://rpc.chiadochain.net", // Gnosis Chiado testnet RPC URL
            gasPrice: 1000000000,
            accounts: [String(PRIVATE_KEY)],// Add your private key here
        },
        sepolia: {
            url: "https://eth-sepolia.public.blastapi.io",
            gasPrice: 1000000000,
            accounts: [String(PRIVATE_KEY)],
        }
    }
};