import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
const networks = require("./scripts/networks");

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: networks.networks,
  etherscan: {
    apiKey: networks.etherscan.apiKey, // Ensure this is properly mapped
  },
};

export default config;
