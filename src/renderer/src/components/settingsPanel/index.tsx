import { Button, type ButtonProps, Box, Tab, Tabs, type TabsProps, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocale } from "@renderer/i18n";
import type { SettingsPanelProps, TabPanelProps } from "./types";
import { GoogleTokenGenerateFormField } from "../googleTokenGenerateFormField";
import { GoogleSheetBackupFormField } from "../googleSheetBackupFormField";

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

export const SettingsPanel = ({ handleDeleteData, handleSaveGoogleSheet }: SettingsPanelProps) => {
  const { t } = useLocale();
  const tabs = {
    upload: {
      value: 0,
      label: t("settingPanel.upload"),
    },
    backup: {
      value: 1,
      label: t("settingPanel.backup"),
    },
    data: {
      value: 2,
      label: t("settingPanel.data"),
    },
  } as const;
  const [tabsValue, setTabsValue] = useState(tabs.upload.value);
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
        {Object.values(tabs).map((tab) => (
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
      <TabPanel value={tabsValue} index={tabs.upload.value}>
        <GoogleTokenGenerateFormField />
      </TabPanel>
      <TabPanel value={tabsValue} index={tabs.backup.value}>
        <GoogleSheetBackupFormField handleSaveGoogleSheet={handleSaveGoogleSheet} />
      </TabPanel>
      <TabPanel value={tabsValue} index={tabs.data.value}>
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
                label={t("settingPanel.configFileLocation")}
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
                {t("settingPanel.open")}
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
            {t("settingPanel.delete")}
          </Button>
        </Stack>
      </TabPanel>
    </Box>
  );
};
