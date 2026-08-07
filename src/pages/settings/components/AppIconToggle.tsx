import { Switch, Label, Header } from "@/components";
import { useApp } from "@/contexts";

interface AppIconToggleProps {
  className?: string;
}

export const AppIconToggle = ({ className }: AppIconToggleProps) => {
  const { customizable, toggleAppIconVisibility } = useApp();

  const handleSwitchChange = async (checked: boolean) => {
    await toggleAppIconVisibility(checked);
  };

  return (
    <div id="app-icon" className={`space-y-2 ${className}`}>
      <Header
        title="アプリアイコン ステルスモード"
        description="ウィンドウが非表示のときの Dock/タスクバーアイコンの表示を制御します"
        descriptionClassName="text-sm lg:text-base"
        isMainTitle
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <Label className="text-sm font-medium">
              {!customizable.appIcon.isVisible
                ? "Dock/タスクバーにアイコンを表示"
                : "Dock/タスクバーからアイコンを非表示"}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {`アプリアイコンを${
                !customizable.appIcon.isVisible ? "表示" : "非表示"
              }に切り替え`}
            </p>
          </div>
        </div>
        <Switch
          checked={customizable.appIcon.isVisible}
          onCheckedChange={handleSwitchChange}
          aria-label="アプリアイコンの表示切り替え"
        />
      </div>
    </div>
  );
};
