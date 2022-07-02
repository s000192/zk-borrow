import { Grid } from "@mui/material";
import InfoBox from "../shared/InfoBox";
import InfoGrid from "../shared/InfoGrid";
import Button from "../shared/Button";
import { Contract, constants, BigNumber } from "ethers";
import { createDeposit, rbigint, toHex } from '../../utils/helpers/transactions';
import { Deposit } from '../../data/types';
import { formatUnits } from 'ethers/lib/utils'
import { useCallback, useEffect, useState } from 'react';

const { MaxUint256, Zero } = constants;


const Deposit = ({
  userAddress,
  chainId,
  balance,
  underlyingSymbol,
  decimals,
  marketAddress,
  market,
  underlying,
  underlyingAddress,
  refreshMarketDetails
}: {
  chainId?: number,
  userAddress?: string,
  balance: number,
  underlyingSymbol: string,
  decimals: number,
  marketAddress?: string,
  market?: Contract,
  underlying?: Contract,
  underlyingAddress: string,
  refreshMarketDetails: () => Promise<void>

}) => {
  const [allowanceEnough, setAllowanceEnough] = useState<boolean>(false);
  const [depositNote, setDepositNote] = useState("")
  const [defaultDeposit, setDefaultDeposit] = useState<BigNumber>(Zero);
  const [statusMessage, setStatusMessage] = useState("");

  const checkAllowance = useCallback(async () => {
    const allowance = await underlying?.allowance(userAddress, marketAddress);
    setAllowanceEnough(allowance.gte(defaultDeposit));
  }, [defaultDeposit, marketAddress, underlying, userAddress]);

  const handleApproveButtonClick = async () => {
    if (allowanceEnough || !underlying || !marketAddress) return;

    try {
      const approveTx = await underlying.approve(marketAddress, MaxUint256);
      const receipt = await approveTx.wait();
      setStatusMessage(`Your approve transaction hash: ${receipt.transactionHash}`);
      await checkAllowance();
    } catch (e: any) {
      setStatusMessage(JSON.stringify(e));
    }
  };


  const handleDepositButtonClick = async () => {
    if (!defaultDeposit) {
      setStatusMessage("Contract owner has not set default deposit.");
      return;
    }

    if (!market) {
      setStatusMessage("Contract is not yet set up");
      return;
    }

    try {
      const deposit: Deposit = createDeposit({
        nullifier: rbigint(31),
        secret: rbigint(31),
      });
      const note = toHex(deposit.preimage, 62);
      const amount = formatUnits(
        defaultDeposit.toString(),
        decimals
      );
      const noteString = `zkjoe-${underlyingSymbol}-${amount}-${chainId}-${note}`;
      const depositTx = await market.deposit(deposit.commitmentHex);
      const receipt = await depositTx.wait();
      setDepositNote(`Please mark your deposit note: ${noteString}`);
      await refreshMarketDetails();
      setStatusMessage(`Your deposit transaction hash: ${receipt.transactionHash}`);
    } catch (e) {
      setStatusMessage(JSON.stringify(e));
    }
  };

  useEffect(() => {
    if (
      !underlying ||
      !chainId ||
      !defaultDeposit ||
      underlyingAddress === ""
    )
      return;

    checkAllowance();
  }, [underlying, defaultDeposit, chainId, marketAddress, checkAllowance, underlyingAddress]);

  useEffect(() => {
    if (!market) return;

    (async () => {
      const _defaultDeposit = await market.defaultDeposit();
      setDefaultDeposit(_defaultDeposit);
    })();
  }, [market]);

  return (
    <>
      <Grid item xs>
        <InfoGrid container direction="row" alignContent="space-between">
          <Grid item xs>
            <InfoBox>Wallet Balance</InfoBox>
          </Grid>
          <Grid item xs>
            <InfoBox>{balance}</InfoBox>
          </Grid>
        </InfoGrid>
      </Grid>

      <Grid item xs>
        <InfoGrid container direction="row" alignContent="space-between">
          <Grid item xs>
            <InfoBox>Default deposit</InfoBox>
          </Grid>
          <Grid item xs>
            <InfoBox>{formatUnits(defaultDeposit.toString(), decimals)}</InfoBox>
          </Grid>
        </InfoGrid>
      </Grid>

      <Grid item xs>
        <Button
          onClick={
            allowanceEnough
              ? handleDepositButtonClick
              : handleApproveButtonClick
          }
        >
          {allowanceEnough ? "deposit" : "approve"}
        </Button>
      </Grid>

      <InfoBox>{depositNote}</InfoBox>
    </>
  );
};

export default Deposit;
