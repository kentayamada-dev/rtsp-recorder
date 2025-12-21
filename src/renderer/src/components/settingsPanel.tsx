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
};

export const SettingsPanel = ({
  saveSetting,
  toggleSaveSetting,
}: SettingsPanelProps) => {
  const handleChange: SwitchProps["onChange"] = () => {
    toggleSaveSetting();
  };

  const handleDelete: ButtonProps["onClick"] = async () => {
    const confirmed = await window.api.invoke(
      "showQuestionMessage",
      "Confirm Delete",
      "Are you sure you want to delete?",
    );

    if (!confirmed) return;

    window.api.send("resetFormValues");
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
        onClick={handleDelete}
        sx={{
          width: "fit-content",
        }}
      >
        Delete Form Data
      </Button>
    </Stack>
  );
};
