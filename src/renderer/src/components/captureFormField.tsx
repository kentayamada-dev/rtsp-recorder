import {
  TextField,
  Button,
  type ButtonProps,
  IconButton,
  styled,
  Stack,
  Box,
} from "@mui/material";
import { string, number, strictObject, type ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import { PlayArrow, Pause } from "@mui/icons-material";
import { CustomNumberField } from "./customNumberField";
import type { FormStore } from "@shared-types/form";
import { onValid } from "@renderer/utils";

const StyledForm = styled("form")(() => ({
  height: "100%",
}));

type FormSchema = FormStore["captureForm"];

type CaptureFormFieldProps = {
  clearForm: boolean;
  handleClearForm: (fn: () => void) => void;
  isCapturing: boolean;
  onStartCapture: (data: FormSchema) => void;
  onStopCapture: () => void;
};

const formSchema = strictObject({
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
}) satisfies ZodType<FormSchema>;

const initialDefaults: FormSchema = {
  interval: 60,
  rtspUrl: "",
  outputFolder: "",
};

export const CaptureFormField = ({
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
  } = useForm<FormSchema>({
    reValidateMode: "onBlur",
    mode: "onBlur",
    defaultValues: initialDefaults,
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
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
    const fetchData = async () => {
      const savedFormState = await window.api.invoke("getCaptureForm");
      if (!savedFormState) return;

      onValid(savedFormState.rtspUrl, (val) => setValue("rtspUrl", val));
      onValid(savedFormState.outputFolder, (val) =>
        setValue("outputFolder", val),
      );
      onValid(savedFormState.interval, (val) => setValue("interval", val));
    };

    fetchData();
  }, []);

  useEffect(() => {
    handleClearForm(reset);
  }, [clearForm]);

  useEffect(() => {
    const { interval, outputFolder, rtspUrl } = getValues();
    window.api.send("form:capture", {
      interval,
      outputFolder,
      rtspUrl,
    });
  }, []);

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <Stack
        direction="row"
        sx={{
          height: "100%",
        }}
      >
        <Box
          sx={{
            width: "70%",
          }}
        >
          <Stack
            sx={{
              height: "100%",
              justifyContent: "space-between",
            }}
          >
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
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
              }}
              spacing={2}
            >
              <Box
                sx={{
                  width: "80%",
                }}
              >
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
              </Box>
              <Box
                sx={{
                  width: "20%",
                }}
              >
                <Button
                  disabled={isCapturing}
                  fullWidth
                  variant="contained"
                  onClick={handleSelectFolder}
                >
                  Browse
                </Button>
              </Box>
            </Stack>
          </Stack>
        </Box>
        <Box
          sx={{
            width: "30%",
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
        </Box>
      </Stack>
    </StyledForm>
  );
};
