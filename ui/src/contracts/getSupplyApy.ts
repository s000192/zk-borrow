import { BigNumber, Contract, providers, constants } from "ethers";
import mTokenAbi from "../abis/zkjToken.json";

const getSupplyApy = async (provider: providers.Web3Provider, marketAddress: string) => {
  // mantissa is the same even the underlying asset has different decimals
  // const mantissa = 1e18;
  // const secondsPerDay = 24 * 60 * 60;
  // const daysPerYear = 365;

  // const market = new Contract(
  //   marketAddress,
  //   mTokenAbi,
  //   provider
  // );
  // const supplyRatePerSecond = await market.supplyRatePerSecond();

  // console.log("supplyRatePerSecond.toNumber()")
  // console.log(supplyRatePerSecond.toNumber())

  // console.log("Math.pow");
  // console.log(Math.pow(
  //   (supplyRatePerSecond.toNumber() / mantissa) * secondsPerDay + 1,
  //   daysPerYear - 1
  // ) - 1);

  // const supplyApy = BigNumber.from(
  //   Math.pow(
  //     (supplyRatePerSecond.toNumber() / mantissa) * secondsPerDay + 1,
  //     daysPerYear - 1
  //   ) - 1
  // );
  return constants.Zero;
};

export default getSupplyApy;