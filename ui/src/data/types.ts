export type User = {
  address: string;
};

export type ChainId = "1313161554" | "4" | "1337"

export type MarketDetails = {
  underlyingTokenAddress: string;
  decimals: number;
  symbol: string;
  supplyApy: number;
  borrowApy: number;
  balance: number;
  supplied: number;
  borrowed: number;
  liquidity: number;
}

export type Deposit = {
  commitment: number;
  commitmentHex: string;
  nullifier: number;
  nullifierHash: number
  nullifierHex: string;
  preimage: Uint8Array;
  secret: number;
}