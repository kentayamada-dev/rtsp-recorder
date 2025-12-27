import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Tab,
  Paper,
  type ButtonProps,
  type SwitchProps,
} from "@mui/material";
import {
  TabContext,
  TabList,
  TabPanel,
  type TabPanelProps,
  type TabListProps,
} from "@mui/lab";
import { styled } from "@mui/material/styles";
import { SettingsPanel } from "./components/settingsPanel";
import { MessagePanel } from "./components/messagePanel";
import { StatusPanel } from "./components/statusPanel";
import type { CaptureForm, UploadForm } from "@shared-types/form";
import { CaptureFormField } from "./components/captureFormField";
import { UploadFormField } from "./components/uploadFormField";

const TABS = {
  CAPTURE: {
    value: "capture",
    label: "Capture",
  },
  UPLOAD: {
    value: "upload",
    label: "Upload",
  },
  STATUS: {
    value: "status",
    label: "Status",
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
  const [tabValue, setTabValue] = useState(TABS.CAPTURE.value);
  const [autoSave, setAutoSave] = useState(false);
  const [clearForm, setClearForm] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleTabChange: TabListProps["onChange"] = (_event, newValue) => {
    setTabValue(newValue);
  };

  const handleAutoSave: SwitchProps["onChange"] = (event) => {
    const isChecked = event.target.checked;
    setAutoSave(isChecked);
    window.api.send("form:autosave", isChecked);
  };

  const handleClearForm = (fn: () => void) => {
    if (clearForm === true) {
      fn();
    }
    setClearForm(false);
  };

  const handleDeleteForm: ButtonProps["onClick"] = async () => {
    setClearForm(true);
    const confirmed = await window.api.invoke("showQuestionDialog", {
      title: "Confirm Delete",
      message: "Are you sure you want to delete?",
    });

    if (!confirmed) return;

    window.api.send("form:capture:reset");
    window.api.send("form:upload:reset");
  };

  const handleStartCapture = (data: CaptureForm) => {
    setIsCapturing(true);
    window.api.send("capture:start", data);
    if (autoSave) {
      window.api.send("form:capture:save", data);
    }
  };

  const handleStopUpload = () => {
    window.api.send("upload:stop");
    setIsUploading(false);
  };

  const handleStartUpload = (data: UploadForm) => {
    setIsUploading(true);

    window.api.send("upload:start", { fps: 1, ...data });

    if (autoSave) {
      window.api.send("form:upload:save", data);
    }
  };

  const handleStopCapture = () => {
    window.api.send("capture:stop");
    setIsCapturing(false);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      const autoSave = await window.api.invoke("getFormAutoSave");
      if (autoSave) {
        setAutoSave(autoSave);
      }
    };

    fetchData();

    return () => controller.abort();
  }, []);

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
            minHeight: "400px",
          }}
        >
          <TabContext value={tabValue}>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                marginBottom: "30px",
              }}
            >
              <TabList onChange={handleTabChange} variant="fullWidth">
                {Object.values(TABS).map((tab) => (
                  <Tab key={tab.value} label={tab.label} value={tab.value} />
                ))}
              </TabList>
            </Box>
            <CustomTabPanel value={TABS.CAPTURE.value} keepMounted>
              <CaptureFormField
                autoSave={autoSave}
                clearForm={clearForm}
                handleClearForm={handleClearForm}
                isCapturing={isCapturing}
                onStartCapture={handleStartCapture}
                onStopCapture={handleStopCapture}
              />
            </CustomTabPanel>
            <CustomTabPanel value={TABS.UPLOAD.value} keepMounted>
              <UploadFormField
                autoSave={autoSave}
                clearForm={clearForm}
                handleClearForm={handleClearForm}
                isUploading={isUploading}
                onStartUpload={handleStartUpload}
                onStopUpload={handleStopUpload}
              />
            </CustomTabPanel>
            <CustomTabPanel value={TABS.STATUS.value} keepMounted>
              <StatusPanel
                isCapturing={isCapturing}
                isUploading={isUploading}
              />
            </CustomTabPanel>
            <CustomTabPanel value={TABS.SETTINGS.value} keepMounted>
              <SettingsPanel
                autoSave={autoSave}
                handleOnChange={handleAutoSave}
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
          <MessagePanel />
        </Paper>
      </Box>
    </>
  );
};
