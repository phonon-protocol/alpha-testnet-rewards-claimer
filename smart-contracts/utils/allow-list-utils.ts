import { ethers } from "ethers";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";
import { RewardRow } from "../types";

export type MerkleTreeResult = {
  rootHash: string;
  merkleTree: MerkleTree;
};

export const createMerkleTree = (rows: RewardRow[]): MerkleTreeResult => {
  const leaves = rows.map((row) => {
    return Buffer.from(
      ethers.utils
        .solidityKeccak256(
          ["address", "uint256"],
          [
            ethers.utils.getAddress(row.address),
            ethers.utils.parseEther(row.amount).toString(),
          ]
        )
        .slice(2),
      "hex"
    );
  });

  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const rootHash = merkleTree.getHexRoot();

  return {
    rootHash,
    merkleTree,
  };
};

export const getProof = (row: RewardRow, merkleTree: MerkleTree) =>
  merkleTree.getHexProof(
    ethers.utils.solidityKeccak256(
      ["address", "uint256"],
      [row.address, ethers.utils.parseEther(row.amount).toString()]
    )
  );
