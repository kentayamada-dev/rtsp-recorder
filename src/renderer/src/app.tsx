import { useState } from "react";
import { Typography, Box, Tab, Paper, styled } from "@mui/material";
import { TabContext, TabList, TabPanel, type TabPanelProps, type TabListProps } from "@mui/lab";
import { MessagePanel } from "./components/messagePanel";
import { StatusPanel } from "./components/statusPanel";
import { useLocale } from "./i18n";
import { CaptureFormField } from "./components/captureFormField";
import type { CaptureFormFieldProps } from "./components/captureFormField/types";
import type { GoogleSheetBackupFormFieldProps } from "./components/googleSheetBackupFormField/types";
import { SettingsPanel } from "./components/settingsPanel";
import type { SettingsPanelProps } from "./components/settingsPanel/types";
import { UploadFormField } from "./components/uploadFormField";
import type { UploadFormFieldProps } from "./components/uploadFormField/types";

const CustomTabPanel = styled(TabPanel)<TabPanelProps>(() => ({
  padding: 0,
  height: "100%",
}));

export const App = () => {
  const { t } = useLocale();
  const tabs = {
    capture: {
      value: 0,
      label: t("tabs.capture"),
    },
    upload: {
      value: 1,
      label: t("tabs.upload"),
    },
    status: {
      value: 2,
      label: t("tabs.status"),
    },
    settings: {
      value: 3,
      label: t("tabs.settings"),
    },
  } as const;
  const [tabValue, setTabValue] = useState(tabs.capture.value);
  const [isClearingForm, setIsClearingForm] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleTabChange: TabListProps["onChange"] = (_event, newValue) => {
    setTabValue(newValue);
  };

  const handleClearForm: CaptureFormFieldProps["handleClearForm"] = (fn) => {
    if (isClearingForm === true) {
      fn();
    }
    setIsClearingForm(false);
  };

  const handleDeleteData: SettingsPanelProps["handleDeleteData"] = async () => {
    setIsClearingForm(true);

    if (
      (
        await window.api.invoke("showDialog", {
          type: "question",
          buttons: [t("dialog.no"), t("dialog.yes")],
          message: t("dialog.message"),
        })
      ).response === 0
    ) {
      return;
    }

    window.api.send("reset");
  };

  const handleStartCapture: CaptureFormFieldProps["handleStartCapture"] = (data) => {
    setIsCapturing(true);

    window.api.send("capture:start", data);
    window.api.send("form:capture", data);
  };

  const handleSaveGoogleSheet: GoogleSheetBackupFormFieldProps["handleSaveGoogleSheet"] = (data) => {
    window.api.send("google:sheet:values", data);

    window.api.invoke("showDialog", {
      type: "info",
      message: t("dialog.saved"),
    });
  };

  const handleStopUpload: UploadFormFieldProps["handleStopUpload"] = () => {
    window.api.send("upload:stop");
    setIsUploading(false);
  };

  const handleStartUpload: UploadFormFieldProps["handleStartUpload"] = (data) => {
    setIsUploading(true);
    window.api.send("upload:start", data);
    window.api.send("form:upload", data);
  };

  const handleStopCapture: CaptureFormFieldProps["handleStopCapture"] = () => {
    window.api.send("capture:stop");
    setIsCapturing(false);
  };

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
          {t("title")}
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
                {Object.values(tabs).map((tab) => (
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
              <CustomTabPanel value={tabs.capture.value} keepMounted>
                <CaptureFormField
                  isClearingForm={isClearingForm}
                  handleClearForm={handleClearForm}
                  isCapturing={isCapturing}
                  handleStartCapture={handleStartCapture}
                  handleStopCapture={handleStopCapture}
                />
              </CustomTabPanel>
              <CustomTabPanel value={tabs.upload.value} keepMounted>
                <UploadFormField
                  isClearingForm={isClearingForm}
                  handleClearForm={handleClearForm}
                  isUploading={isUploading}
                  handleStartUpload={handleStartUpload}
                  handleStopUpload={handleStopUpload}
                />
              </CustomTabPanel>
              <CustomTabPanel value={tabs.status.value} keepMounted>
                <StatusPanel isCapturing={isCapturing} isUploading={isUploading} />
              </CustomTabPanel>
              <CustomTabPanel value={tabs.settings.value} keepMounted>
                <SettingsPanel handleSaveGoogleSheet={handleSaveGoogleSheet} handleDeleteData={handleDeleteData} />
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
