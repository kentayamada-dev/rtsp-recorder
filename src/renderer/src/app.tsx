import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Tab,
  Paper,
  type ButtonProps,
  styled,
} from "@mui/material";
import {
  TabContext,
  TabList,
  TabPanel,
  type TabPanelProps,
  type TabListProps,
} from "@mui/lab";
import { SettingsPanel } from "./components/settingsPanel";
import { MessagePanel } from "./components/messagePanel";
import { StatusPanel } from "./components/statusPanel";
import { CaptureFormField } from "./components/captureFormField";
import { UploadFormField } from "./components/uploadFormField";
import type { FormStore, GoogleStore } from "@shared-types/form";

const TABS = {
  CAPTURE: {
    value: 0,
    label: "Capture",
  },
  UPLOAD: {
    value: 1,
    label: "Upload",
  },
  STATUS: {
    value: 2,
    label: "Status",
  },
  SETTINGS: {
    value: 3,
    label: "Setting",
  },
} as const;

const CustomTabPanel = styled(TabPanel)<TabPanelProps>(() => ({
  padding: 0,
  height: "100%",
}));

export const App = () => {
  const [tabValue, setTabValue] = useState(TABS.CAPTURE.value);
  const [clearForm, setClearForm] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [googleSheetEnabled, setGoogleSheetEnabled] = useState(false);

  const handleTabChange: TabListProps["onChange"] = (_event, newValue) => {
    setTabValue(newValue);
  };

  const handleGoogleSheetToggleChange = (value: boolean) => {
    setGoogleSheetEnabled(value);
    window.api.send("google:sheet:enabled", value);
  };

  const handleClearForm = (fn: () => void) => {
    if (clearForm === true) {
      fn();
    }
    setClearForm(false);
  };

  const handleDeleteData: ButtonProps["onClick"] = async () => {
    setClearForm(true);
    const response = (
      await window.api.invoke("showDialog", {
        type: "question",
        buttons: ["No", "Yes"],
        message: "Are you sure you want to delete?",
      })
    ).response;

    if (response === 0) return;

    window.api.send("reset");
  };

  const handleStartCapture = (data: FormStore["captureForm"]) => {
    setIsCapturing(true);
    window.api.send("capture:start", data);
    window.api.send("form:capture", data);
  };

  const handleSaveGoogleSheetData = (data: GoogleStore["sheet"]["values"]) => {
    window.api.send("google:sheet:values", data);
    window.api.invoke("showDialog", {
      type: "info",
      message: "Saved Successfully",
    });
  };

  const handleStopUpload = () => {
    window.api.send("upload:stop");
    setIsUploading(false);
  };

  const handleStartUpload = (data: FormStore["uploadForm"]) => {
    setIsUploading(true);
    window.api.send("upload:start", data);
    window.api.send("form:upload", data);
  };

  const handleStopCapture = () => {
    window.api.send("capture:stop");
    setIsCapturing(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const enabled = await window.api.invoke("getGoogleSheetEnabled");

      if (enabled) {
        setGoogleSheetEnabled(enabled);
      }
    };

    fetchData();
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
          }}
        >
          <TabContext value={tabValue}>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <TabList onChange={handleTabChange} variant="fullWidth">
                {Object.values(TABS).map((tab) => (
                  <Tab key={tab.value} label={tab.label} value={tab.value} />
                ))}
              </TabList>
            </Box>
            <Box
              sx={{
                height: "300px",
                marginTop: "30px",
              }}
            >
              <CustomTabPanel value={TABS.CAPTURE.value} keepMounted>
                <CaptureFormField
                  clearForm={clearForm}
                  handleClearForm={handleClearForm}
                  isCapturing={isCapturing}
                  onStartCapture={handleStartCapture}
                  onStopCapture={handleStopCapture}
                />
              </CustomTabPanel>
              <CustomTabPanel value={TABS.UPLOAD.value} keepMounted>
                <UploadFormField
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
                  isGoogleSheetEnabeld={googleSheetEnabled}
                  handleSaveGoogleSheetData={handleSaveGoogleSheetData}
                  handleDeleteData={handleDeleteData}
                  handleGoogleSheetToggleChange={handleGoogleSheetToggleChange}
                />
              </CustomTabPanel>
            </Box>
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
