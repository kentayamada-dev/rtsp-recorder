import {
  TextField,
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { boolean, object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useState } from "react";

type FormValues = {
  rtspUrl: string;
  outputFolder: string;
  captureInterval: string;
  autoUpload: boolean;
  uploadInterval: string;
};

const formSchema = object({
  rtspUrl: string()
    .required("RTSP URL is required")
    .matches(/^rtsp:\/\/.+[a-zA-Z0-9/]$/, "Must be a valid RTSP URL"),
  outputFolder: string()
    .required("Output folder is required")
    .test("valid-folder", "Invalid folder path", async (folderPath) => {
      if (!folderPath) return false;
      const isValid = await window.api.invoke("validateFolder", folderPath);
      return isValid;
    }),
  captureInterval: string()
    .required("Capture interval is required")
    .matches(/^[1-9]\d*$/, "Capture interval must be a positive whole number"),
  autoUpload: boolean().required("Auto upload is required"),
  uploadInterval: string()
    .required("Upload interval is required")
    .matches(/^[1-9]\d*$/, "Upload interval must be a positive whole number"),
});

export const RecordForm = () => {
  const [isRecording, setIsRecording] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    reValidateMode: "onBlur",
    mode: "onBlur",
    defaultValues: {
      autoUpload: true,
      captureInterval: "",
      rtspUrl: "",
      outputFolder: "",
      uploadInterval: "",
    },
    resolver: yupResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (isRecording) {
      await window.api.invoke("stopCapture");
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const captureInterval = parseInt(data.captureInterval, 10);
    await window.api.invoke(
      "startCapture",
      data.rtspUrl,
      data.outputFolder,
      captureInterval,
    );
  };

  const handleSelectFolder = async () => {
    try {
      const selectedFolder = await window.api.invoke("selectFolder");
      setValue("outputFolder", selectedFolder, {
        shouldValidate: true,
      });
    } catch (error) {}
  };

  const rtspUrlErrorMessage = errors.rtspUrl?.message;
  const captureIntervalErrorMessage = errors.captureInterval?.message;
  const outputFolderErrorMessage = errors.outputFolder?.message;
  const uploadIntervalErrorMessage = errors.uploadInterval?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={4}>
        <Grid size={9}>
          <Grid container spacing={2}>
            <Grid size={8}>
              <Controller
                name="rtspUrl"
                control={control}
                render={({ field }) => (
                  <TextField
                    variant="standard"
                    placeholder="rtsp://localhost:554/stream"
                    error={Boolean(rtspUrlErrorMessage)}
                    helperText={rtspUrlErrorMessage || " "}
                    label="URL"
                    fullWidth
                    slotProps={{
                      input: {
                        readOnly: isRecording,
                      },
                    }}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid size={4}>
              <Controller
                name="captureInterval"
                control={control}
                render={({ field }) => (
                  <TextField
                    error={Boolean(captureIntervalErrorMessage)}
                    helperText={captureIntervalErrorMessage || " "}
                    variant="standard"
                    label="Capture Interval (sec)"
                    placeholder="60"
                    fullWidth
                    slotProps={{
                      input: {
                        readOnly: isRecording,
                      },
                    }}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid size={9}>
              <Controller
                name="outputFolder"
                control={control}
                render={({ field }) => (
                  <TextField
                    error={Boolean(outputFolderErrorMessage)}
                    helperText={outputFolderErrorMessage || " "}
                    placeholder="C:\\Users\\Documents"
                    variant="standard"
                    fullWidth
                    label="Output Folder"
                    slotProps={{
                      input: {
                        readOnly: isRecording,
                      },
                    }}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid size={3} alignSelf="center">
              <Button
                disabled={isRecording}
                fullWidth
                variant="contained"
                onClick={handleSelectFolder}
              >
                Browse
              </Button>
            </Grid>
            <Grid size={8}>
              <Controller
                name="uploadInterval"
                control={control}
                render={({ field }) => (
                  <TextField
                    error={Boolean(uploadIntervalErrorMessage)}
                    helperText={uploadIntervalErrorMessage || " "}
                    variant="standard"
                    label="Upload Interval (h)"
                    placeholder="24"
                    fullWidth
                    slotProps={{
                      input: {
                        readOnly: isRecording,
                      },
                    }}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid
              size={4}
              sx={{
                display: "flex",
                justifyContent: "end",
                alignItems: "center",
              }}
            >
              <Controller
                control={control}
                name="autoUpload"
                render={({ field: { onChange, value } }) => (
                  <FormControlLabel
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        fontSize: "1.2rem",
                      },
                    }}
                    control={
                      <Checkbox
                        size="large"
                        checked={value}
                        onChange={onChange}
                        disabled={isRecording}
                      />
                    }
                    label="Auto Upload"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid
          size={3}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            sx={{ borderRadius: "50%", minWidth: "130px", minHeight: "130px" }}
            type="submit"
            variant="contained"
            color={isRecording ? "error" : "success"}
          >
            {isRecording ? "Stop" : "Record"}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
