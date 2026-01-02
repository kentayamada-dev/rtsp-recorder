import { Box, Stack, CircularProgress, Typography } from "@mui/material";
import { Autorenew, Pause } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useLocale } from "@renderer/i18n";

const CircularProgressWithLabel = ({ value }: { value: number }) => {
  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        width: "100%",
        height: "100%",
      }}
    >
      <CircularProgress
        variant="determinate"
        value={value}
        sx={{
          width: "100% !important",
          height: "100% !important",
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ color: "text.secondary", fontSize: "15px" }}
        >{`${Math.round(value)}%`}</Typography>
      </Box>
    </Box>
  );
};

type StatusPanelProps = {
  isCapturing: boolean;
  isUploading: boolean;
};

export const StatusPanel = ({ isCapturing, isUploading }: StatusPanelProps) => {
  const [captureProgress, setCaptureProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { t } = useLocale();

  useEffect(() => {
    const captureProgressUnsubscribe = window.api.on(
      "capture:progress",
      ({ progress }) => {
        setCaptureProgress(progress);
      },
    );

    const uploadProgressUnsubscribe = window.api.on(
      "upload:progress",
      ({ progress }) => {
        setUploadProgress(progress);
      },
    );

    return () => {
      captureProgressUnsubscribe();
      uploadProgressUnsubscribe();
    };
  }, []);

  return (
    <Stack
      sx={{
        height: "100%",
        justifyContent: "space-around",
      }}
    >
      <Stack
        direction="row"
        sx={{
          width: "100%",
          justifyContent: "space-around",
        }}
      >
        <Stack
          direction="row"
          sx={{
            width: "300px",
          }}
        >
          <Box
            sx={{
              height: "80px",
              width: "80px",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}
          >
            {isCapturing ? (
              <Autorenew
                color="primary"
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            ) : (
              <Pause
                color="primary"
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            )}
          </Box>
          <Typography
            variant="h6"
            sx={{
              alignSelf: "center",
            }}
          >
            {t("statusPanel.autoCapture")}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          sx={{
            width: "300px",
          }}
        >
          <Box
            sx={{
              height: "80px",
              width: "80px",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}
          >
            {captureProgress === 0 || captureProgress === 100 ? (
              <Pause
                color="primary"
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "80%",
                  height: "80%",
                }}
              >
                <CircularProgressWithLabel value={captureProgress} />
              </Box>
            )}
          </Box>
          <Typography
            variant="h6"
            sx={{
              alignSelf: "center",
            }}
          >
            {t("statusPanel.createVideo")}
          </Typography>
        </Stack>
      </Stack>
      <Stack
        direction="row"
        sx={{
          width: "100%",
          justifyContent: "space-around",
        }}
      >
        <Stack
          direction="row"
          sx={{
            width: "300px",
          }}
        >
          <Box
            sx={{
              height: "80px",
              width: "80px",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}
          >
            {isUploading ? (
              <Autorenew
                color="primary"
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            ) : (
              <Pause
                color="primary"
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            )}
          </Box>
          <Typography
            variant="h6"
            sx={{
              alignSelf: "center",
            }}
          >
            {t("statusPanel.autoUpload")}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          sx={{
            width: "300px",
          }}
        >
          <Box
            sx={{
              height: "80px",
              width: "80px",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}
          >
            {uploadProgress === 0 || uploadProgress === 100 ? (
              <Pause
                color="primary"
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "80%",
                  height: "80%",
                }}
              >
                <CircularProgressWithLabel value={uploadProgress} />
              </Box>
            )}
          </Box>
          <Typography
            variant="h6"
            sx={{
              alignSelf: "center",
            }}
          >
            {t("statusPanel.uploadYouYube")}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
