import {
  TextField,
  Grid,
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
} from "@mui/material";
import { object, string, number } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import type { UploadForm } from "@shared-types/form";
import { Info, Pause, PlayArrow } from "@mui/icons-material";

const formSchema = object({
  inputFolder: string().refine(
    async (folderPath) => {
      const isValid = await window.api.invoke("validateFolder", { folderPath });
      return isValid;
    },
    { message: "Invalid folder path" },
  ),
  secretFile: string().refine(
    async (filePath) => {
      const isValid = await window.api.invoke("validateJsonFile", { filePath });
      return isValid;
    },
    { message: "Invalid file path" },
  ),
  numberUpload: number().min(1).max(6),
});

type UploadFormFieldProps = {
  autoSave: boolean;
  clearForm: boolean;
  handleClearForm: (fn: () => void) => void;
  isUploading: boolean;
  onStartUpload: (data: UploadForm) => void;
  onStopUpload: () => void;
};

const initialDefaults: UploadForm = {
  secretFile: "",
  inputFolder: "",
  numberUpload: 1,
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
  autoSave,
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
  } = useForm<UploadForm>({
    reValidateMode: "onBlur",
    mode: "onBlur",
    defaultValues: initialDefaults,
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<UploadForm> = async (data) => {
    if (isUploading) {
      onStopUpload();
      return;
    }
    onStartUpload(data);
  };

  const handleSelectFolder: ButtonProps["onClick"] = async () => {
    const selectedFolder = await window.api.invoke("selectFolder");
    if (selectedFolder) {
      setValue("inputFolder", selectedFolder, {
        shouldValidate: true,
      });
    }
  };

  const handleSecretFile: ButtonProps["onClick"] = async () => {
    const selectedFile = await window.api.invoke("selectJsonFile");
    if (selectedFile) {
      setValue("secretFile", selectedFile, {
        shouldValidate: true,
      });
    }
  };

  const inputFolderErrorMessage = errors.inputFolder?.message;
  const numberUploadErrorMessage = errors.numberUpload?.message;
  const secretFileErrorMessage = errors.secretFile?.message;

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      const savedFormState = await window.api.invoke("getUploadForm");
      if (!savedFormState) return;

      const setIfDefined = (field: keyof UploadForm, value: any) => {
        if (value !== undefined && value !== null && value !== "") {
          setValue(field, value);
        }
      };

      setIfDefined("inputFolder", savedFormState.inputFolder);
      setIfDefined("numberUpload", savedFormState.numberUpload);
      setIfDefined("secretFile", savedFormState.secretFile);
    };

    fetchData();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    handleClearForm(reset);
  }, [clearForm]);

  useEffect(() => {
    if (autoSave) {
      const { inputFolder, numberUpload, secretFile } = getValues();
      window.api.send("form:upload:save", {
        numberUpload,
        inputFolder,
        secretFile,
      });
    }
  }, [autoSave]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={4}>
        <Grid size={9}>
          <Grid container spacing={3}>
            <Grid size={11}>
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
            </Grid>
            <Grid
              size={1}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <HtmlTooltip
                placement="top"
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
            </Grid>
            <Grid size={9}>
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
            </Grid>
            <Grid size={3} alignSelf="center">
              <Button
                disabled={isUploading}
                fullWidth
                variant="contained"
                onClick={handleSelectFolder}
              >
                Browse
              </Button>
            </Grid>
            <Grid size={9}>
              <Controller
                name="secretFile"
                control={control}
                render={({ field }) => (
                  <TextField
                    error={Boolean(secretFileErrorMessage)}
                    helperText={secretFileErrorMessage || " "}
                    variant="standard"
                    fullWidth
                    required
                    label="Secret File"
                    slotProps={{
                      input: {
                        readOnly: isUploading,
                      },
                    }}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid size={3} alignSelf="center">
              <Button
                disabled={isUploading}
                fullWidth
                variant="contained"
                onClick={handleSecretFile}
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
        </Grid>
      </Grid>
    </form>
  );
};
