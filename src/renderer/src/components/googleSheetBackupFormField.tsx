import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Stack,
  styled,
  Switch,
  TextField,
  Typography,
  type SwitchProps,
} from "@mui/material";
import { onValid } from "@renderer/utils";
import type { GoogleStore } from "@shared-types/form";
import { useEffect } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { strictObject, string, type ZodType } from "zod";

type FormSchema = GoogleStore["sheet"]["values"];

export type GoogleSheetBackupFormFieldProps = {
  handleSaveGoogleSheetData: (data: FormSchema) => void;
  handleGoogleSheetToggleChange: (value: boolean) => void;
  isGoogleSheetEnabeld: boolean;
};

const StyledForm = styled("form")(() => ({
  height: "100%",
}));

const initialDefaults: FormSchema = {
  sheetId: "",
  sheetTitle: "",
};

const formSchema = strictObject({
  sheetId: string().min(1, { message: "This field is required." }),
  sheetTitle: string().min(1, { message: "This field is required." }),
}) satisfies ZodType<FormSchema>;

export const GoogleSheetBackupFormField = ({
  handleSaveGoogleSheetData,
  handleGoogleSheetToggleChange,
  isGoogleSheetEnabeld,
}: GoogleSheetBackupFormFieldProps) => {
  const {
    control,
    handleSubmit,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<FormSchema>({
    reValidateMode: "onBlur",
    mode: "onBlur",
    defaultValues: initialDefaults,
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    handleSaveGoogleSheetData(data);
  };

  const handleChangeSwitch: SwitchProps["onChange"] = (_event, newValue) => {
    if (newValue === false) {
      clearErrors();
    }
    handleGoogleSheetToggleChange(newValue);
  };

  const sheetIdErrorMessage = errors.sheetId?.message;
  const sheetTitleErrorMessage = errors.sheetTitle?.message;

  useEffect(() => {
    const fetchData = async () => {
      const savedFormState = await window.api.invoke("getGoogleSheetValues");
      if (!savedFormState) return;

      onValid(savedFormState.sheetId, (val) => setValue("sheetId", val));
      onValid(savedFormState.sheetTitle, (val) => setValue("sheetTitle", val));
    };

    fetchData();
  }, []);

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <Stack
        sx={{
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Google Sheet Backup</Typography>
            <Switch
              size="small"
              checked={isGoogleSheetEnabeld}
              onChange={handleChangeSwitch}
            />
          </Stack>
          <Controller
            name="sheetId"
            control={control}
            render={({ field }) => (
              <TextField
                variant="standard"
                error={Boolean(sheetIdErrorMessage)}
                helperText={sheetIdErrorMessage || " "}
                label="Sheet ID"
                fullWidth
                required
                slotProps={{
                  input: {
                    disabled: !isGoogleSheetEnabeld,
                  },
                }}
                {...field}
              />
            )}
          />
          <Controller
            name="sheetTitle"
            control={control}
            render={({ field }) => (
              <TextField
                variant="standard"
                error={Boolean(sheetTitleErrorMessage)}
                helperText={sheetTitleErrorMessage || " "}
                label="Sheet Title"
                fullWidth
                required
                slotProps={{
                  input: {
                    disabled: !isGoogleSheetEnabeld,
                  },
                }}
                {...field}
              />
            )}
          />
        </Stack>
        <Button
          variant="contained"
          type="submit"
          sx={{
            width: "fit-content",
            alignSelf: "flex-end",
          }}
          disabled={!isGoogleSheetEnabeld}
        >
          save
        </Button>
      </Stack>
    </StyledForm>
  );
};
