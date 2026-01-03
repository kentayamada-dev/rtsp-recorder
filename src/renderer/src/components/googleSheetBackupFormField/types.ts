import type { GoogleStore } from "@shared-types/form";

type GoogleSheetBackupFormSchema = GoogleStore["sheet"]["values"];

type GoogleSheetBackupFormFieldProps = {
  handleSaveGoogleSheet: (data: GoogleSheetBackupFormSchema) => void;
};

export type { GoogleSheetBackupFormSchema, GoogleSheetBackupFormFieldProps };
