import { Grid } from '@mui/material';
import type { NextPage } from 'next'
import DashboardTable from '../components/markets/DashboardTable';

import "../i18n";

const Home: NextPage = () => {
  return (
    <Grid container direction="row" alignItems="stretch">
      <Grid item xs>
        <DashboardTable side={"supply"} />
      </Grid>
      <Grid item xs>
        <DashboardTable side={"borrow"} />
      </Grid>
    </Grid>
  )
}

export default Home
