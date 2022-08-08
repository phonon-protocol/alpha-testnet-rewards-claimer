import { ethers } from 'ethers';
import { Claimer__factory, ERC20__factory } from '../contracts';
import config from '../config';
import { createMerkleTree, getProof } from './allow-list';

export type SystemData = {
	claimerPhononBalance: ethers.BigNumber;
	percentageClaimed: ethers.BigNumber;
};

export type UserData = {
	hasClaimed: boolean;
	amount: ethers.BigNumber;
	proof: string[] | undefined;
};

const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

const claimer = Claimer__factory.connect(
	config.claimerContractAddress,
	provider,
);

const phononToken = ERC20__factory.connect(
	config.phononContractAddress,
	provider,
);

const merkleTree = createMerkleTree();

export const getSystemData = async (): Promise<SystemData> => {
	const claimerPhononBalance = await phononToken.balanceOf(
		config.claimerContractAddress,
	);

	const totalRewards = ethers.utils.parseEther(config.totalRewards);

	const percentageClaimed = totalRewards
		.sub(claimerPhononBalance)
		.mul(10000)
		.div(totalRewards);

	return {
		claimerPhononBalance,
		percentageClaimed,
	};
};

export const getUserData = async (account: string): Promise<UserData> => {
	const hasClaimed = await claimer.hasClaimed(account);
	const claim = config.rewardsList.find(
		(row) => row.address.toLowerCase() === account.toLowerCase(),
	);

	if (!claim) {
		console.log(`No claim found for ${account}`);
		return {
			hasClaimed,
			amount: ethers.constants.Zero,
			proof: undefined,
		};
	}

	const proof = getProof(account, claim.amount, merkleTree);

	return {
		hasClaimed,
		amount: ethers.utils.parseEther(claim.amount),
		proof,
	};
};
