import { NextPage } from 'next';
import Button from "../components/shared/Button";
import addresses from "../contracts/addresses.json";
import erc20Abi from "../abis/erc20.json";
import { ChainId } from '../data/types';
import { Contract } from 'ethers';
import { useEffect, useState } from 'react';
import { useConnect } from '../contexts/ConnectContext';
import { parseEther, parseUnits } from 'ethers/lib/utils';

import "../i18n";

const Mint: NextPage = () => {
  const { signer, address, chainId } = useConnect();
  const [weth, setWeth] = useState<Contract>();
  const [usdc, setUsdc] = useState<Contract>();

  useEffect(() => {
    if (weth || !signer || !chainId) return;

    setWeth(
      new Contract(
        addresses.weth[chainId.toString() as ChainId],
        erc20Abi,
        signer
      )
    );
  }, [signer, chainId, weth]);

  useEffect(() => {
    if (usdc || !signer || !chainId) return;

    setUsdc(
      new Contract(
        addresses.usdc[chainId.toString() as ChainId],
        erc20Abi,
        signer
      )
    );
  }, [signer, chainId, usdc]);

  const handleMintWethButtonClick = async () => {
    if (!weth) return

    try {
      await weth.mint(address, parseEther("100"))
    } catch (e) {
      console.log(e)
    }
  }

  const handleMintUsdcButtonClick = async () => {
    if (!usdc) return

    try {
      await usdc.mint(address, parseUnits("100000", 6))
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <>
      <Button onClick={handleMintWethButtonClick}>Mint test WETH</Button>
      <Button onClick={handleMintUsdcButtonClick}>Mint test USDC</Button>
    </>
  )
}

export default Mint
