import "@nomiclabs/hardhat-ethers";
import { ethers } from "ethers";
import { task } from "hardhat/config";
import { getSigner } from "../utils/ledger-utils";

task("deposit-into-claimer")
  .addParam("tokenaddress")
  .addParam("claimeraddress")
  .addParam("amount")
  .addOptionalParam("ledgersigner")
  .setAction(async (args, hre) => {
    const signer = await getSigner(hre.ethers, Number(args.ledgersigner));
    const Contract = await hre.ethers.getContractFactory("MockToken");
    const contractWithSigner = Contract.connect(signer).attach(
      args.tokenaddress
    );

    await contractWithSigner.transfer(
      args.claimeraddress,
      ethers.utils.parseEther(args.amount)
    );
  });
