import { Grid } from "@mui/material";
import InfoBox from "../shared/InfoBox";
import Button from "../shared/Button";
import { Contract } from "ethers";
import NumberField from '../shared/NumberField';
import { useState } from 'react';
import { parseUnits } from 'ethers/lib/utils';
import InfoGrid from '../shared/InfoGrid';

const Borrow = ({
  action,
  balance,
  borrowed,
  underlyingSymbol,
  market,
  decimals,
  refreshMarketDetails
}: {
  action: "BORROW" | "REPAY",
  balance: number,
  borrowed: number,
  underlyingSymbol: string,
  market?: Contract,
  decimals: number,
  refreshMarketDetails: () => Promise<void>
}) => {
  const [amount, setAmount] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let {
      target: { value },
    } = event;

    if (!value.includes('0.')) {
      value = value.replace(/^0+/, '');
    }

    if (value.startsWith('.') && value !== ".0") {
      value = '0'.concat(value);
    }

    if (value === '') {
      value = '0';
    }

    setAmount(value);

  }

  const handleBorrowButtonClick = async () => {
    if (!market || Number(amount) == 0) return;

    try {
      const borrowTx = await market.borrow(parseUnits(amount, decimals));
      const receipt = await borrowTx.wait();
      setStatusMessage(`Your transaction hash: ${receipt.transactionHash}`);
      await refreshMarketDetails();
    } catch (e: any) {
      setStatusMessage(JSON.stringify(e));
    }
  };

  const handleRepayButtonClick = async () => {
    if (!market || Number(amount) == 0) return;

    try {
      const repayBorowTx = await market.repayBorrow(parseUnits(amount, decimals));
      const receipt = await repayBorowTx.wait();
      setStatusMessage(`Your transaction hash: ${receipt.transactionHash}`);
      await refreshMarketDetails();
    } catch (e: any) {
      setStatusMessage(JSON.stringify(e));
    }
  };

  return (
    <>
      <Grid item xs>
        <InfoGrid container direction="row" alignContent="space-between">
          <Grid item xs>
            <InfoBox>Balance</InfoBox>
          </Grid>
          <Grid item xs>
            <InfoBox>{`${balance} ${underlyingSymbol}`}</InfoBox>
          </Grid>
        </InfoGrid>
      </Grid>
      <Grid item xs>
        <InfoGrid container direction="row" alignContent="space-between">
          <Grid item xs>
            <InfoBox>Borrowed</InfoBox>
          </Grid>
          <Grid item xs>
            <InfoBox>{`${borrowed} ${underlyingSymbol}`}</InfoBox>
          </Grid>
        </InfoGrid>
      </Grid>
      <Grid item xs>
        <InfoBox>{`Amount (${underlyingSymbol})`}</InfoBox>
        <NumberField type="number" value={amount} onChange={handleAmountChange} />
        <Button onClick={action === "BORROW" ? handleBorrowButtonClick : handleRepayButtonClick}>{action}</Button>
      </Grid>
      <InfoBox>{statusMessage}</InfoBox>
    </>
  );
};

export default Borrow;
