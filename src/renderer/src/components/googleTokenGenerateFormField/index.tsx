import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Paper, Stack, styled, TextField, Typography, type ButtonProps } from "@mui/material";
import { useLocale } from "@renderer/i18n";
import { useEffect, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { strictObject, string, type ZodType } from "zod";
import type { GoogleTokenGenerateFormSchema } from "./types";

const StyledForm = styled("form")(() => ({
  height: "100%",
}));

const initialDefaults: GoogleTokenGenerateFormSchema = {
  secretFile: "",
};

export const GoogleTokenGenerateFormField = () => {
  const { t } = useLocale();

  const formSchema = strictObject({
    secretFile: string().refine(
      async (filePath) => {
        const isValid = await window.api.invoke("validatePath", {
          path: filePath,
          type: "json",
        });
        return isValid;
      },
      { message: t("error.file") },
    ),
  }) satisfies ZodType<GoogleTokenGenerateFormSchema>;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GoogleTokenGenerateFormSchema>({
    reValidateMode: "onBlur",
    mode: "onBlur",
    defaultValues: initialDefaults,
    resolver: zodResolver(formSchema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<GoogleTokenGenerateFormSchema> = async (data) => {
    setIsLoading(true);

    window.api.send("google:secretFile", data.secretFile);

    const { success, message } = await window.api.invoke("generateGoogleToken");

    await window.api.invoke("showDialog", {
      type: success ? "info" : "error",
      message,
    });

    setIsLoading(false);
  };

  const handleGoogleSecretFile: ButtonProps["onClick"] = async () => {
    const selectedFile = await window.api.invoke("selectDialog", {
      type: "json",
    });

    if (selectedFile) {
      setValue("secretFile", selectedFile, {
        shouldValidate: true,
      });
    }
  };

  const googleSecretFileErrorMessage = errors.secretFile?.message;

  useEffect(() => {
    const fetchData = async () => {
      const googleSecretFile = await window.api.invoke("getGoogleSecretFile");
      if (!googleSecretFile) return;

      setValue("secretFile", googleSecretFile);
    };

    fetchData();
  }, []);

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          padding: "20px",
        }}
      >
        <Stack
          spacing={2}
          sx={{
            width: "100%",
          }}
        >
          <Typography variant="h6">{t("form.googleToken.title")}</Typography>
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
                name="secretFile"
                control={control}
                render={({ field }) => (
                  <TextField
                    error={Boolean(googleSecretFileErrorMessage)}
                    helperText={googleSecretFileErrorMessage || " "}
                    variant="standard"
                    fullWidth
                    label={t("form.googleToken.secretFile")}
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
              <Button fullWidth variant="contained" onClick={handleGoogleSecretFile}>
                {t("form.browse")}
              </Button>
            </Box>
          </Stack>
        </Stack>
        <Stack
          sx={{
            marginTop: "30px",
          }}
        >
          <Button
            variant="contained"
            type="submit"
            loading={isLoading}
            sx={{
              width: "fit-content",
              alignSelf: "flex-end",
            }}
          >
            {t("form.googleToken.generate")}
          </Button>
        </Stack>
      </Paper>
    </StyledForm>
  );
};
