import { Paper, Table, TableHead, styled, TableContainer, TableRow, TableCell, TableBody, TableCellProps as MuiTableCellProps } from "@mui/material";
import { useConnect } from "../../contexts/ConnectContext";
import { Contract } from "ethers";
import comptrollerAbi from "../../abis/comptroller.json";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import addresses from "../../contracts/addresses.json";
import { ChainId } from '../../data/types';
import { percentFormatter } from '../../utils/formatter/percentFormatter';
import getMarketDetails from '../../contracts/getMarketDetails';
import NextLink from 'next/link';

interface Column {
  id: 'asset' | 'apy' | 'balance' | 'liquidity';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: Column[] = [
  { id: 'asset', label: 'Asset', minWidth: 170 },
  {
    id: 'apy',
    label: 'APY',
    minWidth: 100,
    align: 'right',
    format: percentFormatter
  },
  {
    id: 'balance',
    label: 'Balance',
    minWidth: 100,
    align: 'right',
    format: (value: number) => value.toLocaleString(
      undefined,
      { minimumFractionDigits: 2 }
    ),
  },
  // {
  //   id: 'supplied',
  //   label: 'Supplied',
  //   minWidth: 100,
  //   align: 'right',
  //   format: (value: number) => value.toLocaleString(
  //     undefined,
  //     { minimumFractionDigits: 2 }
  //   ),
  // },
  // {
  //   id: 'borrowed',
  //   label: 'Borrowed',
  //   minWidth: 100,
  //   align: 'right',
  //   format: (value: number) => value.toLocaleString(
  //     undefined,
  //     { minimumFractionDigits: 2 }
  //   ),
  // },
  {
    id: 'liquidity',
    label: 'Liquidity',
    minWidth: 170,
    align: 'right',
    format: (value: number) => value.toLocaleString(
      'en-US',
    ),
  }
];

type Side = "borrow" | "supply";

interface Data {
  asset: string;
  apy: number;
  balance: number;
  supplied: number;
  borrowed: number;
  liquidity: number;
  address: string;
}

const StyledTableCell = styled(TableCell)<MuiTableCellProps>(({ theme }) => ({
  "&.MuiTableCell-root": {
    color: "#000",
  },
}));

const aggregateLiquidity = (markets: Array<Data>) => markets.reduce((acc, cur) => {
  return acc + cur.liquidity;
}, 0);

const DashboardTable = ({ side }: { side: Side }) => {
  const { t } = useTranslation();
  const { provider, address, chainId } = useConnect();
  const [comptroller, setComptroller] = useState<Contract>();
  const [markets, setMarkets] = useState<Array<Data>>([]);

  // const filteredColumns = columns.filter((column) => {
  //   if (column.id === "supplied") {
  //     return side === "supply";
  //   } else if (column.id === "borrowed") {
  //     return side === "borrow";
  //   } else {
  //     return true;
  //   }
  // });

  useEffect(() => {
    if (comptroller || !provider || !chainId) return;

    setComptroller(
      new Contract(
        addresses.unitroller[chainId.toString() as ChainId],
        comptrollerAbi,
        provider
      )
    );
  }, [provider, chainId, comptroller]);

  useEffect(() => {
    if (!comptroller || !provider || !address) return;

    (async () => {
      const marketAddresses = await comptroller.getAllMarkets();
      const markets = (await Promise.all(
        marketAddresses.map(async (marketAddress: string) => {
          const details = await getMarketDetails(marketAddress, provider, address);
          // console.log(details)
          if (!details) return;
          const { symbol, supplyApy, borrowApy, balance, supplied, borrowed, liquidity } = details;

          let apy;
          if (side === "supply") {
            apy = supplyApy;
          } else {
            apy = borrowApy;
          }

          return { asset: symbol, apy, balance, supplied, borrowed, liquidity, address: marketAddress };
        })
      )).filter(market => market.asset !== "WETH"); // Temporary disable WETH market
      setMarkets(markets);
    })();
  }, [comptroller, provider, address, side]);

  return (
    <Paper>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="left" colSpan={3}>
                {t(`market:${side}_markets`)}
              </StyledTableCell>
              <StyledTableCell align="right" colSpan={2}>
                {aggregateLiquidity(markets)}
              </StyledTableCell>
            </TableRow>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCell
                  key={column.id}
                  align={column.align}
                  style={{ top: 57, minWidth: column.minWidth }}
                >
                  {column.label}
                </StyledTableCell>
              ))
              }
            </TableRow >
          </TableHead >
          <TableBody>
            {markets.map((market) => {
              return (
                <NextLink key={market.asset} href={`/${side}/${market.address}`}>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    {columns.map((column) => {
                      const value = market[column.id];
                      return (
                        <StyledTableCell key={column.id} align={column.align}>
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                        </StyledTableCell>
                      );
                    })}
                  </TableRow>
                </NextLink>
              );
            })}
          </TableBody >
        </Table >
      </TableContainer >
    </Paper >
  )
}

export default DashboardTable