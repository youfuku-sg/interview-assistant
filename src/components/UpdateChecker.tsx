import { useEffect, useRef, useState } from "react";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function UpdateChecker() {
  const [update, setUpdate] = useState<Update | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    void checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const availableUpdate = await check();
      if (availableUpdate) setUpdate(availableUpdate);
    } catch (error) {
      console.debug("Update check skipped:", error);
    }
  };

  const installUpdate = async () => {
    if (!update) return;

    setIsInstalling(true);
    try {
      let downloaded = 0;
      let contentLength: number | undefined;
      await update.downloadAndInstall((event) => {
        if (event.event === "Started") {
          contentLength = event.data.contentLength;
        } else if (event.event === "Progress") {
          downloaded += event.data.chunkLength;
          if (contentLength) {
            setProgress(Math.min(100, Math.round((downloaded / contentLength) * 100)));
          }
        } else if (event.event === "Finished") {
          setProgress(100);
        }
      });
      await relaunch();
    } catch (error) {
      console.error("Update installation failed:", error);
      setIsInstalling(false);
      setProgress(0);
      setUpdate(null);
    }
  };

  return (
    <Dialog open={update !== null} onOpenChange={(open) => !open && !isInstalling && setUpdate(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新しいバージョンがあります</DialogTitle>
          <DialogDescription>
            Interview-Assistant {update?.version} が利用できます。更新しますか？
          </DialogDescription>
        </DialogHeader>
        {isInstalling && (
          <p className="text-sm text-muted-foreground">
            ダウンロード中… {progress > 0 ? `${progress}%` : ""}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={isInstalling} onClick={() => setUpdate(null)}>
            後で
          </Button>
          <Button disabled={isInstalling} onClick={() => void installUpdate()}>
            {isInstalling ? "更新中…" : "更新する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
