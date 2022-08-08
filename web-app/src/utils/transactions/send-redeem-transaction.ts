import { ethers } from 'ethers';
import config from '../../config';
import { Claimer__factory } from '../../contracts';
import { getClaimedNotifications } from '../../config/notifications';
import sendTransaction from './send-transaction';

const sendClaimTransaction = async (
	claimableAmount: ethers.BigNumber,
	proof: string[],
	signer: ethers.Signer,
) => {
	const claimerContract = Claimer__factory.connect(
		config.claimerContractAddress,
		signer,
	);
	await sendTransaction(
		claimerContract.claim(claimableAmount, proof),
		getClaimedNotifications({ claimableAmount }),
	);
};

export default sendClaimTransaction;
