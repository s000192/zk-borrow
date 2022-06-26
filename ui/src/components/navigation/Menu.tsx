import {
  Box,
  Button,
  Popper as MuiPopper,
  alpha,
  tooltipClasses,
  Tooltip,
  styled,
} from "@mui/material";
import { useConnect } from "../../contexts/ConnectContext";
import NextLink from 'next/link';
import { useTranslation } from "react-i18next";
// import useFeatures from "../../features";

const ButtonBase = styled(Button)(({ theme }) => ({
  padding: theme.spacing(0.75, 3),
  letterSpacing: 0.5,
  margin: theme.spacing(0, 1),
  color: theme.palette.common.white,
  border: "1px solid transparent",
  background: "transparent",
  borderRadius: 32,
}));

const StyledButton = styled(NextLink)(({ theme }) => ({
  "&:hover": {
    color: theme.palette.common.white,
    borderColor: "#fff",
    background: "rgba(255,255,255, 0.1)",
  },
  "&:active": {
    background: "rgba(255,255,255, 0.3)",
  },

  "&.Mui-selected": {
    padding: theme.spacing(0.75, 3),
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(0.75, 7),
    },
    fontWeight: 700,
    color: theme.palette.common.white,
    background: "rgba(255,255,255, 0.3)",
  },
}));

const ComingSoonButton = styled(ButtonBase)(({ theme }) => ({
  cursor: "default",
  "&:hover, &:active": {
    borderColor: "transparent",
    background: "transparent",
  },
}));

const items = [
  {
    path: "/",
    label: "common:nav.home",
  },
];

const Popper = styled(MuiPopper)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    border: `1px solid ${alpha("#000", 0.5)}`,
    color: "#fff",
    fontSize: theme.typography.overline.fontSize,
    borderRadius: "2px",
    padding: theme.spacing(0.25, 1),
    margin: 0,
    fontFamily: "Abril Fatface",
    background: alpha("#000", 0.65),
  },
}));

const Menu = () => {
  const { isConnected, isChainIdCorrect } = useConnect();

  const { t } = useTranslation();
  // const features = useFeatures();

  return (
    <Box
      flex={1}
      display="flex"
      mb={4}
      sx={{
        overflow: {
          xs: "auto",
        },
        "::-webkit-scrollbar": {
          xs: {
            display: "none",
          },
        },
      }}
    >
      {isConnected && isChainIdCorrect && (
        <>
          {items.map(({ path, label }, idx) => {
            return path &&
              <StyledButton
                href={path}
                key={idx}
              >
                {t(label)}
              </StyledButton>
          })}
        </>
      )}
    </Box>
  );
};
export default Menu;
