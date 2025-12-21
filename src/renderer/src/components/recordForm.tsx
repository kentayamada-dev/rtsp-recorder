import {
  TextField,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type ButtonProps,
  FormHelperText,
} from "@mui/material";
import { object, union, string, literal } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import type { FormValues } from "@shared-types/form";

const formSchema = object({
  rtspUrl: string().regex(
    /^rtsp:\/\/.+[a-zA-Z0-9/]$/,
    "Must be a valid RTSP URL",
  ),
  outputFolder: string()
    .min(1, "Output folder is required")
    .refine(
      async (folderPath) => {
        const isValid = await window.api.invoke("validateFolder", folderPath);
        return isValid;
      },
      { message: "Invalid folder path" },
    ),
  captureInterval: string().regex(
    /^[1-9]\d*$/,
    "Must be a positive whole number",
  ),
  autoUpload: union([literal("yes"), literal("no")]),
  uploadInterval: string().regex(
    /^[1-9]\d*$/,
    "Must be a positive whole number",
  ),
});

type RecordFormProps = {
  saveSetting: boolean;
};

export const RecordForm = ({ saveSetting }: RecordFormProps) => {
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
      autoUpload: "yes",
      captureInterval: "",
      rtspUrl: "",
      outputFolder: "",
      uploadInterval: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (isRecording) {
      window.api.send("stopCapture");

      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const captureInterval = parseInt(data.captureInterval, 10);
    const uploadInterval = parseInt(data.uploadInterval, 10);
    const { rtspUrl, outputFolder, autoUpload } = data;

    window.api.send("startCapture", rtspUrl, outputFolder, captureInterval);

    if (saveSetting) {
      window.api.send("saveForm", {
        autoUpload,
        captureInterval,
        outputFolder,
        rtspUrl,
        uploadInterval,
      });
    }
  };

  const handleSelectFolder: ButtonProps["onClick"] = async () => {
    const selectedFolder = await window.api.invoke("selectFolder");
    if (selectedFolder) {
      setValue("outputFolder", selectedFolder, {
        shouldValidate: true,
      });
    }
  };

  const rtspUrlErrorMessage = errors.rtspUrl?.message;
  const captureIntervalErrorMessage = errors.captureInterval?.message;
  const outputFolderErrorMessage = errors.outputFolder?.message;
  const uploadIntervalErrorMessage = errors.uploadInterval?.message;
  const autoUploadErrorMessage = errors.autoUpload?.message;

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      const savedFormState = await window.api.invoke("getForm");
      if (!savedFormState) return;

      const setIfDefined = (field: keyof FormValues, value: any) => {
        if (value !== undefined && value !== null && value !== "") {
          setValue(field, value);
        }
      };

      setIfDefined("rtspUrl", savedFormState.rtspUrl);
      setIfDefined("outputFolder", savedFormState.outputFolder);
      setIfDefined(
        "captureInterval",
        savedFormState.captureInterval?.toString(),
      );
      setIfDefined("uploadInterval", savedFormState.uploadInterval?.toString());
      setIfDefined("autoUpload", savedFormState.autoUpload);
    };

    fetchData();

    return () => controller.abort();
  }, []);

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
                    required
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
                    required
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
                    required
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
                    required
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
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    variant="standard"
                    error={Boolean(autoUploadErrorMessage)}
                  >
                    <InputLabel id="demo-simple-select-error-label">
                      Auto Upload
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-error-label"
                      label="Auto Upload"
                      inputProps={{ readOnly: isRecording }}
                      {...field}
                    >
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                    </Select>
                    <FormHelperText>
                      {autoUploadErrorMessage || " "}
                    </FormHelperText>
                  </FormControl>
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
