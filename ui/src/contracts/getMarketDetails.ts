import { Web3Provider } from '@ethersproject/providers';
import { formatUnits } from 'ethers/lib/utils';
import { Address } from '../contexts/ConnectContext';
import { MarketDetails } from '../data/types';
import getAccountSnapshot from './getAccountSnapshot';
import getBorrowApy from './getBorrowApy';
import getLiquidity from './getLiquidity';
import getSupplyApy from './getSupplyApy';
import getTokenBalance from './getTokenBalance';
import getTokenInfo from './getTokenInfo';
import getUnderlying from './getUnderlying';
import getUnderlyingPrice from './getUnderlyingPrice';

const getMarketDetails = async (marketAddress: string, provider: Web3Provider, address: Address): Promise<MarketDetails> => {
  const underlyingTokenAddress = await getUnderlying(provider, marketAddress);
  const { decimals, symbol } = await getTokenInfo(provider, underlyingTokenAddress);
  const underlyingTokenBalance = await getTokenBalance(provider, address, underlyingTokenAddress);
  const underlyingPrice = await getUnderlyingPrice(provider, marketAddress, decimals);
  const accountSnapshot = await getAccountSnapshot(
    provider,
    marketAddress,
    decimals,
    Number(underlyingPrice),
    address
  );

  const supplyApy = await getSupplyApy(provider, marketAddress);
  const borrowApy = await getBorrowApy(provider, marketAddress);
  const liquidity = await getLiquidity(provider, marketAddress, decimals);
  return {
    underlyingTokenAddress,
    symbol,
    decimals: Number(decimals),
    supplyApy: Number(supplyApy),
    borrowApy: Number(borrowApy),
    balance: Number(formatUnits(underlyingTokenBalance.toString(), decimals)),
    supplied: accountSnapshot.supplyBalance,
    borrowed: accountSnapshot.borrowBalance,
    liquidity
  };
}

export default getMarketDetails;