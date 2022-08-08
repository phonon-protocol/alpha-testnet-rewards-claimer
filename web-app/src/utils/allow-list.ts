import { ethers } from 'ethers';
import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';
import config from '../config';

export type MerkleTreeResult = {
	rootHash: string;
	merkleTree: MerkleTree;
};

export const createMerkleTree = (): MerkleTree => {
	const leaves = config.rewardsList.map((row) => {
		return Buffer.from(
			ethers.utils
				.solidityKeccak256(
					['address', 'uint256'],
					[
						ethers.utils.getAddress(row.address),
						ethers.utils.parseEther(row.amount).toString(),
					],
				)
				.slice(2),
			'hex',
		);
	});

	return new MerkleTree(leaves, keccak256, { sortPairs: true });
};

export const getProof = (
	address: string,
	amount: string,
	merkleTree: MerkleTree,
): string[] =>
	merkleTree.getHexProof(
		ethers.utils.solidityKeccak256(
			['address', 'uint256'],
			[address, ethers.utils.parseEther(amount).toString()],
		),
	);
