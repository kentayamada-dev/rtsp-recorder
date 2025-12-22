import { useEffect, useRef, useState } from "react";
import { Typography, Box, Tab, Paper, type ButtonProps } from "@mui/material";
import {
  TabContext,
  TabList,
  TabPanel,
  type TabPanelProps,
  type TabListProps,
} from "@mui/lab";
import { styled } from "@mui/material/styles";
import { RecordForm } from "./components/recordForm";
import { SettingsPanel } from "./components/settingsPanel";
import { LogPanel } from "./components/logPanel";

const TABS = {
  RECORD: {
    value: "record",
    label: "Record",
  },
  SETTINGS: {
    value: "settings",
    label: "Setting",
  },
} as const;

const CustomTabPanel = styled(TabPanel)<TabPanelProps>(() => ({
  padding: 0,
}));

export const App = () => {
  const [tabValue, setTabValue] = useState(TABS.RECORD.value);
  const [saveSetting, setSaveSetting] = useState(false);
  const [deleteForm, setDeleteForm] = useState(false);
  const isHydratedRef = useRef(false);

  const handleTabChange: TabListProps["onChange"] = (_event, newValue) => {
    setTabValue(newValue);
  };

  const toggleSaveSetting = () => {
    setSaveSetting((prevState) => !prevState);
  };

  const handleDeleteForm: ButtonProps["onClick"] = async () => {
    setDeleteForm(true);
    const confirmed = await window.api.invoke(
      "showQuestionMessage",
      "Confirm Delete",
      "Are you sure you want to delete?",
    );

    if (!confirmed) return;

    window.api.send("resetFormValues");
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      const isAutoSave = await window.api.invoke("getFormAutoSave");
      if (isAutoSave !== undefined) {
        setSaveSetting(isAutoSave);
      }
      isHydratedRef.current = true;
    };

    fetchData();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    window.api.send("saveFormAutoSave", saveSetting);
  }, [saveSetting]);

  return (
    <>
      <Box
        sx={{
          width: "900px",
          justifySelf: "center",
          padding: "30px",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            placeSelf: "center",
          }}
        >
          RTSP Manager
        </Typography>
        <Paper
          sx={{
            marginTop: "50px",
            padding: "20px",
          }}
        >
          <TabContext value={tabValue}>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                marginBottom: "20px",
              }}
            >
              <TabList onChange={handleTabChange}>
                {Object.values(TABS).map((tab) => (
                  <Tab key={tab.value} label={tab.label} value={tab.value} />
                ))}
              </TabList>
            </Box>
            <CustomTabPanel value={TABS.RECORD.value} keepMounted>
              <RecordForm saveSetting={saveSetting} deleteForm={deleteForm} />
            </CustomTabPanel>
            <CustomTabPanel value={TABS.SETTINGS.value} keepMounted>
              <SettingsPanel
                toggleSaveSetting={toggleSaveSetting}
                saveSetting={saveSetting}
                handleDeleteForm={handleDeleteForm}
              />
            </CustomTabPanel>
          </TabContext>
        </Paper>
        <Paper
          sx={{
            marginTop: "30px",
            padding: "20px",
          }}
        >
          <LogPanel />
        </Paper>
      </Box>
    </>
  );
};
