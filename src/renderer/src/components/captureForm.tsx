import {
  TextField,
  Grid,
  Button,
  type ButtonProps,
  IconButton,
} from "@mui/material";
import { object, string } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import { PlayArrow, Pause } from "@mui/icons-material";
import type { CaptureFormValues } from "@shared-types/form";

const formSchema = object({
  rtspUrl: string().regex(
    /^rtsp:\/\/.+[a-zA-Z0-9/]$/,
    "Must be a valid RTSP URL",
  ),
  outputFolder: string().refine(
    async (folderPath) => {
      const isValid = await window.api.invoke("validateFolder", { folderPath });
      return isValid;
    },
    { message: "Invalid folder path" },
  ),
  interval: string().regex(/^[1-9]\d*$/, "Must be a positive whole number"),
});

type CaptureFormProps = {
  autoSave: boolean;
  clearForm: boolean;
  handleClearForm: (fn: () => void) => void;
  isCapturing: boolean;
  onStartCapture: (data: CaptureFormValues) => void;
  onStopCapture: () => void;
};

const initialDefaults: CaptureFormValues = {
  interval: "60",
  rtspUrl: "",
  outputFolder: "",
};

export const CaptureForm = ({
  autoSave,
  clearForm,
  handleClearForm,
  isCapturing,
  onStartCapture,
  onStopCapture,
}: CaptureFormProps) => {
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<CaptureFormValues>({
    reValidateMode: "onBlur",
    mode: "onBlur",
    defaultValues: initialDefaults,
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<CaptureFormValues> = async (data) => {
    if (isCapturing) {
      onStopCapture();
      return;
    }
    onStartCapture(data);
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
  const intervalErrorMessage = errors.interval?.message;
  const outputFolderErrorMessage = errors.outputFolder?.message;

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      const savedFormState = await window.api.invoke("getCaptureForm");
      if (!savedFormState) return;

      const setIfDefined = (field: keyof CaptureFormValues, value: any) => {
        if (value !== undefined && value !== null && value !== "") {
          setValue(field, value);
        }
      };

      setIfDefined("rtspUrl", savedFormState.rtspUrl);
      setIfDefined("outputFolder", savedFormState.outputFolder);
      setIfDefined("interval", savedFormState.interval?.toString());
    };

    fetchData();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    handleClearForm(reset);
  }, [clearForm]);

  useEffect(() => {
    if (autoSave) {
      const { interval, outputFolder, rtspUrl } = getValues();
      window.api.send("form:capture:save", {
        interval: interval
          ? Number(interval)
          : Number(initialDefaults.interval),
        outputFolder,
        rtspUrl,
      });
    }
  }, [autoSave]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={4}>
        <Grid size={9}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Controller
                name="rtspUrl"
                control={control}
                render={({ field }) => (
                  <TextField
                    variant="standard"
                    error={Boolean(rtspUrlErrorMessage)}
                    helperText={rtspUrlErrorMessage || " "}
                    label="URL"
                    fullWidth
                    required
                    slotProps={{
                      input: {
                        readOnly: isCapturing,
                      },
                    }}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="interval"
                control={control}
                render={({ field }) => (
                  <TextField
                    error={Boolean(intervalErrorMessage)}
                    helperText={intervalErrorMessage || " "}
                    variant="standard"
                    label="Capture Interval (sec)"
                    fullWidth
                    required
                    slotProps={{
                      input: {
                        readOnly: isCapturing,
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
                    variant="standard"
                    fullWidth
                    required
                    label="Output Folder"
                    slotProps={{
                      input: {
                        readOnly: isCapturing,
                      },
                    }}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid size={3} alignSelf="center">
              <Button
                disabled={isCapturing}
                fullWidth
                variant="contained"
                onClick={handleSelectFolder}
              >
                Browse
              </Button>
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
          <IconButton
            color="primary"
            type="submit"
            sx={{
              width: "130px",
              height: "130px",
            }}
          >
            {isCapturing ? (
              <Pause
                sx={{
                  width: "inherit",
                  height: "inherit",
                }}
              />
            ) : (
              <PlayArrow
                sx={{
                  width: "inherit",
                  height: "inherit",
                }}
              />
            )}
          </IconButton>
        </Grid>
      </Grid>
    </form>
  );
};
