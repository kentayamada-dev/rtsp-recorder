import { LazyLog } from "@melloware/react-logviewer";
import { Grid, Stack, Box, Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import type { LogLevel } from "@shared-types/ipc";
import { CustomToggleButton } from "./customToggleButton";

const AUTOUPDATE_STATE = {
  ON: "on",
  OFF: "off",
} as const;
const LOG_TYPES = ["info", "error"] as const satisfies LogLevel[];
type LogType = (typeof LOG_TYPES)[number];
type AutoUpdateStateValue =
  (typeof AUTOUPDATE_STATE)[keyof typeof AUTOUPDATE_STATE];

const useLogRefsMap = () => {
  const refs = Object.fromEntries(
    LOG_TYPES.map((type) => [type, useRef<LazyLog | null>(null)]),
  ) as Record<LogType, React.RefObject<LazyLog>>;

  return refs;
};

export const LogPanel = () => {
  const [logType, setLogType] = useState<LogType>("info");
  const [autoUpdate, setAutoUpdate] = useState<AutoUpdateStateValue>(
    AUTOUPDATE_STATE.ON,
  );
  const logsRef = useLogRefsMap();
  const unsubscribeRef = useRef<() => void>(() => {});

  const handleGetLog = (log: string, level: LogType) => {
    logsRef[level].current.appendLines([log]);
  };

  const handleLogTypeChange = (newType: LogType) => {
    setLogType(newType);
  };

  const handleAutoUpdateChange = (newValue: AutoUpdateStateValue) => {
    setAutoUpdate(newValue);
  };

  const handleClearLog = () => {
    logsRef[logType].current.clear();
  };

  useEffect(() => {
    if (autoUpdate === "on") {
      unsubscribeRef.current = window.api.on("getLog", handleGetLog);
    } else {
      unsubscribeRef.current();
    }
    return () => unsubscribeRef.current();
  }, [autoUpdate]);

  return (
    <Grid container spacing={2}>
      <Grid size={9.5}>
        {LOG_TYPES.map((type) => (
          <Box key={type} sx={{ display: logType === type ? "block" : "none" }}>
            <LazyLog
              caseInsensitive
              enableSearch
              extraLines={1}
              height={200}
              selectableLines
              follow
              ref={logsRef[type]}
              external
              enableLinks
            />
          </Box>
        ))}
      </Grid>
      <Grid size={2.5}>
        <Stack
          direction="column"
          spacing={0}
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CustomToggleButton
            label="Log Type"
            value={logType}
            options={LOG_TYPES}
            onChange={handleLogTypeChange}
          />
          <CustomToggleButton
            label="Auto Update"
            value={autoUpdate}
            options={Object.values(AUTOUPDATE_STATE)}
            onChange={handleAutoUpdateChange}
          />
          <Button
            variant="outlined"
            color="error"
            onClick={handleClearLog}
            fullWidth
          >
            Clear Log
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};
