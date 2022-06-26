import { Box, Paper } from '@mui/material';
import InfoGrid from '../shared/InfoGrid';
import { styled } from "@mui/material";

interface MarketInfo {
  [key: string]: number
}

interface Label {
  index: string
  label: string
  format: (value: number) => string
}

const Item = styled(Paper)(({ theme }) => ({
  // ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: "#000",
  borderRadius: '0px',
  boxShadow: 'none'
}));

const MarketInfo = ({ labels, values, xs }: { labels: Label[], values: MarketInfo, xs: number }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <InfoGrid container direction="row">
        {labels.map((item) => (
          <InfoGrid key={item.index} item xs={xs}>
            <Item>{item.label}</Item>
            <Item>{item.format(values[item.index])}</Item>
          </InfoGrid>
        )
        )}
      </InfoGrid>
    </Box>
  )
}

export default MarketInfo;