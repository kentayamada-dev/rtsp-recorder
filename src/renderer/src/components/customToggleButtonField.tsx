import {
  Stack,
  Typography,
  ToggleButtonGroup,
  type ToggleButtonGroupProps,
  ToggleButton,
} from "@mui/material";

type CustomToggleButtonFieldProps<T extends string> = {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
};

export const CustomToggleButtonField = <T extends string>({
  label,
  value,
  options,
  onChange,
}: CustomToggleButtonFieldProps<T>) => {
  const handleChange: ToggleButtonGroupProps["onChange"] = (
    _event,
    newValue,
  ) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <Stack
      sx={{
        width: "100%",
      }}
    >
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
          <ToggleButton key={String(option)} value={option}>
            {option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
};
