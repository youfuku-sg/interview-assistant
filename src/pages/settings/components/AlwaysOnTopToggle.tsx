import { Switch, Label, Header } from "@/components";
import { useApp } from "@/contexts";

interface AlwaysOnTopToggleProps {
  className?: string;
}

export const AlwaysOnTopToggle = ({ className }: AlwaysOnTopToggleProps) => {
  const { customizable, toggleAlwaysOnTop } = useApp();

  const handleSwitchChange = async (checked: boolean) => {
    await toggleAlwaysOnTop(checked);
  };

  return (
    <div id="always-on-top" className={`space-y-2 ${className}`}>
      <Header
        title="常に最前面に表示"
        description="ウィンドウを他のすべてのアプリケーションより前面に表示するかどうかを制御します"
        descriptionClassName="text-sm lg:text-base"
        isMainTitle
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <Label className="text-sm font-medium">
              {customizable.alwaysOnTop.isEnabled
                ? "常に最前面表示を無効化"
                : "常に最前面表示を有効化"}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {customizable.alwaysOnTop.isEnabled
                ? "ウィンドウは常に他のアプリケーションより前面に表示されます(既定)"
                : "ウィンドウは通常のアプリケーションと同じように動作します"}
            </p>
          </div>
        </div>
        <Switch
          checked={customizable.alwaysOnTop.isEnabled}
          onCheckedChange={handleSwitchChange}
          title={`常に最前面表示を${
            !customizable.alwaysOnTop.isEnabled ? "有効" : "無効"
          }に切り替え`}
          aria-label={`常に最前面表示を${
            customizable.alwaysOnTop.isEnabled ? "有効" : "無効"
          }に切り替え`}
        />
      </div>
    </div>
  );
};
