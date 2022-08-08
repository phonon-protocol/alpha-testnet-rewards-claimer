const getEnvVariable = (property: string, canBeUndefined = false): string => {
	const value = process.env[property];
	if (!canBeUndefined && !value) {
		throw new Error(`${property} environment variable is not set`);
	}
	return value as string;
};

const chainNameToChainId: Record<string, number> = {
	ethereum: 1,
	goerli: 5,
	localhost: 1337,
};

const chainName = getEnvVariable('REACT_APP_NETWORK_NAME');

const chainId = chainNameToChainId[chainName];

if (!chainId) {
	throw new Error(`Could not find chainId for ${chainName}`);
}

const deploymentConfig: {
	contractAddress: string;
	phononTokenAddress: string;
	rewards: { address: string; amount: string }[];
	totalRewards: string;
} = require(`./rewards-lists/${chainName}.json`);

const config = {
	chainId,
	rpcUrl: getEnvVariable('REACT_APP_RPC_URL'),
	claimerContractAddress: deploymentConfig.contractAddress,
	phononContractAddress: deploymentConfig.phononTokenAddress,
	totalRewards: deploymentConfig.totalRewards,
	rewardsList: deploymentConfig.rewards,
};

export default config;
