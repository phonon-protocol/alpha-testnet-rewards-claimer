import { ethers } from 'ethers';
import { displayToken } from '../utils/format';
import { NotificationMessages } from '../utils/transactions/send-transaction';
import { PHONON_TOKEN_DECIMALS } from './constants';

type ClaimNotificationArgs = {
	claimableAmount: ethers.BigNumber;
};

export const getClaimedNotifications = ({
	claimableAmount,
}: ClaimNotificationArgs): NotificationMessages => {
	const base = `${displayToken(claimableAmount, PHONON_TOKEN_DECIMALS)} PHONON`;

	return {
		awaitingApproval: `Follow wallet instructions to claim ${base}`,
		pending: `Transaction pending to claim ${base}`,
		success: `Successfully claimed ${base}`,
		error: 'Claiming failed',
	};
};
