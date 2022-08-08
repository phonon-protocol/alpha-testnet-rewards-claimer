import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { getSigner } from "../utils/ledger-utils";

task("deploy-with-token")
  .addParam("daomultisigaddress")
  .addOptionalParam("gaspriceingwei")
  .addOptionalParam("ledgersigner")
  .setAction(async (args, hre) => {
    const signer = await getSigner(hre.ethers, Number(args.ledgersigner));
    const Contract = await hre.ethers.getContractFactory("MockToken");
    const contractWithSigner = Contract.connect(signer);

    console.log(`Deploying from ${await signer.getAddress()}`);

    const contract = await contractWithSigner.deploy({
      gasPrice: args.gaspriceingwei
        ? hre.ethers.utils.parseUnits(args.gaspriceingwei, "gwei").toString()
        : undefined,
    });
    await contract.deployed();

    console.log(
      `Token deployed to ${contract.address} on ${hre.hardhatArguments.network}`
    );

    await hre.run("deploy", {
      phonontokenaddress: contract.address,
      daomultisigaddress: args.daomultisigaddress,
      gaspriceingwei: args.gaspriceingwei,
      ledgersigner: args.ledgersigner,
    });
  });
