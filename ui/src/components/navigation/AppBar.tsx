import { Box } from "@mui/material";
import ConnectWallet from "../user/ConnectWallet";
import NextLink from 'next/link';
import Image from "../shared/Image";

const AppBar = () => {
  return (
    <Box display="flex">
      <NextLink href="/">
        <Image src={"images/small_logo.png"} alt="logo" width={150} />
      </NextLink>
      <Box flex={1} />
      <Box>
        <ConnectWallet />
      </Box>
    </Box>
  );
};
export default AppBar;
