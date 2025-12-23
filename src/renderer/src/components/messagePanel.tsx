import { LazyLog } from "@melloware/react-logviewer";
import { Grid, Stack, Box, Button } from "@mui/material";
import { useEffect, useRef, useState, type RefObject } from "react";
import { CustomToggleButton } from "./customToggleButton";

const AUTOUPDATE_STATE = {
  ON: "on",
  OFF: "off",
} as const;
const MESSAGE_TYPES = ["capture", "upload"] as const;
type MessageType = (typeof MESSAGE_TYPES)[number];
type AutoUpdateStateValue =
  (typeof AUTOUPDATE_STATE)[keyof typeof AUTOUPDATE_STATE];

const useMessageRefsMap = () => {
  const refs = Object.fromEntries(
    MESSAGE_TYPES.map((type) => [type, useRef<LazyLog | null>(null)]),
  ) as Record<MessageType, RefObject<LazyLog>>;

  return refs;
};

export const MessagePanel = () => {
  const [messageType, setMessageType] = useState<MessageType>("capture");
  const [autoUpdate, setAutoUpdate] = useState<AutoUpdateStateValue>(
    AUTOUPDATE_STATE.ON,
  );
  const messageRef = useMessageRefsMap();
  const captureUnsubscribeRef = useRef<() => void>(() => {});
  const uploadUnsubscribeRef = useRef<() => void>(() => {});

  const handleMessageTypeChange = (newType: MessageType) => {
    setMessageType(newType);
  };

  const handleAutoUpdateChange = (newValue: AutoUpdateStateValue) => {
    setAutoUpdate(newValue);
  };

  const handleClearMessages = () => {
    messageRef[messageType].current.clear();
  };

  useEffect(() => {
    if (autoUpdate === "on") {
      uploadUnsubscribeRef.current = window.api.on(
        "upload:message",
        ({ message }) => {
          messageRef["upload"].current.appendLines([message]);
        },
      );
      captureUnsubscribeRef.current = window.api.on(
        "capture:message",
        ({ message }) => {
          messageRef["capture"].current.appendLines([message]);
        },
      );
    } else {
      uploadUnsubscribeRef.current();
      captureUnsubscribeRef.current();
    }
    return () => {
      uploadUnsubscribeRef.current();
      captureUnsubscribeRef.current();
    };
  }, [autoUpdate]);

  return (
    <Grid container spacing={2}>
      <Grid size={9.5}>
        {MESSAGE_TYPES.map((type) => (
          <Box
            key={type}
            sx={{ display: messageType === type ? "block" : "none" }}
          >
            <LazyLog
              caseInsensitive
              enableSearch
              extraLines={1}
              height={200}
              selectableLines
              follow
              ref={messageRef[type]}
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
            value={messageType}
            options={MESSAGE_TYPES}
            onChange={handleMessageTypeChange}
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
            onClick={handleClearMessages}
            fullWidth
          >
            Clear
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};
