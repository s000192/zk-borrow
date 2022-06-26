import mTokenAbi from "../abis/zkbToken.json";
import { providers, Contract } from "ethers";

const getUnderlying = async (provider: providers.Web3Provider, marketAddress: string) => {
  // TODO: Hardcode CEther address as it doesn't have the `underlying` function
  const market = new Contract(
    marketAddress,
    mTokenAbi,
    provider
  );
  const underlyingToken = await market.underlying();
  return underlyingToken;
}

export default getUnderlying;