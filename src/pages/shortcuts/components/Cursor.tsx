import {
  Header,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { useApp } from "@/contexts";
import { getPlatform } from "@/lib";
import { CursorType } from "@/lib/storage";
import { MousePointer, MousePointer2, Pointer, TextCursor } from "lucide-react";

interface CursorSelectionProps {
  className?: string;
}

export const CursorSelection = ({ className }: CursorSelectionProps) => {
  const { customizable, setCursorType } = useApp();
  const platform = getPlatform();

  return (
    <div id="cursor" className={`space-y-2 ${className}`}>
      <Header
        title="カーソル"
        description="Interview-Assistantのカーソル表示を制御します"
        isMainTitle
        rightSlot={
          <Select
            value={customizable.cursor.type}
            onValueChange={(value) => setCursorType(value as CursorType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="カーソルの種類を選択" />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              <SelectItem value="invisible" disabled={platform === "linux"}>
                非表示 (<MousePointer2 className="size-3 px-0" />){" "}
                {platform === "linux" && (
                  <span className="text-xs text-muted-foreground">
                    Linuxでは非対応
                  </span>
                )}
              </SelectItem>
              <SelectItem value="default">
                既定 (<MousePointer className="size-3" />)
              </SelectItem>
              <SelectItem value="auto">
                自動 (
                <MousePointer className="size-3" />/
                <TextCursor className="size-3" /> /
                <Pointer className="size-3" />)
              </SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
};
