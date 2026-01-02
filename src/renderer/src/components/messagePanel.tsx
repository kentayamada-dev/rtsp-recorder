import { LazyLog } from "@melloware/react-logviewer";
import { Grid, Stack, Box, Button } from "@mui/material";
import { useEffect, useRef, useState, type RefObject } from "react";
import { CustomToggleButtonField } from "./customToggleButtonField";
import { formatTimestamp } from "@renderer/utils";
import { useLocale } from "@renderer/i18n";

export const MessagePanel = () => {
  const { t } = useLocale();
  const autoUpdateState = {
    on: t("messagePanel.autoUpdate.on"),
    off: t("messagePanel.autoUpdate.off"),
  } as const;

  const messageTypes = {
    capture: t("messagePanel.messageTypes.capture"),
    upload: t("messagePanel.messageTypes.upload"),
  } as const;

  const [messageType, setMessageType] = useState<string>(messageTypes.capture);
  const [autoUpdate, setAutoUpdate] = useState<string>(autoUpdateState.on);
  const useMessageRefsMap = (): Record<string, RefObject<LazyLog | null>> => {
    return {
      [messageTypes.capture]: useRef<LazyLog>(null),
      [messageTypes.upload]: useRef<LazyLog>(null),
    };
  };

  const messageRef = useMessageRefsMap();
  const captureUnsubscribeRef = useRef<() => void>(() => {});
  const uploadUnsubscribeRef = useRef<() => void>(() => {});

  const handleMessageTypeChange = (newType: string) => {
    setMessageType(newType);
  };

  const handleAutoUpdateChange = (newValue: string) => {
    setAutoUpdate(newValue);
  };

  const handleClearMessages = () => {
    messageRef[messageType]?.current?.clear();
  };

  useEffect(() => {
    if (autoUpdate === autoUpdateState.on) {
      uploadUnsubscribeRef.current = window.api.on(
        "upload:message",
        ({ message }) => {
          const timestampedMessage = `[${formatTimestamp()}] ${message}`;
          messageRef[messageTypes.upload]?.current?.appendLines([
            timestampedMessage,
          ]);
        },
      );
      captureUnsubscribeRef.current = window.api.on(
        "capture:message",
        ({ message }) => {
          const timestampedMessage = `[${formatTimestamp()}] ${message}`;
          messageRef[messageTypes.capture]?.current?.appendLines([
            timestampedMessage,
          ]);
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
      <Grid size={9}>
        {Object.values(messageTypes).map((type) => {
          return (
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
          );
        })}
      </Grid>
      <Grid size={3}>
        <Stack
          direction="column"
          spacing={0}
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CustomToggleButtonField
            label={t("messagePanel.messageTypes.title")}
            value={messageType}
            options={Object.values(messageTypes)}
            onChange={handleMessageTypeChange}
          />
          <CustomToggleButtonField
            label={t("messagePanel.autoUpdate.title")}
            value={autoUpdate}
            options={Object.values(autoUpdateState)}
            onChange={handleAutoUpdateChange}
          />
          <Button
            variant="outlined"
            color="error"
            onClick={handleClearMessages}
            fullWidth
          >
            {t("messagePanel.clear")}
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};
