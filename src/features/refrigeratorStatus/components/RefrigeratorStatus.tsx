import {
  Box,
  Card,
  Grid,
  Theme,
  Typography,
  makeStyles,
} from "@material-ui/core";
import TemperatureCharts from "./TemperatureCharts";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import {
  RefrigeratorAsset,
  refrigeratorStatusQueryKeys,
  useRefrigeratorStatusQuery,
} from "../api/refrigeratorStatus";
import HumidityCharts from "./HumidityCharts";
import DoorCharts from "./DoorCharts";
import {
  RelativeAbsoluteDateRangePicker,
  useMessaging,
} from "@clearblade/ia-mfe-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import {
  doorOpenHistoryQueryKeys,
  useDoorOpenHistoryQuery,
} from "../api/doorOpenHistory";
import {
  humidityHistoryQueryKeys,
  useHumidityHistoryQuery,
} from "../api/humidityHistory";
import {
  temperatureHistoryQueryKeys,
  useTemperatureHistoryQuery,
} from "../api/temperatureHistory";
import { Skeleton } from "@material-ui/lab";
import { RelativeOrAbsoluteRange, TimeUnitMultiplier } from "../utils/types";
import {
  motionHistoryQueryKeys,
  useMotionHistoryQuery,
} from "../api/motionHistory";
import MotionCharts from "./MotionCharts";

const refrigeratorStatusStyles = makeStyles<Theme, { powerStatus: boolean }>(
  (theme) => ({
    powerStatusIcon: ({ powerStatus }) => ({
      color: powerStatus
        ? theme.palette.success.main
        : theme.palette.text.disabled,
    }),
    card: {
      padding: theme.spacing(2),
    },
    container: {
      width: "100%",
    },
  })
);

export default function RefrigeratorStatus({ assetId }: { assetId: string }) {
  const refrigeratorStatusQuery = useRefrigeratorStatusQuery({ assetId });

  const [timeRange, setTimeRange] = useState<RelativeOrAbsoluteRange>({
    type: "relative",
    count: 1,
    units: TimeUnitMultiplier.HOURS,
  });

  const temperatureHistoryQuery = useTemperatureHistoryQuery({
    assetId,
    timeRange,
  });
  const humidityHistoryQuery = useHumidityHistoryQuery({
    assetId,
    timeRange,
  });
  const doorOpenHistoryQuery = useDoorOpenHistoryQuery({
    timeRange,
    assetId,
  });
  const motionHistoryQuery = useMotionHistoryQuery({
    timeRange,
    assetId,
  });
  useLiveDataForRefrigerator({ assetId, timeRange });

  const powerStatus = refrigeratorStatusQuery.data?.custom_data.isRunning;
  const classes = refrigeratorStatusStyles({
    powerStatus: powerStatus ?? false,
  });

  if (refrigeratorStatusQuery.isLoading) {
    return (
      <>
        <Skeleton variant="rect" height={25} />
        <Box pt={1} />
        <Skeleton variant="rect" height={200} />
        <Box pt={2} />
        <Skeleton variant="rect" height={200} />
        <Box pt={2} />
        <Skeleton variant="rect" height={200} />
      </>
    );
  }

  if (
    refrigeratorStatusQuery.isError ||
    temperatureHistoryQuery.isError ||
    humidityHistoryQuery.isError ||
    doorOpenHistoryQuery.isError ||
    motionHistoryQuery.isError
  ) {
    return <div>Error</div>;
  }

  if (!refrigeratorStatusQuery.isSuccess) {
    return null;
  }

  return (
    <Card className={classes.card}>
      <Grid container alignItems="center" direction="column" spacing={2}>
        <Grid item className={classes.container}>
          <Box display="flex" alignItems="left">
            <Typography variant="h5" noWrap>
              Refrigerator Power Status
            </Typography>
            <Box display="flex" flexWrap="nowrap" alignItems="center">
              <FiberManualRecordIcon className={classes.powerStatusIcon} />
              <Typography variant="subtitle1">
                {powerStatus ? "On" : "Off"}
              </Typography>
            </Box>
            <Box pt={1} ml="auto">
              <RelativeAbsoluteDateRangePicker
                currentRange={timeRange}
                onApplyRange={(range) => {
                  if (range) {
                    setTimeRange(range);
                  }
                }}
                compact
              />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} className={classes.container}>
          <TemperatureCharts
            temperatureHistoryQuery={temperatureHistoryQuery}
            current={refrigeratorStatusQuery.data.custom_data.temperature}
          />
        </Grid>
        <Grid item xs={12} className={classes.container}>
          <HumidityCharts
            humidityHistoryQuery={humidityHistoryQuery}
            current={refrigeratorStatusQuery.data.custom_data.humidity}
          />
        </Grid>
        <Grid item xs={12} className={classes.container}>
          <DoorCharts
            doorOpenHistoryQuery={doorOpenHistoryQuery}
            current={refrigeratorStatusQuery.data.custom_data.doorOpen}
          />
        </Grid>
        <Grid item xs={12} className={classes.container}>
          <MotionCharts
            motionHistoryQuery={motionHistoryQuery}
            current={refrigeratorStatusQuery.data.custom_data.motion ?? false}
          />
        </Grid>
      </Grid>
    </Card>
  );
}

