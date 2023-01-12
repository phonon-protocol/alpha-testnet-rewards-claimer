import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { expect } from "chai";
import { PhononDAOTestnetRewardsClaimer, MockToken } from "../typechain";
import { expectRevert } from "./utils";
import {
  createMerkleTree,
  MerkleTreeResult,
  getProof,
} from "../utils/allow-list-utils";
import { RewardRow } from "../types";

const PHONON_REWARDS = ethers.utils.parseEther("100");
const CLAIMEE_ONE_REWARDS = ethers.utils.parseEther("40");
const CLAIMEE_TWO_REWARDS = ethers.utils.parseEther("50");
const CLAIMEE_THREE_REWARDS = ethers.utils.parseEther("10");

describe("Claimer", () => {
  let multiSig: Signer;
  let deployer: Signer;
  let claimeeOne: Signer;
  let claimeeTwo: Signer;
  let claimeeThree: Signer;
  let thief: Signer;
  let multiSigAddress: string;
  let claimeeOneAddress: string;
  let claimeeTwoAddress: string;
  let claimeeThreeAddress: string;
  let phonon: MockToken;
  let claimer: PhononDAOTestnetRewardsClaimer;
  let merkleTree: MerkleTreeResult;
  let rewards: RewardRow[];
  let updatedRewards: RewardRow[];
  let updatedMerkleTree: MerkleTreeResult;

  const getProofFromAddress = (
    claimeeAddress: string,
    rewards: RewardRow[]
  ) => {
    const reward = rewards.find((r) => r.address === claimeeAddress);
    if (!reward) {
      throw new Error(`No reward found for ${claimeeAddress}`);
    }
    return getProof(reward, merkleTree.merkleTree);
  };

  beforeEach(async () => {
    const [
      multiSigTemp,
      deployerTemp,
      claimeeOneTemp,
      claimeeTwoTemp,
      claimeeThreeTemp,
      thiefTemp,
    ] = await ethers.getSigners();
    multiSig = multiSigTemp;
    deployer = deployerTemp;
    claimeeOne = claimeeOneTemp;
    claimeeTwo = claimeeTwoTemp;
    claimeeThree = claimeeThreeTemp;
    thief = thiefTemp;
    multiSigAddress = await multiSig.getAddress();
    claimeeOneAddress = await claimeeOne.getAddress();
    claimeeTwoAddress = await claimeeTwo.getAddress();
    claimeeThreeAddress = await claimeeThree.getAddress();

    rewards = [
      {
        address: claimeeOneAddress,
        amount: ethers.utils.formatEther(CLAIMEE_ONE_REWARDS),
      },
      {
        address: claimeeTwoAddress,
        amount: ethers.utils.formatEther(CLAIMEE_TWO_REWARDS),
      },
    ];

    updatedRewards = [
      {
        address: claimeeThreeAddress,
        amount: ethers.utils.formatEther(CLAIMEE_THREE_REWARDS),
      },
    ];

    merkleTree = createMerkleTree(rewards);
    updatedMerkleTree = createMerkleTree(updatedRewards);

    const phononFactory = await ethers.getContractFactory(
      "MockToken",
      multiSigTemp
    );

    phonon = (await phononFactory.deploy()) as MockToken;
    await phonon.deployed();

    const claimerFactory = await ethers.getContractFactory(
      "PhononDAOTestnetRewardsClaimer",
      deployer
    );

    claimer = await claimerFactory.deploy(
      phonon.address,
      multiSigAddress,
      merkleTree.rootHash
    );

    await claimer.deployed();

    await phonon.transfer(claimer.address, PHONON_REWARDS);
  });

  describe(".mint", async () => {
    it("Should prevent an account not on the allow list from claiming with a valid proof", async () => {
      const proof = getProofFromAddress(claimeeOneAddress, rewards);

      await expectRevert(
        async () => claimer.connect(thief).claim(CLAIMEE_ONE_REWARDS, proof),
        "Invalid proof"
      );
    });

    it("Should prevent a claimee from claiming with another claimee's valid proof ", async () => {
      const proof = getProofFromAddress(claimeeTwoAddress, rewards);

      // with claimee two rewards
      await expectRevert(
        async () =>
          claimer.connect(claimeeOne).claim(CLAIMEE_TWO_REWARDS, proof),
        "Invalid proof"
      );
      // with claimee one rewards
      await expectRevert(
        async () =>
          claimer.connect(claimeeOne).claim(CLAIMEE_ONE_REWARDS, proof),
        "Invalid proof"
      );
    });

    it("Should revert when claimee has already claimed", async () => {
      const proof = getProofFromAddress(claimeeOneAddress, rewards);

      await claimer.connect(claimeeOne).claim(CLAIMEE_ONE_REWARDS, proof);

      await expectRevert(
        async () =>
          claimer.connect(claimeeOne).claim(CLAIMEE_ONE_REWARDS, proof),
        "Already claimed"
      );
    });

    it("Should correctly allow a claimee to claim", async () => {
      const claimerBeforeBalance = await phonon.balanceOf(claimer.address);
      const claimeeOneBeforeBalance = await phonon.balanceOf(claimeeOneAddress);

      const proof = getProofFromAddress(claimeeOneAddress, rewards);
      await claimer.connect(claimeeOne).claim(CLAIMEE_ONE_REWARDS, proof);

      const claimerAfterBalance = await phonon.balanceOf(claimer.address);
      const claimeeOneAfterBalance = await phonon.balanceOf(claimeeOneAddress);

      expect(
        claimerAfterBalance.eq(claimerBeforeBalance.sub(CLAIMEE_ONE_REWARDS))
      ).to.be.true;
      expect(
        claimeeOneAfterBalance
          .sub(claimeeOneBeforeBalance)
          .eq(CLAIMEE_ONE_REWARDS)
      ).to.be.true;
    });
  });

  describe(".withdraw", async () => {
    it("Should prevent non multi sig account from calling", async () => {
      await expectRevertSenderIsNotOwner(() =>
        claimer.connect(deployer).withdraw()
      );
    });

    it("Should correctly allow the multi sig account to withdraw the full phonon balance", async () => {
      const multiSigBeforeBalance = await phonon.balanceOf(multiSigAddress);
      const claimerBeforeBalance = await phonon.balanceOf(claimer.address);

      await claimer.connect(multiSig).withdraw();

      const multiSigAfterBalance = await phonon.balanceOf(multiSigAddress);
      const claimerAfterBalance = await phonon.balanceOf(claimer.address);

      expect(claimerAfterBalance.eq(ethers.constants.Zero)).to.be.true;
      expect(
        multiSigAfterBalance.eq(multiSigBeforeBalance.add(claimerBeforeBalance))
      ).to.be.true;
    });
  });

  describe(".setAllowList", async () => {
    it("Should prevent non multi sig account from calling", async () => {
      await expectRevertSenderIsNotOwner(() =>
        claimer.connect(deployer).setAllowList(updatedMerkleTree.rootHash)
      );
    });

    it("Should correctly allow the multi sig account to set the allow list. Claimees on previous allow list should not be able to claim.", async () => {
      await claimer.connect(multiSig).setAllowList(updatedMerkleTree.rootHash);

      const claimeeOneProof = getProofFromAddress(claimeeOneAddress, rewards);
      await expectRevert(
        async () =>
          await claimer
            .connect(claimeeOne)
            .claim(CLAIMEE_ONE_REWARDS, claimeeOneProof),
        "Invalid proof"
      );

      const claimeeThreeProof = getProofFromAddress(
        claimeeThreeAddress,
        updatedRewards
      );

      const claimeeThreeBeforeBalance = await phonon.balanceOf(
        claimeeThreeAddress
      );

      await claimer
        .connect(claimeeThree)
        .claim(CLAIMEE_THREE_REWARDS, claimeeThreeProof);

      const claimeeThreeAfterBalance = await phonon.balanceOf(
        claimeeThreeAddress
      );

      expect(
        claimeeThreeAfterBalance
          .sub(claimeeThreeBeforeBalance)
          .eq(CLAIMEE_THREE_REWARDS)
      ).to.be.true;
    });
  });
});

const expectRevertSenderIsNotOwner = (fn: () => void) =>
  expectRevert(fn, "Ownable: caller is not the owner");
