import { NumberField } from "@base-ui-components/react/number-field";
import {
  IconButton,
  FormControl,
  FormHelperText,
  Input,
  InputAdornment,
  InputLabel,
} from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import { useId } from "react";

type CustomNumberFieldProps = NumberField.Root.Props & {
  label: string;
  error: boolean;
  helperText: string;
};

export const CustomNumberField = ({
  id: idProp,
  label,
  error,
  helperText,
  ...other
}: CustomNumberFieldProps) => {
  let id = useId();
  if (idProp) {
    id = idProp;
  }

  return (
    <NumberField.Root
      {...other}
      render={(props, state) => (
        <FormControl
          fullWidth
          ref={props.ref}
          disabled={state.disabled}
          required={state.required}
          error={error}
          variant="standard"
        >
          {props.children}
        </FormControl>
      )}
    >
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <NumberField.Input
        id={id}
        render={(props, state) => {
          return (
            <Input
              fullWidth
              id={id}
              value={state.inputValue}
              inputProps={props}
              endAdornment={
                <InputAdornment
                  position="end"
                  sx={{
                    flexDirection: "column",
                    maxHeight: "unset",
                    alignSelf: "stretch",
                    ml: 0,
                    "& button": {
                      py: 0,
                      flex: 1,
                      borderRadius: 0.5,
                    },
                  }}
                >
                  <NumberField.Increment render={<IconButton size="small" />}>
                    <KeyboardArrowUp
                      fontSize="small"
                      sx={{ transform: "translateY(2px)" }}
                    />
                  </NumberField.Increment>

                  <NumberField.Decrement render={<IconButton size="small" />}>
                    <KeyboardArrowDown
                      fontSize="small"
                      sx={{ transform: "translateY(-2px)" }}
                    />
                  </NumberField.Decrement>
                </InputAdornment>
              }
              sx={{
                pr: 0,
              }}
            />
          );
        }}
      />

      <FormHelperText sx={{ ml: 0, "&:empty": { mt: 0 } }}>
        {helperText}
      </FormHelperText>
    </NumberField.Root>
  );
};
