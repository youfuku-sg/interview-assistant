import {
  Theme,
  AlwaysOnTopToggle,
  AppIconToggle,
  AutostartToggle,
  LaunchHistory,
} from "./components";
import { PageLayout } from "@/layouts";

const Settings = () => {
  return (
    <PageLayout title="設定" description="アプリの設定を管理します">
      {/* Theme */}
      <Theme />

      {/* Autostart Toggle */}
      <AutostartToggle />

      {/* App Icon Toggle */}
      <AppIconToggle />

      {/* Always On Top Toggle */}
      <AlwaysOnTopToggle />

      {/* Launch History */}
      <LaunchHistory />
    </PageLayout>
  );
};

export default Settings;
