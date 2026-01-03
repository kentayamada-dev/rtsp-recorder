export type ToggleFieldProps<T extends string | number> = {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
};
