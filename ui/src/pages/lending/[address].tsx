import { Grid } from '@mui/material';
import type { NextPage } from 'next'
import InfoGrid from '../../components/shared/InfoGrid';
import MarketInfo from '../../components/markets/MarketInfo';
import InfoBox from '../../components/shared/InfoBox';

import "../../i18n";
import { percentFormatter } from '../../utils/formatter/percentFormatter';
import { nearestIntegerFormatter } from '../../utils/formatter/nearestIntegerFormatter';
import { currencyFormatter } from '../../utils/formatter/currencyFormatter';
import Button from '../../components/shared/Button';
import NumberField from '../../components/shared/NumberField';
import { useEffect, useState } from 'react';
import { BigNumber, Contract } from 'ethers';
import { useConnect } from '../../contexts/ConnectContext';
import zkbTokenAbi from "../../abis/zkbToken.json";
import erc20TokenAbi from "../../abis/erc20.json";
import { useRouter } from 'next/router';
import { createDeposit, getDepositEvents, generateMerkleProof, parseNote, rbigint, toHex } from '../../utils/helpers/transactions';
import { Deposit, MarketDetails } from '../../data/types';
import getMarketDetails from '../../contracts/getMarketDetails';
import { formatUnits } from 'ethers/lib/utils';
import { generateCalldata } from '../../utils/circuits/generate_calldata';

type Tab = "DEPOSIT" | "REDEEM"

const marketInfoValues = {
  depositsUsd: 47653204,
  borrowsUsd: 9286112,
  reserves: 262177,
  utilRate: 0.1949,
  deposits: 16701,
  borrows: 3255,
  collateralFactor: 0.75
}

const marketInfoLabels = [
  {
    index: "depositsUsd",
    label: "Deposits (USD)",
    format: currencyFormatter
  },
  {
    index: "borrowsUsd",
    label: "Borrows (USD)",
    format: currencyFormatter

  },
  {
    index: "reserves",
    label: "Reserves (USD)",
    format: currencyFormatter
  },
  {
    index: "utilRate",
    label: "Util Rate",
    format: percentFormatter
  },
  {
    index: "deposits",
    label: "Deposits",
    format: nearestIntegerFormatter
  },
  {
    index: "borrows",
    label: "Borrows",
    format: nearestIntegerFormatter
  },
  {
    index: "collateralFactor",
    label: "Collateral Factor",
    format: percentFormatter
  },
]

const marketIncentiveValues = {
  depositApy: 0.0071,
  joeRewardsApr: 0.0369,
  avaxRewardsApr: 0,
  depositBalance: 1924,
  collateralValue: 16701,
  liquidationPx: 1,
}

const marketIncentiveLabels = [
  {
    index: "depositApy",
    label: "Deposits (USD)",
    format: percentFormatter,
  },
  {
    index: "joeRewardsApr",
    label: "Borrows (USD)",
    format: percentFormatter

  },
  {
    index: "avaxRewardsApr",
    label: "Reserves (USD)",
    format: percentFormatter
  },
  {
    index: "depositBalance",
    label: "Util Rate",
    format: nearestIntegerFormatter
  },
  {
    index: "collateralValue",
    label: "Deposits",
    format: currencyFormatter
  },
  {
    index: "liquidationPx",
    label: "Deposits",
    format: currencyFormatter
  },
]

const limitInfoValues = {
  borrowLimit: 71,
  borrowLimitUsed: 0.0369,
}

const limitLabels = [
  {
    index: "borrowLimit",
    label: "Borrow Limit",
    format: currencyFormatter
  },
  {
    index: "borrowLimitUsed",
    label: "Borrow Limit Used",
    format: percentFormatter

  },
]

