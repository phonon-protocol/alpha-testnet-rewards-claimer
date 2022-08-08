import * as React from 'react';
import { ethers } from 'ethers';
import { useAccount, useSigner } from 'wagmi';
import { ButtonSendTransaction } from '../components';
import { displayToken } from '../utils/format';
import useData from '../hooks/useData';
import sendClaimTransaction from '../utils/transactions/send-redeem-transaction';
import { PHONON_TOKEN_DECIMALS } from '../config/constants';
import config from '../config';

const Home: React.FC = () => {
	const { data: accountData } = useAccount();
	const { data: signer } = useSigner();
	const { systemData, userData, refreshData } = useData(accountData?.address);
	const [sending, setSending] = React.useState(false);

	const onClaim = async () => {
		if (!signer || !userData?.amount.gt(0) || !userData.proof) {
			return;
		}

		setSending(true);

		try {
			await sendClaimTransaction(userData.amount, userData.proof, signer);
			await refreshData();
		} finally {
			setSending(false);
		}
	};

	const canClaim =
		!sending &&
		!!accountData?.address &&
		!userData?.hasClaimed &&
		!!userData?.amount.gt(0) &&
		!!userData.proof;

	return (
		<div className='flex flex-col justify-center mt-8 sm:mx-auto sm:w-full sm:max-w-4xl backdrop-blur py-8 px-4 shadow sm:rounded-lg sm:px-10'>
			<h1 className='text-3xl phonon-text-gradient mb-5'>
				Alpha Testnet Rewards
			</h1>

			<div className='sm:grid grid-cols-2 gap-x-16 gap-y-5'>
				<div>
					<h2 className='text-lg phonon-text-gradient mb-5'>
						Claim your PHONON rewards
					</h2>
					<p className='text-sm'>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit.
						Pellentesque tempor nisi ut leo volutpat, non interdum est interdum.
						Nam dui magna, finibus pretium diam accumsan, congue accumsan lacus.
						Nunc accumsan efficitur ultricies.
					</p>
					<p className='text-sm mt-3'>
						Aenean consectetur arcu ut libero condimentum elementum. Nunc
						faucibus leo a maximus sagittis. Nunc mattis eu justo vel rhoncus.
						Quisque at iaculis nunc. Aenean porta tristique nisi, a viverra leo
						rhoncus non. Praesent accumsan ornare velit vel varius.
					</p>
				</div>

				<div className='sm:pt-0 flex flex-col justify-between mt-3 sm:mt-0'>
					<div className='grid grid-cols-7 text-sm'>
						<div className='col-span-3 pb-1'>Total rewards</div>
						<div className='col-span-4 text-right'>
							<DisplaySystemData
								data={displayToken(
									ethers.utils.parseEther(config.totalRewards),
									PHONON_TOKEN_DECIMALS,
								)}
							/>
						</div>
						<div className='col-span-3 pb-1'>Percent claimed</div>
						<div className='col-span-4 text-right'>
							<DisplaySystemData
								data={
									systemData
										? `${displayToken(systemData.percentageClaimed, 2)}%`
										: undefined
								}
							/>
						</div>
						<div className='col-span-7 mt-3 mb-2'>
							<span className='text phonon-text-gradient mb-5'>
								Your wallet
							</span>
						</div>
						<div className='col-span-3 pb-1'>Your rewards</div>
						<div className='col-span-4 text-right'>
							<DisplayUserData
								accountConnected={!!accountData}
								data={displayToken(userData?.amount, PHONON_TOKEN_DECIMALS)}
							/>
						</div>
						<div className='col-span-3 pb-1'>Already claimed?</div>
						<div className='col-span-4 text-right'>
							<DisplayUserData
								accountConnected={!!accountData}
								data={userData?.hasClaimed ? 'Yes' : 'No'}
							/>
						</div>
					</div>

					<ButtonSendTransaction
						className='w-full mt-4'
						onClick={onClaim}
						disabled={!canClaim}
					>
						Claim
					</ButtonSendTransaction>
				</div>

				<div className='col-span-2 text-center text-xs pt-3 link'>
					<a
						href={`https://etherscan.io/address/${config.claimerContractAddress}`}
					>
						View contract on Etherscan
					</a>
				</div>
			</div>
		</div>
	);
};

export default Home;

const DisplaySystemData: React.FC<{
	data: string | undefined;
}> = (props) => {
	if (!props.data) {
		return <span>Loading...</span>;
	}

	return <span>{props.data}</span>;
};

const DisplayUserData: React.FC<{
	data: string | undefined;
	accountConnected: boolean;
}> = (props) => {
	if (!props.accountConnected) {
		return <span>-</span>;
	}

	if (props.accountConnected && !props.data) {
		return <span>Loading...</span>;
	}

	return <span>{props.data}</span>;
};
