import { Contract, providers, utils } from "ethers";
import mTokenAbi from "../abis/zkbToken.json"
import getUnderlyingPrice from "./getUnderlyingPrice";

const getUnderlyingAmount = async (
  provider: providers.Web3Provider,
  marketAddress: string,
  decimals: number,
): Promise<string> => {
  const market = new Contract(
    marketAddress,
    mTokenAbi,
    provider
  );
  const cash = await market.getCash();
  return utils.formatUnits(cash, decimals);
};

const getLiquidity = async (
  provider: providers.Web3Provider,
  marketAddress: string,
  decimals: number,
): Promise<number> => {
  const underlyingAmount = await getUnderlyingAmount(provider, marketAddress, decimals);
  const underlyingPrice = await getUnderlyingPrice(provider, marketAddress, decimals);
  return Number(underlyingAmount) * Number(underlyingPrice);
}

export default getLiquidity;