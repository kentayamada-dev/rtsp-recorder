import {
  Button,
  type ButtonProps,
  Box,
  Tab,
  Tabs,
  type TabsProps,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState, type JSX } from "react";
import {
  GoogleSheetBackupFormField,
  type GoogleSheetBackupFormFieldProps,
} from "./googleSheetBackupFormField";
import { GoogleTokenGenerateFormField } from "./googleTokenGenerateFormField";

type TabPanelProps = {
  children: JSX.Element;
  index: number;
  value: number;
};

type SettingsPanelProps = GoogleSheetBackupFormFieldProps & {
  handleDeleteData: ButtonProps["onClick"];
};

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index } = props;

  return (
    <Box
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      sx={{
        height: "100%",
        width: "100%",
        paddingLeft: "15px",
        paddingRight: "15px",
      }}
    >
      {value === index && <>{children}</>}
    </Box>
  );
};

const TABS = {
  UPLOAD: {
    value: 0,
    label: "Upload",
  },
  BACKUP: {
    value: 1,
    label: "Backup",
  },
  DATA: {
    value: 2,
    label: "Data",
  },
} as const;

export const SettingsPanel = ({
  isGoogleSheetEnabeld,
  handleDeleteData,
  handleGoogleSheetToggleChange,
  handleSaveGoogleSheetData,
}: SettingsPanelProps) => {
  const [tabsValue, setTabsValue] = useState(TABS.UPLOAD.value);
  const [configPath, setConfigPath] = useState("");

  const handleTabsChange: TabsProps["onChange"] = (_event, newValue) => {
    setTabsValue(newValue);
  };

  const handleFileOpen: ButtonProps["onClick"] = () => {
    window.api.send("file:open", { filePath: configPath });
  };

  useEffect(() => {
    const fetchData = async () => {
      const configFilePath = await window.api.invoke("getConfigFile");
      setConfigPath(configFilePath);
    };

    fetchData();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        width: "100%",
      }}
    >
      <Tabs
        orientation="vertical"
        value={tabsValue}
        onChange={handleTabsChange}
        sx={{ borderRight: 1, borderColor: "divider", width: "130px" }}
      >
        {Object.values(TABS).map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            sx={{
              padding: 0,
            }}
          />
        ))}
      </Tabs>
      <TabPanel value={tabsValue} index={TABS.UPLOAD.value}>
        <GoogleTokenGenerateFormField />
      </TabPanel>
      <TabPanel value={tabsValue} index={TABS.BACKUP.value}>
        <GoogleSheetBackupFormField
          handleGoogleSheetToggleChange={handleGoogleSheetToggleChange}
          handleSaveGoogleSheetData={handleSaveGoogleSheetData}
          isGoogleSheetEnabeld={isGoogleSheetEnabeld}
        />
      </TabPanel>
      <TabPanel value={tabsValue} index={TABS.DATA.value}>
        <Stack
          direction="column"
          sx={{
            height: "100%",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{
              width: "100%",
            }}
          >
            <Box
              sx={{
                width: "80%",
              }}
            >
              <TextField
                value={configPath}
                label="Config File Location"
                variant="standard"
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
              />
            </Box>
            <Box
              sx={{
                width: "20%",
                placeSelf: "center",
              }}
            >
              <Button variant="contained" fullWidth onClick={handleFileOpen}>
                Open
              </Button>
            </Box>
          </Stack>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteData}
            sx={{
              width: "fit-content",
              alignSelf: "end",
            }}
          >
            Delete All Saved Data
          </Button>
        </Stack>
      </TabPanel>
    </Box>
  );
};
