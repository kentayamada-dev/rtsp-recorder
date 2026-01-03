import type { FormStore } from "@shared-types/form";

type CaptureFormSchema = FormStore["captureForm"];

type CaptureFormFieldProps = {
  isClearingForm: boolean;
  handleClearForm: (fn: () => void) => void;
  isCapturing: boolean;
  handleStartCapture: (data: CaptureFormSchema) => void;
  handleStopCapture: () => void;
};

export type { CaptureFormSchema, CaptureFormFieldProps };
