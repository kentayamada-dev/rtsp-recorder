import {
  Switch,
  type SwitchProps,
  FormControlLabel,
  Button,
  type ButtonProps,
  Stack,
} from "@mui/material";

type SettingsPanelProps = {
  toggleSaveSetting: () => void;
  saveSetting: boolean;
  handleDeleteForm: ButtonProps["onClick"];
};

export const SettingsPanel = ({
  saveSetting,
  toggleSaveSetting,
  handleDeleteForm,
}: SettingsPanelProps) => {
  const handleChange: SwitchProps["onChange"] = () => {
    toggleSaveSetting();
  };

  return (
    <Stack spacing={5}>
      <FormControlLabel
        control={<Switch checked={saveSetting} onChange={handleChange} />}
        label="Save form data"
      />
      <Button
        variant="outlined"
        color="error"
        onClick={handleDeleteForm}
        sx={{
          width: "fit-content",
        }}
      >
        Delete Form Data
      </Button>
    </Stack>
  );
};
