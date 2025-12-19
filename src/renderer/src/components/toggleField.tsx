import {
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  type ToggleButtonGroupProps,
} from "@mui/material";

type ToggleFieldProps<T extends string | number> = {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
};

export const ToggleField = <T extends string | number>({
  label,
  value,
  options,
  onChange,
}: ToggleFieldProps<T>) => {
  const handleChange: ToggleButtonGroupProps["onChange"] = (
    _event,
    newValue,
  ) => {
    if (newValue !== null) {
      onChange(newValue as T);
    }
  };

  return (
    <Stack>
      <Typography variant="caption">{label}</Typography>
      <ToggleButtonGroup
        size="small"
        color="primary"
        value={value}
        exclusive
        fullWidth
        onChange={handleChange}
      >
        {options.map((option) => (
          <ToggleButton key={option} value={option}>
            {option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
};
