import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import path from "path";
import { promises as fs } from "fs";
import { RewardRow } from "../../types";
import { createMerkleTree } from "../../utils/allow-list-utils";
import { csvToArray } from "../../utils/csv-utils";
import { getSigner } from "../../utils/ledger-utils";
import { ethers } from "ethers";

task("deploy")
  .addParam("phonontokenaddress")
  .addParam("daomultisigaddress")
  .addOptionalParam("gaspriceingwei")
  .addOptionalParam("ledgersigner")
  .setAction(async (args, hre) => {
    const network = hre.hardhatArguments.network;
    const signer = await getSigner(hre.ethers, Number(args.ledgersigner));
    const rewardsCsvPath = path.join(__dirname, `./rewards/${network}.csv`);
    const deploymentResultPath = path.join(
      __dirname,
      `./deployments/${network}.json`
    );

    const rewards = await csvToArray<RewardRow>(rewardsCsvPath);

    const merkleTree = createMerkleTree(rewards);

    const Contract = await hre.ethers.getContractFactory(
      "PhononDAOTestnetRewardsClaimer"
    );

    const contractWithSigner = Contract.connect(signer);

    console.log("Deploying from address:", await signer.getAddress());

    const contract = await contractWithSigner.deploy(
      args.phonontokenaddress,
      args.daomultisigaddress,
      merkleTree.rootHash,
      {
        gasPrice: args.gaspriceingwei
          ? hre.ethers.utils.parseUnits(args.gaspriceingwei, "gwei").toString()
          : undefined,
      }
    );

    await contract.deployed();

    console.log(`Claimer deployed to ${contract.address} on ${network}`);

    const deploymentData = {
      contractAddress: contract.address,
      phononTokenAddress: args.phonontokenaddress,
      daoMultiSigAddress: args.daomultisigaddress,
      rootHash: merkleTree.rootHash,
      rewards,
      totalRewards: ethers.utils.formatEther(
        rewards.reduce(
          (sum, reward) => sum.add(ethers.utils.parseEther(reward.amount)),
          ethers.BigNumber.from(0)
        )
      ),
    };

    await fs.writeFile(deploymentResultPath, JSON.stringify(deploymentData));
  });