interface HistoricalData {
  x: string[];
  y: number[];
}

function useLiveDataForRefrigerator({
  assetId,
  timeRange,
}: {
  assetId: string;
  timeRange: RelativeOrAbsoluteRange;
}) {
  const { subscribe, unsubscribe } = useMessaging();
  const queryClient = useQueryClient();
  useEffect(() => {
    const topics = [`_dbupdate/_monitor/_asset/${assetId}/locStatusHistory`];

    subscribe(topics, (msg) => {
      try {
        const assetData = msg.payload as RefrigeratorAsset;
        const last_updated = assetData.last_updated;
        if (last_updated === null) {
          console.warn(
            `Received message from on ${msg.message.destinationName} that contained a null value for last_updated. Ignoring`
          );
          return;
        }
        queryClient.setQueryData<RefrigeratorAsset | undefined>(
          refrigeratorStatusQueryKeys.byAsset({ assetId }),
          (data) => {
            if (typeof data === "undefined") {
              return assetData;
            }

            return {
              ...data,
              last_updated: last_updated,
              custom_data: {
                ...data.custom_data,
                ...assetData.custom_data,
              },
            };
          }
        );

        if (
          typeof assetData.custom_data.temperature !== "undefined" &&
          !queryClient.isFetching({
            queryKey: temperatureHistoryQueryKeys.byAsset({
              assetId,
              timeRange,
            }),
          })
        ) {
          queryClient.setQueryData<HistoricalData | undefined>(
            temperatureHistoryQueryKeys.byAsset({ assetId, timeRange }),
            (data) => {
              if (typeof data === "undefined") {
                return data;
              }
              return {
                ...data,
                x: [...data.x, last_updated],
                y: [...data.y, assetData.custom_data.temperature],
              };
            }
          );
        }

        if (
          typeof assetData.custom_data.humidity !== "undefined" &&
          !queryClient.isFetching({
            queryKey: humidityHistoryQueryKeys.byAsset({ assetId, timeRange }),
          })
        ) {
          queryClient.setQueryData<HistoricalData | undefined>(
            humidityHistoryQueryKeys.byAsset({ assetId, timeRange }),
            (data) => {
              if (typeof data === "undefined") {
                return data;
              }
              return {
                ...data,
                x: [...data.x, last_updated],
                y: [...data.y, assetData.custom_data.humidity],
              };
            }
          );
        }

        if (
          typeof assetData.custom_data.doorOpen !== "undefined" &&
          !queryClient.isFetching({
            queryKey: doorOpenHistoryQueryKeys.byAsset({ assetId, timeRange }),
          })
        ) {
          queryClient.setQueryData<HistoricalData | undefined>(
            doorOpenHistoryQueryKeys.byAsset({ assetId, timeRange }),
            (data) => {
              if (typeof data === "undefined") {
                return data;
              }
              return {
                ...data,
                x: [...data.x, last_updated],
                y: [...data.y, assetData.custom_data.doorOpen === true ? 1 : 0],
              };
            }
          );
        }

        if (
          typeof assetData.custom_data.motion !== "undefined" &&
          !queryClient.isFetching({
            queryKey: motionHistoryQueryKeys.byAsset({ assetId, timeRange }),
          })
        ) {
          queryClient.setQueryData<HistoricalData | undefined>(
            motionHistoryQueryKeys.byAsset({ assetId, timeRange }),
            (data) => {
              if (typeof data === "undefined") {
                return data;
              }
              return {
                ...data,
                x: [...data.x, last_updated],
                y: [...data.y, assetData.custom_data.motion === true ? 1 : 0],
              };
            }
          );
        }
      } catch (e) {
        console.error("caught error!", e);
      }
    });

    return () => unsubscribe(topics);
  }, [assetId, subscribe, unsubscribe, queryClient, timeRange]);
}
