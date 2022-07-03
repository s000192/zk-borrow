import { Contract, providers, utils } from "ethers";
import comptrollerAbi from "../abis/comptroller.json";
import oracleAbi from "../abis/oracle.json";
import addresses from "../contracts/addresses.json";
import { ChainId } from '../data/types';

const getUnderlyingPrice = async (
  provider: providers.Web3Provider,
  marketAddress: string,
  decimals: number,
): Promise<string> => {
  const network = await provider.getNetwork();
  const comptroller = new Contract(
    addresses.unitroller[network.chainId.toString() as ChainId],
    comptrollerAbi,
    provider
  );
  const oracleAddress = await comptroller.oracle();

  const oracle = new Contract(
    oracleAddress,
    oracleAbi,
    provider
  )
  const underlyingPrice = await oracle.getUnderlyingPrice(marketAddress);
  return utils.formatUnits(underlyingPrice, 36 - decimals);
};

export default getUnderlyingPrice;