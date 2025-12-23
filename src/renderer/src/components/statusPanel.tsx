import { Box, Grid, Stack, CircularProgress, Typography } from "@mui/material";
import { Autorenew, Pause } from "@mui/icons-material";
import { useEffect, useState } from "react";

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
          sx={{ color: "text.secondary", fontSize: "20px" }}
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
    <Grid container spacing={7}>
      <Grid size={6}>
        <Stack direction="row" spacing={1}>
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
            Auto Capture
          </Typography>
        </Stack>
      </Grid>
      <Grid size={6}>
        <Stack direction="row" spacing={1}>
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
              <CircularProgressWithLabel value={captureProgress} />
            )}
          </Box>
          <Typography
            variant="h6"
            sx={{
              alignSelf: "center",
            }}
          >
            Create Video
          </Typography>
        </Stack>
      </Grid>
      <Grid size={6}>
        <Stack direction="row" spacing={1}>
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
            Auto Upload
          </Typography>
        </Stack>
      </Grid>
      <Grid size={6}>
        <Stack direction="row" spacing={1}>
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
              <CircularProgressWithLabel value={uploadProgress} />
            )}
          </Box>
          <Typography
            variant="h6"
            sx={{
              alignSelf: "center",
            }}
          >
            Upload YouYube
          </Typography>
        </Stack>
      </Grid>
    </Grid>
  );
};
