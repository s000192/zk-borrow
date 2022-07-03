import { Grid } from '@mui/material';
import type { NextPage } from 'next'
import DashboardTable from '../components/markets/DashboardTable';
import InfoBox from '../components/shared/InfoBox';

import "../i18n";

const Home: NextPage = () => {
  return (
    <>
      <Grid container direction="row" alignItems="stretch">
        <Grid item xs>
          <DashboardTable side={"supply"} />
        </Grid>
        <Grid item xs>
          <DashboardTable side={"borrow"} />
        </Grid>
      </Grid>

      <InfoBox>Please mint test tokens to use ZkJoe.</InfoBox>
      <InfoBox>ZkJoe is currently using a mock oracle.</InfoBox>
    </>
  )
}

export default Home
