import erc20Abi from "../abis/erc20.json";
import { providers, Contract } from "ethers";

const getTokenBalance = async (
  provider: providers.Web3Provider,
  userAddress: string,
  underlyingTokenAddress: string
) => {
  const underlyingToken = new Contract(
    underlyingTokenAddress,
    erc20Abi,
    provider
  );

  const balance = await underlyingToken.balanceOf(userAddress);
  return balance;
}

export default getTokenBalance;