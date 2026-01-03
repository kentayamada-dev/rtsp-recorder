import type { NumberField } from "@base-ui-components/react/number-field";

type CustomNumberFieldProps = NumberField.Root.Props & {
  label: string;
  error: boolean;
  helperText: string;
};

export type { CustomNumberFieldProps };
