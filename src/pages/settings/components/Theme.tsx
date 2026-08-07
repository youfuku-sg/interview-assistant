import { useTheme } from "@/contexts";
import { Header, Label, Slider, Button } from "@/components";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components";

export const Theme = () => {
  const { theme, transparency, setTheme, onSetTransparency } = useTheme();

  return (
    <div id="theme" className="relative space-y-3">
      <Header
        title="テーマのカスタマイズ"
        description="カスタムテーマと透明度の設定で表示をカスタマイズします"
        descriptionClassName="text-sm lg:text-base"
        isMainTitle
      />

      {/* Theme Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                {theme === "system" ? (
                  <>
                    <MonitorIcon className="h-4 w-4" />
                    システム
                  </>
                ) : theme === "light" ? (
                  <>
                    <SunIcon className="h-4 w-4" />
                    ライトモード
                  </>
                ) : (
                  <>
                    <MoonIcon className="h-4 w-4" />
                    ダークモード
                  </>
                )}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {theme === "light"
                  ? "明るい環境で見やすいライトテーマを使用しています"
                  : "暗い環境で見やすいダークテーマを使用しています"}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                {theme === "system" ? (
                  <MonitorIcon className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <>
                    <SunIcon className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                    <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                ライト
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                ダーク
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                システム
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Transparency Slider */}
      <div className="space-y-2">
        <Header
          title="ウィンドウの透明度"
          description="アプリケーションウィンドウの透明度を調整します"
          descriptionClassName="text-xs lg:text-sm"
        />
        <div className="space-y-3">
          <div className="flex items-center gap-4 mt-4">
            <Slider
              value={[transparency]}
              onValueChange={(value: number[]) => onSetTransparency(value[0])}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>

          <p className="text-sm text-muted-foreground/70">
            💡 ヒント: 透明度を上げるとウィンドウが透けて見えるようになり、暗いオーバーレイに最適です。変更はすぐに反映されます。
          </p>
        </div>
      </div>
    </div>
  );
};
