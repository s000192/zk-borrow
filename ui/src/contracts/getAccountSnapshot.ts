import { Contract, providers, utils } from "ethers";
import mTokenAbi from "../abis/zkjToken.json"

const getAccountSnapshot = async (
  provider: providers.Web3Provider,
  marketAddress: string,
  decimals: number,
  underlyingPrice: number,
  userAddress: string
) => {
  const market = new Contract(
    marketAddress,
    mTokenAbi,
    provider
  );

  const accountSnapshot = await market.getAccountSnapshot(userAddress);

  // (uint256(Error.NO_ERROR), jTokenBalance, borrowBalance, exchangeRateMantissa);
  const supplyBalance = Number(utils.formatUnits(
    accountSnapshot[1].mul(accountSnapshot[3]),
    (decimals - 18) * -1
  ));
  const supplyBalanceInUsd = supplyBalance * underlyingPrice;
  const borrowBalance = Number(utils.formatUnits(accountSnapshot[2], decimals));
  const borrowBalanceInUsd = borrowBalance * underlyingPrice;

  return {
    supplyBalance,
    supplyBalanceInUsd,
    borrowBalance,
    borrowBalanceInUsd,
  };
};

export default getAccountSnapshot;