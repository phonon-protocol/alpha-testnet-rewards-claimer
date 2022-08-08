import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "./scripts";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.11",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    goerli: {
      chainId: 5,
      url: process.env.GOERLI_RPC_URL,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
