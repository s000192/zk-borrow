import { Grid } from "@mui/material";
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
import Borrow from '../../components/markets/Borrow';
import Container from '../../components/shared/Container';

type Tab = "BORROW" | "REPAY";

const Supply: NextPage = () => {
  const [tab, setTab] = useState<Tab>("BORROW");

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

  const handleTabClick = (tab: Tab) => setTab(tab);

  const refreshMarketDetails = useCallback(async () => {
    if (!provider || !address) return;
    const details = await getMarketDetails(
      marketAddress as string,
      provider,
      address
    );
    setMarketDetails(details);
  }, [address, marketAddress, provider])

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

    refreshMarketDetails();
  }, [provider, address, marketAddress, refreshMarketDetails]);

  return (
    <Container>
      <InfoBox>{marketDetails.symbol} Borrow Market</InfoBox>
      <InfoGrid container direction="row">
        <Grid item xs>
          <InfoGrid container direction="column">
            <Grid item xs>
              <InfoGrid container direction="row">
                <Button onClick={() => handleTabClick("BORROW")}>
                  Borrow
                </Button>
                <Button onClick={() => handleTabClick("REPAY")}>Repay</Button>

              </InfoGrid>
            </Grid>

            <Borrow
              action={tab}
              userAddress={address}
              balance={marketDetails.balance}
              borrowed={marketDetails.borrowed}
              underlying={underlying}
              underlyingSymbol={marketDetails.symbol}
              market={market}
              marketAddress={marketAddress as string}
              decimals={marketDetails.decimals}
              refreshMarketDetails={refreshMarketDetails}
            />
          </InfoGrid>
        </Grid>
      </InfoGrid>
    </Container>
  );
};

export default Supply;
