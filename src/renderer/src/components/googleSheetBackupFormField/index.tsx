import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack, styled, Switch, TextField, Typography, type SwitchProps } from "@mui/material";
import { useLocale } from "@renderer/i18n";
import { onValid } from "@renderer/utils";
import { useEffect, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { strictObject, string, type ZodType } from "zod";
import type { GoogleSheetBackupFormFieldProps, GoogleSheetBackupFormSchema } from "./types";

const StyledForm = styled("form")(() => ({
  height: "100%",
}));

const initialDefaults: GoogleSheetBackupFormSchema = {
  sheetId: "",
  sheetTitle: "",
};

export const GoogleSheetBackupFormField = ({ handleSaveGoogleSheet }: GoogleSheetBackupFormFieldProps) => {
  const { t } = useLocale();

  const formSchema = strictObject({
    sheetId: string().min(1, { message: t("error.empty") }),
    sheetTitle: string().min(1, { message: t("error.empty") }),
  }) satisfies ZodType<GoogleSheetBackupFormSchema>;

  const {
    control,
    handleSubmit,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<GoogleSheetBackupFormSchema>({
    reValidateMode: "onBlur",
    mode: "onBlur",
    defaultValues: initialDefaults,
    resolver: zodResolver(formSchema),
  });

  const [googleSheetEnabled, setGoogleSheetEnabled] = useState(false);

  const onSubmit: SubmitHandler<GoogleSheetBackupFormSchema> = (data) => {
    handleSaveGoogleSheet(data);
  };

  const handleChangeSwitch: SwitchProps["onChange"] = (_event, newValue) => {
    if (newValue === false) {
      clearErrors();
    }
    setGoogleSheetEnabled(newValue);
    window.api.send("google:sheet:enabled", newValue);
  };

  const sheetIdErrorMessage = errors.sheetId?.message;
  const sheetTitleErrorMessage = errors.sheetTitle?.message;

  useEffect(() => {
    const fetchData = async () => {
      const savedFormState = await window.api.invoke("getGoogleSheetValues");
      if (savedFormState) {
        onValid(savedFormState.sheetId, (val) => setValue("sheetId", val));
        onValid(savedFormState.sheetTitle, (val) => setValue("sheetTitle", val));
      }

      const enabled = await window.api.invoke("getGoogleSheetEnabled");
      if (enabled) {
        setGoogleSheetEnabled(enabled);
      }
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
            <Typography variant="h6">{t("form.googleSheet.title")}</Typography>
            <Switch size="small" checked={googleSheetEnabled} onChange={handleChangeSwitch} />
          </Stack>
          <Controller
            name="sheetId"
            control={control}
            render={({ field }) => (
              <TextField
                variant="standard"
                error={Boolean(sheetIdErrorMessage)}
                helperText={sheetIdErrorMessage || " "}
                label={t("form.googleSheet.sheetId")}
                fullWidth
                slotProps={{
                  input: {
                    disabled: !googleSheetEnabled,
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
                label={t("form.googleSheet.sheetTitle")}
                fullWidth
                slotProps={{
                  input: {
                    disabled: !googleSheetEnabled,
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
          disabled={!googleSheetEnabled}
        >
          {t("form.save")}
        </Button>
      </Stack>
    </StyledForm>
  );
};
