import type { ButtonProps } from "@mui/material";
import type { JSX } from "react";
import type { GoogleSheetBackupFormFieldProps } from "../googleSheetBackupFormField/types";

type TabPanelProps = {
  children: JSX.Element;
  index: number;
  value: number;
};

type SettingsPanelProps = GoogleSheetBackupFormFieldProps & {
  handleDeleteData: ButtonProps["onClick"];
};

export type { TabPanelProps, SettingsPanelProps };
