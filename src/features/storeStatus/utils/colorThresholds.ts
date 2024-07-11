import { Theme } from "@material-ui/core";
import { ColorThresholds } from "../types";

export const getIndoorTempThresholds = (theme: Theme): ColorThresholds => [
  { value: theme.palette.error.main, min: -Infinity, max: 55 },
  { value: theme.palette.warning.main, min: 55, max: 64 },
  { value: theme.palette.success.main, min: 64, max: Infinity },
];

export const getIndoorHumidityThresholds = (theme: Theme): ColorThresholds => [
  { value: theme.palette.error.main, min: -Infinity, max: 20 },
  { value: theme.palette.warning.main, min: 20, max: 30 },
  { value: theme.palette.success.main, min: 30, max: 60 },
  { value: theme.palette.warning.main, min: 60, max: 70 },
  { value: theme.palette.error.main, min: 70, max: Infinity },
];

export const getIndoorCO2Thresholds = (theme: Theme): ColorThresholds => [
  { value: theme.palette.success.main, min: -Infinity, max: 1500 },
  { value: theme.palette.warning.main, min: 1500, max: 4000 },
  { value: theme.palette.error.main, min: 4000, max: Infinity },
];
