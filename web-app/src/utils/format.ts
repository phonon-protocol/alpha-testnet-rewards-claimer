import { ethers } from 'ethers';

export const truncateAddress = (
	address: string,
	startChars: number = 6,
	endChars: number = 4,
) => {
	return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

export const displayToken = (
	bn: ethers.BigNumber | undefined,
	decimals: number,
) => {
	return bn
		? parseFloat(ethers.utils.formatUnits(bn, decimals)).toLocaleString(
				undefined,
				{
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				},
		  )
		: undefined;
};
