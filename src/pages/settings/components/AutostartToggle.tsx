import { Switch, Label, Header } from "@/components";
import { useApp } from "@/contexts";

interface AutostartToggleProps {
  className?: string;
}

export const AutostartToggle = ({ className }: AutostartToggleProps) => {
  const { customizable, toggleAutostart } = useApp();

  const isEnabled = customizable?.autostart?.isEnabled ?? true;

  const handleSwitchChange = async (checked: boolean) => {
    await toggleAutostart(checked);
  };

  return (
    <div id="autostart" className={`space-y-2 ${className}`}>
      <Header
        title="起動時に自動起動"
        description="システム起動時にInterview-Assistantを自動的に開きます"
        isMainTitle
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <Label className="text-sm font-medium">起動時に開く</Label>
            <p className="text-xs text-muted-foreground mt-1">
              {isEnabled
                ? "システム起動時にInterview-Assistantが自動的に起動します"
                : "Interview-Assistantは自動的に起動しません"}
            </p>
          </div>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={handleSwitchChange}
          aria-label="自動起動の切り替え"
        />
      </div>
    </div>
  );
};
