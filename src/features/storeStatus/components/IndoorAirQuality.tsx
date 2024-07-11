import {
  Box,
  Card,
  Grid,
  Typography,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useStoreStatusQuery } from "../api/storeStatus";
import {
  getIndoorCO2Thresholds,
  getIndoorHumidityThresholds,
  getIndoorTempThresholds,
} from "../utils";
import GaugeChart from "./GaugeChart";

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
  const theme = useTheme();
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
            colorThresholds={getIndoorTempThresholds(theme)}
            minHeight={gaugeChartHeight}
            minWidth={gaugeChartWidth}
          />
        </Grid>
        <Grid item>
          <GaugeChart
            title="Humidity"
            units="%"
            value={storeStatusQuery.data.custom_data.humidity}
            colorThresholds={getIndoorHumidityThresholds(theme)}
            minHeight={gaugeChartHeight}
            minWidth={gaugeChartWidth}
          />
        </Grid>
        <Grid item>
          <GaugeChart
            title="CO2"
            units=" PPM"
            value={storeStatusQuery.data.custom_data.co2}
            gaugeAxis={{
              range: [0, 6000],
              tickvals: [0, 2000, 4000, 6000],
              tickangle: 0,
            }}
            colorThresholds={getIndoorCO2Thresholds(theme)}
            minHeight={gaugeChartHeight}
            minWidth={gaugeChartWidth}
          />
        </Grid>
      </Grid>
    </Card>
  );
}
