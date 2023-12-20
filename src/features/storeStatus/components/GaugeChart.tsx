import { Box, Typography, useTheme } from "@material-ui/core";
import Plot from "react-plotly.js";
import { ColorThresholds } from "../types";
import { getThresholdValue } from "../utils";

export default function GaugeChart({
  title,
  subtitle,
  value,
  units,
  colorThresholds,
  minHeight,
  minWidth,
}: {
  title: string;
  subtitle?: string;
  value: number;
  units: string;
  colorThresholds?: ColorThresholds;
  minHeight?: number;
  minWidth?: number;
}) {
  const theme = useTheme();
  const barColor = colorThresholds
    ? getThresholdValue({ value, thresholds: colorThresholds }) ??
      theme.palette.text.primary
    : theme.palette.text.primary;
  const data = [
    {
      domain: { x: [0, 1], y: [0, 1] },
      value,
      number: { suffix: units },
      type: "indicator" as const,
      mode: "gauge+number" as const,
      gauge: {
        bar: { color: barColor },
      },
    },
  ];
  return (
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
        title: subtitle ? `${title} <br /> (${subtitle})` : title,
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
  );
}
