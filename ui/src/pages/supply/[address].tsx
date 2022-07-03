import { Box, Grid, styled } from "@mui/material";
import type { NextPage } from "next";
import InfoGrid from "../../components/shared/InfoGrid";
import InfoBox from "../../components/shared/InfoBox";

import "../../i18n";
import Button from "../../components/shared/Button";
import { useCallback, useEffect, useState } from "react";
import { Contract } from "ethers";
import { useConnect } from "../../contexts/ConnectContext";
import zkjTokenAbi from "../../abis/zkjToken.json";
import erc20TokenAbi from "../../abis/erc20.json";
import { useRouter } from "next/router";
import { MarketDetails } from "../../data/types";
import getMarketDetails from "../../contracts/getMarketDetails";
import Mint from "../../components/markets/Mint";
import Deposit from "../../components/markets/Deposit";
import Redeem from '../../components/markets/Redeem';
import { formatUnits } from 'ethers/lib/utils';
import Container from '../../components/shared/Container';

type Tab = "DEPOSIT" | "REDEEM" | "MINT";

const Supply: NextPage = () => {
  const [tab, setTab] = useState<Tab>("DEPOSIT");

  const router = useRouter();
  const { address: marketAddress } = router.query;
  const { provider, address, chainId, signer } = useConnect();
  const [market, setMarket] = useState<Contract>();
  const [underlying, setUnderlying] = useState<Contract>();
  const [marketDetails, setMarketDetails] = useState<MarketDetails>({
    underlyingTokenAddress: "",
    symbol: "",
    decimals: 0,
    supplyApy: 0,
    borrowApy: 0,
    balance: 0,
    supplied: 0,
    borrowed: 0,
    liquidity: 0,
  });
  const [suppliedBalance, setSuppliedBalance] = useState(0);

  const refreshSuppliedBalance = useCallback(async () => {
    if (!market || !address) return;

    try {
      // TODO: use multicall
      const _balance = await market.balanceOf(address);
      const _decimals = await market.decimals();

      setSuppliedBalance(Number(formatUnits(_balance.toString(), _decimals)));
    } catch (e) {
      console.log(e)
    }
  }, [address, market])

  const refreshMarketDetails = useCallback(async () => {
    if (!provider || !address) return;
    const details = await getMarketDetails(
      marketAddress as string,
      provider,
      address
    );
    setMarketDetails(details);
  }, [address, marketAddress, provider])

  const handleTabClick = (tab: Tab) => setTab(tab);

  useEffect(() => {
    if (!signer || !chainId || marketDetails.underlyingTokenAddress === "")
      return;

    setUnderlying(
      new Contract(
        marketDetails.underlyingTokenAddress as string,
        erc20TokenAbi,
        signer
      )
    );
  }, [signer, chainId, marketDetails.underlyingTokenAddress]);

  useEffect(() => {
    if (!signer || !chainId || !marketAddress) return;

    setMarket(new Contract(marketAddress as string, zkjTokenAbi, signer));
  }, [signer, chainId, marketAddress]);

  useEffect(() => {
    if (!provider || !address || !marketAddress) return;

    (async () => {
      const details = await getMarketDetails(
        marketAddress as string,
        provider,
        address
      );
      setMarketDetails(details);
    })();
  }, [provider, address, marketAddress]);

  useEffect(() => {
    refreshSuppliedBalance()
  }, [refreshSuppliedBalance])

  return (
    <Container>
      <InfoBox>{marketDetails.symbol} Supply Market</InfoBox>
      <InfoGrid container direction="row">
        {/* <Grid item xs>
          <InfoGrid container direction="column">
            <Grid item xs>
              <MarketInfo labels={marketInfoLabels} values={marketInfoValues} xs={4} />
            </Grid>
            <Grid item xs>
              <MarketInfo labels={marketIncentiveLabels} values={marketIncentiveValues} xs={3} />
            </Grid>
            <Grid item xs>
              <MarketInfo labels={limitLabels} values={limitInfoValues} xs={6} />
            </Grid>
          </InfoGrid>
        </Grid> */}
        <Grid item xs>
          <InfoGrid container direction="column">
            <Grid item xs>
              <InfoGrid container direction="row">
                <Button onClick={() => handleTabClick("DEPOSIT")}>
                  Deposit
                </Button>
                <Button onClick={() => handleTabClick("MINT")}>Mint</Button>

                <Button onClick={() => handleTabClick("REDEEM")}>Redeem</Button>
              </InfoGrid>
            </Grid>
            {tab === "MINT" ? (
              <Mint market={market} suppliedBalance={suppliedBalance} underlyingSymbol={marketDetails.symbol} refreshSuppliedBalance={refreshSuppliedBalance} />
            ) : tab === "DEPOSIT" ?
              <Deposit
                userAddress={address}
                chainId={chainId}
                balance={marketDetails.balance}
                underlyingSymbol={marketDetails.symbol}
                decimals={marketDetails.decimals}
                market={market}
                marketAddress={marketAddress as string}
                underlyingAddress={marketDetails.underlyingTokenAddress}
                underlying={underlying}
                refreshMarketDetails={refreshMarketDetails}
              /> : <Redeem
                underlyingSymbol={marketDetails.symbol}
                market={market}
                suppliedBalance={suppliedBalance}
                refreshSuppliedBalance={refreshSuppliedBalance}
              />
            }
          </InfoGrid>
        </Grid>
      </InfoGrid>
    </Container>
  );
};

export default Supply;
