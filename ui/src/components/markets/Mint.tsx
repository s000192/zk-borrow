import { Grid } from '@mui/material'
import { Contract } from 'ethers'
import { useState } from 'react'
import { generateCalldata } from '../../utils/circuits/generate_calldata'
import { generateMerkleProof, getDepositEvents, parseNote, toHex } from '../../utils/helpers/transactions'
import Button from '../shared/Button'
import InfoBox from '../shared/InfoBox'
import InfoGrid from '../shared/InfoGrid'
import NumberField from '../shared/NumberField'

const Mint = ({ underlyingSymbol,
  suppliedBalance, market, refreshSuppliedBalance }: {
    underlyingSymbol: string,
    suppliedBalance: number,
    market?: Contract,
    refreshSuppliedBalance: () => Promise<void>
  }) => {
  const [receiver, setReceiver] = useState("");
  const [depositNote, setDepositNote] = useState("")
  const [statusMessage, setStatusMessage] = useState("");

  const handleReceiverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReceiver(event.target.value);
  }

  const handleDepositNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDepositNote(event.target.value);
  }

  const handleMintButtonClick = async (receiver: string, depositNote: string) => {
    if (!market) return;

    try {
      const events = await getDepositEvents(market);
      const { deposit } = parseNote(depositNote);
      const { nullifierHash, nullifier, secret } = deposit;

      setStatusMessage("Generating merkle proof...");
      const { root, pathElements, pathIndices } = await generateMerkleProof(
        events,
        deposit
      );
      const input = {
        root,
        nullifierHash,
        nullifier,
        secret,
        pathElements,
        pathIndices,
      };

      setStatusMessage("Preparing for your transaction ...");
      const calldata = await generateCalldata(input);
      if (!calldata) return;

      // TODO: should validate on-chain data before sending tx (isValidRoot & isSpent & leafIndex >= 0)
      const mintTx = await market.mint(
        calldata[0],
        calldata[1],
        calldata[2],
        toHex(root),
        toHex(nullifierHash),
        receiver
      );
      const receipt = await mintTx.wait();
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
        <InfoBox>Receiver</InfoBox>
        <NumberField onChange={handleReceiverChange} />
        <InfoBox>Deposit Note</InfoBox>
        <NumberField onChange={handleDepositNoteChange} />
        <Button onClick={() => handleMintButtonClick(receiver, depositNote)}>Mint</Button>
        <InfoBox>{statusMessage}</InfoBox>
      </Grid>
    </>
  )
}

export default Mint;