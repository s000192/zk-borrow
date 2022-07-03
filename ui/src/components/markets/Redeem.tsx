import { Grid } from "@mui/material";
import InfoBox from "../shared/InfoBox";
import InfoGrid from "../shared/InfoGrid";
import Button from "../shared/Button";
import { Contract } from "ethers";
import { useState } from 'react';
import { parseUnits } from 'ethers/lib/utils';

const Redeem = ({
  underlyingSymbol,
  market,
  suppliedBalance,
  refreshSuppliedBalance
}: {
  underlyingSymbol: string,
  market?: Contract,
  suppliedBalance: number,
  refreshSuppliedBalance: () => Promise<void>

}) => {
  const [statusMessage, setStatusMessage] = useState("");

  const handleRedeemButtonClick = async () => {
    if (!market || suppliedBalance == 0) return;

    try {

      const amount = parseUnits(suppliedBalance.toString(), 8);
      const redeemTx = await market.redeem(amount);
      const receipt = await redeemTx.wait();
      await refreshSuppliedBalance();
      setStatusMessage(`Your transaction hash: ${receipt.transactionHash}`);
    } catch (e: any) {
      setStatusMessage(JSON.stringify(e));
    }
  };

  return (
    <>
      <Grid item xs>
        <InfoGrid container direction="row" alignContent="space-between">
          <Grid item xs>
            <InfoBox>Supplied Balance</InfoBox>
          </Grid>
          <Grid item xs>
            <InfoBox>{`${suppliedBalance} zkj${underlyingSymbol}`}</InfoBox>
          </Grid>
        </InfoGrid>
      </Grid>

      <Grid item xs>
        <Button onClick={handleRedeemButtonClick}>REDEEM MAX</Button>
      </Grid>
      <InfoBox>{statusMessage}</InfoBox>
    </>
  );
};

export default Redeem;
