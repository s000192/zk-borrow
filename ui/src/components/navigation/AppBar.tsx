import { Box } from "@mui/material";
import ConnectWallet from "../user/ConnectWallet";
import NextLink from 'next/link';

const AppBar = () => {
  return (
    <Box display="flex">
      <NextLink href="/">
        HOME
      </NextLink>
      <Box flex={1} />
      <Box>
        <ConnectWallet />
      </Box>
    </Box>
  );
};
export default AppBar;
