import { Grid } from "@mui/material";
import InfoBox from "../shared/InfoBox";
import Button from "../shared/Button";
import { Contract, constants } from "ethers";
import TextField from "../shared/TextField";
import { useCallback, useState } from "react";
import { parseUnits } from "ethers/lib/utils";
import InfoGrid from "../shared/InfoGrid";

const { MaxUint256 } = constants;

const Borrow = ({
  action,
  userAddress,
  balance,
  borrowed,
  underlying,
  underlyingSymbol,
  market,
  marketAddress,
  decimals,
  refreshMarketDetails,
}: {
  action: "BORROW" | "REPAY";
  userAddress?: string;
  balance: number;
  borrowed: number;
  underlying?: Contract;
  underlyingSymbol: string;
  market?: Contract;
  marketAddress?: string;
  decimals: number;
  refreshMarketDetails: () => Promise<void>;
}) => {
  const [allowanceEnough, setAllowanceEnough] = useState(false);
  const [amount, setAmount] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const checkAllowance = useCallback(async () => {
    const allowance = await underlying?.allowance(userAddress, marketAddress);
    setAllowanceEnough(allowance.gte(MaxUint256.div(100)));
  }, [marketAddress, underlying, userAddress]);

  const handleApproveButtonClick = async () => {
    if (allowanceEnough || !underlying || !marketAddress) return;

    try {
      const approveTx = await underlying.approve(marketAddress, MaxUint256);
      const receipt = await approveTx.wait();
      setStatusMessage(
        `Your approve transaction hash: ${receipt.transactionHash}`
      );
      await checkAllowance();
    } catch (e: any) {
      setStatusMessage(JSON.stringify(e));
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let {
      target: { value },
    } = event;

    if (!value.includes("0.")) {
      value = value.replace(/^0+/, "");
    }

    if (value.startsWith(".") && value !== ".0") {
      value = "0".concat(value);
    }

    if (value === "") {
      value = "0";
    }

    setAmount(value);
  };

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
      const repayBorowTx = await market.repayBorrow(
        parseUnits(amount, decimals)
      );
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
        <TextField type="number" value={amount} onChange={handleAmountChange} />
        <Button
          onClick={
            action === "BORROW"
              ? handleBorrowButtonClick
              : allowanceEnough
                ? handleRepayButtonClick
                : handleApproveButtonClick
          }
        >
          {action === "BORROW" ? action : allowanceEnough ? action : "approve"}
        </Button>
      </Grid>
      <InfoBox>{statusMessage}</InfoBox>
    </>
  );
};

export default Borrow;
