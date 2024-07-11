import { Box, Typography, useTheme } from "@material-ui/core";
import Plot from "react-plotly.js";
import { ColorThresholds } from "../types";
import { getThresholdValue } from "../utils";
import { Axis, Data } from "plotly.js";

export default function GaugeChart({
  title,
  value,
  units,
  colorThresholds,
  minHeight,
  minWidth,
  gaugeAxis,
}: {
  title: string;
  value: number;
  units: string;
  colorThresholds?: ColorThresholds;
  minHeight?: number;
  minWidth?: number;
  gaugeAxis?: Partial<Axis>;
}) {
  const theme = useTheme();
  const barColor = colorThresholds
    ? getThresholdValue({ value, thresholds: colorThresholds }) ??
      theme.palette.text.primary
    : theme.palette.text.primary;
  const data: Data[] = [
    {
      domain: { x: [0, 1], y: [0, 1] },
      value,
      number: { suffix: units },
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        bar: { color: barColor },
        axis: gaugeAxis,
      },
    },
  ];
  return (
    <Box textAlign={"center"}>
      <Typography>{title}</Typography>
      <Plot
        data={data}
        config={{
          responsive: true,
          displayModeBar: false,
          displaylogo: false,
        }}
        layout={{
          autosize: true,
          margin: { t: 50, b: 50 },
          // title,
          titlefont: {
            size: 16,
            family: theme.typography.fontFamily,
          },
        }}
        style={{
          width: "100%",
          height: "100%",
          minHeight,
          minWidth,
        }}
      />
    </Box>
  );
}
