import { Box } from "@mui/material";
import ConnectWallet from "../user/ConnectWallet";
import NextLink from 'next/link';

const AppBar = () => {
  return (
    <Box display="flex">
      <Box flex={1}>
        <NextLink href="/">
          HOME
        </NextLink>
      </Box>
      <Box flex={1}>
        <NextLink href="/mint">
          MINT TEST TOKENS
        </NextLink>
      </Box>
      <Box flex={1} />
      <Box>
        <ConnectWallet />
      </Box>
    </Box>
  );
};
export default AppBar;
