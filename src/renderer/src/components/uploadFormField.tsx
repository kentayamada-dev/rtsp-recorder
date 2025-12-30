import {
  TextField,
  Button,
  type ButtonProps,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  FormHelperText,
  Tooltip,
  styled,
  tooltipClasses,
  type TooltipProps,
  Box,
  Stack,
} from "@mui/material";
import { string, number, strictObject, type ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import { Info, Pause, PlayArrow } from "@mui/icons-material";
import type { FormStore } from "@shared-types/form";
import { onValid } from "@renderer/utils";
import { CustomNumberField } from "./customNumberField";

const StyledForm = styled("form")(() => ({
  height: "100%",
}));

type FormSchema = FormStore["uploadForm"];

type UploadFormFieldProps = {
  clearForm: boolean;
  handleClearForm: (fn: () => void) => void;
  isUploading: boolean;
  onStartUpload: (data: FormSchema) => void;
  onStopUpload: () => void;
};

const formSchema = strictObject({
  inputFolder: string().refine(
    async (folderPath) => {
      const isValid = await window.api.invoke("validatePath", {
        path: folderPath,
        type: "folder",
      });
      return isValid;
    },
    { message: "Invalid folder path" },
  ),
  numberUpload: number().min(1).max(6),
  fps: number().min(1),
}) satisfies ZodType<FormSchema>;

const initialDefaults: FormSchema = {
  inputFolder: "",
  numberUpload: 1,
  fps: 1,
};

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip
    {...props}
    {...(className ? { classes: { popper: className } } : {})}
  />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#23272e",
    border: "1px solid rgba(255, 255, 255, 0.12)",
  },
}));

export const UploadFormField = ({
  clearForm,
  handleClearForm,
  isUploading,
  onStartUpload,
  onStopUpload,
}: UploadFormFieldProps) => {
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
    if (isUploading) {
      onStopUpload();
      return;
    }
    onStartUpload(data);
  };

  const handleSelectFolder: ButtonProps["onClick"] = async () => {
    const selectedFolder = await window.api.invoke("selectDialog", {
      type: "folder",
    });
    if (selectedFolder) {
      setValue("inputFolder", selectedFolder, {
        shouldValidate: true,
      });
    }
  };

  const inputFolderErrorMessage = errors.inputFolder?.message;
  const numberUploadErrorMessage = errors.numberUpload?.message;
  const fpsErrorMessage = errors.fps?.message;

  useEffect(() => {
    const fetchData = async () => {
      const savedFormState = await window.api.invoke("getUploadForm");
      if (!savedFormState) return;

      onValid(savedFormState.inputFolder, (val) =>
        setValue("inputFolder", val),
      );
      onValid(savedFormState.numberUpload, (val) =>
        setValue("numberUpload", val),
      );
      onValid(savedFormState.fps, (val) => setValue("fps", val));
    };

    fetchData();
  }, []);

  useEffect(() => {
    handleClearForm(reset);
  }, [clearForm]);

  useEffect(() => {
    const { inputFolder, numberUpload, fps } = getValues();
    window.api.send("form:upload", {
      numberUpload,
      inputFolder,
      fps,
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
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: "90%",
                }}
              >
                <Controller
                  control={control}
                  name="numberUpload"
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      required
                      variant="standard"
                      error={Boolean(numberUploadErrorMessage)}
                    >
                      <InputLabel id="numberUpload-label">
                        Upload Times
                      </InputLabel>
                      <Select
                        labelId="numberUpload-label"
                        label="Upload Times"
                        inputProps={{ readOnly: isUploading }}
                        {...field}
                      >
                        {Array.from({ length: 6 }, (_, i) => (
                          <MenuItem key={i + 1} value={i + 1}>
                            {i + 1}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {numberUploadErrorMessage || " "}
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              </Box>
              <Box
                sx={{
                  width: "10%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <HtmlTooltip
                  title={
                    <>
                      <ul
                        style={{ margin: 0, paddingLeft: 10, paddingRight: 10 }}
                      >
                        <li>1 = Daily at midnight</li>
                        <li>2 = Twice daily (midnight, noon)</li>
                        <li>3 = Every 8 hours</li>
                        <li>4 = Every 6 hours</li>
                        <li>5 = Every 5 hours</li>
                        <li>6 = Every 4 hours</li>
                      </ul>
                    </>
                  }
                >
                  <Info />
                </HtmlTooltip>
              </Box>
            </Stack>
            <Controller
              name="fps"
              control={control}
              render={({ field }) => (
                <CustomNumberField
                  label="FPS"
                  readOnly={isUploading}
                  onValueChange={(v) =>
                    field.onChange(
                      typeof v === "number" && v >= 1 ? v : initialDefaults.fps,
                    )
                  }
                  error={Boolean(fpsErrorMessage)}
                  helperText={fpsErrorMessage || " "}
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
                  name="inputFolder"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      error={Boolean(inputFolderErrorMessage)}
                      helperText={inputFolderErrorMessage || " "}
                      variant="standard"
                      fullWidth
                      required
                      label="Input Folder"
                      slotProps={{
                        input: {
                          readOnly: isUploading,
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
                  disabled={isUploading}
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
            {isUploading ? (
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
