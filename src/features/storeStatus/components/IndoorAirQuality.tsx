import { Box, Card, Grid, Typography, makeStyles } from "@material-ui/core";
import GaugeChart from "./GaugeChart";
import { useStoreStatusQuery } from "../api/storeStatus";
import { Skeleton } from "@material-ui/lab";
import { MOCK_THRESHOLDS } from "../utils";

export const gaugeChartHeight = 170;
export const gaugeChartWidth = 300;

const useIndoorAirQualityStyles = makeStyles((theme) => ({
  container: {
    width: "100%",
  },
  card: {
    padding: theme.spacing(2),
  },
}));

export default function IndoorAirQuality({ assetId }: { assetId: string }) {
  const storeStatusQuery = useStoreStatusQuery({
    assetId,
  });
  const classes = useIndoorAirQualityStyles();

  if (storeStatusQuery.isLoading) {
    return (
      <>
        <Skeleton variant="rect" height={25} />
        <Box pt={1} />
        <Skeleton variant="rect" height={150} />
        <Box pt={2} />
        <Skeleton variant="rect" height={150} />
        <Box pt={2} />
        <Skeleton variant="rect" height={150} />
      </>
    );
  }

  if (storeStatusQuery.isError) {
    return <div>Error</div>;
  }

  if (!storeStatusQuery.isSuccess) {
    return null;
  }

  return (
    <Card className={classes.card}>
      <Box textAlign={"center"} mb={2}>
        <Typography variant="h5">Indoor Air Quality</Typography>
      </Box>
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        spacing={1}
        className={classes.container}
        wrap="nowrap"
      >
        <Grid item>
          <GaugeChart
            title="Temperature"
            units="°F"
            value={storeStatusQuery.data.custom_data.temperature}
            colorThresholds={MOCK_THRESHOLDS}
            minHeight={gaugeChartHeight}
            minWidth={gaugeChartWidth}
            subtitle="sub"
          />
        </Grid>
        <Grid item>
          <GaugeChart
            title="Humidity"
            units="%"
            value={storeStatusQuery.data.custom_data.humidity}
            colorThresholds={MOCK_THRESHOLDS}
            minHeight={gaugeChartHeight}
            minWidth={gaugeChartWidth}
          />
        </Grid>
        <Grid item>
          <GaugeChart
            title="CO2"
            units=" PPM"
            value={storeStatusQuery.data.custom_data.co2}
            colorThresholds={MOCK_THRESHOLDS}
            minHeight={gaugeChartHeight}
            minWidth={gaugeChartWidth}
          />
        </Grid>
      </Grid>
    </Card>
  );
}
