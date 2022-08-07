# Phonon DAO Alpha Testnet Rewards Claimer

## Overview

A smart contract and simple UI for claiming Phonon Protocol Alpha Testnet rewards.

1. The DAO creates a CSV listing accounts eligible for rewards and the amount of PHONON claimable by each.
2. A merkle proof allow list is generated during deployment.
3. Testnet participants use the web app to claim their PHONON.
4. The DAO multi sig can withdraw any unclaimed PHONONN.

## Testing Smart Contract

From the `smart-contracts` sub project run `yarn && yarn test`

## Deployment

### Smart Contract

1. `yarn`
2. `cp .env.sample .env` and add your Etherscan and a RPC URL for the network you wish to deploy to.
3. If missing, add the network you wish to deploy to's config to `hardhat.config.ts`
4. Add a `[network name].csv` listing the rewards amount for each address to `scripts/deploy/rewards` with the headings `address,amount`. See `scripts/deploy/rewards/localhost.csv` for an example.
5. Run `npx hardhat deploy --phonontokenaddress [PHONON token address] --daomultisigaddress [DAO multi sig address] --network [network name]`. If deploying to a test chain you may with to use the `deploy-with-token` script instead. See the running locally instructions below.
6. Transfer PHONON to the deployed contract.

### Web App

1. Add the `rewards` value from `./smart-contracts/scripts/deploy/deployments/[network name].json` to `./src/config/rewards-list.ts` (replace the current value).
2. See `./env.sample` for the required environment variables.
3. Deploy the React App to your favourite hosting solution.

## Running Locally

The defaut config in both projects is for running the project locally with a mock PHONON token. Local account zero is both the deployer and multi sig account. Check `./smart-contracts/scripts/deploy/rewards/localhost.csv` for the claimee acount and the amount each can claim.

**In smart-contracts**

1. `yarn`
1. `npx hardhat node`
1. In a second terminal, `npx hardhat deploy-with-token --network localhost --0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266`
1. `npx hardhat deposit-into-claimer --network localhost --claimeraddress 0x5FbDB2315678afecb367f032d93F642f64180aa3 --amount 1500`

**In web-app**

1. `yarn`
2. `cp .env.sample .env`
3. `yarn start`
