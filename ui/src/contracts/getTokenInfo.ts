import erc20Abi from "../abis/erc20.json";
import { providers, Contract } from "ethers";

const getTokenInfo = async (provider: providers.Web3Provider, underlyingTokenAddress: string) => {
  const underlyingToken = new Contract(
    underlyingTokenAddress,
    erc20Abi,
    provider
  );

  const decimals = await underlyingToken.decimals();
  const symbol = await underlyingToken.symbol();
  return { decimals, symbol };
}

export default getTokenInfo;