import type { FormStore } from "@shared-types/form";

type UploadFormSchema = FormStore["uploadForm"];

type UploadFormFieldProps = {
  isClearingForm: boolean;
  handleClearForm: (fn: () => void) => void;
  isUploading: boolean;
  handleStartUpload: (data: UploadFormSchema) => void;
  handleStopUpload: () => void;
};

export type { UploadFormSchema, UploadFormFieldProps };
