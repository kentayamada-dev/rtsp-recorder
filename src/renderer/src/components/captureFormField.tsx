import {
  TextField,
  Grid,
  Button,
  type ButtonProps,
  IconButton,
} from "@mui/material";
import { object, string, number } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import { PlayArrow, Pause } from "@mui/icons-material";
import type { CaptureForm } from "@shared-types/form";
import { CustomNumberField } from "./customNumberField";

const formSchema = object({
  rtspUrl: string().regex(/^rtsp:\/\/.+[a-zA-Z0-9/]$/, "Invalid RTSP URL"),
  outputFolder: string().refine(
    async (folderPath) => {
      const isValid = await window.api.invoke("validatePath", {
        path: folderPath,
        type: "folder",
      });
      return isValid;
    },
    { message: "Invalid folder path" },
  ),
  interval: number().min(1, { message: "Interval must be at least 1" }),
});

type CaptureFormFieldProps = {
  autoSave: boolean;
  clearForm: boolean;
  handleClearForm: (fn: () => void) => void;
  isCapturing: boolean;
  onStartCapture: (data: CaptureForm) => void;
  onStopCapture: () => void;
};

const initialDefaults: CaptureForm = {
  interval: 60,
  rtspUrl: "",
  outputFolder: "",
};

export const CaptureFormField = ({
  autoSave,
  clearForm,
  handleClearForm,
  isCapturing,
  onStartCapture,
  onStopCapture,
}: CaptureFormFieldProps) => {
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<CaptureForm>({
    reValidateMode: "onBlur",
    mode: "onBlur",
    defaultValues: initialDefaults,
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<CaptureForm> = async (data) => {
    if (isCapturing) {
      onStopCapture();
      return;
    }
    onStartCapture(data);
  };

  const handleSelectFolder: ButtonProps["onClick"] = async () => {
    const selectedFolder = await window.api.invoke("selectDialog", {
      type: "folder",
    });
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

      const setIfDefined = (field: keyof CaptureForm, value: any) => {
        if (value !== undefined && value !== null && value !== "") {
          setValue(field, value);
        }
      };

      setIfDefined("rtspUrl", savedFormState.rtspUrl);
      setIfDefined("outputFolder", savedFormState.outputFolder);
      setIfDefined("interval", savedFormState.interval);
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
        interval,
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
                  <CustomNumberField
                    label="Interval (seconds)"
                    readOnly={isCapturing}
                    onValueChange={(v) =>
                      field.onChange(
                        typeof v === "number" && v >= 1
                          ? v
                          : initialDefaults.interval,
                      )
                    }
                    error={Boolean(intervalErrorMessage)}
                    helperText={intervalErrorMessage || " "}
                    required
                    min={1}
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
