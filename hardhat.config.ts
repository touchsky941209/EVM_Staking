import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
const networks = require("./scripts/networks");

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: networks.networks
};

export default config;
