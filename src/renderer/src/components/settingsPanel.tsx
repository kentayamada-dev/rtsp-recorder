import {
  Switch,
  type SwitchProps,
  FormControlLabel,
  Button,
  type ButtonProps,
  Stack,
} from "@mui/material";

type SettingsPanelProps = {
  handleOnChange: Exclude<SwitchProps["onChange"], undefined>;
  autoSave: boolean;
  handleDeleteForm: ButtonProps["onClick"];
};

export const SettingsPanel = ({
  autoSave,
  handleOnChange,
  handleDeleteForm,
}: SettingsPanelProps) => {
  return (
    <Stack spacing={5}>
      <FormControlLabel
        control={<Switch checked={autoSave} onChange={handleOnChange} />}
        label="Auto save form data"
      />
      <Button
        variant="outlined"
        color="error"
        onClick={handleDeleteForm}
        sx={{
          width: "fit-content",
        }}
      >
        Delete Saved Form Data
      </Button>
    </Stack>
  );
};