const Supply: NextPage = () => {
  const [tab, setTab] = useState<Tab>("DEPOSIT");

  const router = useRouter();
  const { address: marketAddress } = router.query;
  const { provider, address, chainId, signer } = useConnect();
  const [market, setMarket] = useState<Contract>();
  const [underlying, setUnderlying] = useState<Contract>();
  const [allowanceEnough, setAllowanceEnough] = useState<boolean>();
  const [defaultDeposit, setDefaultDeposit] = useState<BigNumber>();
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
  const [statusMessage, setStatusMessage] = useState("");

  const checkAllowance = async () => {
    const allowance = await underlying?.allowance(address, marketAddress);
    setAllowanceEnough(allowance.gte(defaultDeposit));
  }

  const handleTabClick = (tab: Tab) => setTab(tab);

  const handleApproveButtonClick = async () => {
    if (allowanceEnough || !underlying || !defaultDeposit || !marketAddress) return;

    try {
      const approveTx = await underlying.approve(marketAddress, defaultDeposit);
      await approveTx.wait();
      await checkAllowance();
    } catch (e: any) {
      console.log(e.message);
    }
  }

  const handleDepositButtonClick = async () => {
    if (!defaultDeposit) {
      console.log("Contract owner has not set default deposit.");
      return;
    }

    if (!market) {
      console.log("Contract is not yet set up");
      return;
    }

    try {
      const deposit: Deposit = createDeposit({ nullifier: rbigint(31), secret: rbigint(31) });
      const note = toHex(deposit.preimage, 62);
      const amount = formatUnits(defaultDeposit.toString(), marketDetails.decimals);
      const noteString = `zkborrow-${marketDetails.symbol}-${amount}-${chainId}-${note}`
      console.log(`${noteString}`)
      const depositTx = await market.deposit(deposit.commitmentHex);
      const receipt = await depositTx.wait();
      console.log(receipt);
    } catch (e) {
      console.log(e);
    }
  }

  const handleMintButtonClick = async () => {
    if (!market) return;
    const minter = "0xCb49cC137f80A0541039d2A205D1A1b7DDBa9566";

    try {
      const events = await getDepositEvents(market);
      const { deposit } = parseNote("zkborrow-USDC-1000.0-1337-0xc85b44c1d87192e70d9ea2bf221073737efaeea8e90cbe90964962d51e3b8cc5c79e8b461886b0504ca4f2e1ced85d4d5220898b9adf4b67bf66907bb85f");
      const { nullifierHash, nullifier, secret } = deposit;

      setStatusMessage("Generating merkle proof...")
      const { root, pathElements, pathIndices } = await generateMerkleProof(events, deposit);
      const input = {
        root,
        nullifierHash,
        nullifier,
        secret,
        pathElements,
        pathIndices,
      }

      setStatusMessage("Preparing transaction data...")
      const calldata = await generateCalldata(input);
      if (!calldata) return;

      // TODO: should validate on-chain data before sending tx (isValidRoot & isSpent & leafIndex >= 0)
      setStatusMessage("Sending your transaction!")
      const mintTx = await market.mint(calldata[0], calldata[1], calldata[2], toHex(root), toHex(nullifierHash), minter);
      const receipt = await mintTx.wait();
      setStatusMessage(`Your transaction hash: ${receipt.transactionHash}`)
    } catch (e: any) {
      setStatusMessage(JSON.stringify(e))
    }
  }

  const handleRedeemButtonClick = async () => {

  }

  useEffect(() => {
    if (!signer || !chainId || marketDetails.underlyingTokenAddress === "") return;

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

    setMarket(
      new Contract(
        marketAddress as string,
        zkbTokenAbi,
        signer
      )
    );
  }, [signer, chainId, marketAddress]);

  useEffect(() => {
    if (!underlying || !signer || !chainId || !defaultDeposit || marketDetails.underlyingTokenAddress === "") return;

    checkAllowance();
  }, [underlying, defaultDeposit, signer, chainId, marketAddress, address, marketDetails.underlyingTokenAddress])

  useEffect(() => {
    if (!market || !provider || !chainId) return;

    (async () => {
      const _defaultDeposit = await market.defaultDeposit();
      setDefaultDeposit(_defaultDeposit);
    })();
  }, [market, provider, chainId])

  useEffect(() => {
    if (!provider || !address || !marketAddress) return;

    (async () => {
      const details = await getMarketDetails(marketAddress as string, provider, address);
      console.log(details);
      setMarketDetails(details);
    })();
  }, [provider, address, marketAddress]);

  return (
    <>
      <InfoBox>{marketDetails.symbol}</InfoBox>
      <InfoGrid container direction="row">
        <Grid item xs>
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
        </Grid>
        <Grid item xs>
          <InfoGrid container direction="column">
            <Grid item xs>
              <InfoGrid container direction="row">
                <Button onClick={() => handleTabClick("DEPOSIT")}>Deposit</Button>
                <Button onClick={() => handleTabClick("REDEEM")}>Redeem</Button>
                <Button>Setting</Button>
              </InfoGrid>
            </Grid>
            <Grid item xs>
              <InfoGrid container direction="row" alignContent="space-between">
                <Grid item xs>
                  <InfoBox>{tab === "DEPOSIT" ? "Wallet Balance" : "Supplied Balance"}</InfoBox>
                </Grid>
                <Grid item xs>
                  <InfoBox>{tab === "DEPOSIT" ? marketDetails.balance : marketDetails.supplied}</InfoBox>
                </Grid>
              </InfoGrid>
            </Grid>
            <Grid item xs>
              <Button
                onClick={allowanceEnough ?
                  (tab === "DEPOSIT" ? handleDepositButtonClick : handleRedeemButtonClick) :
                  handleApproveButtonClick
                }
              >
                {allowanceEnough ? tab : "approve"}
              </Button>
            </Grid>
            <Grid item xs>
              <NumberField></NumberField>
              <Button onClick={handleMintButtonClick}>Mint</Button>
            </Grid>
          </InfoGrid>
          <InfoBox>{statusMessage}</InfoBox>
        </Grid>
      </InfoGrid >
    </>
  )
}

export default Supply
